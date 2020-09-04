import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { db, arrayUnion } from '../services/firebase';
import { SYNC_MARGIN } from '../services/utilities';

type VideoPlayerProps = {
  ownerId: string;
  userId: string;
  roomId: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ownerId, userId, roomId }) => {
  const player = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [allowUpdate, setAllowUpdate] = useState(true);

  // Update database on play (owner only)
  const onPlay = async () => {
    setPlaying(true);
    if (ownerId === userId) {
      const currTime = player.current?.getCurrentTime();
      if (currTime !== undefined) {
        await db.collection('states').doc(roomId).update({
          isPlaying: true,
          time: currTime,
        });

        await db
          .collection('rooms')
          .doc(roomId)
          .update({
            requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: currTime, type: 'play' }),
          });
      }
    }
  };

  // Update database on pause (owner only)
  const onPause = async () => {
    setPlaying(false);
    if (ownerId === userId) {
      const currTime = player.current?.getCurrentTime();
      if (currTime !== undefined) {
        await db.collection('states').doc(roomId).update({
          isPlaying: false,
          time: currTime,
        });

        await db
          .collection('rooms')
          .doc(roomId)
          .update({
            requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: currTime, type: 'pause' }),
          });
      }
    }
  };

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

  // Subscribe member only listener
  useEffect(() => {
    if (ownerId !== userId) {
      const stateRef = db.collection('states').doc(roomId);
      const roomRef = db.collection('rooms').doc(roomId);

      // Add a listener to 'states' collection, listening for video state changes
      const stateUnsubscribe = stateRef.onSnapshot((docSnapshot) => {
        const docData = docSnapshot.data();

        const currTime = player.current?.getCurrentTime();
        if (currTime !== undefined) {
          const realPlayState: boolean = docData?.isPlaying;
          const realTimeState: number = docData?.time;
          setPlaying(realPlayState);

          if (allowUpdate && Math.abs(currTime - realTimeState) > SYNC_MARGIN / 1000 && realPlayState) {
            setAllowUpdate(false);
            setTimeout(() => {
              // throttle update requests
              setAllowUpdate(true);
            }, 3000);

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
  }, [ownerId, roomId, userId, allowUpdate]);

  // Subscribe owner only listener
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
              isPlaying: true,
            });
          }
        }
      });

      return () => {
        roomUnsubscribe();
      };
    }
  }, [ownerId, roomId, userId]);

  // Listen for video URL changes
  useEffect(() => {
    const playlistRef = db.collection('playlists').doc(roomId);
    const playlistUnsubscribe = playlistRef.onSnapshot((docSnapshot) => {
      const data = docSnapshot.data();
      if (data !== undefined) {
        setVideoUrl(data.url);
      }
    });

    return () => {
      playlistUnsubscribe();
    };
  }, [roomId]);

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

export default VideoPlayer;
