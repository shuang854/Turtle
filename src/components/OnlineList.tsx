import {
  IonContent,
  IonFabButton,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonToolbar,
  IonIcon,
  IonRow,
  IonCol,
  IonToast,
} from '@ionic/react';
import React, { useState, useRef } from 'react';
import './OnlineList.css';
import { clipboardOutline } from 'ionicons/icons';
import copy from 'copy-to-clipboard';

type OnlineListProps = {
  pane: string;
  userList: Map<string, string>;
};

const OnlineList: React.FC<OnlineListProps> = ({ pane, userList }) => {
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [showToast, setShowToast] = useState(false);

  const copyLink = () => {
    copy(window.location.href);
    setShowToast(true);
  };

  return (
    <IonContent style={{ display: pane === 'online' ? null : 'none' }} class="online-content">
      <IonListHeader class="online-header">Online</IonListHeader>
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
          <IonListHeader class="online-header">Invite friends!</IonListHeader>
          <IonToolbar class="clipboard-toolbar">
            <IonInput readonly value={window.location.href} ref={inputRef} class="clipboard-input"></IonInput>
            <IonFabButton slot="end" size="small" onClick={copyLink} class="send-button">
              <IonIcon icon={clipboardOutline}></IonIcon>
            </IonFabButton>
          </IonToolbar>
        </IonCol>
      </IonRow>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message="Room link copied"
        color="primary"
        duration={2000}
      ></IonToast>
    </IonContent>
  );
};

export default OnlineList;
