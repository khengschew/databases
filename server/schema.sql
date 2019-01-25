DROP DATABASE IF EXISTS chat;

CREATE DATABASE chat;

USE chat;

CREATE TABLE user (
  id INT AUTO_INCREMENT,
  name VARCHAR(50),
  PRIMARY KEY (id)
);

CREATE TABLE room (
  id INT AUTO_INCREMENT,
  name VARCHAR(100),
  PRIMARY KEY (id)
);

CREATE TABLE messages (
  id INT AUTO_INCREMENT,
  userId INT,
  roomId INT,
  text text,
  createdAt timestamp NULL,
  updatedAt timestamp NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (userId)
    REFERENCES user(id)
    ON DELETE CASCADE,
  FOREIGN KEY (roomId)
    REFERENCES room(id)
    ON DELETE CASCADE,
  INDEX (userId),
  INDEX (roomId)
);

/* Create other tables and define schemas for them here! */




/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

