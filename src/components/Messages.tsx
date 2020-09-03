import { IonCol, IonContent, IonGrid, IonRow } from '@ionic/react';
import React, { useEffect, useRef, useState } from 'react';
import { currTime, db, TimestampType } from '../services/firebase';
import './Messages.css';

type MessagesProps = {
  ownerId: string;
  roomId: string;
  userId: string;
};

type Message = {
  id: string;
  senderId: string;
  sender: string;
  content: string;
};

type RawMessage = {
  content: string;
  createdAt: TimestampType;
  senderId: string;
};

const Messages: React.FC<MessagesProps> = ({ ownerId, roomId, userId }) => {
  const [chats, setChats] = useState<Message[]>([
    { id: '', senderId: userId, sender: '', content: 'You have joined the room.' },
  ]); // All received messages
  const [messages, setMessages] = useState<RawMessage[]>();
  const [prevMessages, setPrevMessages] = useState<Message[]>([]); // Track previous messages
  const contentRef = useRef<HTMLIonContentElement>(null);

  // Listen for new messages
  useEffect(() => {
    const chatUnsubscribe = db
      .collection('chats')
      .doc(roomId)
      .onSnapshot((docSnapshot) => {
        const data = docSnapshot.data();
        if (data !== undefined) {
          const messages = data.messages;
          setMessages(messages);
        }
      });

    return () => {
      chatUnsubscribe();
    };
  }, [roomId, ownerId]);

  // Listen for list of users in the room

  useEffect(() => {}, [messages]);

  // Always scroll to most recent chat message (bottom)
  useEffect(() => {
    let content = contentRef.current;

    // Set timeout because DOM doesn't update immediately after 'chats' state is updated
    setTimeout(() => {
      content?.scrollToBottom(200);
    }, 100);
  }, [chats]);

  return (
    <IonContent class="message-card" ref={contentRef}>
      <IonGrid class="message-grid">
        {chats.map((chat) => {
          return (
            <IonRow key={chat.id} class={chat.senderId === userId ? 'right-align' : ''}>
              <IonCol size="auto" class={chat.senderId === userId ? 'my-msg' : 'other-msg'}>
                {chat.sender !== '' ? <b>{chat.sender}: </b> : <></>}
                <span>{chat.content}</span>
              </IonCol>
            </IonRow>
          );
        })}
      </IonGrid>
    </IonContent>
  );
};

export default Messages;
