const auth = require('../middleware/auth');
const {User} = require('../models/user');
const { validateLoginRules, validate } = require('../middleware/validate.js')
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

/**
 * @swagger
 *
 * definitions:
 *   Login:
 *     type: object
 *     required:
 *       - email
 *       - password
 *     properties:
 *       email:
 *         type: string
 *         format: email
 *       password:
 *         type: string
 *         format: password
 *   JWT:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       accessToken:
 *         type: string
 *   error:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       error:
 *         type: string
 */

 /**
 * @swagger
 *
 * /auth:
 *   post:
 *     tags: [auth]
 *     description: Returns JWT
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: User credentials
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/Login'
 *     responses:
 *       200:
 *         description: JWT
 *         schema:
 *           $ref: '#/definitions/JWT'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', validateLoginRules(), validate, async (req, res) => {

	let user = await User.findOne({
		email: req.body.email
	});
	if (!user) return res.status(400).json({
		status: 400, 
		errors: [
			{
				param: "email",
				message:'USER_NOT_EXISTS'
			}
		]
	});

	const validPassword = await bcrypt.compare(req.body.password, user.password);
	if (!validPassword) return res.status(400).json({
		status: 400,
		errors: [
			{
				param: "password",
				message:'INVALID_PASSWORD'
			}
		]
	});

	const token = user.generateAuthToken();
	res.status(200).json({
		status: 200,
		data: {
			accessToken: token
		}
	});
});

/**
 * @swagger
 *
 * /auth:
 *   get:
 *     tags: [auth]
 *     description: Refresh token
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: JWT
 *         description: JWT which needs to be refreshed
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/JWT'
 *     responses:
 *       200:
 *         description: JWT
 *         schema:
 *           $ref: '#/definitions/JWT'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/', auth, async (req, res) => {

	const token = req.user.generateAuthToken();
	res.status(200).json({
		status: 200,
		data: {
			accessToken: token
		}
	});
});

module.exports = router;