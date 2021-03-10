const {admin, db} = require('../util/admin');

//Verifying and authenticating logged in user
exports.FBAuth = (req,res,next)=>{
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

// module.exports = FBAuth