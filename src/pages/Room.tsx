import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { auth, db, rtdb } from '../services/firebase';

const Room: React.FC<RouteComponentProps<{ roomId: string }>> = ({ match }) => {
  const history = useHistory();
  const roomId = match.params.roomId;

  const [validRoom, setValidRoom] = useState(false);
  const [userId, setUserId] = useState('');

  // Verify that the roomId exists in db
  useEffect(() => {
    const fetchRoom = async () => {
      const room = await db.collection('rooms').doc(roomId).get();
      if (!room.exists) {
        history.push('/');
      } else {
        setValidRoom(true);
      }
    };

    fetchRoom();
  }, [history, roomId]);

  // Handle logging in
  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        auth.signInAnonymously();
      }
    });

    return () => {
      authUnsubscribe();
    };
  }, []);

  // Keep track of user presence in realtime database rooms
  useEffect(() => {
    if (userId !== '' && validRoom) {
      const populateRoom = async () => {
        // Keep userId in the room as long as a connection from the client exists
        rtdb.ref('/rooms/' + roomId).on('value', async (snapshot) => {
          if (snapshot.val()) {
            await rtdb.ref('/rooms/' + roomId).update({ [userId]: 'placeholder' });
          }
        });

        // Remove userId from the room on disconnect (closing a browser window/tab)
        await rtdb
          .ref('/rooms/' + roomId + '/' + userId)
          .onDisconnect()
          .remove();
      };

      populateRoom();
    }
  }, [userId, validRoom, roomId]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Turtle</IonTitle>
        </IonToolbar>
      </IonHeader>
      {validRoom ? (
        <IonContent className="ion-padding">Video and chat</IonContent>
      ) : (
        <IonContent className="ion-padding">Loading...</IonContent>
      )}
    </IonPage>
  );
};

export default Room;
