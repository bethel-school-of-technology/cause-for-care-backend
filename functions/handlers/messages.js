const {db} = require("../utilities/admin");

exports.getMessages = (req, res) => {
	db.collection("messages")
		.get()
		.then((data) => {
			let messages = [];
			data.forEach((doc) => {
				messages.push({
					userHandle: doc.data().userHandle,
					body: doc.data().body
				});
			});
			return res.json(messages);
		})
		.catch((err) => console.error(err));
};

exports.postOneMessage = (req, res) => {
	if (req.body.body.trim() === "") {
		return res.status(400).json({body: "cant leave body empty"});
	}

	const newMessage = {
		body: req.body.body,
		userHandle: req.user.userHandle
	};

	db.collection("messages")
		.add(newMessage)
		.then((doc) => {
			res.json({message: `document ${doc.id} all good it got created`});
		})
		.catch((err) => {
			res.status(500).json({error: "something broke dude fix it"});
			console.error(err);
		});
};
