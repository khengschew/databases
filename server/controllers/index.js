var models = require('../models');

module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get(result => {
        res.status(200).send(result);
      });
    },
    post: function (req, res) {
      models.messages.post(req.body, result => {
        res.status(201).send();
      });
    } // a function which handles posting a message to the database
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      models.users.get(result => {
        res.status(200).send(result);
      });
    },
    post: function (req, res) {
      models.users.post(req.body.username);
      res.status(201).send();
    }
  }
};

