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
                    likeCount: doc.data().likeCount
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

//comment ona quip
exports.commentOnQuip = (req, res) =>{
    if(req.body.body.trim() === '') return res.status(400).json({ error: 'Must not be empty'});

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