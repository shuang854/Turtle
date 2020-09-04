import { IonFabButton, IonIcon, IonInput, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { db, arrayUnion } from '../services/firebase';
import './RoomHeader.css';

type RoomHeaderProps = {
  roomId: string;
  userId: string;
  ownerId: string;
};

const RoomHeader: React.FC<RoomHeaderProps> = ({ roomId, userId, ownerId }) => {
  const [videoUrl, setVideoUrl] = useState('');
  let history = useHistory();

  const onSubmit = async () => {
    if (userId === ownerId && videoUrl !== '') {
      await db.collection('playlists').doc(roomId).update({
        url: videoUrl,
      });

      await db
        .collection('rooms')
        .doc(roomId)
        .update({
          requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: 0, type: 'change' }),
        });

      setVideoUrl('');
    }
  };

  const toHome = () => {
    history.push('/');
    history.go(0);
  };

  return (
    <IonToolbar>
      <IonTitle slot="start" onClick={toHome} class="title">
        TURTLE
      </IonTitle>
      {userId === ownerId ? (
        <>
          <IonInput
            slot="end"
            type="url"
            inputmode="search"
            class="input-bar"
            placeholder="Upload video by URL"
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
