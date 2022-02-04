const Sequelize = require('sequelize');
const db = require('../db');

const Message = db.define(
  'message',
  {
    text: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    senderId: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    readUsers: {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
    },
  },
  {
    hooks: {
      beforeCreate: (record, options) => {
        record.dataValues.readUsers = [record.dataValues.senderId];
      },
    },
  }
);

module.exports = Message;
