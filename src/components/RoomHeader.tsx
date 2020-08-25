import { IonFabButton, IonIcon, IonInput, IonTitle, IonToolbar } from '@ionic/react';
import { add } from 'ionicons/icons';
import React, { useState } from 'react';
import './RoomHeader.css';

type VideoInputProps = {
  changeUrl: (newUrl: string) => void;
};

const VideoInput: React.FC<VideoInputProps> = ({ changeUrl }) => {
  const [url, setUrl] = useState('');

  const onSubmit = () => {
    if (url !== '') {
      changeUrl(url);
    }

    setUrl('');
  };

  return (
    <IonToolbar>
      <IonTitle slot="start" class="title">
        Turtle
      </IonTitle>
      <IonInput
        slot="end"
        type="url"
        inputmode="search"
        class="input-bar"
        placeholder="Upload new video by URL"
        onIonChange={(e) => setUrl(e.detail.value!)}
        value={url}
        onSubmit={onSubmit}
      ></IonInput>
      <IonFabButton slot="end" size="small" onClick={onSubmit}>
        <IonIcon icon={add}></IonIcon>
      </IonFabButton>
    </IonToolbar>
  );
};

export default VideoInput;
