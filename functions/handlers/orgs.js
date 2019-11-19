const {db} = require('../utilities/admin');
const firebase = require('firebase');
const firebaseConfig = require('../utilities/config');
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
  //PHOTO ASSIGNMENT//
  const noImg = 'no-img.png';
  let token, userId;
  // CHECKS FOR DUPLICATE HANDLE 'username'
  db.doc(`/orgs/${newUser.orgHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({orgHandle: 'handle already exists'});
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    //AUTHORIZATION TOKEN FOR SENSITIVE INFO/CONFIRMS NEW USER CREATION
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idtoken => {
      token = idtoken;
      const userCreds = {
        orgHandle: newUser.orgHandle,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
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

//ADD DETAILS FOR ORGS, specific code for fields is in 'validation.js' need to add org details in order to appear in search function

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

exports.uploadOrgPhoto = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({headers: req.headers});
  let imageFileName;
  let imageToUpload = {};
  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    // console.log(fieldname);
    // console.log(file);
    // console.log(filename);
    // console.log(encoding);
    // console.log(mimetype);
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({error: 'wrong file type'});
    }
    const imageExtension = filename.split('.')[filename.split('.').length - 1];
    imageFileName = `${Math.round(Math.random() * 10000000000)}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToUpload = {filepath, mimetype};
    file.pipe(fs.createWriteStream(filepath));
  });
  busboy.on('finish', () => {
    admin
      .storage()
      .bucket('cause-for-care.appspot.com')
      .upload(imageToUpload.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToUpload.mimetype
          }
        }
      })
      .then(() => {
        const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/orgs/${req.user.orgHandle}`).update({imageUrl});
      })
      .then(() => {
        return res.json({message: 'photo to FB bucket success'});
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({message: 'photo to bucket failed'});
      });
  });
  busboy.end(req.rawBody);
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
