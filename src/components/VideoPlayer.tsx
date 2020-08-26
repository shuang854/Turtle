import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { db, timestamp } from '../services/firebase';
import { secondsToTimestamp, timestampToSeconds } from '../services/utilities';

type VideoPlayerProps = {
  ownerId: string;
  userId: string;
  roomId: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ ownerId, userId, roomId }) => {
  const player = useRef<ReactPlayer>(null);
  const [playing, setPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

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
  }, [roomId, userId]);

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
      onPause={onPause}
      playing={playing}
      muted={true}
    ></ReactPlayer>
  );
};

export default VideoPlayer;
