import { IonButton, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar, IonCol } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { auth, db, rtdb, timestamp } from '../services/firebase';
import { generateAnonName } from '../services/utilities';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  let history = useHistory();

  // Populate both Firestore and RealTimeDB before navigating to room
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
      url: 'https://www.youtube.com/watch?v=DGQwd1_dpuc',
    });
    await db.collection('states').doc(roomId.id).set({
      isPlaying: false,
      time: 0,
    });

    // RealTimeDB preparations
    await rtdb.ref('/rooms/' + roomId.id).set({ userCount: 0 });
    await rtdb.ref('/available/' + roomId.id).set({ name: 'Room Name', createdAt: new Date().toISOString() });
    const path = '/room/' + roomId.id;

    return history.push(path);
  };

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
              <IonCol size="12" class="first-step-col">
                Step 1:
              </IonCol>
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
                Share the link with friends!
              </IonCol>
            </IonRow>
          </IonGrid>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
