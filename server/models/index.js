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
      var query = `SELECT u.name AS username, r.name AS roomname, m.text AS text, m.createdAt AS createdAt, m.updatedAt as updatedAt FROM messages m, user u, room r WHERE m.userId = u.id AND m.roomId = r.id`;
      db.sendQuery(query, (err, result, fields) => {
        if (err) {
          throw err;
        } else {
          done(result);
        }
      });
    },
    post: (message, callback) => {
      var query = `SELECT id FROM user WHERE name = "${message.username}";`;
      var userId = sendQueryAsync(query)
        .then((result) => {
          if (result.length === 0) {
            query = `INSERT INTO user (name) VALUES ("${message.username}");`;
            return sendQueryAsync(query);
          } else {
            return result[0].id;
          }
        })
        .then((result) => {
          if (typeof result !== 'number') {
            result = result.insertId;
          }
          return result;
        });

      query = `SELECT id FROM room WHERE name = "${message.roomname}";`;
      var roomId = sendQueryAsync(query)
        .then((result) => {
          if (result.length === 0) {
            query = `INSERT INTO room (name) VALUES ("${message.roomname}");`;
            return sendQueryAsync(query);
          } else {
            return result[0].id;
          }
        })
        .then((result) => {
          if (typeof result !== 'number') {
            result = result.insertId;
          }
          return result;
        });

      return Promise.all([userId, roomId])
        .then(([userId, roomId]) => {
          query = `INSERT INTO messages (userId, roomId, text, createdAt, updatedAt) VALUES (${userId}, ${roomId}, "${message.text}", CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());`;
          return sendQueryAsync(query);
        })
        .then((result) => callback(result))
        .catch(err => console.error(err));
      
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: done => {
      var query = `SELECT * FROM user`;
      db.sendQuery(query, (err, result, fields) => {
        if (err) {
          throw err;
        } else {
          done(result);
        }
      });
    },
    post: username => {
      var query = `SELECT COUNT(id) as cnt FROM user WHERE name = "${username}";`;
      db.sendQuery(query, (err, result, fields) => {
        if (err || result[0].cnt > 0) {
          throw err;
        } else {
          query = `INSERT INTO user (name) VALUES ("${username}");`;
          db.sendQuery(query, (err) => {
            if (err) {
              throw err;
            } else {
              // console.log(`User ${username} successfully created.`);
            }
          });
        }
      });
    }
  }
};

