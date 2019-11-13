const functions = require('firebase-functions');
const app = require('express')();
const userAuth = require('./utilities/userAuth');
const orgAuth = require('./utilities/orgAuth');
const { getMessages, postOneMessage, orgPostOneMessage } = require('./handlers/messages');
const { userSignup, userLogin } = require('./handlers/users');
const { orgSignup, orgLogin } = require('./handlers/orgs');
//MESSAGES ROUTES
app.get('/messages', getMessages);
app.post('/messages', userAuth, postOneMessage);
app.post('/orgmessages', orgAuth, orgPostOneMessage);
// ADD USER/LOGIN TO DATABASE ROUTE // COPY AND MODIFY FOR ORGANIZATIONS
app.post('/usersignup', userSignup);
app.post('/userlogin', userLogin);
//ORG LOGIN AND SIGNUP
app.post('/orgsignup', orgSignup);
app.post('/orglogin', orgLogin);

app.get('/orgs', (req, res) => {
	db.collection('orgs')
		.get()
		.then((data) => {
			let orgs = [];
			data.forEach((doc) => {
				orgs.push({
					orgName: doc.data().orgName,
					description: doc.data().description
				});
			});
			return res.json(orgs);
		})
		.catch((err) => console.error(err));
});

// ADD ENTRIES TO MESSAGES/POSTS DATABASE
app.post('/org', (req, res) => {
	const newOrgs = {
		description: req.body.description,
		orgName: req.body.orgName,
		location: req.body.location
	};

	db.collection('orgs')
		.add(newOrgs)
		.then((doc) => {
			res.json({ message: `document ${doc.id} all good it got created` });
		})
		.catch((err) => {
			res.status(500).json({ error: 'something broke dude fix it' });
			console.error(err);
		});
});

exports.api = functions.https.onRequest(app);
