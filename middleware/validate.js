const { check, validationResult } = require('express-validator');

exports.validateRegisterRules = () => {
    return [
        check('name').exists(),
        check('surname').exists(),
        check('email').exists().isEmail(),
        check('password').exists().isLength({min: 4, max: 32})
    ]
}

exports.validateLoginRules = () => {
	return [
		check('email').exists().isEmail(),
		check('password').exists().isLength({min: 4, max: 32})
	]
}

exports.validateUpdateRules = () => {
	return [
		check('name').optional(),
        check('surname').optional(),
        check('email').optional().isEmail(),
        check('password').optional().isLength({min: 4, max: 32})
	]
}

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      	return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))
  
    return res.status(422).json({
		status: 422,
      	errors: extractedErrors,
    })
}