// importing util and validators
const {db, admin} = require('../util/admin');
const {validateSignUpData, validateLoginData} = require('../helpers/validators');

//initializing firebase
const firebaseConfig = require('../../firebase');
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);

// SIgnup handler
exports.signUp = (req,res)=>{
    const {email, password, userHandle, confirmPassword} = req.body
    const newUser = {
        email, password, userHandle, confirmPassword
    };
    // validating data
    const {valid, errors} = validateSignUpData(newUser);
    if(!valid) return res.status(400).json(errors);

    //adding profile image
    const noImg = 'no_img.png'
    
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
                imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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
}

//Login handler
exports.logIn = (req,res)=>{
    const {email, password} = req.body;
    const user ={email ,password};
    // validating data
    const {valid, errors} = validateLoginData(user);
    if(!valid) return res.status(400).json(errors)
    
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
    
}

exports.uploadImage = (req, res)=>{
    const BusBoy = require('busboy');
    const path = require('path');
    const os = require('os');
    const fs = require('fs');

    const busBoy = new BusBoy({ headers : req.headers});

    let imageFileName;
    let imageToBeUploaded = {};

    busBoy.on('file', (fieldname, file, filename, encoding, mimetype)=>{
        if(mimetype !== 'image/jpeg' && mimetype !== 'image/png'){
            return res.status(400).json({error : 'wrong file submitted'})
        }
        const imageExtension = filename.split('.')[filename.split('.').length - 1];
        imageFileName = `${Math.round(Math.random()* 100000000000)}.${imageExtension}`;

        const filePath = path.join(os.tmpdir(), imageFileName);
        imageToBeUploaded = { filePath, mimetype };

        file.pipe(fs.createWriteStream(filePath));
    });
    busBoy.on('finish', ()=>{
        admin.storage().bucket().upload(imageToBeUploaded.filePath, {
            resumable: false,
            metadata: {
                metadata: {
                    contentType: imageToBeUploaded.mimetype
                }
            }
        })
        .then(()=>{
            //alt=media shows the image in  the browser when we acess the link
            const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
            return db.doc(`/users/${req.user.userHandle}`).update({ imageUrl });
        })
        .then(()=>{
            return res.json({message : 'Image uploaded succesfully'})
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({error: err.code});
        })
    });
    busBoy.end(req.rawBody);
}