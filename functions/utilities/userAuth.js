const {admin, db} = require("./admin");

module.exports = (req, res, next) => {
	let idToken;
	if (req.headers.authorization) {
		idToken = req.headers.authorization;
	} else {
		console.error("couldnt retrive token");
		return res.status(403).json({error: "couldnt retrieve token"});
	}

	admin
		.auth()
		.verifyIdToken(idToken)
		.then((decodedToken) => {
			req.user = decodedToken;
			console.log(decodedToken);
			return db
				.collection("users")
				.where("userId", "==", req.user.uid)
				.limit(1)
				.get();
		})
		.then((data) => {
			req.user.userHandle = data.docs[0].data().userHandle;
			return next();
		})
		.catch((err) => {
			console.error("could not verify token", err);
			return res.status(403).json({error: "could not verify token"});
		});
};
