import { IonButton, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { db, timestamp, auth, rtdb } from '../services/firebase';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  let history = useHistory();

  // Populate both Firestore and RealTimeDB before navigating to room
  const createRoom = async () => {
    const roomId = await db.collection('rooms').add({
      createdAt: timestamp,
      ownerId: userId,
    });

    await rtdb.ref('/rooms/' + roomId.id).set({ userCount: 0 });
    const path = '/room/' + roomId.id;
    return history.push(path);
  };

  // Sign in anonymously before showing Create Room button
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
        setLoading(false);
      } else {
        auth.signInAnonymously();
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
          <IonTitle>Turtle</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonGrid>
          <IonRow>
            {loading ? (
              <IonContent className="ion-padding">Loading...</IonContent>
            ) : (
              <IonButton onClick={createRoom}>Create Room</IonButton>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
