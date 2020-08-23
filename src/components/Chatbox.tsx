import { IonButton, IonCard, IonCardContent, IonCol, IonRow, IonTextarea } from '@ionic/react';
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
    await db.collection('rooms').doc(roomId).collection('messages').add({
      createdAt: timestamp,
      senderId: userId,
      content: message,
      type: 'user',
    });

    // Reset textarea field
    setMessage('');
  };

  return (
    <IonCard class="chat-card">
      <Messages roomId={roomId} userId={userId}></Messages>
      <IonRow class="input-card-row">
        <IonCol size="12" sizeLg="3" class="input-card-col">
          <IonCardContent class="input-card-content">
            <IonRow>
              <IonCol size="9">
                <IonTextarea
                  onIonChange={(e) => setMessage(e.detail.value!)}
                  value={message}
                  class="textarea"
                ></IonTextarea>
              </IonCol>
              <IonCol size="3" class="send-msg">
                <IonButton expand="block" color="primary" onClick={sendMessage} class="send-button">
                  Send
                </IonButton>
              </IonCol>
            </IonRow>
          </IonCardContent>
        </IonCol>
      </IonRow>
    </IonCard>
  );
};

export default Chat;
