const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const url = require('../middleware/url');
const { validateSiteRules, validate } = require('../middleware/validate.js')
const {Site} = require('../models/site');
const express = require('express');
const router = express.Router();


/**
 * @swagger
 *
 * definitions:
 *   Site:
 *     type: object
 *     properties:
 *       url:
 *         type: string
 *       occurences:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *             timestamps: 
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *                   endTime: 
 *                     type: string
 *                     format: date-time
 *         
 *   NewSite:
 *     type: object
 *     required:
 *       - url
 *       - startTime
 *       - surname
 *       - email
 *     properties:
 *       url:
 *         type: string
 *       startTime:
 *         type: string
 *         format: date-time
 *       endTime:
 *         type: string
 *         format: date-time
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
 *         $ref: '#/definitions/Site'
 */


 /**
 * @swagger
 *
 * /sites/:
 *   get:
 *     tags: [sites]
 *     description: Get all visits(admin only)
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
 *         description: Visits data
 *         schema:
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/', auth, admin, async (req, res) => {
    let sites = await Site.find();
	res.status(200).json({
		status: 200,
		data: sites
	});
});

 /**
 * @swagger
 *
 * /sites/me:
 *   get:
 *     tags: [sites]
 *     description: Get logged user visits
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
 *         description: User visits
 *         schema:
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/me', auth, async (req, res) => {
	let sites = await Site.find();
	sites = sites.filter(item =>{
		return item.occurences.findIndex(it =>{return it.user == req.user._id}) != -1;
	});
	let userSites = [];
	sites.forEach(item =>{
		let index = item.occurences.findIndex(i =>{
			return i.user == req.user._id
		})
		userSites.push({
			url: item.url,
			timestamps: item.occurences[index].timestamps
		});
	})

	res.status(200).json({
		status: 200,
		data: userSites
	});
});

 /**
 * @swagger
 *
 * /sites/:id:
 *   get:
 *     tags: [sites]
 *     description: Get specified user visits(admin only)
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
 *           $ref: '#/definitions/response'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/:id', auth, admin, async (req, res) => {
	let sites = await Site.find();
	sites = sites.filter(item =>{
		return item.occurences.findIndex(it =>{return it.user == req.params.id}) != -1;
	});
	let userSites = [];
	sites.forEach(item =>{
		let index = item.occurences.findIndex(i =>{ 
			return i.user == req.params.id
		});	
		userSites.push({
			url: item.url,
			timestamps: item.occurences[index].timestamps
		});
	})

	res.status(200).json({
		status: 200,
		data: userSites
	});
});


/**
 * @swagger
 *
 * /sites/:
 *   post:
 *     tags: [sites]
 *     description: Add new visit
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: site
 *         description: New visit data
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/NewSite'
 *       - name: JWT
 *         description: User'S JWT
 *         in: header
 *         required: true
 *         type: string
 *         schema: 
 *           $ref: '#/definitions/token'
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', auth, validateSiteRules(), validate, url, async (req, res) => {
	let site = await Site.findOne({url: req.body.url});
	if(!site) {
		site = new Site({
			url: req.url,
			occurences:[{
				user: req.user._id,
				timestamps: [{
					startTime: req.body.startTime,
					endTime: req.body.endTime
				}]
			}]
		})
	} else {
		let index = site.occurences.findIndex(item => {return item.user == req.user._id});
		if(index < 0) {
			site.occurences.push({
				user: req.user._id,
				timestamps: [{
					startTime: req.body.startTime,
					endTime: req.body.endTime
				}]
			});
		} else {
			site.occurences[index].timestamps.push({
				startTime: req.body.startTime,
				endTime: req.body.endTime
			})
		}
	}
	await site.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message: "SAVED"
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