const {db} = require('../util/admin');

exports.getAllQuips = (req,res)=>{
    db.collection('Quips')
        .orderBy('createdAt', 'desc').get()
        .then(data => {
            let quips = [];
            data.forEach(doc => {
                quips.push({
                    quipId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount,
                    userImage: doc.data().userImage
                });
            });
            return res.json(quips);
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({error : err.code});
        });  
}

exports.postQuip = (req,res)=>{
    const {body} = req.body;
    if(body.trim() === ""){
        return res.status(400).json({ body: 'Body must not be empty'});
    }

    const newQuip = {
        body,
        userHandle: req.user.userHandle,
        userImage: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db.collection('Quips').add(newQuip)
        .then(doc=> {
            const resQuip = newQuip;
            resQuip.quipId = doc.id;
            res.json(resQuip)
            // res.json({ message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err);
        })
}

//get a users quip
exports.getQuip = (req,res)=>{
    let quipData = {};
    db.doc(`/Quips/${req.params.quipId}`).get()
        .then(doc =>{
            if(!doc.exists){
                return res.status(404).json({error: 'quip not found'})
            }
            quipData = doc.data();
            quipData.quipId = doc.id;
            return db.collection('comments')
                    .orderBy('createdAt', 'desc')
                    .where('quipId', '==', req.params.quipId)
                    .get();
        })
        .then(data =>{
            quipData.comments = [];
            data.forEach(doc => {
                quipData.comments.push(doc.data())
            });
            return res.json({quipData});
        })
        .catch(err =>{
            console.error(err);
            res.status(500).json({error : err.code});
        })
}

//comment on a quip
exports.commentOnQuip = (req, res) =>{
    if(req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty'});

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        quipId: req.params.quipId,
        userHandle: req.user.userHandle,
        userImage: req.user.imageUrl
    };

    db.doc(`/Quips/${req.params.quipId}`).get()
        .then(doc =>{
            if(!doc.exists){
                return res.status(404).json({ error: 'Quip not found'});
            }
            return doc.ref.update({ commentCount: doc.data().commentCount + 1});
        })
        .then(()=> {
            return db.collection('comments').add(newComment);
        })
        .then(()=>{
            res.json(newComment);
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ error: 'Something went wrong'});
        })
}

//like a quip
exports.likeQuip = (req, res) =>{
    const likeDocument = db.collection('likes').where('userHandle', '==', req.user.userHandle)
        .where('quipId', '==', req.params.quipId).limit(1);

    const quipDocument = db.doc(`/Quips/${req.params.quipId}`);

    let quipData;
    quipDocument.get()
        .then(doc => {
            if(doc.exists){
                quipData = doc.data();
                quipData.quipId = doc.id;
                return likeDocument.get();
            }else{
                return res.status(404).json({ error: 'Quip not found'});
            }
        })
        .then(data =>{
            if(data.empty){
                return db.collection('likes').add({
                    quipId: req.params.quipId,
                    userHandle: req.user.userHandle,
                    createdAt: new Date().toISOString(),
                })
                .then(() => {
                    quipData.likeCount++
                    return quipDocument.update({ likeCount: quipData.likeCount});
                })
                .then(() =>{
                    return res.json(quipData);
                })
            } else {
                return res.status(400).json({ error: ' Quip already liked'});
            }
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ error: err.code})
        })
}

//unlike liked quip
exports.unLikeQuip = (req,res) =>{
    const unlikeDocument = db.collection('likes').where('userHandle', '==', req.user.userHandle)
        .where('quipId', '==', req.params.quipId).limit(1);

    const quipDocument = db.doc(`/Quips/${req.params.quipId}`);

    let quipData;
    quipDocument.get()
        .then(doc => {
            if(doc.exists){
                quipData = doc.data();
                quipData.quipId = doc.id;
                return unlikeDocument.get();
            }else{
                return res.status(404).json({ error: 'Quip not found'});
            }
        })
        .then(data =>{
            if(data.empty){
                return res.status(400).json({ error: ' Quip not liked'});
               
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() =>{
                        quipData.likeCount--;
                        return quipDocument.update({ likeCount: quipData.likeCount});
                    })
                    .then(()=>{
                        return res.json(quipData);
                    })
            }
        })
        .catch(err => {
            console.error(err)
            res.status(500).json({ error: err.code})
        })
};

//delete a quip
exports.deleteQuip = (req, res) =>{
    const document = db.doc(`/Quips/${req.params.quipId}`);
    document.get()
        .then(doc => {
            if(!doc.exists){
                return res.status(404).json({ error: 'Quip not found'});
            }
            if(doc.data().userHandle !== req.user.userHandle){
                return res.status(403).json({ error: 'Unauthorized'});
            }else{
                return document.delete();
            }
        })
        .then(()=> {
            res.json({ message: 'Quip deleted successfully'});
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ error: err});
        })
}