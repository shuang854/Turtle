// Database schema

/**
 * Notes:
 * - hierarchy consists of many collections, but shallow depth in each collection. This works nicely with subscribing
 *   listeners in useEffect. Also if collections are combined, single document updates may become too frequent.
 */

// Firestore
const collection = {
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

  // Keep chats in Realtime DB could potentially lower cost
  chats: {
    roomId: {
      messageId: {
        content: 'Message content',
        senderId: 'userId',
        createdAt: 'timestamp',
      },
    },
  },

  // Keeping state requests in Realtime DB could also lower cost
  requests: {
    roomId: {
      requestId: {
        createdAt: '2020-10-31T00:12:14.234Z',
        data: '01:25:44', // Contents of data depend on type of request
        type: 'updateState',
        senderId: 'userId',
      },
    },
  },

  // Keeping track of which users are present in a room
  rooms: {
    roomId: {
      userId: {
        name: 'Username',
      },
      userCount: 0,
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
