const Conversation = require('./conversation');
const User = require('./user');
const Message = require('./message');

// associations

User.hasMany(Conversation);
Conversation.belongsToMany(User, {
  as: 'participants',
  through: 'participants_of_conversation',
  foreignKey: 'userId',
});
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
};
