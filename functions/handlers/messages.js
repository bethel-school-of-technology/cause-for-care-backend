const {db} = require('../utilities/admin');

exports.getMessages = (req, res) => {
  db.collection('messages')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let messages = [];
      data.forEach(doc => {
        messages.push({
          messageId: doc.id,
          userHandle: doc.data().userHandle,
          orgHandle: doc.data().orgHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(messages);
    })
    .catch(err => console.error(err));
};

exports.postOneMessage = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'cant leave body empty'});
  }

  const newMessage = {
    body: req.body.body,
    userHandle: req.user.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('messages')
    .add(newMessage)
    .then(doc => {
      const resMessage = newMessage;
      resMessage.messageId = doc.id;
      res.json(resMessage);
    })
    .catch(err => {
      res.status(500).json({error: 'something broke dude fix it'});
      console.error(err);
    });
};

exports.orgPostOneMessage = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'cant leave body empty'});
  }

  const newMessage = {
    body: req.body.body,
    orgHandle: req.user.orgHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('messages')
    .add(newMessage)
    .then(doc => {
      const resMessage = newMessage;
      resMessage.messageId = doc.id;
      res.json(resMessage);
    })
    .catch(err => {
      res.status(500).json({error: 'something broke dude fix it'});
      console.error(err);
    });
};

//possible to use this for search feature//
//use this code for each org post//
exports.getMessage = (req, res) => {
  let messageData = {};
  db.doc(`/messages/${req.params.messageId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'message not found'});
      }
      messageData = doc.data();
      messageData.messageId = doc.id;
      return (
        db
          .collection('comments')
          .orderBy('createdAt', 'desc')
          // // this code should work for sorting by location and cause '&&' <--this to add the rest of the code
          .where('messageId', '==', req.params.messageId)
          .get()
      );
    })
    .then(data => {
      messageData.comments = [];
      data.forEach(doc => {
        messageData.comments.push(doc.data());
      });
      return res.json(messageData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({error: err.code});
    });
};

exports.commentOnUpdate = (req, res) => {
  if (req.body.body.trim() === '') return res.status(400).json({comment: 'cant be empty'});

  const newComment = {
    body: req.body.body,
    createdAt: new Date().toISOString(),
    messageId: req.params.messageId,
    userHandle: req.user.userHandle,
    userImage: req.user.imageUrl
  };
  console.log(newComment);

  db.doc(`/orgUpdates/${req.params.messageId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
    })
    .then(() => {
      return db.collection('comments').add(newComment);
    })
    .then(() => {
      res.json(newComment);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({error: 'Something went wrong'});
    });
};

exports.deleteComment = (req, res) => {
  const document = db.doc(`/comments/${req.params.doc.id}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
      if (doc.data().userHandle !== req.user.userHandle) {
        return res.status(403).json({error: 'credentials not authorized to do this'});
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({message: 'post deletion success!'});
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({error: err.code});
    });
};
