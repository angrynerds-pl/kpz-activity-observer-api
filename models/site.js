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
    totalTime: {
        type: Number,
        default: 0
    },
    totalVisits: {
        type: Number,
        default: 1
    },
    occurences: [{ 
        user: {
            type: String,
            ref: 'User'
        },
        visits: {
            type: Number,
            default: 1
        },
        time: {
            type: Number,
            default: 0
        },
        timestamps: [{
            startTime: {
                type: Date,
                required: true
            }
        }]  
    }]
});


const Site = mongoose.model('Site', siteSchema);

exports.siteSchema = siteSchema;
exports.Site = Site;