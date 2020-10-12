import { IonCard, IonIcon, IonSegment, IonSegmentButton } from '@ionic/react';
import { chatboxOutline, cogOutline, peopleOutline } from 'ionicons/icons';
import React, { useState } from 'react';
import './Frame.css';
import Messages from './Messages';
import OnlineList from './OnlineList';
import Settings from './Settings';

type FrameProps = {
  ownerId: string;
  roomId: string;
  userId: string;
  userList: Map<string, string>;
  joinTime: number;
};

const Frame: React.FC<FrameProps> = ({ ownerId, roomId, userId, userList, joinTime }) => {
  const [pane, setPane] = useState('chat');

  return (
    <IonCard class="frame-card">
      <IonSegment value={pane} class="frame-segment">
        <IonSegmentButton value="chat" onClick={() => setPane('chat')}>
          <IonIcon icon={chatboxOutline}></IonIcon>
        </IonSegmentButton>
        <IonSegmentButton value="online" onClick={() => setPane('online')}>
          <IonIcon icon={peopleOutline}></IonIcon>
        </IonSegmentButton>
        <IonSegmentButton value="settings" onClick={() => setPane('settings')}>
          <IonIcon icon={cogOutline}></IonIcon>
        </IonSegmentButton>
      </IonSegment>

      <Messages
        pane={pane}
        ownerId={ownerId}
        roomId={roomId}
        userId={userId}
        userList={userList}
        joinTime={joinTime}
      ></Messages>
      <OnlineList pane={pane} roomId={roomId} userId={userId} userList={userList}></OnlineList>
      <Settings pane={pane} roomId={roomId} userId={userId}></Settings>
    </IonCard>
  );
};

export default Frame;
