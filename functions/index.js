const functions = require('firebase-functions');
const app = require('express')();
const userAuth = require('./utilities/userAuth');
const orgAuth = require('./utilities/orgAuth');
const {getMessages, getMessage, postOneMessage, orgPostOneMessage} = require('./handlers/messages');
const {userSignup, userLogin, uploadPhoto, getAuthUser} = require('./handlers/users');
const {orgSignup, orgLogin, addOrgDetails, searchOrgs} = require('./handlers/orgs');
const {postNewUpdate, getUpdate, getUpdates, getOrgUpdates} = require('./handlers/orgUpdates');
const {postOneJob, getJobs} = require('./handlers/jobs');
const cors = require('cors');

app.use(cors());

//need:
// delete messages
// follow organization updates
// organization updates and blogpost
// comment on organizations blogposts and updates

// JOBBOARD FUNCTIONS
//posts one job with org verification
app.post('/jobs', orgAuth, postOneJob);
app.get('/jobs', getJobs); //gets all job listings

//delete post function
// app.post('/jobapp);
//get one job listing
// app.get('./job/:jobId', getJob);

//POSTS ROUTES
app.get('/messages', getMessages); //gets all messages
app.get('/message/:messageId', getMessage); //gets 1 message from message database
// ADD USER/LOGIN TO DATABASE ROUTE // COPY AND MODIFY FOR ORGANIZATIONS
app.post('/usersignup', userSignup);
app.post('/userlogin', userLogin);
app.post('/user/image', userAuth, uploadPhoto); //user uploads profile pic
app.get('/user', userAuth, getAuthUser); //gets self user info
app.post('/comment', userAuth, postOneMessage); //user posts message

//ORG LOGIN AND SIGNUP
app.post('/orgsignup', orgSignup);
app.post('/orglogin', orgLogin);
app.post('/org', orgAuth, addOrgDetails);

//ORGUPDATES
app.get('/search', searchOrgs);
app.post('/orgupdate', orgAuth, postNewUpdate); //change to post to orgUpdate database? // org posts message
app.get('/orgupdates', getUpdates); //gets all updates
app.get('/orgupdate/:messageId', getUpdate); //gets 1 update
app.get('/getorgupdates/:orgHandle', getOrgUpdates); // gets all updates of 1 orghandle

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

exports.api = functions.https.onRequest(app);
