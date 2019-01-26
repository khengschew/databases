var models = require('../models');

module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get(result => {
        res.status(200).send({results:result});
      });
    },
    post: function (req, res) {
      models.messages.post(req.body, result => {
        res.status(201).send(result);
      });
    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      models.users.get(result => {
        res.status(200).send({results:result});
      });
    },
    post: function (req, res) {
      models.users.post(req.body.username, (userId) => {
        res.status(201).send({userId:userId});
      });
    }
  }
};

