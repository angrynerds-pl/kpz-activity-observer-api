const { check, validationResult } = require('express-validator');

exports.validateRegisterRules = () => {
    return [
        check('name').exists().withMessage("MISSING"),
        check('surname').exists().withMessage("MISSING"),
        check('email').exists().withMessage("MISSING").isEmail().withMessage("BAD_FORMAT"),
        check('password').exists().withMessage("MISSING").isLength({min: 4}).withMessage("TOO_SHORT").isLength({max: 32}).withMessage("TOO_LONG")
    ]
}

exports.validateLoginRules = () => {
	return [
		check('email').exists().withMessage("MISSING").isEmail().withMessage("BAD_FORMAT"),
		check('password').exists().withMessage("MISSING").isLength({min: 4}).withMessage("TOO_SHORT").isLength({max: 32}).withMessage("TOO_LONG")
	]
}

exports.validateUpdateRules = () => {
	return [
		check('name').optional(),
        check('surname').optional(),
        check('email').optional().isEmail().withMessage("BAD_FORMAT"),
        check('password').exists().withMessage("MISSING").isLength({min: 4}).withMessage("TOO_SHORT").isLength({max: 32}).withMessage("TOO_LONG")
	]
}

exports.validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      	return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({
        param: err.param, 
        message: err.msg 
    }))
  
    return res.status(422).json({
		status: 422,
      	errors: extractedErrors,
    })
}