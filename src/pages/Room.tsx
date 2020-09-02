import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow } from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps, useHistory } from 'react-router';
import Chat from '../components/Chatbox';
import RoomHeader from '../components/RoomHeader';
import VideoPlayer from '../components/VideoPlayer';
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
  const [userCount, setUserCount] = useState(0);
  const [videoId, setVideoId] = useState('');
  const [stateId, setStateId] = useState('');
  const [userList, setUserList] = useState<string[]>(['']);

  // Verify that the roomId exists in db
  useEffect(() => {
    const fetchRoomAndVid = async () => {
      const roomRef = db.collection('rooms').doc(roomId);
      const room = await roomRef.get();
      if (!room.exists) {
        history.push('/');
      } else {
        // Set videoId for RoomHeader component
        const playlistSnapshot = await roomRef.collection('playlist').get();
        const vidId = playlistSnapshot.docs[0].id;
        setVideoId(vidId);

        // Set stateId for VideoPlayer component
        const stateSnapshot = await roomRef.collection('states').get();
        const vidStateId = stateSnapshot.docs[0].id;
        setStateId(vidStateId);

        setOwnerId(room.data()?.ownerId);
        setValidRoom(true);
      }
    };

    fetchRoomAndVid();
  }, [history, roomId]);

  // Handle logging in
  useEffect(() => {
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
  }, []);

  // Subscribe listeners
  useEffect(() => {
    if (userId !== '' && validRoom) {
      const populateRoom = () => {
        const roomRef = rtdb.ref('/rooms/' + roomId);
        const availableRef = rtdb.ref('/available/');

        // Keep track of online user presence in realtime database rooms
        roomRef.on('value', async (snapshot) => {
          // Populate list of users in a room
          const set: string[] = [];
          snapshot.forEach((childSnapshot) => {
            if (childSnapshot.key !== 'userCount') {
              set.push(childSnapshot.child('name').val());
            }
          });
          setUserList(set);

          if (!snapshot.hasChild(userId)) {
            // Keep userId in the room as long as a connection from the client exists
            const username = (await db.collection('users').doc(userId).get()).data()?.name;
            await roomRef.child(userId).set({ name: username });
            await roomRef.update({ userCount: increment });
          }
        });

        roomRef.child('userCount').on('value', (snapshot) => {
          setUserCount(snapshot.val());
        });

        // Re-add room into /available/ if the room was deleted
        availableRef.on('value', async (snapshot) => {
          if (!snapshot.hasChild(roomId)) {
            await availableRef.child(roomId).set({
              name: 'Room Name',
              createdAt: new Date().toISOString(),
            });
          }
        });

        setLoading(false); // Ready when connections to databases are made

        // Unsubscribe listeners
        return () => {
          roomRef.off('value');
          roomRef.child('userCount').off('value');
          availableRef.off('child_removed');
        };
      };

      const unsub = populateRoom();

      return () => {
        unsub();
      };
    }
  }, [userId, validRoom, roomId]);

  // Handle disconnect events
  useEffect(() => {
    if (!loading && userId !== '' && validRoom) {
      const depopulateRoom = async () => {
        const refUser = rtdb.ref('/rooms/' + roomId + '/' + userId);
        const refRoom = rtdb.ref('/rooms/' + roomId);
        const refAvailable = rtdb.ref('/available/' + roomId);

        // Always remove user from room on disconnect
        await refRoom.onDisconnect().update({ userCount: decrement });
        await refUser.onDisconnect().remove();

        // Remove the room if the leaving user is the last in the room
        if (userCount <= 1) {
          await refRoom.onDisconnect().remove();
          await refAvailable.onDisconnect().remove();
        } else {
          await refRoom.onDisconnect().cancel(); // Cancels all disconnect actions at and under refRoom
          await refAvailable.onDisconnect().cancel();
          await refRoom.onDisconnect().update({ userCount: decrement }); // User disconnect still needs to be handled
          await refUser.onDisconnect().remove();
        }
      };

      depopulateRoom();
    }
  }, [userId, validRoom, roomId, loading, userCount]);

  return (
    <IonPage>
      <IonHeader>
        <RoomHeader roomId={roomId} videoId={videoId} ownerId={ownerId} userId={userId}></RoomHeader>
      </IonHeader>
      {loading ? (
        <IonContent className="ion-padding">Loading...</IonContent>
      ) : (
        <IonGrid class="room-grid">
          <IonRow class="room-row">
            <IonCol size="12" sizeLg="9" class="player-col">
              <VideoPlayer ownerId={ownerId} userId={userId} roomId={roomId} stateId={stateId}></VideoPlayer>
            </IonCol>
            <IonCol size="12" sizeLg="3" class="chat-col">
              <Chat ownerId={ownerId} roomId={roomId} userId={userId} userList={userList}></Chat>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
    </IonPage>
  );
};

export default Room;
