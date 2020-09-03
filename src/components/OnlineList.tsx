import React, { useState } from 'react';
import { IonPopover, IonFabButton, IonIcon, IonList, IonListHeader, IonItem, IonLabel } from '@ionic/react';
import { peopleOutline } from 'ionicons/icons';
import './OnlineList.css';

type OnlineListProps = {
  userList: string[];
};

const OnlineList: React.FC<OnlineListProps> = ({ userList }) => {
  const [showPopover, setShowPopover] = useState<{ open: boolean; event: Event | undefined }>({
    open: false,
    event: undefined,
  });

  return (
    <>
      <IonPopover
        cssClass="online-popover"
        isOpen={showPopover.open}
        event={showPopover.event}
        showBackdrop={false}
        onDidDismiss={(e) => setShowPopover({ open: false, event: undefined })}
      >
        <IonList class="popover-list">
          <IonListHeader class="list-header">Online</IonListHeader>
          {userList.map((user) => {
            return (
              <IonItem key={user} class="online-item" lines="none">
                <IonLabel class="online-label">{user}</IonLabel>
              </IonItem>
            );
          })}
        </IonList>
      </IonPopover>
      <IonFabButton
        slot="end"
        size="small"
        class="online-button"
        onClick={(e) => setShowPopover({ open: true, event: e.nativeEvent })}
      >
        <IonIcon icon={peopleOutline}></IonIcon>
      </IonFabButton>
    </>
  );
};

export default OnlineList;
