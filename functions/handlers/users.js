const {admin, db} = require('../utilities/admin');
const firebaseConfig = require('../utilities/config');
const firebase = require('firebase');
const {validSignupData, validLoginData} = require('../utilities/validation');

exports.userSignup = (req, res) => {
  //MODEL FOR DATABASE ENTRY
  // testing verison controls now
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

  //PHOTO ASSIGNMENT//
  const noImg = 'no-img.png';
  let token, userId;
  // CHECKS FOR DUPLICATE HANDLE 'username'
  db.doc(`/users/${newUser.userHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({userHandle: 'handle already exists'});
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
        userHandle: newUser.userHandle,
        email: newUser.email,
        imageUrl: `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImg}?alt=media`,
        userId
      };
      return db.doc(`/users/${newUser.userHandle}`).set(userCreds);
    })
    .then(() => {
      return res.status(201).json({message: `user signed up real good`, token});
    })

    //CHECKS FOR DUPLICATE ENTRIES ON EMAIL
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({email: 'email already registered'});
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

//UPLOAD TO PROFILE PIC FOR SIGNED IN USER
exports.uploadPhoto = (req, res) => {
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
        return db.doc(`/users/${req.user.userHandle}`).update({imageUrl});
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

//GET OWN USER DETAILS
// use similar function to search org by location and cause
exports.getAuthUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.userHandle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.userCreds = doc.data();
        return (
          db
            .collection('likes')
            //should be similar to this for search function
            .where(`userHandle`, '==', req.user.userHandle)
            .get()
        );
      }
    })
    .then(data => {
      userData.likes = [];
      data.forEach(doc => {
        userData.likes.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};
