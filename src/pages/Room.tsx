import { IonCol, IonContent, IonGrid, IonHeader, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import React, { useEffect, useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { RouteComponentProps, useHistory } from 'react-router';
import Chat from '../components/Chat';
import { auth, db, decrement, increment, rtdb, timestamp } from '../services/firebase';
import { generateAnonName, secondsToTimestamp, timestampToSeconds } from '../services/utilities';
import './Room.css';

const Room: React.FC<RouteComponentProps<{ roomId: string }>> = ({ match }) => {
  const history = useHistory();
  const roomId = match.params.roomId;

  const [validRoom, setValidRoom] = useState(false);
  const [userId, setUserId] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const player = useRef<ReactPlayer>(null);

  // Verify that the roomId exists in db
  useEffect(() => {
    const fetchRoom = async () => {
      const room = await db.collection('rooms').doc(roomId).get();
      if (!room.exists) {
        history.push('/');
      } else {
        setValidRoom(true);
        setOwnerId(room.data()?.ownerId);
      }
    };

    fetchRoom();
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
          if (!snapshot.hasChild(userId)) {
            // Keep userId in the room as long as a connection from the client exists
            await roomRef.child(userId).set({ name: 'placeholder' });
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

  // Send video playing message to database when owner plays video
  const onPlay = async () => {
    if (ownerId === userId) {
      const currTime = player?.current?.getCurrentTime();
      if (currTime !== undefined) {
        await db
          .collection('rooms')
          .doc(roomId)
          .collection('messages')
          .add({
            createdAt: timestamp,
            senderId: userId,
            content: 'started playing the video from ' + secondsToTimestamp(currTime),
            type: 'play',
          });
      }
    }
  };

  const onPause = async () => {
    if (ownerId === userId) {
      const currTime = player?.current?.getCurrentTime();
      if (currTime !== undefined) {
        await db
          .collection('rooms')
          .doc(roomId)
          .collection('messages')
          .add({
            createdAt: timestamp,
            senderId: userId,
            content: 'paused the video at ' + secondsToTimestamp(currTime),
            type: 'pause',
          });
      }
    }
  };

  // Listen for video interactions
  useEffect(() => {
    if (!loading) {
      const videoUnsubscribe = db
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .where('type', 'in', ['play', 'pause'])
        .onSnapshot((querySnapshot) => {
          const changes = querySnapshot.docChanges();
          const change = changes[changes.length - 1];
          if (change?.type === 'added') {
            const data = change.doc.data();
            if (userId !== data.senderId) {
              // Match video timestamp of received message
              const arr = data.content.split(' ');
              const timestamp = arr[arr.length - 1];
              player.current?.seekTo(timestampToSeconds(timestamp));

              if (data.type === 'play') {
                setPlaying(true);
              } else {
                setPlaying(false);
              }
            }
          }
        });

      return () => {
        videoUnsubscribe();
      };
    }
  }, [loading, roomId, userId]);

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
        <IonGrid class="room-grid">
          <IonRow class="room-row">
            <IonCol size="12" sizeLg="9" class="player-col">
              <ReactPlayer
                ref={player}
                url="https://www.youtube.com/watch?v=ysz5S6PUM-U"
                width="100%"
                height="100%"
                controls={true}
                onPlay={onPlay}
                onPause={onPause}
                playing={playing}
                muted={true}
              ></ReactPlayer>
            </IonCol>
            <IonCol size="12" sizeLg="3" class="chat-col">
              <Chat roomId={roomId} userId={userId}></Chat>
            </IonCol>
          </IonRow>
        </IonGrid>
      )}
    </IonPage>
  );
};

export default Room;
