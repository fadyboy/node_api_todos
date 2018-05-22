const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const _ = require("lodash");

// create user schema object, useful for adding instance methods 
var userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'User email is required'],
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        minlength: 6,
        required: true
    },
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
})

// override toJSON() to return only specified properties from user object
userSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return _.pick(userObject, ['_id', 'email'])
}

userSchema.methods.generateAuthToken = function () {
    // use regular function as arrow functions do not bind to 'this'
    var user = this;
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'testing123').toString();

    user.tokens = user.tokens.concat([{token, access}]);

    return user.save().then(() => {
        return token;
    })
    
}

var User = mongoose.model("User", userSchema);

module.exports = {User};