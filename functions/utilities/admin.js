const admin = require("firebase-admin");
const firebase = require("firebase");
const firebaseConfig = require("../utilities/config");
const serviceAccount = require("../cause-for-care-firebase-adminsdk-zujkw-e4e009541a.json");
firebase.initializeApp(firebaseConfig);
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

module.exports = {admin, db};
