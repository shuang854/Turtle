import React, { useEffect, useRef, useState } from 'react';
import { arrayUnion, db } from '../../services/firebase';
import { SYNC_MARGIN } from '../../services/utilities';
import GetExtension from './GetExtension';

type SubscriptionFrameProps = {
  roomId: string;
  ownerId: string;
  userId: string;
  videoUrl: string;
};

const SubscriptionFrame: React.FC<SubscriptionFrameProps> = ({ ownerId, userId, roomId, videoUrl }) => {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [hasExtension, setHasExtension] = useState(false);

  const getExtensionVersion = () => {
    return new Promise<boolean>((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = ({ data }) => {
        channel.port1.close();
        if (data.error) {
          reject(false);
        } else {
          resolve(true);
        }
      };
      window.postMessage('get extension version', '*', [channel.port2]);
    });
  };

  // Validate browser extension version
  useEffect(() => {
    const checkExtension = async () => {
      const val = await getExtensionVersion();
      setHasExtension(val);
    };

    checkExtension();
  }, []);

  // Listen for events from browser extension (owner only)
  useEffect(() => {
    if (ownerId === userId) {
      const handleMessage = (e: MessageEvent) => {
        const type = e.data.type;

        // Send play/pause events to Firebase
        if (type === 'play' || type === 'pause') {
          db.collection('states')
            .doc(roomId)
            .update({
              isPlaying: type === 'play',
              time: e.data.time,
            });

          db.collection('rooms')
            .doc(roomId)
            .update({
              requests: arrayUnion({ createdAt: Date.now(), senderId: userId, time: e.data.time, type: type }),
            });
        }
      };

      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [roomId, ownerId, userId]);

  // Request current state of video from browser extension
  const getCurrentStatus = () => {
    return new Promise<{ isPlaying: boolean; time: number }>((resolve, reject) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = ({ data }) => {
        channel.port1.close();
        if (data.error) {
          reject(data.error);
        } else {
          resolve({ isPlaying: data.isPlaying, time: data.time });
        }
      };
      frameRef.current?.contentWindow?.postMessage('fetch current status', '*', [channel.port2]);
    });
  };

  // Listen for updateState requests from Firebase (owner only)
  useEffect(() => {
    if (ownerId === userId) {
      const roomRef = db.collection('rooms').doc(roomId);
      const stateRef = db.collection('states').doc(roomId);

      // Add a listener to 'rooms' collection, listening for updateState requests
      const roomUnsubscribe = roomRef.onSnapshot(async (docSnapshot) => {
        const requests = docSnapshot.data()?.requests;
        const req = requests[requests.length - 1];

        if (!!req && req.type === 'updateState' && req.senderId !== userId) {
          const status = await getCurrentStatus();
          stateRef.update({
            time: status.time,
            isPlaying: status.isPlaying,
          });
        }
      });

      return () => {
        roomUnsubscribe();
      };
    }
  }, [ownerId, roomId, userId]);

  // Listen for browser extension events (member only)
  useEffect(() => {
    if (ownerId !== userId) {
      const handleMessage = (e: MessageEvent) => {
        const event = e.data.toString();
        if (event === 'video ready') {
          setPlayerReady(true);
        }
        if (event === 'video not ready') {
          setPlayerReady(false);
        }
      };

      // Listen for current video state updates from browser extension
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [ownerId, userId, videoUrl]);

  // Listen for changes in video state from Firebase (member only)
  useEffect(() => {
    if (ownerId !== userId && playerReady) {
      const stateRef = db.collection('states').doc(roomId);
      const roomRef = db.collection('rooms').doc(roomId);
      let allowUpdate = true;

      // Send player seeking event to browser extension
      const seekTo = (time: number) => {
        frameRef.current?.contentWindow?.postMessage({ type: 'seek', currentTime: time }, '*');
      };

      // Send player set event to browser extension
      const setPlaying = (isPlaying: boolean) => {
        frameRef.current?.contentWindow?.postMessage({ type: 'playing', playing: isPlaying }, '*');
      };

      // Listen to 'states' collection for video state changes from owner
      const stateUnsubscribe = stateRef.onSnapshot(async (docSnapshot) => {
        const actual = docSnapshot.data();
        if (allowUpdate) {
          const status = await getCurrentStatus();
          console.log('status:', status);
          setPlaying(actual?.isPlaying);

          if (Math.abs(status.time - actual?.time) > SYNC_MARGIN / 1000 && actual?.isPlaying) {
            allowUpdate = false;
            setTimeout(() => {
              // Throttle update requests
              allowUpdate = true;
            }, 5000);

            seekTo(actual?.time);
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
  }, [playerReady, roomId, ownerId, userId]);

  return hasExtension ? (
    <iframe
      ref={frameRef}
      src={videoUrl}
      frameBorder="0"
      title="Subscription Service"
      allow="encrypted-media; fullscreen"
      allow-scripts=""
      sandbox="allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-presentation allow-scripts allow-same-origin allow-storage-access-by-user-activation"
      height="100%"
      width="100%"
    ></iframe>
  ) : (
    <GetExtension></GetExtension>
  );
};

export default SubscriptionFrame;
