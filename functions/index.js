const functions = require("firebase-functions");
const admin = require('firebase-admin');
const app = require('express')();

admin.initializeApp()


const firebaseConfig = require('./../firebase');
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

const db = admin.firestore();

// importing helper functions 
const {isEmpty, isEmail} = require("./helpers/helperFunctions");


//@route:   GET api/quips
//@desc:    Get all quips
//@access:  Public
app.get('/quips', (req,res)=>{
    db.collection('Quips')
        .orderBy('createdAt', 'desc').get()
        .then(data => {
            let quips = [];
            data.forEach(doc => {
                quips.push({
                    quipId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt
                });
            });
            return res.json(quips);
        })
        .catch(err => console.error(err));
})

//Verifying and authenticating logged in user
const FBAuth = (req,res,next)=>{
    let idToken;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')){
        idToken = req.headers.authorization.split('Bearer ')[1]; //getting authorization token
    }else {
        console.error('No token found')
        return res.status(403).json({ error: 'Unauthorized'});
    }

    // verifying user with token
    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            console.log(decodedToken);
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            req.user.userHandle = data.docs[0].data().userHandle;
            return next();
        })
        .catch(err =>{
            console.error('Error while verifying token', err)
            return res.status(403).json(err);
        })
}


//@route:   POST api/quips
//@desc:    create a quip
//@access:  Public
app.post('/quips', FBAuth, (req,res)=>{
    const {body} = req.body;
    if(body.trim() === ""){
        return res.status(400).json({ body: 'Body must not be empty'});
    }

    const newQuip = {
        body,
        userHandle: req.user.userHandle,
        createdAt: new Date().toISOString()
    };

    db.collection('Quips').add(newQuip)
        .then(doc=> {
            res.json({ message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err);
        })
})

//@route:   POST api/signup
//@desc:    Sign up
//@access:  Public
app.post('/signup', (req,res)=>{
    const {email, password, userHandle, confirmPassword} = req.body
    const newUser = {
        email, password, userHandle, confirmPassword
    };

    let errors = {};
    if(isEmpty(newUser.email)){
        errors.email = 'Must not be empty'
    }else if(!isEmail(newUser.email)){
        errors.email = 'Must be a valid email address'
    }

    if(isEmpty(newUser.password))errors.password = 'Must not be empty';
    if(newUser.password !== newUser.confirmPassword) errors.confirmPassword = 'Passwords must match';
    if(isEmpty(newUser.userHandle)) errors.userHandle = 'Must not be empty';

    if(Object.keys(errors).length > 0) return res.status(400).json(errors);
    //Todo: validate data
    let token, userId;
    db.doc(`/users/${newUser.userHandle}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({ userHandle: 'this handle is already taken'});
            }else{
                return firebase.auth()
                        .createUserWithEmailAndPassword(newUser.email, newUser.password)
            }
        })
        .then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        })
        .then(idToken => {
            token = idToken;
            const {userHandle, email} = newUser;
            const userCredentials = {
                userHandle,
                email,
                createdAt: new Date().toISOString(),
                userId
            };
            return db.doc(`/users/${userHandle}`).set(userCredentials);
        })
        .then(() => {
            return res.status(201).json({token});
        })
        .catch(err => {
            console.error(err);
            if(err.code === "auth/email-already-in-use"){
                return res.status(400).json({ email: 'Email is already in Use'})
            }else{
                return res.status(500).json({ error: err.code});
            }    
        })
});

//@route:   POST api/login
//@desc:    Log in
//@access:  Public
app.post('/login', (req,res)=>{
    const {email, password} = req.body;
    const user ={email ,password};

    let errors = {};
    if(isEmpty(user.email)) errors.email = 'Must not be empty';
    if(isEmpty(user.password)) errors.password = 'Must not be empty';

    if(!isEmail(user.email)) errors.email = 'Enter a valid email';
    if(Object.keys(errors).length > 0) return res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return data.user.getIdToken();
        })
        .then(token => {
            return res.json({token});
        })
        .catch(err => {
            console.error(err);
            if(err.code === 'auth/wrong-password'){
                return res.status(403).json({ general: 'Wrong Credentials, please try again'});
            }else{
                return res.status(500).json({error: err.code});
            } 
        });
    
})
exports.api = functions.https.onRequest(app);