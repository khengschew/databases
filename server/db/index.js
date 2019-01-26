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

var Sequelize = require('sequelize');
exports.db = new Sequelize('chat', 'student', 'student');
/* TODO this constructor takes the database name, username, then password.
 * Modify the arguments if you need to */

/* first define the data structure by giving property names and datatypes
 * See http://sequelizejs.com for other datatypes you can use besides STRING. */
exports.User = exports.db.define('user', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false
});

exports.Room = exports.db.define('room', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: Sequelize.STRING
}, {
  freezeTableName: true,
  timestamps: false
});

exports.Messages = exports.db.define('messages', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: exports.User,
      key: exports.User.id
    }
  },
  roomId: {
    type: Sequelize.INTEGER,
    references: {
      model: exports.Room,
      key: exports.Room.id
    }
  },
  text: Sequelize.STRING,
  createdAt: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  },
  updatedAt: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false
  }
}, {
  freezeTableName: true,
  timestamps: false
});

exports.User.hasMany(exports.Messages, {foreignKey: 'userId'});
exports.Room.hasMany(exports.Messages, {foreignKey: 'roomId'});
exports.Messages.belongsTo(exports.User, {foreignKey: 'userId'});
exports.Messages.belongsTo(exports.Room, {foreignKey: 'roomId'});