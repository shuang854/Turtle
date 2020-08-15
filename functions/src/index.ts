import functions = require('firebase-functions');

import admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info('Hello logs!', { structuredData: true });
  response.send('Hello from Firebase!');
});

export const deleteRoom = functions.database.ref('/available/{roomId}').onDelete(async (snapshot, context) => {
  const firestoreRef = firestore.doc(`rooms/${context.params.roomId}`);

  // // Consider fast changes to realtime database
  // const currSnapshot = snapshot.val();
  // const newSnapshot = await snapshot.ref.once('value');
  // if (newSnapshot.val().last_changed > currSnapshot.last_changed) {
  //   return null;
  // }

  return firestoreRef.delete();
});
