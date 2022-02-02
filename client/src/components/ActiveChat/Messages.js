import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '../ActiveChat';
import moment from 'moment';

const Messages = props => {
  const { messages, otherUser, userId } = props;
  const messageSearchKeys = messages.map(
    message => `${message.senderId}_${message.isRead}`
  );

  const lastReadMessage = messageSearchKeys.lastIndexOf(`${userId}_${true}`);

  return (
    <Box>
      {messages.map((message, index) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
            isLastRead={index === lastReadMessage}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            text={message.text}
            time={time}
            otherUser={otherUser}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
