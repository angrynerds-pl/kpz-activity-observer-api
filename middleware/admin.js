module.exports = function (req, res, next) {
    if (!req.user.admin) return res.status(403).json({
        status: 403,
        errors: [
			{
				param: "user",
				message:'NOT_AUTHORIZED'
			}
		]
    });
    next();
}