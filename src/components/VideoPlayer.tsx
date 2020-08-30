import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { db, timestamp } from '../services/firebase';
import { secondsToTimestamp, SYNC_MARGIN } from '../services/utilities';

type VideoPlayerProps = {
  ownerId: string;
  userId: string;
  roomId: string;
  stateId: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ownerId, userId, roomId, stateId }) => {
  const player = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  // Update database on play (owner only)
  const onPlay = async () => {
    setPlaying(true);
    if (ownerId === userId) {
      const currTime = player.current?.getCurrentTime();
      if (currTime !== undefined) {
        const roomRef = db.collection('rooms').doc(roomId);
        await roomRef.collection('messages').add({
          createdAt: timestamp,
          senderId: userId,
          content: 'started playing the video from ' + secondsToTimestamp(currTime),
          type: 'play',
        });

        await roomRef.collection('states').doc(stateId).update({
          time: currTime,
          isPlaying: true,
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
        const roomRef = db.collection('rooms').doc(roomId);
        await roomRef.collection('messages').add({
          createdAt: timestamp,
          senderId: userId,
          content: 'paused the video at ' + secondsToTimestamp(currTime),
          type: 'pause',
        });

        await roomRef.collection('states').doc(stateId).update({
          time: currTime,
          isPlaying: false,
        });
      }
    }
  };

  // Request an update after buffering is finished (member only)
  const onBufferEnd = () => {
    if (ownerId !== userId) {
      db.collection('rooms').doc(roomId).collection('messages').add({
        createdAt: timestamp,
        senderId: userId,
        type: 'updateState',
      });
    }
  };

  // Listen for video state updates (member only)
  useEffect(() => {
    if (ownerId !== userId) {
      const stateRef = db.collection('rooms').doc(roomId).collection('states');
      const stateUnsubscribe = stateRef.onSnapshot((querySnapshot) => {
        const changes = querySnapshot.docChanges();
        const change = changes[changes.length - 1];
        if (change.type === 'modified') {
          const data = change.doc.data();
          const currTime = player.current?.getCurrentTime();
          if (currTime !== undefined) {
            setPlaying(data.isPlaying);
            if (!data.isPlaying) {
              player.current?.seekTo(data.time);
            }

            // Continue requesting an update on the video state, until synced
            if (Math.abs(currTime - data.time) > SYNC_MARGIN / 1000 && data.isPlaying) {
              player.current?.seekTo(data.time);
              console.log('diff: ' + Math.abs(currTime - data.time));
              db.collection('rooms').doc(roomId).collection('messages').add({
                createdAt: timestamp,
                senderId: userId,
                type: 'updateState',
              });
            }
          }
        }
      });

      return () => {
        stateUnsubscribe();
      };
    }
  }, [ownerId, userId, roomId]);

  // Listen for video updateState requests (owner only)
  useEffect(() => {
    if (ownerId === userId) {
      const roomRef = db.collection('rooms').doc(roomId);
      const videoUnsubscribe = roomRef
        .collection('messages')
        .where('type', '==', 'updateState')
        .onSnapshot((querySnapshot) => {
          const changes = querySnapshot.docChanges();
          const change = changes[changes.length - 1];
          if (change?.type === 'added') {
            const currTime = player.current?.getCurrentTime();
            if (currTime !== undefined) {
              roomRef.collection('states').doc(stateId).update({
                time: currTime,
                isPlaying: true,
              });
            }
          }
        });

      return () => {
        videoUnsubscribe();
      };
    }
  }, [ownerId, roomId, userId, stateId]);

  // Listen for video URL changes
  useEffect(() => {
    const urlRef = db.collection('rooms').doc(roomId).collection('playlist');
    const urlUnsubscribe = urlRef.onSnapshot((querySnapshot) => {
      const changes = querySnapshot.docChanges();
      for (const change of changes) {
        const data = change.doc.data();
        setVideoUrl(data.url);
      }
    });

    return () => {
      urlUnsubscribe();
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
