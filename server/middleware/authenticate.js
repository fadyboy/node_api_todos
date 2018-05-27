const {User} = require('../models/user');

// Create middleware that can be used to make routes private
var authenticate = (req, res, next) => {
    var token = req.header('x-auth');
    User.findByToken(token).then((user) => {
        if (!user) {
            return res.status(404).send({msg:"No user found"});
        }
        req.user = user;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send({msg: e})
    });
}

module.exports = {authenticate};