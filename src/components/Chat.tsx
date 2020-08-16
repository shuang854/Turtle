import { IonButton, IonCol, IonContent, IonFooter, IonGrid, IonRow, IonTextarea } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { currTime, db, timestamp } from '../services/firebase';
import './Chat.css';

type ChatProps = {
  roomId: string;
  userId: string;
};

type Message = {
  id: string;
  senderId: string;
  sender: string;
  content: string;
};

const Chat: React.FC<ChatProps> = ({ roomId, userId }) => {
  const [room] = useState(roomId);
  const [message, setMessage] = useState(''); // Message to be sent
  const [prevMessages, setPrevMessages] = useState<Message[]>([]); // Track previous messages for updating useEffect
  const [newMessages, setNewMessages] = useState<Message[]>([]); // Newly retrieved messages
  const [chats, setChats] = useState<Message[]>([
    { id: '', senderId: userId, sender: '', content: 'You have joined the room.' },
  ]); // All received messages
  const [loading, setLoading] = useState(true);

  // Listen for new messages
  useEffect(() => {
    const chatUnsubscribe = db
      .collection('rooms')
      .doc(room)
      .collection('messages')
      .orderBy('createdAt')
      .where('createdAt', '>', currTime)
      .onSnapshot(async (querySnapshot) => {
        let newMsgs: Message[] = [];
        const changes = querySnapshot.docChanges();
        for (const change of changes) {
          if (change.type === 'added') {
            const data = change.doc.data();
            const user = await db.collection('users').doc(data?.senderId).get();
            newMsgs.push({
              id: change.doc.id,
              senderId: data?.senderId,
              sender: user.data()?.name,
              content: data?.content,
            });
          }
        }

        if (newMsgs.length !== 0) {
          setNewMessages(newMsgs);
        }
      });

    setLoading(false);
    return () => {
      chatUnsubscribe();
    };
  }, [room]);

  // Only update array containing all messages when there are new messages
  useEffect(() => {
    if (prevMessages !== newMessages) {
      setPrevMessages(newMessages);
      setChats([...chats, ...newMessages]);
    }
  }, [prevMessages, newMessages, chats]);

  // Send message to database and reset textarea field
  const sendMessage = async () => {
    await db.collection('rooms').doc(roomId).collection('messages').add({
      createdAt: timestamp,
      senderId: userId,
      content: message,
    });

    setMessage('');
  };

  return (
    <>
      <IonContent>
        <IonGrid class="message-grid">
          {!loading ? (
            chats.map((chat) => {
              return (
                <IonRow key={chat.id} class={chat.senderId === userId ? 'right-align' : ''}>
                  <IonCol size="auto" class={chat.senderId === userId ? 'my-msg' : 'other-msg'}>
                    {chat.sender !== '' ? <b>{chat.sender}: </b> : <></>}
                    <span>{chat.content}</span>
                  </IonCol>
                </IonRow>
              );
            })
          ) : (
            <></>
          )}
        </IonGrid>
      </IonContent>
      <IonFooter class="ion-no-border">
        <IonGrid class="message-input">
          <IonRow>
            <IonCol size="9">
              <IonTextarea onIonChange={(e) => setMessage(e.detail.value!)} value={message}></IonTextarea>
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
