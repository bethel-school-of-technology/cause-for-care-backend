const {db} = require('../utilities/admin');

exports.postNewUpdate = (req, res) => {
  if (req.body.body.trim() === '') {
    return res.status(400).json({body: 'cant leave body empty'});
  }

  const newUpdate = {
    title: req.body.title,
    body: req.body.body,
    orgHandle: req.user.orgHandle
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
