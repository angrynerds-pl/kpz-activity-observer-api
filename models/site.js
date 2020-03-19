const mongoose = require('mongoose');
const uuid = require('node-uuid');

const siteSchema = new mongoose.Schema({
	_id: {
		type: String,
		default: uuid.v4
    },
	url: {
        type: String,
        required: true
    },
    occurences: [{ 
        user: {
            type: String,
            ref: 'User'
        },
        timestamps: [{
            startTime: {
                type: Date,
                required: true
            },
            endTime: {
                type: Date
            }
        }]  
    }]
});


const Site = mongoose.model('Site', siteSchema);

exports.siteSchema = siteSchema;
exports.Site = Site;