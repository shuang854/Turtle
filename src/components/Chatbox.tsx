import { IonCard, IonFabButton, IonFooter, IonIcon, IonInput, IonToolbar } from '@ionic/react';
import { sendOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import { rtdb } from '../services/firebase';
import './Chatbox.css';
import Messages from './Messages';
import OnlineList from './OnlineList';

type ChatboxProps = {
  ownerId: string;
  roomId: string;
  userId: string;
  userList: Map<string, string>;
};

const Chat: React.FC<ChatboxProps> = ({ ownerId, roomId, userId, userList }) => {
  const [message, setMessage] = useState(''); // Message to be sent

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

  return (
    <IonCard class="chat-card">
      <Messages ownerId={ownerId} roomId={roomId} userId={userId} userList={userList}></Messages>
      <IonFooter>
        <IonToolbar class="message-toolbar">
          <IonInput
            onIonChange={(e) => setMessage(e.detail.value!)}
            onKeyDown={(e) => onEnter(e)}
            value={message}
            placeholder="Send message"
            enterkeyhint="send"
            class="message-input"
          ></IonInput>
          <IonFabButton slot="end" size="small" onClick={sendMessage} class="send-button">
            <IonIcon icon={sendOutline}></IonIcon>
          </IonFabButton>
          <OnlineList userList={userList}></OnlineList>
        </IonToolbar>
      </IonFooter>
    </IonCard>
  );
};

export default Chat;
