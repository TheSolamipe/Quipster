const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp()

const express = require('express');
const app = express();

//@route:   GET api/quips
//@desc:    Get all quips
//@access:  Public
app.get('/quips', (req,res)=>{
    admin.firestore().collection('Quips').get()
        .then(data => {
            let quips = [];
            data.forEach(doc => {
                quips.push(doc.data());
            });
            return res.json(quips);
        })
        .catch(err => console.error(err));
})

//@route:   POST api/quips
//@desc:    create a quip
//@access:  Public
app.post('/quips', (req,res)=>{
    const {body, userHandle} = req.body;
    const newQuip = {
        body,
        userHandle,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };

    admin.firestore()
        .collection('Quips').add(newQuip)
        .then(doc=> {
            res.json({ message: `document ${doc.id} created successfully`})
        })
        .catch(err => {
            res.status(500).json({ error: 'something went wrong'});
            console.error(err);
        })
})


exports.api = functions.https.onRequest(app);