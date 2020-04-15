const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const url = require('../middleware/url');
const { validateSiteRules, validateUpdateSiteRules, validate } = require('../middleware/validate.js')
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
 *       totalVisits:
 *         type: number
 *       totalTime:
 *         type: number
 *       occurences:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             user:
 *               type: string
 *             time:
 *               type: number
 *             visits:
 *               type: number
 *             timestamps: 
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   startTime:
 *                     type: string
 *                     format: date-time
 *   UserSite:
 *     type: object
 *     properties:
 *       url:
 *         type: string
 *       time:
 *         type: number
 *       visits:
 *         type: number
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
 *   EditSite:
 *     type: object
 *     required:
 *       - url
 *       - endTime
 *       - recordID
 *     properties:
 *       url:
 *         type: string
 *       endTime:
 *         type: string
 *         format: date-time
 *       recordID:
 *         type: string
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
 *   responseUser:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       data:
 *         $ref: '#/definitions/UserSite'
 *   NewSiteResponse:
 *     type: object
 *     properties:
 *       status:
 *         type: number
 *       message: 
 *         type: string
 *       recordID:
 *         type: string
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
 *           $ref: '#/definitions/responseUser'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.get('/me', auth, async (req, res) => {
	let sites = await Site.find( { 'occurences.user': { $eq: req.user._id} } );
	let userSites = [];
	sites.forEach(item =>{
		let index = item.occurences.findIndex(i =>{
			return i.user == req.user._id
		})
		userSites.push({
			url: item.url,
			visits: item.occurences[index].visits,
			time: item.occurences[index].time,
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
	let sites = await Site.find( { 'occurences.user': { $eq: req.params.id} } );
	let userSites = [];
	sites.forEach(item =>{
		let index = item.occurences.findIndex(i =>{ 
			return i.user == req.params.id
		});	
		userSites.push({
			url: item.url,
			visits: item.occurences[index].visits,
			time: item.occurences[index].time,
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
 *         schema: 
 *           $ref: '#/definitions/NewSiteResponse'
 *       400:
 *         description: Error
 *         schema:
 *           $ref: '#/definitions/error'
 */
router.post('/', auth, validateSiteRules(), validate, url, async (req, res) => {
	let site = await Site.findOne({url: req.url});
	let timeCount = 0;
	if(req.body.endTime) {
		let dateStart = new Date(req.body.startTime);
		let dateEnd = new Date(req.body.endTime);
		timeCount = Math.ceil(parseFloat((dateEnd - dateStart)/(1000*60)));
	}
	let index;
	if(!site) {
		site = new Site({
			url: req.url,
			occurences:[{
				user: req.user._id,
				timestamps: req.body.endTime ? [] : [{startTime: req.body.startTime}]
			}]
		})
		index = 0;
	} else {
		index = site.occurences.findIndex(item => {return item.user == req.user._id});
		site.totalVisits += 1;
		if(index < 0) {
			site.occurences.push({
				user: req.user._id,
				timestamps: req.body.endTime ? [] : [{startTime: req.body.startTime}]
			});
			index = site.occurences.length - 1;
		} else {
			site.occurences[index].visits += 1;
			if(!req.body.endTime) {
				site.occurences[index].timestamps.push({
					startTime: req.body.startTime,
				})
			}
		}
	}
	if(timeCount >= 1) {
		site.totalTime += timeCount;
		site.occurences[index].time += timeCount;
	}
	await site.save((err)=>{
		if(!err) {
			res.status(201).json({
				status: 201, 
				message: "SAVED",
				recordID: req.body.endTime ? "" : site.occurences[index].timestamps[site.occurences[index].timestamps.length - 1]._id
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
 * /sites/:
 *   patch:
 *     tags: [sites]
 *     description: Add visit endTime
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: site
 *         description: Visit endtime, url and recordID
 *         in:  body
 *         required: true
 *         type: string
 *         schema:
 *           $ref: '#/definitions/EditSite'
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
router.patch('/', auth, validateUpdateSiteRules(), validate, url, async (req, res) => {
	let site = await Site.findOne({url: req.url});
	let index = site.occurences.findIndex(item =>{return item.user == req.user._id});
	if(index < 0) {
		res.status(400).json({
			status: 400, 
			errors: [
				{
					param: "site",
					message:'NO_OCCURENCES'
				}
			]
		});
	} else {
		let timestampIndex = site.occurences[index].timestamps.findIndex(item => {return item._id == req.body.recordID})
		if (timestampIndex < 0) {
			res.status(400).json({
				status: 400, 
				errors: [
					{
						param: "site",
						message:'NO_TIMESTAMP'
					}
				]
			});
		} else {
			let dateStart = new Date(site.occurences[index].timestamps[timestampIndex].startTime);
			let dateEnd = new Date(req.body.endTime);
			let timeCount = Math.ceil(parseFloat((dateEnd - dateStart)/(1000*60)));
			if(timeCount >= 1) {
				site.totalTime += timeCount;
				site.occurences[index].time += timeCount;
				site.occurences[index].timestamps.pull({_id: req.body.recordID});
			} else {
				res.status(503).json({
					status: 503, 
					errors: [
						{
							param: "endTime",
							message:'BAD_VALUE'
						}
					]
				});
			}
			
			await site.save((err)=>{
				if(!err) {
					res.status(200).json({
						status: 200, 
						message: "SAVED",
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
		}
	}
});

module.exports = router;