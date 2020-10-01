import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { matchUrl } from '../../services/utilities';
import ReactPlayerFrame from './ReactPlayerFrame';
import SubscriptionFrame from './SubscriptionFrame';

type VideoPlayerProps = {
  ownerId: string;
  userId: string;
  roomId: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ roomId, ownerId, userId }) => {
  const [videoUrl, setVideoUrl] = useState('');

  // Listen for video URL changes
  useEffect(() => {
    const playlistRef = db.collection('playlists').doc(roomId);
    const playlistUnsubscribe = playlistRef.onSnapshot((docSnapshot) => {
      const data = docSnapshot.data();
      if (data !== undefined) {
        let url: string = data.url;
        if (matchUrl(url) === 'NETFLIX') {
          // Remove query from url
          if (url.indexOf('?') > 0) {
            url = url.substring(0, url.indexOf('?'));
          }
        }
        setVideoUrl(url);
      }
    });

    return () => {
      playlistUnsubscribe();
    };
  }, [roomId]);

  return matchUrl(videoUrl) === 'NETFLIX' ? (
    <SubscriptionFrame roomId={roomId} ownerId={ownerId} userId={userId} videoUrl={videoUrl}></SubscriptionFrame>
  ) : (
    <ReactPlayerFrame roomId={roomId} ownerId={ownerId} userId={userId} videoUrl={videoUrl}></ReactPlayerFrame>
  );
};

export default VideoPlayer;
