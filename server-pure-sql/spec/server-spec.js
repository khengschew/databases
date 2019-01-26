/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require('request'); // You might need to npm install the request module!
var expect = require('chai').expect;

describe('Persistent Node Chat Server', function() {
  var dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
      user: 'student',
      password: 'student',
      database: 'chat',
      multipleStatements: true
    });
    dbConnection.connect();

    /*
    select * from information_schema.key_column_usage where table_name = "messages" limit 10;
    */
   
    var constraints = ['messages_ibfk_1', 'messages_ibfk_2'];
    dbConnection.query('ALTER TABLE messages DROP FOREIGN KEY ' + constraints[0]);
    dbConnection.query('ALTER TABLE messages DROP FOREIGN KEY ' + constraints[1]);

    //var tablename = "TABLE_NAME from INFORMATION_SCHEMA.TABLES where TABLE_NAME in ('messages','user','room')"; // TODO: fill this out
    var tables = ['messages', 'user', 'room'];

    dbConnection.query('truncate ' + tables[0]);
    dbConnection.query('truncate ' + tables[1]);
    dbConnection.query('truncate ' + tables[2], done);

    dbConnection.query('ALTER TABLE messages ADD CONSTRAINT ' + constraints[0] + ' FOREIGN KEY messages(userId) REFERENCES user(id) ON DELETE CASCADE');
    dbConnection.query('ALTER TABLE messages ADD CONSTRAINT ' + constraints[1] + ' FOREIGN KEY messages(roomId) REFERENCES room(id) ON DELETE CASCADE');

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    //dbConnection.query('truncate ' + tablename, done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it('Should insert posted messages to the DB', function(done) {
    // Post the user to the chat server.
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/users',
      json: { username: 'Valjean' }
    }, function () {
      // Post a message to the node chat server:
      request({
        method: 'POST',
        uri: 'http://127.0.0.1:3000/classes/messages',
        json: {
          username: 'Valjean',
          text: 'In mercy\'s name, three days is all I need.',
          roomname: 'Hello'
        }
      }, function () {
        // Now if we look in the database, we should find the
        // posted message there.

        // TODO: You might have to change this test to get all the data from
        // your message table, since this is schema-dependent.
        var queryString = 'SELECT * FROM messages';
        var queryArgs = [];

        dbConnection.query(queryString, queryArgs, function(err, results) {
          // Should have one result:
          expect(results.length).to.equal(1);

          // TODO: If you don't have a column named text, change this test.
          expect(results[0].text).to.equal('In mercy\'s name, three days is all I need.');

          done();
        });
      });
    });
  });

  it('Should output all messages from the DB', function(done) {
    // Let's insert a message into the db
    var queryString = 'INSERT INTO user (name) VALUES ("testuser");';
    queryString += 'INSERT INTO room (name) VALUES ("lobby");';
    queryString += 'INSERT INTO messages (userId, roomId, text, createdAt, updatedAt) VALUES (1, 1, "Men like you can never change!", CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());';
    var queryArgs = [];
    // TODO - The exact query string and query args to use
    // here depend on the schema you design, so I'll leave
    // them up to you. */

    dbConnection.query(queryString, queryArgs, function(err) {
      if (err) { throw err; }

      // Now query the Node chat server and see if it returns
      // the message we just inserted:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messageLog = JSON.parse(body).results;
        expect(messageLog[0].text).to.equal('Men like you can never change!');
        expect(messageLog[0].roomname).to.equal('lobby');
        done();
      });
    });
  });
});
