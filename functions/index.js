const functions = require("firebase-functions");
const cors = require("cors");
const app = require('express')();
const db = require('./util/admin');

// importing handlers functions
const { getAllQuips, postQuip, getQuip, commentOnQuip , likeQuip, unLikeQuip, deleteQuip} = require("./handlers/quips");
const { signUp, logIn, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require("./handlers/users");

// importing user authentication function
const {FBAuth} = require('./helpers/userAuthenticator');

// CORS middleware
// applying CORS middleware
app.use(
    cors({
      allowedHeaders: [
        "sessionId",
        "Content-Type",
        "Origin, X-Requested-With, Accept, Authorization, remember-me, type",
      ],
      exposedHeaders: ["sessionId, Authorization"],
      origin: "*",
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
    })
  );  

//User's routes
app.post('/signup', signUp); //@access: Public //@desc: Sign up //@route: POST api/signup
app.post('/login', logIn); //@access:  Public //@desc: Login //@route: POST api/login
app.post('/user/image', FBAuth, uploadImage); //@access: Private //@desc: upload user image //@route: POST api/user/image
app.post('/user', FBAuth, addUserDetails); //@access: Private //@desc: add user details //@route: POST api/user
app.get('/user', FBAuth, getAuthenticatedUser); //@access: Private //@desc: get own user details //@route: GET api/user
app.get('/user/:userHandle', getUserDetails); //@access: Public //@desc: get a particular your details //@route: GET api/user/:userHandle
app.post('/notifications', FBAuth, markNotificationsRead); //@access: Private //@desc: mark notification //@route: GET api/notifications

//Quip's routes
app.get('/quips', getAllQuips);//@access: Public //@desc: Get all quips //@route: GET api/quips
app.post('/quip', FBAuth, postQuip); //@access: Private //@desc: Post a quip //@route: POST api/quip
app.get('/quip/:quipId', getQuip); //@access: Public //@desc: Get quip by id //@route: GET api/quip
app.get('/quip/:quipId/unlike', FBAuth, unLikeQuip); //@access: Private //@desc: Unlike a quip //@route: GET api/quip/:quipId/unlike
app.get('/quip/:quipId/like', FBAuth, likeQuip); //@access: Private //@desc: Like a quip //@route: GET api/quip/:quipId/like
app.post('/quip/:quipId/comment', FBAuth, commentOnQuip); //@access: Private //@desc: Comment on Quip //@route: GET api/quip/:quipId/comment
app.delete('/quip/:quipId', FBAuth, deleteQuip) //@access: Private //@desc: delete a quip //@route: GET api/quip/:quipId


exports.api = functions.https.onRequest(app);

//TODO: TEST NOTIFICATION FUNCTIONS
exports.createNotificationOnLike = functions.firestore.document('/likes/{id}')
    .onCreate((snapshot) =>{
        return db.doc(`/Quips/${snapshot.data().quipId}`).get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        quipId: doc.id
                    });
                }
            })
            .catch(err =>
                console.error(err))
    });

exports.deleteNotificationOnUnlike = functions.firestore.document('/likes/{id}')
    .onDelete((snapshot) =>{
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(err =>{
                console.error(err);
                return;
            })
    });

exports.createNotificationOnComment = functions.firestore.document('/comments/{id}')
    .onCreate((snapshot) =>{
        return db.doc(`/Quips/${snapshot.data().quipId}`).get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        quipId: doc.id
                    });
                }
            })
            .catch(err =>{
                console.error(err);
                return;
            })
    });

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
    .onUpdate((change) =>{
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().imageUrl !== change.after.data().imageUrl){
            console.log('image has changed');
            let batch =  db.batch();
        return db.collection('Quips').where('userHandle', '==', change.before.data().userHandle).get()
            .then((data) =>{
                data.forEach(doc => {
                    const quip = db.doc(`/Quips/${doc.id}`)
                    batch.update(quip, {userImage : change.after.data().imageUrl});
                })
                return batch.commit();
            });
        }else return true;
    });

exports.onQuipDelete = functions.firestore.document('/Quips/{quipId}')
    .onDelete((snapshot, context) =>{
        const quipId = context.params.quipId;
        const batch = db.batch();
        return db.collection('comments').where('quipId', '==', quipId).get()
            .then(data => {
                data.forEach(doc =>{
                    batch.delete(db.doc(`/comments/${doc.id}`));
                })
                return db.collection('likes').where('quipId', '==', quipId).get();
            })
            .then(data => {
                data.forEach(doc =>{
                    batch.delete(db.doc(`/likes/${doc.id}`));
                })
                return db.collection('notifications').where('quipId', '==', quipId).get();
            })
            .then(data => {
                data.forEach(doc =>{
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                })
                return batch.commit();
            })
            .catch(err =>{
                console.error(err);
            })
    })