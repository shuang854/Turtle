import { IonCol, IonContent, IonFabButton, IonGrid, IonIcon, IonInput, IonRow, IonToolbar } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { db, rtdb } from '../services/firebase';
import { secondsToTimestamp } from '../services/utilities';
import './Messages.css';

type MessagesProps = {
  pane: string;
  ownerId: string;
  roomId: string;
  userId: string;
  userList: Map<string, string>;
  joinTime: number;
};

type Message = {
  content: string;
  createdAt: number;
  id: string;
  senderId: string;
  type: string;
};

const Messages: React.FC<MessagesProps> = ({ pane, ownerId, roomId, userId, userList, joinTime }) => {
  const [chats, setChats] = useState<Message[]>([]); // All processed chat messages
  const [systemMessages, setSystemMessages] = useState<Message[]>([]); // All processed system messages
  const [allMessages, setAllMessages] = useState<Message[]>([]); // Combined array of chat and system messages
  const [userHistory] = useState<Map<string, string>>(new Map<string, string>()); // All users who are/were in the room
  const [message, setMessage] = useState(''); // Message to be sent
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Listen for new chat messages
  useEffect(() => {
    rtdb.ref('/chats/' + roomId).on('value', (snapshot) => {
      let arr: Message[] = [];
      snapshot.forEach((child) => {
        const msg = child.val();
        if (msg.createdAt > joinTime) {
          arr.push({
            content: msg.content,
            createdAt: msg.createdAt,
            id: msg.senderId + msg.createdAt,
            senderId: msg.senderId,
            type: 'chat',
          });
        }
      });
      setChats(arr);
    });

    return () => {
      rtdb.ref('/chats/' + roomId).off('value');
    };
  }, [roomId, joinTime]);

  // Listen for new system messages
  useEffect(() => {
    const roomUnsubscribe = db
      .collection('rooms')
      .doc(roomId)
      .onSnapshot((docSnapshot) => {
        const docData = docSnapshot.data();
        if (docData !== undefined) {
          const requests = docData.requests;

          let arr: Message[] = [];
          for (const req of requests) {
            if (req.createdAt > joinTime && req.type !== 'updateState') {
              arr.push({
                content: processType(req.type, req.time),
                createdAt: req.createdAt,
                id: req.senderId + req.createdAt,
                senderId: req.senderId,
                type: 'system',
              });
            }
          }
          setSystemMessages(arr);
        }
      });

    return () => {
      roomUnsubscribe();
    };
  }, [roomId, joinTime]);

  // Convert request type to message content
  const processType = (type: string, time: number): string => {
    switch (type) {
      case 'change':
        return 'changed the video.';
      case 'join':
        return 'joined the room.';
      case 'pause':
        return 'paused the video at ' + secondsToTimestamp(time);
      case 'play':
        return 'played the video from ' + secondsToTimestamp(time);
      default:
        return '';
    }
  };

  // Maintain list of users who entered the room, in order to keep all sender names of messages in the room
  useEffect(() => {
    userList.forEach((name: string, id: string) => {
      userHistory.set(id, name);
    });
  }, [userList, userHistory]);

  // Combine messages
  useEffect(() => {
    setAllMessages(chats.concat(systemMessages));
  }, [chats, systemMessages]);

  // Always scroll to most recent chat message (bottom)
  useEffect(() => {
    let content = contentRef.current;

    // Set timeout because DOM doesn't update immediately after 'chats' state is updated
    setTimeout(() => {
      content?.scrollToBottom(200);
    }, 100);
  }, [allMessages, pane]);

  // Retrieve display name from userId
  const getName = (id: string) => {
    let name = userHistory.get(id);
    if (id === ownerId) {
      name += ' 👑';
    }
    return name;
  };

  // Send message to database
  const sendMessage = async () => {
    if (message !== '') {
      await rtdb.ref('/chats/' + roomId).push({
        content: message,
        createdAt: Date.now(),
        senderId: userId,
      });

      // Reset textarea field
      setMessage('');
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const renderMessages = () => {
    return allMessages
      .sort((msg1, msg2) => msg1.createdAt - msg2.createdAt)
      .map((msg) => {
        if (getName(msg.senderId) !== undefined) {
          if (msg.type === 'chat') {
            return (
              <IonRow key={msg.id} class={msg.senderId === userId ? 'right-align' : ''}>
                <IonCol size="auto" class={msg.senderId === userId ? 'my-msg' : 'other-msg'}>
                  {getName(msg.senderId) !== '' ? <b>{getName(msg.senderId)}: </b> : <></>}
                  <span>{msg.content}</span>
                </IonCol>
              </IonRow>
            );
          } else {
            return (
              <IonRow key={msg.id}>
                <IonCol size="auto" class="system-msg">
                  <span>{getName(msg.senderId) + ' ' + msg.content}</span>
                </IonCol>
              </IonRow>
            );
          }
        } else {
          return <></>;
        }
      });
  };

  return (
    <>
      <IonContent style={{ display: pane === 'chat' ? null : 'none' }} class="message-content" ref={contentRef}>
        <IonGrid class="message-grid">
          {userList.size === 0 ? (
            <span>Loading...</span>
          ) : (
            <>
              <IonRow>
                <IonCol size="auto" class="system-msg">
                  {ownerId === userId ? (
                    <span>
                      Welcome to TurtleTV! You joined the room as the owner, so everyone else in the room will sync up
                      with your plays/pauses.
                    </span>
                  ) : (
                    <span>
                      Welcome to TurtleTV! You joined the room as a member, so your plays/pauses will not affect anyone
                      else in the room.
                    </span>
                  )}
                </IonCol>
              </IonRow>

              {renderMessages()}
            </>
          )}
        </IonGrid>
      </IonContent>
      <IonToolbar class="message-toolbar" style={{ display: pane === 'chat' ? null : 'none' }}>
        <IonInput
          onIonChange={(e) => setMessage(e.detail.value!)}
          onKeyDown={(e) => onEnter(e)}
          value={message}
          placeholder="Send message"
          enterkeyhint="send"
          autocorrect="on"
          autocapitalize="on"
          spellcheck={true}
          class="message-input"
        ></IonInput>
        <IonFabButton slot="end" size="small" onClick={sendMessage} class="send-button">
          <IonIcon icon={sendOutline}></IonIcon>
        </IonFabButton>
      </IonToolbar>
    </>
  );
};

export default Messages;
