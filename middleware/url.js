var url = require('url');

module.exports = function (req, res, next) {
   let u = new URL(req.body.url);
   req.url = u.host;
   next();
}