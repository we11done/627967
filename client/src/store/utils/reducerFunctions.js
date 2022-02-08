export const addMessageToStore = (state, payload) => {
  const { message, sender, recipientId } = payload;
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    newConvo.unreadMessageCount = 1;
    return [newConvo, ...state];
  }

  return state.map(convo => {
    if (convo.id === message.conversationId) {
      const convoCopy = { ...convo };
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      if (recipientId) {
        convoCopy.unreadMessageCount = convoCopy.messages.filter(
          message => message.senderId !== recipientId && !message.isRead
        ).length;
      }
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addOnlineUserToStore = (state, id) => {
  return state.map(convo => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const removeOfflineUserFromStore = (state, id) => {
  return state.map(convo => {
    if (convo.otherUser.id === id) {
      const convoCopy = { ...convo };
      convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const addSearchedUsersToStore = (state, users) => {
  const currentUsers = {};

  // make table of current users so we can lookup faster
  state.forEach(convo => {
    currentUsers[convo.otherUser.id] = true;
  });

  const newState = [...state];
  users.forEach(user => {
    // only create a fake convo if we don't already have a convo with this user
    if (!currentUsers[user.id]) {
      let fakeConvo = { otherUser: user, messages: [] };
      newState.push(fakeConvo);
    }
  });

  return newState;
};

export const addNewConvoToStore = (state, recipientId, message) => {
  return state.map(convo => {
    if (convo.otherUser.id === recipientId) {
      const convoCopy = { ...convo };
      convoCopy.id = message.conversationId;
      convoCopy.messages.push(message);
      convoCopy.latestMessageText = message.text;
      return convoCopy;
    } else {
      return convo;
    }
  });
};

export const updateConvoToStore = (state, payload) => {
  const { readUserId, conversationId, updatedMessages, updatedMessagesCount } =
    payload;
  return state.map(convo => {
    if (convo.id === conversationId && updatedMessagesCount > 0) {
      const convoCopy = { ...convo };
      for (let updateMessage of updatedMessages) {
        const searchIndex = convoCopy.messages.findIndex(
          message => message.id === updateMessage.id
        );
        convoCopy.messages[searchIndex] = updateMessage;
      }
      convoCopy.lastReadMessage = updatedMessages[updatedMessages.length - 1];
      convoCopy.unreadMessageCount = convoCopy.messages.filter(
        message => message.senderId !== readUserId && !message.isRead
      ).length;
      return convoCopy;
    } else {
      return convo;
    }
  });
};
