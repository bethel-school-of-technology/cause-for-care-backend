const {db} = require('../utilities/admin');

exports.postOneJob = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'cant leave body empty'});
  }

  const newMessage = {
    title: req.body.title,
    body: req.body.body,
    orgHandle: req.user.orgHandle
  };

  db.collection('jobs')
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

exports.getJobs = (req, res) => {
  db.collection('jobs')
    .get()
    .then(data => {
      let messages = [];
      data.forEach(doc => {
        messages.push({
          messageId: doc.id,
          title: doc.data().title,
          body: doc.data().body,
          orgHandle: doc.data().orgHandle
        });
      });
      return res.json(messages);
    })
    .catch(err => console.error(err));
};

//exports. jobapp >>>
//first name
//last name
//phone number
// email
//upload file (resume)
