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
  INDEX (userId),
  INDEX (roomId),
  FOREIGN KEY `fk_userId` (userId)
    REFERENCES user(id)
    ON DELETE CASCADE,
  FOREIGN KEY `fk_roomId` (roomId)
    REFERENCES room(id)
    ON DELETE CASCADE
);

/* Create other tables and define schemas for them here! */

/*
  FOREIGN KEY `fk_userId` (userId)
    REFERENCES user(id)
    ON DELETE CASCADE,
  FOREIGN KEY `fk_roomId` (roomId)
    REFERENCES room(id)
    ON DELETE CASCADE,
*/

/*  Execute this file from the command line by typing:
 *    mysql -u student < server/schema.sql
 *  to create the database and the tables.*/

