/*
Schema is an object that defines the structure of any documents that will be stored in your MongoDB collection; it enables you to define types and validators for all of your data items.

Model is an object that gives you easy access to a named collection, allowing you to query the collection and use the Schema to validate any documents you save to that collection. It is created by combining a Schema, a Connection, and a collection name.
*/

const _ = require("lodash");
const validator = require("validator");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        unique: true,
        validate: { // if validator returns false, return message.
            validator: (value) => {
                return validator.isEmail(value);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
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

// Determines what is sent back when a model is converted to a JSON value (w/ tokens). This OVERRIDES the method that converts our mongoose model into a JSON object before sending it back. We're clipping off the data we don't want to return, like the password and the email.
UserSchema.methods.toJSON = function() {
    var user = this;
    var userObject = user.toObject(); // Convert mongoose obj to reg. object.

    return _.pick(userObject, ['_id', 'email']);
};


// Returns a promise that resolves with the signed user token.
UserSchema.methods.generateAuthToken = function () { // Where our instance methods live. They have access to the original document.
    var user = this; // This document.
    var access = 'auth';
    var token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString(); // salt it!

    user.tokens = user.tokens.concat([{access, token}]); // Push is inconsistent across versions.

    return user.save().then(() => {
        return token; // Token is success argument for next then call
    });
};

var User = mongoose.model("User", UserSchema);

module.exports = {
    User
}