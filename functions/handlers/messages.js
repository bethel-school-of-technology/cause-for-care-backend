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
