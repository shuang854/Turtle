import { IonButton, IonCard, IonCol, IonFooter, IonInput, IonRow } from '@ionic/react';
import React, { useState } from 'react';
import { db, timestamp } from '../services/firebase';
import './Chatbox.css';
import Messages from './Messages';

type ChatboxProps = {
  roomId: string;
  userId: string;
};

const Chat: React.FC<ChatboxProps> = ({ roomId, userId }) => {
  const [message, setMessage] = useState(''); // Message to be sent

  // Send message to database
  const sendMessage = async () => {
    if (message !== '') {
      await db.collection('rooms').doc(roomId).collection('messages').add({
        createdAt: timestamp,
        senderId: userId,
        content: message,
        type: 'user',
      });
    }

    // Reset textarea field
    setMessage('');
  };

  const onEnter = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <IonCard class="chat-card">
      <Messages roomId={roomId} userId={userId}></Messages>
      <IonFooter>
        <IonRow>
          <IonCol size="12" sizeSm="9" class="message-col">
            <IonInput
              onIonChange={(e) => setMessage(e.detail.value!)}
              onKeyDown={(e) => onEnter(e)}
              value={message}
              placeholder="Send message"
              enterkeyhint="send"
              class="message-input"
            ></IonInput>
          </IonCol>
          <IonCol size="3" class="send-msg">
            <IonButton expand="block" color="primary" onClick={sendMessage} class="send-button">
              Send
            </IonButton>
          </IonCol>
        </IonRow>
      </IonFooter>
    </IonCard>
  );
};

export default Chat;
