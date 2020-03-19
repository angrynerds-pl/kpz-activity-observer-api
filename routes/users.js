const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateRegisterRules, validateUpdateRules, validate } = require('../middleware/validate.js')
const {User} = require('../models/user');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

/**
 * @swagger
 *
 * definitions:
 *   User:
 *     type: object
 *     required:
 *       - id
 *       - name
 *       - surname
 *       - email
 *     properties:
 *       id:
 *         type: string
 *       name:
 *         type: string
 *         example: Jan
 *       surname:
 *         type: string
 *         example: Kowalski
 *       email:
 *         type: string
 *         format: email
 *   NewUser:
 *     type: object
 *     required:
 *       - password
 *       - name
 *       - surname
 *       - email
 *     properties:
 *       password:
 *         type: string
 *       name:
 *         type: string
 *         example: Jan
 *       surname:
 *         type: string
 *         example: Kowalski
 *       email:
 *         type: string
 *         format: email
 *   token:
 *     type: object
 *     properties:
 *       x-auth-token:
 *         type: string
 *   error:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       errors:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             param:
 *               type: string
 *             message: 
 *               type: string
 *   response:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       data:
 *         $ref: '#/definitions/User'
 *   paginationResponse:
 *     type: object
 *     properties: 
 *       status:
 *         type: number
 *       data: 
 *         type: object
 *         properties:
 *           docs:
 *             $ref: '#/definitions/User'
 *           total:
 *             type: number
 *           limit:
 *             type: number
 *           page:
 *             type: number
 *           pages:
 *             type: number
 *                 
 */

 /**
 * @swagger
 *
 * /users/me:
 *   get:
 *     tags: [users]
 *     description: Get logged user data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: x-auth-token
 *         description: User's JWT
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/token'
 *     responses:
 *       200:
 *         description: User data
 *         schema:
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get('/me', auth, async (req, res) => {
	res.status(200).json({
		status: 200,
		data: req.user
	});
});


 /**
 * @swagger
 *
 * /users?limit=<value>&page=<value>:
 *   get:
 *     tags: [users]
 *     description: Get all users data(for admin only)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: x-auth-token
 *         description: Admin's JWT
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/token'
 *     responses:
 *       200:
 *         description: Users data
 *         schema:
 *           $ref: '#/definitions/paginationResponse'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.get('/', auth, admin, async (req, res) => {
	await User.paginate({}, { page: parseInt(req.query.page), limit: parseInt(req.query.limit), select: "-password" })
	.then(response => {
		res.status(200).json({
			status: 200,
			data: response
		});
	});
});

/**
 * @swagger
 *
 * /users/delete:
 *   delete:
 *     tags: [users]
 *     description: Drop entire database(for develop purposes only, will be removed in the future)
 *     responses:
 *       200:
 *         description: Success
 *       500:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.delete('/delete', async (req, res) => {
	if(process.env.NODE_ENV == 'development'){
		await User.collection.drop();
		res.status(200).json({
			status: 200
		});
	}
});


/**
 * @swagger
 *
 * /users/:
 *   patch:
 *     tags: [users]
 *     description: Change user's data
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: x-auth-token
 *         description: User's JWT
 *         in:  header
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/token'
 *       - name: user
 *         description: User data
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewUser'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.patch('/', auth, validateUpdateRules(), validate, async (req, res) => {
	let body = req.body;
	if (req.body.email && req.body.email != req.user.email) {
		let user = await User.findOne({
			email: req.body.email
		});
		if (user) return res.status(400).json({
			status: 400, 
			errors: [
				{
					param: "email",
					message:'EMAIL_TAKEN'
				}
			]
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
				message:"USER_UPDATED"
			});
		} else {
			res.status(503).json({
				status: 503, 
				errors: [
					{
						param: "system",
						message:'SYSTEM_ERROR'
					}
				]
			});
		}
	});
	
});

/**
 * @swagger
 *
 * /users/:
 *   post:
 *     tags: [users]
 *     description: Register new user
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: New User data
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewUser'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */

router.post('/', validateRegisterRules(), validate, async (req, res) => {
	let user = await User.findOne({
		email: req.body.email
	});
	if (user) return res.status(400).json({
		status: 400, 
		errors: [
			{
				param: "email",
				message:'EMAIL_TAKEN'
			}
		]
	});

	user = new User(req.body);
	const salt = await bcrypt.genSalt(10);
	user.password = await bcrypt.hash(user.password, salt);
	await user.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message: "USER_CREATED"
			});
		} else {
			res.status(503).json({
				status: 503, 
				errors: [
					{
						param: "system",
						message:'SYSTEM_ERROR'
					}
				]
			});
		}
	});

});

module.exports = router;