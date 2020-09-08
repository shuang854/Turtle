import { IonContent, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/react';
import React from 'react';
import './OnlineList.css';

type OnlineListProps = {
  pane: string;
  userList: Map<string, string>;
};

const OnlineList: React.FC<OnlineListProps> = ({ pane, userList }) => {
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
    </IonContent>
  );
};

export default OnlineList;
