import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import { auth, db, rtdb, increment, decrement } from '../services/firebase';

const Room: React.FC<RouteComponentProps<{ roomId: string }>> = ({ match }) => {
  const history = useHistory();
  const roomId = match.params.roomId;

  const [validRoom, setValidRoom] = useState(false);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [didConnect, setDidConnect] = useState(false);

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

  // Keep track of online user presence in realtime database rooms
  useEffect(() => {
    if (!didConnect && userId !== '' && validRoom) {
      const populateRoom = () => {
        const ref = rtdb.ref('/rooms/' + roomId);

        ref.on('value', async (snapshot) => {
          if (!snapshot.hasChild(userId)) {
            // Keep userId in the room as long as a connection from the client exists
            await ref.child(userId).set({ name: 'placeholder' });
            await ref.update({ userCount: increment });
          }
        });

        ref.child('userCount').on('value', (snapshot) => {
          setUserCount(snapshot.val());
        });

        setLoading(false); // Ready when connection to rtdb is made
        return () => {
          ref.off('value');
          ref.child('userCount').off('value');
        };
      };

      populateRoom();
      setDidConnect(true); // Run this effect only once
    }
  }, [userId, validRoom, roomId, userCount, loading, didConnect]);

  // Handle disconnect events
  useEffect(() => {
    if (!loading && userId !== '' && validRoom) {
      const depopulateRoom = async () => {
        const refUser = rtdb.ref('/rooms/' + roomId + '/' + userId);
        const refRoom = rtdb.ref('/rooms/' + roomId);

        // Always remove user from room on disconnect
        await refRoom.onDisconnect().update({ userCount: decrement });
        await refUser.onDisconnect().remove();

        // Remove the room if the leaving user is the last in the room
        console.log('userCount: ' + userCount);
        if (userCount <= 1) {
          await refRoom.onDisconnect().remove();
        } else {
          await refRoom.onDisconnect().cancel(); // Cancels all disconnect actions
          await refRoom.onDisconnect().update({ userCount: decrement });
          await refUser.onDisconnect().remove();
        }
      };

      depopulateRoom();
    }
  }, [userId, validRoom, roomId, loading, userCount]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Turtle</IonTitle>
        </IonToolbar>
      </IonHeader>
      {loading ? (
        <IonContent className="ion-padding">Loading...</IonContent>
      ) : (
        <IonContent className="ion-padding">Video and chat</IonContent>
      )}
    </IonPage>
  );
};

export default Room;
