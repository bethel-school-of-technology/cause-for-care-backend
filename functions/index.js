const functions = require('firebase-functions');
const app = require('express')();
const userAuth = require('./utilities/userAuth');
const orgAuth = require('./utilities/orgAuth');
const {getMessages, postOneMessage, orgPostOneMessage} = require('./handlers/messages');
const {userSignup, userLogin, uploadPhoto, getAuthUser} = require('./handlers/users');
const {orgSignup, orgLogin, addOrgDetails} = require('./handlers/orgs');
const {postOneJob, getJobs} = require('./handlers/jobs');
const cors = require('cors');

app.use(cors());

//need:
// delete messages
// follow organization updates
// organization updates and blogpost
//  comment on organizations blogposts and updates

// JOBBOARD FUNCTIONS
//gets all job listing
app.get('/jobs', getJobs);
//posts one job with org verification
app.post('/jobs', orgAuth, postOneJob);
//get one job listing
// app.get('./job/:jobId', getJob);

//POSTS ROUTES
app.get('/messages', getMessages);
//copy modify this route for job board and job posts
//user posts message
app.post('/messages', userAuth, postOneMessage);
// org posts message
app.post('/orgmessages', orgAuth, orgPostOneMessage);
// copy and modify this route for blog posts
//gets 1 message from message database
// app.get('./message/:messageId', getMessage);

// ADD USER/LOGIN TO DATABASE ROUTE // COPY AND MODIFY FOR ORGANIZATIONS
app.post('/usersignup', userSignup);
app.post('/userlogin', userLogin);
app.post('/user/image', userAuth, uploadPhoto);
//gets self user info
app.get('/user', userAuth, getAuthUser);

//ORG LOGIN AND SIGNUP
app.post('/orgsignup', orgSignup);
app.post('/orglogin', orgLogin);
app.post('/org', orgAuth, addOrgDetails);

// ADD ENTRIES TO MESSAGES/POSTS DATABASE

app.get('/organizations', (req, res) => {
  db.collection('orgs')
    .get()
    .then(data => {
      let orgs = [];
      data.forEach(doc => {
        orgs.push({
          orgName: doc.data().orgName,
          description: doc.data().description
        });
      });
      return res.json(orgs);
    })
    .catch(err => console.error(err));
});
app.post('/organizations', (req, res) => {
  const newOrgs = {
    description: req.body.description,
    orgName: req.body.orgName,
    location: req.body.location
  };

  db.collection('orgs')
    .add(newOrgs)
    .then(doc => {
      res.json({message: `document ${doc.id} all good it got created`});
    })
    .catch(err => {
      res.status(500).json({error: 'something broke dude fix it'});
      console.error(err);
    });
});

exports.api = functions.https.onRequest(app);
