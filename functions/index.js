const functions = require("firebase-functions");

const app = require('express')();

// importing handlers functions
const { getAllQuips, postQuip, getQuip, commentOnQuip , likeQuip, unLikeQuip, deleteQuip} = require("./handlers/quips");
const { signUp, logIn, uploadImage, addUserDetails, getAuthenticatedUser } = require("./handlers/users");

// importing user authentication function
const {FBAuth} = require('./helpers/userAuthenticator');

//User's routes
app.post('/signup', signUp); //@access: Public //@desc: Sign up //@route: POST api/signup
app.post('/login', logIn); //@access:  Public //@desc: Login //@route: POST api/login
app.post('/user/image', FBAuth, uploadImage); //@access: Private //@desc: upload user image //@route: POST api/user/image
app.post('/user', FBAuth, addUserDetails); //@access: Private //@desc: add user details //@route: POST api/user
app.get('/user', FBAuth, getAuthenticatedUser); //@access: Private //@desc: get own user details //@route: GET api/user

//Quip's routes
app.get('/quips', getAllQuips);//@access: Public //@desc: Get all quips //@route: GET api/quips
app.post('/quip', FBAuth, postQuip); //@access: Private //@desc: Post a quip //@route: POST api/quip
app.get('/quip/:quipId', getQuip); //@access: Public //@desc: Get quip by id //@route: GET api/quip
app.get('/quip/:quipId/unlike', FBAuth, unLikeQuip); //@access: Private //@desc: Unlike a quip //@route: GET api/quip/:quipId/unlike
app.get('/quip/:quipId/like', FBAuth, likeQuip); //@access: Private //@desc: Like a quip //@route: GET api/quip/:quipId/like
app.post('/quip/:quipId/comment', FBAuth, commentOnQuip); //@access: Private //@desc: Comment on Quip //@route: GET api/quip/:quipId/comment
app.delete('/quip/:quipId', FBAuth, deleteQuip) //@access: Private //@desc: delete a quip //@route: GET api/quip/:quipId


exports.api = functions.https.onRequest(app);