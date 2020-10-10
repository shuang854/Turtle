import {
  IonCol,
  IonContent,
  IonFabButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonRow,
  IonToast,
  IonToolbar,
} from '@ionic/react';
import copy from 'copy-to-clipboard';
import { clipboardOutline } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { rtdb } from '../services/firebase';
import './OnlineList.css';

type OnlineListProps = {
  pane: string;
  roomId: string;
  userId: string;
  userList: Map<string, string>;
};

const OnlineList: React.FC<OnlineListProps> = ({ pane, roomId, userId, userList }) => {
  const inputRef = useRef<HTMLIonInputElement>(null);
  const connectionRef = useRef<HTMLIonToastElement>(null);
  const [showConnectionChange, setShowConnectionChange] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('You joined the room');
  const [showCopied, setShowCopied] = useState(false);

  // Listen for connection changes in the room
  useEffect(() => {
    const roomRef = rtdb.ref('/rooms/' + roomId);
    roomRef.on('child_added', (snapshot) => {
      if (snapshot.val().name !== undefined) {
        setConnectionMessage(snapshot.val().name + ' joined');
      }
    });

    roomRef.on('child_removed', (snapshot) => {
      if (snapshot.val().name !== undefined && snapshot.key !== userId) {
        setConnectionMessage(snapshot.val().name + ' left');
      }
    });

    return () => {
      roomRef.off('child_added');
      roomRef.off('child_removed');
    };
  }, [roomId, userId]);

  // Show toast whenever connection message changes
  useEffect(() => {
    setShowConnectionChange(true);
    connectionRef.current?.present();
  }, [connectionMessage]);

  const copyLink = () => {
    copy(window.location.href);
    setShowCopied(true);
  };

  return (
    <IonContent style={{ display: pane === 'online' ? null : 'none' }} class="online-content">
      <IonListHeader>Online</IonListHeader>
      <IonList class="online-list">
        {Array.from(userList.values()).map((user) => {
          return (
            <IonItem key={user} class="online-item" lines="none">
              <IonLabel class="online-label">{user}</IonLabel>
            </IonItem>
          );
        })}
      </IonList>
      <IonRow>
        <IonCol class="clipboard-col">
          <IonListHeader>Invite friends!</IonListHeader>
          <IonToolbar class="clipboard-toolbar">
            <IonInput readonly value={window.location.href} ref={inputRef} class="clipboard-input"></IonInput>
            <IonFabButton slot="end" size="small" onClick={copyLink} class="send-button">
              <IonIcon icon={clipboardOutline}></IonIcon>
            </IonFabButton>
          </IonToolbar>
        </IonCol>
      </IonRow>
      <IonToast
        color="primary"
        duration={2000}
        isOpen={showCopied}
        onDidDismiss={() => setShowCopied(false)}
        position="top"
        message="Room link copied"
      ></IonToast>
      <IonToast
        color="primary"
        duration={500}
        isOpen={showConnectionChange}
        onDidDismiss={() => setShowConnectionChange(false)}
        position="top"
        message={connectionMessage}
        ref={connectionRef}
      ></IonToast>
    </IonContent>
  );
};

export default OnlineList;
