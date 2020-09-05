import { IonCard, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react';
import { chatboxOutline, informationCircleOutline, peopleOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './Frame.css';
import Messages from './Messages';
import OnlineList from './OnlineList';

type FrameProps = {
  ownerId: string;
  roomId: string;
  userId: string;
  userList: Map<string, string>;
};

const Frame: React.FC<FrameProps> = ({ ownerId, roomId, userId, userList }) => {
  const [pane, setPane] = useState('chat');

  return (
    <IonCard class="frame-card">
      <IonSegment value={pane}>
        <IonSegmentButton value="chat" onClick={() => setPane('chat')}>
          <IonIcon icon={chatboxOutline}></IonIcon>
        </IonSegmentButton>
        <IonSegmentButton value="online" onClick={() => setPane('online')}>
          <IonIcon icon={peopleOutline}></IonIcon>
        </IonSegmentButton>
        <IonSegmentButton value="about" onClick={() => setPane('about')}>
          <IonIcon icon={informationCircleOutline}></IonIcon>
        </IonSegmentButton>
      </IonSegment>

      <Messages pane={pane} ownerId={ownerId} roomId={roomId} userId={userId} userList={userList}></Messages>
      <OnlineList pane={pane} userList={userList}></OnlineList>
    </IonCard>
  );
};

export default Frame;
