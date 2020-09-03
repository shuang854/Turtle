// Database schema

/**
 * Notes:
 * - hierarchy consists of many collections, but shallow depth in each collection. This works nicely with subscribing
 *   listeners in useEffect. Also if collections are combined, single document updates may become too frequent.
 */

// Firestore
const collection = {
  chats: [
    {
      roomId: {
        messages: [
          {
            content: 'Message content',
            createdAt: 'timestamp',
            senderId: 'userId',
          },
        ],
      },
    },
  ],
  playlists: [
    {
      roomId: {
        createdAt: 'timestamp',
        url: 'https://youtube.com',
      },
    },
  ],
  rooms: [
    {
      roomId: {
        createdAt: 'timestamp',
        ownerId: 'userId',
        requests: [
          {
            createdAt: 'timestamp',
            type: 'updateState',
            senderId: 'userId',
          },
        ],
      },
    },
  ],
  states: [
    {
      roomId: {
        time: 'timestamp',
        isPlaying: true,
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
