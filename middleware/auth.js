const jwt = require('jsonwebtoken');
const config = require('config');
const {User} = require('../models/user');

module.exports = function (req, res, next) {
	const token = req.header('x-auth-token');
	if (!token) return res.status(401).json({
		status: 401,
		error: 'No token provided.'
	});

	try {
		const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
		User.findById(decoded._id).select("-password")
			.then(user => {
				if (user) {
					req.user = user;
					return next();
				} else {
					res.status(400).json({
						status: 400,
						error: 'Invalid token.'
					});
				}
			})
	} 
	catch (ex) {
		res.status(400).json({
			status: 400,
			error: 'Invalid token.'
		});
	}
}