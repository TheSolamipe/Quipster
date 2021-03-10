const functions = require("firebase-functions");

const app = require('express')();

// importing handlers functions
const { getAllQuips, postQuip } = require("./handlers/quips");
const { signUp, logIn, uploadImage } = require("./handlers/users");

// importing user authentication function
const {FBAuth} = require('./helpers/userAuthenticator');

//User's routes

//@route:   POST api/signup
//@desc:    Sign up
//@access:  Public
app.post('/signup', signUp);

//@route:   POST api/login
//@desc:    Log in
//@access:  Public
app.post('/login', logIn)

//@route:   POST api/user/image
//@desc:    Upload user image
//@access:  Private
app.post('/user/image', FBAuth, uploadImage)

//Quip's routes

//@route:   GET api/quips
//@desc:    Get all quips
//@access:  Public
app.get('/quips', getAllQuips)

//@route:   POST api/quips
//@desc:    create a quip
//@access:  Private
app.post('/quips', FBAuth, postQuip)


exports.api = functions.https.onRequest(app);