const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateRegisterRules, validateUpdateRules, validate } = require('../middleware/validate.js')
const {User} = require('../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();


router.get('/me', auth, async (req, res) => {
	res.status(200).json({
		status: 200,
		data: req.user
	});
});

router.get('/', auth, admin, async (req, res) => {
	let users = await User.find()
	res.status(200).json({
		status: 200,
		data: users
	});
});

router.delete('/delete', async (req, res) => {
	if(process.env.NODE_ENV == 'development'){
		await User.collection.drop();
		res.status(200).json({
			status: 200
		});
	}
});

router.patch('/', auth, validateUpdateRules(), validate, async (req, res) => {
	let body = req.body;
	if (req.body.email && req.body.email != req.user.email) {
		let user = await User.findOne({
			email: req.body.email
		});
		if (user) return res.status(400).json({
			status: 400, 
			message:"User with that e-mail already exists!"
		});
	}
	if(body.password) {
		const salt = await bcrypt.genSalt(10);
		body.password = await bcrypt.hash(body.password, salt);
	}
	User.findByIdAndUpdate(req.user._id, body, (err) =>{
		if(!err) {
			res.status(200).json({
				status: 200, 
				message:"User updated!"
			});
		} else {
			res.status(503).json({
				status: 503, 
				error:"User could not be updated"
			});
		}
	});
	
});

router.post('/', validateRegisterRules(), validate, async (req, res) => {
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).json({
		status: 400, 
		message:"User with that e-mail already exists!"
	});

	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message:"User created!"
			});
		} else {
			res.status(503).json({
				status: 503, 
				error:"User could not be created"
			});
		}
	});

});

module.exports = router;