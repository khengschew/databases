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
   
    var constraints = ['messages_ibfk_1', 'messages_ibfk_2'];
    dbConnection.query('ALTER TABLE messages DROP FOREIGN KEY ' + constraints[0]);
    dbConnection.query('ALTER TABLE messages DROP FOREIGN KEY ' + constraints[1]);

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

  it('Should insert a new room to the DB when there is no matching room', function(done) {
    // Post a message to the node chat server:
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Good Tester',
        text: 'This will hopefully break your code',
        roomname: 'Breakers'
      }
    }, function () {
      // Now if we look in the database, we should find the
      // posted message there.

      // TODO: You might have to change this test to get all the data from
      // your message table, since this is schema-dependent.
      var queryString = 'SELECT * FROM room';
      var queryArgs = [];

      dbConnection.query(queryString, queryArgs, function(err, results) {
        // Should have one result:
        expect(results.length).to.equal(1);

        done();
      });
    });
  });


  it('Should insert a new message even when user and room is not in database', function(done) {
    // Post a message to the node chat server:
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Very Good Tester',
        text: 'This will definitely hopefully break your code',
        roomname: 'Bad Breakers'
      }
    }, function () {
      // Now if we look in the database, we should find the
      // posted message there.

      // TODO: You might have to change this test to get all the data from
      // your message table, since this is schema-dependent.
      var queryString = 'SELECT * FROM room';
      var queryArgs = [];

      dbConnection.query(queryString, queryArgs, function(err, results) {
        // Should have one result:
        expect(results.length).to.equal(1);
        queryString = 'SELECT * FROM user';
  
        dbConnection.query(queryString, queryArgs, function(err, results) {
          // Should have one result:
          expect(results.length).to.equal(1);
    
          request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
            // Should have one result:
            var results = JSON.parse(body).results;
            expect(results.length).to.equal(1);
            expect(results[0].text).to.equal('This will definitely hopefully break your code');
            expect(results[0].roomname).to.equal('Bad Breakers');
            expect(results[0].username).to.equal('Very Good Tester');
            done();
          });
        });
      });
    });
  });
});

/*
// This comment will help find foreign key names
select * from information_schema.key_column_usage where table_name = "messages" limit 10;

// This comment will help text POST requests
curl -H 'Content-Type: application/json' -X POST -d '{"username":"tester10", "roomname":"lobby", "text":"hello there"}' 127.0.0.1:3000/classes/messages
*/
