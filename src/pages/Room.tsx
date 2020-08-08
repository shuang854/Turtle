import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { db } from '../services/firebase';

const Room: React.FC<RouteComponentProps<{ roomId: string }>> = ({ match }) => {
  const history = useHistory();
  const roomId = match.params.roomId;

  const [loading, setLoading] = useState(true);

  // Verify that the roomId exists in db
  useEffect(() => {
    const fetchRoom = async () => {
      const room = await db.collection('rooms').doc(roomId).get();
      if (!room.exists) {
        history.push('/');
      } else {
        setLoading(false);
      }
    };

    console.log('Hook fired');
    fetchRoom();
  }, [history, roomId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Turtle</IonTitle>
        </IonToolbar>
      </IonHeader>
      {!loading ? (
        <IonContent className="ion-padding">Video and chat</IonContent>
      ) : (
        <IonContent className="ion-padding">Loading...</IonContent>
      )}
    </IonPage>
  );
};

export default Room;
