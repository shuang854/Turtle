import { IonButton, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { db, timestamp } from '../services/firebase';
import './Home.css';

const Home: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');

  let history = useHistory();

  const handleClick = async () => {
    const roomId = await db.collection('rooms').add({
      createdAt: timestamp,
      ownerId: userId,
    });

    const path = '/room/' + roomId.id;
    return history.push(path);
  };

  useEffect(() => {
    console.log('Hook fired');
    setUserId('placeholder');
    setLoading(false);
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
              <IonButton onClick={handleClick}>Create Room</IonButton>
            )}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
