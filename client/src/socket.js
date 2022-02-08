import io from 'socket.io-client';
import store from './store';
import {
  setNewMessage,
  removeOfflineUser,
  addOnlineUser,
  updateConversations,
} from './store/conversations';

const socket = io(window.location.origin);

socket.on('connect', () => {
  console.log('connected to server');

  socket.on('add-online-user', id => {
    store.dispatch(addOnlineUser(id));
  });

  socket.on('remove-offline-user', id => {
    store.dispatch(removeOfflineUser(id));
  });

  socket.on('new-message', data => {
    store.dispatch(setNewMessage(data.message, data.sender, data.recipientId));
  });

  socket.on('other-user-read', data => {
    store.dispatch(
      updateConversations(
        data.readUserId,
        data.conversationId,
        data.updatedMessages,
        data.updatedMessagesCount
      )
    );
  });
});

export default socket;
