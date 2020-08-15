import { IonButton, IonCol, IonContent, IonFooter, IonGrid, IonRow, IonTextarea } from '@ionic/react';
import React, { useState } from 'react';
import { db, timestamp } from '../services/firebase';
import './Chat.css';

type ChatProps = {
  roomId: string;
  userId: string;
};

const Chat: React.FC<ChatProps> = ({ roomId, userId }) => {
  const [message, setMessage] = useState('');

  const sendMessage = async () => {
    const messageId = await db.collection('rooms').doc(roomId).collection('messages').add({
      createdAt: timestamp,
      senderId: userId,
      content: message,
    });
    console.log(messageId);
  };

  return (
    <>
      <IonContent>
        <IonGrid>
          <IonRow class="right-align">
            <IonCol size="auto" class="my-msg">
              <b>Simon: </b>
              <span>Hello!</span>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="auto" class="other-msg">
              <b>Manuel: </b>
              <span>They are all asking me about what I'm going to do next</span>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="auto" class="other-msg">
              <b>Amaria: </b>
              <span>Probably riding on</span>
            </IonCol>
          </IonRow>
          <IonRow class="right-align">
            <IonCol size="auto" class="my-msg">
              <b>Simon: </b>
              <span>my photo jet</span>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
      <IonFooter class="ion-no-border">
        <IonGrid>
          <IonRow>
            <IonCol size="9">
              <IonTextarea onIonChange={(e) => setMessage(e.detail.value!)}></IonTextarea>
            </IonCol>
            <IonCol size="3" class="send-msg">
              <IonButton expand="block" color="primary" onClick={sendMessage} class="send-button">
                Send
              </IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonFooter>
    </>
  );
};

export default Chat;
