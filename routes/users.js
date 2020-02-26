const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateRegisterRules, validate } = require('../middleware/validate.js')
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

router.post('/', validateRegisterRules(), validate, async (req, res) => {
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).send('User already registered.');

	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save();

	res.status(201).json({
		status: 201, 
		message:"User created!"
	});
});

module.exports = router;