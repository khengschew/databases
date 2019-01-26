var db = require('../db');
var Promise = require('bluebird');

var sendQueryAsync = (query) => {
  var promise = new Promise((resolve, reject) => {
    db.sendQuery(query, (err, result, fields) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
  return promise;
};

module.exports = {
  messages: {
    get: done => {
      db.User.sync()
        .then(() => {
          return db.Messages.findAll({
            include: [db.Room, db.User]
          });
        })
        .then((results) => {
          var messageLog = results.map(result => {
            var message = result.dataValues;
            message.roomname = message.room.name;
            message.username = message.user.name;
            message.objectId = message.id;
            return message;
          });
          done(messageLog);
        })
        .catch(err => {
          console.error(err);
        });
    },
    post: (message, done) => {   
      var userId = db.User.sync()
        .then(() => {
          return db.User.findAll({
            where: { name: message.username }
          });
        })
        .then(result => {
          if (result.length === 0) {
            return db.User.create({
              name: message.username
            });
          } else {
            return result[0];
          }
        })
        .then((result) => {
          return result.dataValues.id;
        })
        .catch(err => {
          console.error(err);
        });

      var roomId = db.Room.sync()
        .then(() => {
          return db.Room.findAll({
            where: { name: message.roomname }
          });
        })
        .then(result => {
          if (result.length === 0) {
            return db.Room.create({
              name: message.roomname
            });
          } else {
            return result[0];
          }
        })
        .then((result) => {
          return result.dataValues.id;
        })
        .catch(err => {
          console.error(err);
        });

      Promise.all([userId, roomId])
        .then(([userId, roomId]) => {
          return db.Messages.create({
            userId: userId,
            roomId: roomId,
            text: message.text
          });
        })
        .then((result) => {
          done({objectId:result.dataValues.id});
        })
        .catch(err => console.error(err));
    }
  },

  users: {
    get: done => {
      db.User.sync()
        .then(() => {
          return db.User.findAll();
        })
        .then((results) => {
          done(results);
        })
        .catch(err => {
          console.error(err);
        });
    },
    post: (username, done) => {
      db.User.sync()
        .then(() => {
          return db.User.findAndCountAll({
            where: { name: username }
          });
        })
        .then(result => {
          if (result.count > 0) {
            throw 'ERROR: that user already exists.';
          }
        })
        .then(() => {
          return db.User.create({
            name: username
          });
        })
        .then((results) => {
          done(results.dataValues.id);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }
};

