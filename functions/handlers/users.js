// importing util and validators
const {db, admin} = require('../util/admin');
const {validateSignUpData, validateLoginData, reduceUserDetails} = require('../helpers/validators');

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
                return res.status(500).json({ general: 'Something went wrong, please try again'});
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
            // auth/wrong-password
            // auth/user-not-found
            return res.status(403).json({ general: 'Wrong Credentials, please try again'});
        });
    
}

//Add user details
exports.addUserDetails = (req,res)=>{
    let userDetails = reduceUserDetails(req.body);

    db.doc(`/users/${req.user.userHandle}`).update(userDetails)
        .then(()=>{
            return res.json({message: 'Details added succesfully'})
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code});
        });
};

//upload user profile image
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

//Get own user details
exports.getAuthenticatedUser = (req,res)=>{
    let userData = {};
    db.doc(`/users/${req.user.userHandle}`).get()
        .then(doc =>{
            if(doc.exists){
                userData.credentials = doc.data();
                return db.collection('likes').where('userHandle', '==', req.user.userHandle).get();
            }
        })
        .then(data => {
            userData.likes = [];
            data.forEach(doc =>{
                userData.likes.push(doc.data());
            });
            // return res.json(userData);
            return db.collection('notifications').where('recipient', '==', req.user.userHandle)
                .orderBy('createdAt', 'desc').limit(10).get();
        })
        .then(data => {
            userData.notifications = [],
            data.forEach(doc => {
                userData.notifications.push({
                    recipient: doc.data().recipient,
                    sender: doc.data().sender,
                    createdAt: doc.data().createdAt,
                    quipId: doc.data().quipId,
                    type: doc.data().type,
                    read: doc.data().read,
                    notificationId: doc.id
                })
            });
            return res.json({userData});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error : err.code});
        })
};


//get any user's details
exports.getUserDetails = (req, res)=>{
    let userData = {};
    db.doc(`/users/${req.params.userHandle}`).get()
        .then(doc => {
            if(doc.exists){
                userData.user = doc.data();
                return db.collection('Quips').where('userHandle', '==', req.params.userHandle)
                    .orderBy('createdAt', 'desc')
                    .get();
            }else{
                return res.status(404).json({ error: 'User not found'})
            }
        })
        .then(data =>{
            userData.quips = [];
            data.forEach(doc =>{
                userData.quips.push({
                    body: doc.data().body,
                    createdAt: doc.data().createdAt,
                    userHandle: doc.data().userHandle,
                    userImage: doc.data().userImage,
                    likeCount: doc.data().likeCount,
                    commentCount: doc.data().commentCount,
                    quipId: doc.id
                })
            });
            return res.json(userData);
        })
        .catch(err =>{
            console.log(err);
            return res.status(500).json({ error: err.code })
        })
}

//mark read notifications
exports.markNotificationsRead = (req, res) =>{
    let batch = db.batch();
    res.body.forEach(notificationId => {
        const notification = db.doc(`/notifications/${notificationId}`);
        batch.update(notification, { read: true})
    });
    batch.commit()
        .then(() => {
            return res.json({ message: 'Notifications marked read'})
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({ error: err.code});
        })
}