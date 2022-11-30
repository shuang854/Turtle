import {
  IonButton,
  IonCol,
  IonContent,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { enterOutline } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db, rtdb, timestamp } from '../services/firebase';
import { generateAnonName, matchRoomUrl } from '../services/utilities';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [roomLink, setRoomLink] = useState('');
  const [valid, setValid] = useState(true);

  let history = useHistory();

  // Sign in anonymously before finishing loading page content
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        const credential = await auth.signInAnonymously();
        await db.collection('users').doc(credential.user?.uid).set({
          name: generateAnonName(),
        });
      }
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  // Populate both Firestore and RealTimeDB before navigating to room on create
  const createRoom = async () => {
    // Firestore preparations
    const roomId = await db.collection('rooms').add({
      createdAt: timestamp,
      ownerId: userId,
      requests: [],
      state: { time: 0, isPlaying: false },
    });
    await db.collection('playlists').doc(roomId.id).set({
      createdAt: timestamp,
      url: 'https://www.youtube.com/watch?v=SMKPKGW083c',
    });
    await db.collection('states').doc(roomId.id).set({
      isPlaying: false,
      time: 0,
    });

    // RealTimeDB preparations
    await rtdb.ref('/rooms/' + roomId.id).set({ userCount: 0 });
    await rtdb.ref('/available/' + roomId.id).set({ name: 'Room Name', createdAt: new Date().toISOString() });
    const path = '/room/' + roomId.id;

    return history.push(path); // Navigate to room
  };

  const showError = () => {
    return <div style={{ color: 'red', fontSize: '14px' }}>Invalid link</div>;
  };

  // Validate URL and join the room
  const joinRoom = async () => {
    if (matchRoomUrl(roomLink)) {
      const roomId = roomLink.split('/')[roomLink.split('/').length - 1];
      const doc = await db.collection('rooms').doc(roomId).get();
      if (doc.exists) {
        setValid(true);
        return history.push('/room/' + roomId);
      }
    }

    setValid(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>TURTLE</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="home-content">
        {loading ? (
          <IonContent className="ion-padding">Loading...</IonContent>
        ) : (
          <IonGrid class="home-grid">
            <IonRow>
              <IonCol size="12" sizeLg="6" class="intro-col">
                <IonRow>
                  <IonCol class="intro-header">Watch videos online with friends!</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol class="support-col">-- YouTube -- Netflix -- Facebook Watch -- Vimeo -- Streamable</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol class="request-col">
                    <a href="https://discord.gg/NEw3Msu" target="_blank" rel="noopener noreferrer">
                      Request more options
                    </a>
                  </IonCol>
                </IonRow>
              </IonCol>
              <IonCol size="12" sizeLg="6">
                <IonRow>
                  <IonCol class="first-step-col">Step 1:</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" class="create-col">
                    <IonButton onClick={createRoom} class="create-room">
                      Create Room
                    </IonButton>
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">Step 2:</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" class="share-col">
                    Share the link.
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12">OR</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" class="join-col">
                    Join a room:
                  </IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="12" class="paste-col">
                    <IonToolbar class="paste-toolbar">
                      <IonInput onIonChange={(e) => setRoomLink(e.detail.value!)} placeholder="Paste room link" class="paste-input"></IonInput>
                      <IonFabButton slot="end" size="small" disabled={roomLink === ''} onClick={joinRoom} class="paste-button">
                        <IonIcon icon={enterOutline}></IonIcon>
                      </IonFabButton>
                    </IonToolbar>
                    {valid ? <></> : showError()}
                  </IonCol>
                </IonRow>
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
