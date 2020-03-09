const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { validateRegisterRules, validateUpdateRules, validate } = require('../middleware/validate.js')
const {Site} = require('../models/site');
const {User} = require('../models/user');
const express = require('express');
const router = express.Router();
var url = require('url');

router.get('/', auth, admin, async (req, res) => {
    let sites = await Site.find();
	res.status(200).json({
		status: 200,
		data: sites
	});
});

router.get('/:id', auth, admin, async (req, res) => {
    let user = await User.findById(req.params.id).populate("sites").select("-password");
	res.status(200).json({
		status: 200,
		data: user
	});
});

router.get('/me', auth, async (req, res) => {
    let sites = await User.findById(req.params.id).populate("Site").select("sites");
	res.status(200).json({
		status: 200,
		data: sites
	});
});

router.post('/', auth, async (req, res) => {
    const site = new Site(req.body);
    site.url = url.parse(site.url, true).host;
    await site.save(async (err)=>{
		if(!err) {
            const user = req.user;
            user.sites.push(site._id)
            await user.save((err)=>{
                if(!err) {
                    res.status(201).json({
                        status: 201, 
                        message: "SITE_SAVED",
                        data: site
                    });
                }
            })
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