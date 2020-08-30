// Database schema

// Firestore
const collection = {
  rooms: [
    {
      roomId: {
        createdAt: 'timestamp',
        ownerId: 'userId',
        messages: [
          {
            messageId: {
              createdAt: 'timestamp',
              content: 'Message content',
              senderId: 'userId',
            },
          },
        ],
        playlist: [
          {
            videoId: {
              createdAt: 'timestamp',
              url: 'https://youtube.com',
            },
          },
        ],
        states: [
          {
            stateId: {
              time: 'timestamp',
              isPlaying: true,
            },
          },
        ],
      },
    },
  ],
  users: [
    {
      userId: {
        name: 'Anonymous',
      },
    },
  ],
};

// Realtime Database - needed for tracking user presence
const turtle = {
  // Needed for database triggers updating Firestore
  available: {
    roomId: {
      createdAt: '2020-08-12T00:13:16.273Z',
    },
  },

  // Keeping track of which users are present in a room
  rooms: {
    roomId: {
      userId: {
        name: 'Username',
      },
    },
  },
};

// TODO: Put in firebase.json
// "functions": {
//   "predeploy": [
//     "npm --prefix \"$RESOURCE_DIR\" run lint",
//     "npm --prefix \"$RESOURCE_DIR\" run build"
//   ],
//   "source": "functions"
// },
