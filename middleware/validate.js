const { check, validationResult } = require('express-validator');

exports.validateRegisterRules = () => {
    return [
        check('name').not().isEmpty().withMessage("required"),
        check('surname').not().isEmpty().withMessage("required"),
        check('email').not().isEmpty().withMessage("required").isEmail().withMessage("email"),
        check('password').not().isEmpty().withMessage("required").isLength({min: 4}).withMessage("minLength").isLength({max: 32}).withMessage("maxLength")
    ]
}

exports.validateLoginRules = () => {
	return [
		check('email').not().isEmpty().withMessage("required").isEmail().withMessage("email"),
		check('password').not().isEmpty().withMessage("required").isLength({min: 4}).withMessage("minLength").isLength({max: 32}).withMessage("maxLength")
	]
}

exports.validateUpdateRules = () => {
	return [
		check('name').optional().not().isEmpty().withMessage("required"),
        check('surname').optional().not().isEmpty().withMessage("required"),
        check('email').optional().not().isEmpty().withMessage("required").isEmail().withMessage("email"),
        check('password').optional().not().isEmpty().withMessage("required").isLength({min: 4}).withMessage("minLength").isLength({max: 32}).withMessage("maxLength")
	]
}

exports.validateSiteRules = () => {
	return [
		check('url').not().isEmpty().withMessage("required"),
        check('startTime').not().isEmpty().withMessage("required"),
        check('endTime').optional().not().isEmpty().withMessage("required"),
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