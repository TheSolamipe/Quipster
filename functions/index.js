const functions = require("firebase-functions");
const admin = require('firebase-admin');

admin.initializeApp()
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

exports.getQuips = functions.https.onRequest((req, res) => {
    admin.firestore().collection('Quips').get()
        .then(data => {
            let quips = [];
            data.forEach(doc => {
                quips.push(doc.data());
            });
            return res.json(quips);
        })
        .catch(err => console.error(err));
});

exports.createQuip = functions.https.onRequest((req, res) => {
    if(req.method !== 'POST'){
        return res.status(400).json({ error: 'Method not allowed'});
    }
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
