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