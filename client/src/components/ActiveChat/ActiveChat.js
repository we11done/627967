import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';
import { Input, Header, Messages } from './index';
import { connect, useDispatch } from 'react-redux';
import { fetchConversations } from '../../store/utils/thunkCreators';

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex',
    flexGrow: 8,
    flexDirection: 'column',
  },
  chatContainer: {
    marginLeft: 41,
    marginRight: 41,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    justifyContent: 'space-between',
  },
}));

const ActiveChat = props => {
  const classes = useStyles();
  const { user } = props;
  const conversation = props.conversation || {};

  /**
   * Editor: Jaehyun Jun
   * use useDispatch to fetch the new conversation on submit of Input child componenet
   */
  const dispatch = useDispatch();

  // redux hook to update current component on change of child component
  const onChange = () => dispatch(fetchConversations());

  return (
    <Box className={classes.root}>
      {conversation.otherUser && (
        <>
          <Header
            username={conversation.otherUser.username}
            online={conversation.otherUser.online || false}
          />
          <Box className={classes.chatContainer}>
            <Messages
              messages={conversation.messages}
              otherUser={conversation.otherUser}
              userId={user.id}
            />
            <Input
              otherUser={conversation.otherUser}
              conversationId={conversation.id}
              onChange={onChange}
              user={user}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

const mapStateToProps = state => {
  return {
    user: state.user,
    conversation:
      state.conversations &&
      state.conversations.find(
        conversation =>
          conversation.otherUser.username === state.activeConversation
      ),
  };
};

export default connect(mapStateToProps, null)(ActiveChat);
