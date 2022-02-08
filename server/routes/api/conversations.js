const router = require('express').Router();
const { User, Conversation, Message } = require('../../db/models');
const { Op } = require('sequelize');
const onlineUsers = require('../../onlineUsers');

// get all conversations for a user, include latest message text for preview, and all messages
// include other user model so we have info on username/profile pic (don't include current user info)
router.get('/', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: {
          user1Id: userId,
          user2Id: userId,
        },
      },
      attributes: ['id', 'updatedAt'],
      order: [
        ['updatedAt', 'DESC'],
        [Message, 'createdAt', 'ASC'],
      ],
      include: [
        { model: Message },
        {
          model: User,
          as: 'user1',
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ['id', 'username', 'photoUrl'],
          required: false,
        },
        {
          model: User,
          as: 'user2',
          where: {
            id: {
              [Op.not]: userId,
            },
          },
          attributes: ['id', 'username', 'photoUrl'],
          required: false,
        },
      ],
    });

    for (let i = 0; i < conversations.length; i++) {
      const convo = conversations[i];
      const convoJSON = convo.toJSON();

      // set a property "otherUser" so that frontend will have easier access
      if (convoJSON.user1) {
        convoJSON.otherUser = convoJSON.user1;
        delete convoJSON.user1;
      } else if (convoJSON.user2) {
        convoJSON.otherUser = convoJSON.user2;
        delete convoJSON.user2;
      }

      // set property for online status of the other user
      if (onlineUsers.includes(convoJSON.otherUser.id)) {
        convoJSON.otherUser.online = true;
      } else {
        convoJSON.otherUser.online = false;
      }

      // set properties for notification count and latest message preview
      convoJSON.unreadMessageCount = await Message.count({
        where: {
          conversationId: { [Op.eq]: convoJSON.id },
          senderId: { [Op.ne]: userId },
          isRead: { [Op.eq]: false },
        },
      });

      convoJSON.latestMessageText =
        convoJSON.messages[convoJSON.messages.length - 1].text;

      convoJSON.lastReadMessage = await Message.findOne({
        limit: 1,
        where: {
          conversationId: { [Op.eq]: convoJSON.id },
          senderId: { [Op.eq]: userId },
          isRead: { [Op.eq]: true },
        },
        order: [['createdAt', 'DESC']],
      });

      conversations[i] = convoJSON;
    }

    res.json(conversations);
  } catch (error) {
    next(error);
  }
});

router.patch('/read-status/:conversationId', async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }

    const { conversationId } = req.params;
    const userId = req.user.id;

    const targetConvo = await Conversation.findOne({
      where: {
        id: conversationId,
      },
      attributes: ['id', 'updatedAt'],
      order: [
        ['updatedAt', 'DESC'],
        [Message, 'createdAt', 'ASC'],
      ],
      include: [{ model: Message, where: { senderId: userId } }],
    });

    if (!targetConvo) {
      return res
        .status(403)
        .send({ status: 403, message: 'The user is not in the conversation' });
    }

    const [updatedMessagesCount, updatedMessages] = await Message.update(
      { isRead: true },
      {
        where: { conversationId, senderId: { [Op.ne]: userId }, isRead: false },
        order: [['updatedAt', 'DESC']],
        returning: true,
      }
    );

    res.json({ updatedMessages, updatedMessagesCount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
