import { IonFabButton, IonIcon, IonInput, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import React, { useState } from 'react';
import { db, timestamp } from '../services/firebase';
import './RoomHeader.css';

type RoomHeaderProps = {
  roomId: string;
  userId: string;
  ownerId: string;
  videoId: string;
};

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, userId, ownerId, videoId }) => {
  const [videoUrl, setVideoUrl] = useState('');

  const onSubmit = async () => {
    if (userId === ownerId) {
      if (videoUrl !== '') {
        await db.collection('rooms').doc(roomId).collection('playlist').doc(videoId).update({
          url: videoUrl,
        });

        await db.collection('rooms').doc(roomId).collection('messages').add({
          createdAt: timestamp,
          senderId: userId,
          content: 'changed the video',
          type: 'change',
        });
      }

      setVideoUrl('');
    }
  };

  return (
    <IonToolbar>
      <IonTitle slot="start" class="title">
        Turtle
      </IonTitle>
      {userId === ownerId ? (
        <>
          <IonInput
            slot="end"
            type="url"
            inputmode="search"
            class="input-bar"
            placeholder="Upload new video by URL"
            onIonChange={(e) => setVideoUrl(e.detail.value!)}
            value={videoUrl}
            onSubmit={onSubmit}
          ></IonInput>
          <IonFabButton slot="end" size="small" onClick={onSubmit}>
            <IonIcon icon={add}></IonIcon>
          </IonFabButton>
        </>
      ) : (
        <></>
      )}
    </IonToolbar>
  );
};

export default RoomHeader;
