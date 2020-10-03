import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import Frame from '../components/Frame';
import VideoPlayer from '../components/Player/VideoPlayer';
import RoomHeader from '../components/RoomHeader';
import { auth, db, decrement, increment, rtdb } from '../services/firebase';
import { generateAnonName } from '../services/utilities';
import './Room.css';

const Room: React.FC<RouteComponentProps<{ roomId: string }>> = ({ match }) => {
  const history = useHistory();
  const roomId = match.params.roomId;

  const [validRoom, setValidRoom] = useState(false);
  const [userId, setUserId] = useState('');
  const [ownerId, setOwnerId] = useState('undefined');
  const [loading, setLoading] = useState(true);
  const [userList, setUserList] = useState<Map<string, string>>(new Map<string, string>());
  const [joinTime] = useState(Date.now()); // Time at mounting of the component

  // Verify that the roomId exists in db
  useEffect(() => {
    const fetchRoomAndVid = async () => {
      const roomRef = db.collection('rooms').doc(roomId);
      const room = await roomRef.get();
      if (!room.exists) {
        history.push('/');
      } else {
        setOwnerId(room.data()?.ownerId);
        setValidRoom(true);
      }
    };

    fetchRoomAndVid();
  }, [history, roomId]);

  // Handle logging in
  useEffect(() => {
    if (validRoom) {
      const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          setUserId(user.uid);
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
    }
  }, [validRoom]);

  // Subscribe RealTimeDB listeners
  useEffect(() => {
    if (userId !== '' && validRoom) {
      const populateRoom = () => {
        const roomRef = rtdb.ref('/rooms/' + roomId);
        const availableRef = rtdb.ref('/available/' + roomId);

        // Keep track of online user presence in realtime database rooms
        roomRef.on('value', async (snapshot) => {
          // Populate list of users in a room
          const map: Map<string, string> = new Map<string, string>();
          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key !== null && childSnapshot.key !== 'userCount') {
              map.set(childSnapshot.key, childSnapshot.child('name').val());
            }
          });
          setUserList(map);

          if (!snapshot.hasChild(userId)) {
            // Keep userId in the room as long as a connection from the client exists
            const username = (await db.collection('users').doc(userId).get()).data()?.name;
            await roomRef.child(userId).set({ name: username });

            roomRef.child(userId).onDisconnect().cancel(); // Clear any disconnect actions in case any are queued
            roomRef.child(userId).onDisconnect().remove(); // Remove userId from the room when disconnect happens
          }
        });

        // Manage user count and maintain room availability
        rtdb.ref('.info/connected').on('value', async (snapshot) => {
          if (snapshot.val() === true) {
            try {
              await roomRef.update({ userCount: increment });
              roomRef.onDisconnect().update({ userCount: decrement });
              availableRef.child(roomId).set({ name: 'Room Name', createdAt: new Date().toISOString() });
            } catch (err) {
              console.log(err);
            }
          }
        });

        // Remove room availability when the last person leaves
        roomRef.child('userCount').on('value', (snapshot) => {
          if (snapshot.val() <= 1) {
            availableRef.onDisconnect().remove();
          } else {
            availableRef.onDisconnect().cancel();
          }
        });

        setLoading(false); // Ready when connections to databases are made

        // Unsubscribe listeners
        return () => {
          roomRef.off('value');
          rtdb.ref('.info/connected').off('value');
          roomRef.child('userCount').off('value');
        };
      };

      const unsub = populateRoom();

      return () => {
        unsub();
      };
    }
  }, [userId, validRoom, roomId]);

  return (
    <IonPage>
      <IonHeader>
        <RoomHeader roomId={roomId} ownerId={ownerId} userId={userId}></RoomHeader>
      </IonHeader>
      {loading ? (
        <IonContent className="ion-padding">Loading...</IonContent>
      ) : (
        <IonGrid class="room-grid">
          <IonRow class="room-row">
            <IonCol size="12" sizeLg="9" class="player-col">
              <VideoPlayer roomId={roomId} ownerId={ownerId} userId={userId}></VideoPlayer>
            </IonCol>
            <IonCol size="12" sizeLg="3" class="frame-col">
              <Frame ownerId={ownerId} roomId={roomId} userId={userId} userList={userList} joinTime={joinTime}></Frame>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
    </IonPage>
  );
};

export default Room;
