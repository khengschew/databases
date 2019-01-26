var mysql = require('mysql');

// Create a database connection and export it from this file.
// You will need to connect with the user "root", no password,
// and to the database "chat".
// Above is wrong, use "student" with password "student"!!!!!!!!!!!!!!!!!!

exports.sendQuery = (query, done) => {
  var dbConnection = mysql.createConnection({
    user: 'student',
    password: 'student',
    database: 'chat'
  });
  dbConnection.connect();

  dbConnection.query(query, done);

  dbConnection.end();
};