const {db} = require('../utilities/admin');
const firebase = require('firebase');
const {validOrgSignupData, validLoginData, reduceOrgDetails} = require('../utilities/validation');

exports.orgSignup = (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    orgHandle: req.body.orgHandle //USERNAME OR ORGANIZATION NAME
    //location: country or state
    //cause: restrict this to 5-10 caterogies
  };

  const {valid, errors} = validOrgSignupData(newUser);

  if (!valid) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/orgs/${newUser.orgHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({orgHandle: 'handle already exists'});
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idtoken => {
      token = idtoken;
      const userCreds = {
        orgHandle: newUser.orgHandle,
        email: newUser.email,
        userId
      };
      return db.doc(`/orgs/${newUser.orgHandle}`).set(userCreds);
    })
    .then(() => {
      return res.status(201).json({message: `org sign up success!`, token});
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({email: 'email already registered'});
      } else {
        return res.status(500).json({error: err.code});
      }
    });
};

exports.orgLogin = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const {valid, errors} = validLoginData(user);

  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({token});
    })
    // CATCHES WRONG PASSWORD
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({general: 'password is all messed up'});
      } else {
        return res.status(500).json({error: err.code});
      }
    });
};

//ADD DETAILS FOR ORGS, specific code for fields is in 'validation.js'

exports.addOrgDetails = (req, res) => {
  let orgDetails = reduceOrgDetails(req.body);

  db.doc(`/orgs/${req.user.orgHandle}`)
    .update(orgDetails)
    .then(() => {
      return res.json({message: 'ADDED DESCRIPTION AND LOCATION!'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};

exports.searchOrgs = (req, res) => {
  db.collection('orgs')
    .where('location', '==', `${req.body.location}`)
    .where('cause', '==', `${req.body.cause}`)
    .get()
    .then(data => {
      let organizations = [];
      data.forEach(doc => {
        organizations.push({
          orgHandle: doc.data().orgHandle,
          location: doc.data().location,
          description: doc.data().descrip,
          cause: doc.data().cause
        });
      });
      return res.json(organizations);
    })
    .catch(err => console.error(err));
};

exports.getAllOrgs = (req, res) => {
  db.collection('orgs')
    .get()
    .then(data => {
      let organizations = [];
      data.forEach(doc => {
        organizations.push({
          orgHandle: doc.data().orgHandle,
          location: doc.data().location,
          description: doc.data().descrip,
          cause: doc.data().cause
        });
      });
      return res.json(organizations);
    })
    .catch(err => console.error(err));
};
