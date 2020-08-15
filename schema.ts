// Database schema

// Firestore
const collection = {
  rooms: {
    roomId: {
      createdAt: 'timestamp',
      ownerId: 'userId',
    },
  },
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
