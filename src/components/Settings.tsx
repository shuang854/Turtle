import { ErrorMessage } from '@hookform/error-message';
import discordIcon from '@iconify/icons-simple-icons/discord';
import { Icon } from '@iconify/react';
import {
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonListHeader,
  IonRouterLink,
  IonRow,
  IonToast,
} from '@ionic/react';
import { logoGithub } from 'ionicons/icons';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { db, rtdb } from '../services/firebase';
import './Settings.css';

type SettingsProps = {
  pane: string;
  roomId: string;
  userId: string;
};

const Settings: React.FC<SettingsProps> = ({ pane, roomId, userId }) => {
  const { control, errors, setValue, getValues } = useForm({ mode: 'onChange' });
  const [showNameChange, setShowNameChange] = useState(false);

  // Update databases with new username
  const changeName = async () => {
    const newName = getValues('username');
    if (newName !== '') {
      const snapshot = await db.collection('users').doc(userId).get();
      const prevName = snapshot.data()?.name;
      db.collection('users').doc(userId).update({
        name: newName,
      });
      rtdb.ref('/rooms/' + roomId + '/' + userId).set({ name: newName });

      // Send 'nameChange' request for all clients to get a message about the name change
      rtdb
        .ref('/requests/' + roomId)
        .push({ createdAt: Date.now(), senderId: userId, data: { prev: prevName, curr: newName }, type: 'nameChange' });

      setShowNameChange(true);
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLIonInputElement>) => {
    if (e.key === 'Enter') {
      if (!errors.username) {
        changeName();
        setValue('username', '');
      }
    }
  };

  return (
    <IonContent style={{ display: pane === 'settings' ? null : 'none' }}>
      <IonListHeader class="settings-header">Settings</IonListHeader>
      <IonItem class="name-item">
        <IonLabel>Change Username</IonLabel>
        <Controller
          name="username"
          render={({ onChange, onBlur, value }) => (
            <IonInput
              onIonChange={onChange}
              onKeyDown={(e) => onEnter(e)}
              placeholder="New name"
              maxlength={20}
              value={value}
              class="name-input"
            />
          )}
          control={control}
          rules={{
            minLength: { value: 4, message: '⚠ Must be at least 4 characters long' },
            pattern: { value: /^\w+$/, message: '⚠ Must be alphanumeric' },
          }}
        ></Controller>
      </IonItem>
      <ErrorMessage name="username" errors={errors} as="span" className="error-message"></ErrorMessage>
      <IonGrid class="about-grid">
        <IonRow>
          <IonCol>
            <span>Any feedback, questions, or issues? </span>
            <span role="img" aria-label="Turtle">
              🐢🐢
            </span>
          </IonCol>
        </IonRow>
        <IonRow class="externals-row">
          <IonCol size="3"></IonCol>
          <IonCol size="3">
            <IonRouterLink href="https://github.com/shuang854/Turtle" target="_blank" rel="noopener noreferrer">
              <IonIcon icon={logoGithub} class="about-icons"></IonIcon>
            </IonRouterLink>
          </IonCol>
          <IonCol size="3">
            <IonRouterLink href="https://discord.gg/NEw3Msu" target="_blank" rel="noopener noreferrer">
              <Icon icon={discordIcon} className="about-icons"></Icon>
            </IonRouterLink>
          </IonCol>
          <IonCol size="3"></IonCol>
        </IonRow>
      </IonGrid>
      <IonToast
        color="primary"
        duration={2000}
        isOpen={showNameChange}
        onDidDismiss={() => setShowNameChange(false)}
        position="top"
        message="Username changed successfully"
      ></IonToast>
    </IonContent>
  );
};

export default Settings;
