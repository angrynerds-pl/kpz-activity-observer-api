const auth = require('../middleware/auth');
const {User} = require('../models/user');
const { validateLoginRules, validate } = require('../middleware/validate.js')
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();


router.post('/', validateLoginRules(), validate, async (req, res) => {

	let user = await User.findOne({
		email: req.body.email
	});
	if (!user) return res.status(400).json({
		status: 400, 
		error: 'Invalid e-mail.'
	});

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).json({
		status: 400,
		error: 'Invalid password.'
	});

	const token = user.generateAuthToken();
	res.status(200).json({
		status: 200,
		accessToken: token
	});
});

module.exports = router;