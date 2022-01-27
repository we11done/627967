export const addMessageToStore = (state, payload) => {
  const { message, sender } = payload;

  // Editor: Jaehyun Jun
  // redux compares the memory of the two objects to simply check whether
  // the previous object is the same as the new object.
  // Accordingly, when the attributes of the previous object are changed inside the reducer,
  // both "new state" and "old state" refer to the same object.
  // Therefore, redux thinks nothing has changed, So I made the deep copy of the state to return.
  const newState = state.map(convo => Object.assign({}, convo));
  // if sender isn't null, that means the message needs to be put in a brand new convo
  if (sender !== null) {
    const newConvo = {
      id: message.conversationId,
      otherUser: sender,
      messages: [message],
    };
    newConvo.latestMessageText = message.text;
    return [newConvo, ...newState];
  }

  return newState.map(convo => {
    if (convo.id === message.conversationId) {
      convo.messages.push(message);
      convo.latestMessageText = message.text;
      return convo;
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
  // Editor: Jaehyun Jun
  // redux compares the memory of the two objects to simply check whether
  // the previous object is the same as the new object.
  // Accordingly, when the attributes of the previous object are changed inside the reducer,
  // both "new state" and "old state" refer to the same object.
  // Therefore, redux thinks nothing has changed, So I made the deep copy of the state to return.
  const newState = state.map(convo => Object.assign({}, convo));
  return newState.map(convo => {
    if (convo.otherUser.id === recipientId) {
      convo.id = message.conversationId;
      convo.messages.push(message);
      convo.latestMessageText = message.text;
      return convo;
    } else {
      return convo;
    }
  });
};
