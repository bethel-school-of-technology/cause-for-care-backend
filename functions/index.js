const functions = require('firebase-functions');
const app = require('express')();
const userAuth = require('./utilities/userAuth');
const orgAuth = require('./utilities/orgAuth');
const {
  getMessages,
  getMessage,
  postOneMessage,
  orgPostOneMessage,
  commentOnUpdate
} = require('./handlers/messages');
const {userSignup, userLogin, uploadPhoto, getAuthUser} = require('./handlers/users');
const {orgSignup, orgLogin, addOrgDetails, searchOrgs, getAllOrgs} = require('./handlers/orgs');
const {postNewUpdate, getUpdate, getUpdates, getOrgUpdates} = require('./handlers/orgUpdates');
const {postOneJob, getJobs, getJobListing} = require('./handlers/jobs');
const cors = require('cors');

app.use(cors());

//need:
// delete job posts route
//delete comments route
//delete blogpost route
// follow organization updates
//job app route? // app.post('/job/app/:messageId); easier if it were through email...or use post one messge route somehow?

// JOBBOARD FUNCTIONS

app.post('/jobs', orgAuth, postOneJob); //posts one job with org verification
app.get('/orgjobs', getJobs); //gets all job listings
app.get('/jobs/:messageId', getJobListing); //gets one listing

//POSTS ROUTES
app.get('/messages', getMessages); //gets all messages
app.get('/message/:messageId', getMessage); //gets 1 message from message database

// ADD USER/LOGIN TO DATABASE ROUTE // COPY AND MODIFY FOR ORGANIZATIONS
app.post('/usersignup', userSignup);
app.post('/userlogin', userLogin);
app.post('/user/image', userAuth, uploadPhoto); //user uploads profile pic
app.get('/user', userAuth, getAuthUser); //gets self user info
app.post('/orgupdate/:messageId/comment', userAuth, commentOnUpdate); //user can comment on specific orgUpdate

//ORG LOGIN AND SIGNUP
app.post('/orgsignup', orgSignup);
app.post('/orglogin', orgLogin);
app.post('/org', orgAuth, addOrgDetails);

//ORGUPDATES
app.post('/orgupdate', orgAuth, postNewUpdate); // org posts message
app.get('/orgs', getAllOrgs); // gets all orgs in org database
app.get('/search', searchOrgs); //search by cause and location
app.get('/orgupdates', getUpdates); //gets all updates
app.get('/orgupdate/:messageId', getUpdate); //gets 1 update
app.get('/getorgupdates/:orgHandle', getOrgUpdates); // gets all updates of 1 orghandle

exports.api = functions.https.onRequest(app);
