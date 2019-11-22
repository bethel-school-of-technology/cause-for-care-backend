const {db} = require('../utilities/admin');

exports.postNewUpdate = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'cant leave body empty'});
  }

  const newUpdate = {
    title: req.body.title,
    body: req.body.body,
    orgHandle: req.user.orgHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('orgUpdates')
    .add(newUpdate)
    .then(doc => {
      const resMessage = newUpdate;
      resMessage.messageId = doc.id;
      res.json(resMessage);
    })
    .catch(err => {
      res.status(500).json({error: 'something broke dude fix it'});
      console.error(err);
    });
};

exports.getUpdate = (req, res) => {
  let messageData = {};
  db.doc(`/orgUpdates/${req.params.messageId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'message not found'});
      }
      messageData = doc.data();
      messageData.messageId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('messageId', '==', req.params.messageId)
        .get();
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

exports.getOrgUpdates = (req, res) => {
  db.collection('orgUpdates')
    .orderBy('createdAt', 'desc')
    .where('orgHandle', '==', `${req.params.orgHandle}`)
    .get()
    .then(data => {
      let updates = [];
      data.forEach(doc => {
        updates.push({
          messageId: doc.id,
          userHandle: doc.data().userHandle,
          orgHandle: doc.data().orgHandle,
          body: doc.data().body,
          createdAt: doc.data().createdAt
        });
      });
      return res.json(updates);
    })
    .catch(err => console.error(err));
};

exports.getUpdates = (req, res) => {
  db.collection('orgUpdates')
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
}; // gets all updates

//deletes a post
exports.deleteUpdate = (req, res) => {
  const document = db.doc(`/orgUpdates/${req.params.messageId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({error: 'post not found'});
      }
      if (doc.data().orgHandle !== req.user.orgHandle) {
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
