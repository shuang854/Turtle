import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { arrayUnion, db } from '../../services/firebase';
import { SYNC_MARGIN } from '../../services/utilities';

type ReactPlayerFrameProps = {
  ownerId: string;
  userId: string;
  roomId: string;
  videoUrl: string;
};

const ReactPlayerFrame: React.FC<ReactPlayerFrameProps> = ({ ownerId, userId, roomId, videoUrl }) => {
  const player = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);

  // Update database on play (owner only)
  const onPlay = () => {
    setPlaying(true);
    if (ownerId === userId) {
      const currTime = player.current?.getCurrentTime();
      if (currTime !== undefined) {
        db.collection('states').doc(roomId).update({
          isPlaying: true,
          time: currTime,
        });

        db.collection('rooms')
          .doc(roomId)
          .update({
            requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: currTime, type: 'play' }),
          });
      }
    }
  };

  // Update database on pause (owner only)
  const onPause = () => {
    setPlaying(false);
    if (ownerId === userId) {
      const currTime = player.current?.getCurrentTime();
      if (currTime !== undefined) {
        db.collection('states').doc(roomId).update({
          isPlaying: false,
          time: currTime,
        });

        db.collection('rooms')
          .doc(roomId)
          .update({
            requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: currTime, type: 'pause' }),
          });
      }
    }
  };

  // Listen for requests from Firebase (owner only)
  useEffect(() => {
    if (ownerId === userId) {
      const roomRef = db.collection('rooms').doc(roomId);
      const stateRef = db.collection('states').doc(roomId);

      // Add a listener to 'rooms' collection, listening for updateState requests
      const roomUnsubscribe = roomRef.onSnapshot((docSnapshot) => {
        const requests = docSnapshot.data()?.requests;
        const req = requests[requests.length - 1];

        if (!!req && req.type === 'updateState' && req.senderId !== userId) {
          const currTime = player.current?.getCurrentTime();
          if (currTime !== undefined) {
            stateRef.update({
              time: currTime,
              isPlaying: player.current?.props.playing,
            });
          }
        }
      });

      return () => {
        roomUnsubscribe();
      };
    }
  }, [ownerId, roomId, userId]);

  // Request an update after buffering is finished (member only)
  const onBufferEnd = () => {
    if (ownerId !== userId) {
      db.collection('rooms')
        .doc(roomId)
        .update({
          requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: 0, type: 'updateState' }),
        });
    }
  };

  // Listen for changes in video state from Firebase (member only)
  useEffect(() => {
    if (ownerId !== userId) {
      const stateRef = db.collection('states').doc(roomId);
      const roomRef = db.collection('rooms').doc(roomId);
      let allowUpdate = true;

      // listen to 'states' collection for video state changes from owner
      const stateUnsubscribe = stateRef.onSnapshot((docSnapshot) => {
        const docData = docSnapshot.data();

        const currTime = player.current?.getCurrentTime();
        if (currTime !== undefined) {
          const realPlayState: boolean = docData?.isPlaying;
          const realTimeState: number = docData?.time;
          setPlaying(realPlayState);

          if (allowUpdate && Math.abs(currTime - realTimeState) > SYNC_MARGIN / 1000 && realPlayState) {
            allowUpdate = false;
            setTimeout(() => {
              // Throttle update requests
              allowUpdate = true;
            }, 5000);

            player.current?.seekTo(realTimeState);
            roomRef.update({
              requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: 0, type: 'updateState' }),
            });
          }
        }
      });

      return () => {
        stateUnsubscribe();
      };
    }
  }, [ownerId, roomId, userId]);

  return (
    <ReactPlayer
      ref={player}
      url={videoUrl}
      width="100%"
      height="100%"
      controls={true}
      onPlay={onPlay}
      onBufferEnd={onBufferEnd}
      onPause={onPause}
      playing={playing}
      muted={true}
      config={{
        youtube: {
          playerVars: {
            showinfo: 1, // Keeps mute/full screen controls at bottom for iOS
          },
        },
      }}
    ></ReactPlayer>
  );
};

export default ReactPlayerFrame;
