const {db} = require("../utilities/admin");
const firebase = require("firebase");
const {validSignupData, validLoginData} = require("../utilities/validation");

exports.userSignup = (req, res) => {
	//MODEL FOR DATABASE ENTRY
	const newUser = {
		email: req.body.email,
		password: req.body.password,
		confirmPassword: req.body.confirmPassword,
		userHandle: req.body.userHandle //USERNAME OR ORGANIZATION NAME
		//location: country or state
		//cause: restrict this to 5-10 caterogies
	};

	const {valid, errors} = validSignupData(newUser);

	if (!valid) return res.status(400).json(errors);

	let token, userId;
	// CHECKS FOR DUPLICATE HANDLE 'username'
	db.doc(`/users/${newUser.userHandle}`)
		.get()
		.then((doc) => {
			if (doc.exists) {
				return res.status(400).json({userHandle: "handle already exists"});
			} else {
				return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
			}
		})
		//AUTHORIZATION TOKEN FOR SENSITIVE INFO/CONFIRMS NEW USER CREATION
		.then((data) => {
			userId = data.user.uid;
			return data.user.getIdToken();
		})
		.then((idtoken) => {
			token = idtoken;
			const userCreds = {
				userHandle: newUser.userHandle,
				email: newUser.email,
				userId
			};
			return db.doc(`/users/${newUser.userHandle}`).set(userCreds);
		})
		.then(() => {
			return res.status(201).json({message: `user signed up real good`, token});
		})

		//CHECKS FOR DUPLICATE ENTRIES ON EMAIL
		.catch((err) => {
			console.error(err);
			if (err.code === "auth/email-already-in-use") {
				return res.status(400).json({email: "email already registered"});
			} else {
				return res.status(500).json({error: err.code});
			}
		});
};

exports.userLogin = (req, res) => {
	const user = {
		email: req.body.email,
		password: req.body.password
	};

	const {valid, errors} = validLoginData(user);

	if (!valid) return res.status(400).json(errors);

	firebase
		.auth()
		.signInWithEmailAndPassword(user.email, user.password)
		.then((data) => {
			return data.user.getIdToken();
		})
		.then((token) => {
			return res.json({token});
		})
		// CATCHES WRONG PASSWORD
		.catch((err) => {
			console.error(err);
			if (err.code === "auth/wrong-password") {
				return res.status(403).json({general: "password is all messed up"});
			} else {
				return res.status(500).json({error: err.code});
			}
		});
};
