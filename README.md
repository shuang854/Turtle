<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://turtletv.app">
    <img src="public/assets/icon/extension-icon.png" alt="Turtle" width="80" height="80">
  </a>

  <h3 align="center">TurtleTV</h3>

  <p align="center">
    Watch your favorite shows and movies in real-time with friends!
    <br />
    <a href="https://turtletv.app">Check It Out</a>
    ·
    <a href="https://github.com/shuang854/Turtle/issues">Report Bug</a>
    ·
    <a href="https://github.com/shuang854/Turtle/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->

## Table of Contents

- [About the Project](#about-the-project)
  - [Features](#features)
  - [Built With](#built-with)
- [Local Setup](#local-setup)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

## About The Project

![A Turtle Room][product-screenshot]

TurtleTV was made with the goal of making it as easy as possible to have a virtual watch party. Hosting a watch party with friends or loved ones can be done in as little as two steps!

### Features

- Supports a variety of video URLs:
  - YouTube
  - Netflix\*\*
  - direct URLs ending in .mp4, .webm, .ogv, .mp3, and .m3u8
  - Facebook
  - Vimeo
  - Streamable
- Available on Chromium browsers (Chrome, Firefox, Edge) and Safari, on both mobile and desktop
- Chat interface

\*\*Netflix playback requires installation of the browser extension, available only on Chrome and Firefox

### Built With

Frameworks and technologies were chosen with simplicity in mind, as well as the possibility of platform agnostic.

- [Ionic Framework](https://ionicframework.com/)
  - starter app was made from Ionic CLI
  - Ionic UI library used in most UI components
  - used to deploy iOS and Android projects (not yet implemented)
- [React](https://reactjs.org/) + Typescript
  - most development was done with this combination
- [Firebase](https://firebase.google.com/)
  - User Authentication (anonymous)
  - Firestore and Realtime Database used as databases
  - Firebase Hosting for web hosting
  - Cloud Functions for database maintenance (not yet implemented)
- Javascript
  - Used to develop browser extension

## Local Setup

Overview of how to run the project locally (instructions are a work in progress).

### Prerequisites

- npm

```sh
npm install npm@latest -g
```

### Installation

1. Clone the repo

```sh
git clone https://github.com/shuang854/Turtle.git
```

2. Install NPM packages

```sh
npm install
```

3. [Start a new Firebase project](https://console.firebase.google.com/)

4. Create _src/services/firebase.ts_ file

Firebase credentials have been omitted from this repository for security reasons. Instead, link the credentials from your own Firebase project.

_src/services/firebase.ts_

```typescript
import firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

var firebaseConfig = {
  apiKey: 'yourApiKey',
  authDomain: 'yourAuthDomain',
  databaseURL: 'yourDatabaseURL',
  projectId: 'yourProjectId',
  storageBucket: 'yourStorageBucket',
  messagingSenderId: 'yourMessagingSenderId',
  appId: 'yourAppId',
  measurementId: 'yourMeasurementId',
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();

export const db = firebase.firestore();
export const rtdb = firebase.database();
export const auth = firebase.auth();

export const timestamp = firebase.firestore.FieldValue.serverTimestamp();
export const currTime = firebase.firestore.Timestamp.fromDate(new Date());
export const sessionPersist = firebase.auth.Auth.Persistence.SESSION;
export const increment = firebase.database.ServerValue.increment(1);
export const decrement = firebase.database.ServerValue.increment(-1);

export const arrayUnion = (object: any) => {
  return firebase.firestore.FieldValue.arrayUnion(object);
};
```

## Roadmap

See the [open issues](https://github.com/shuang854/Turtle/issues) for a list of proposed features (and known issues).

- iOS and Android apps
- Microphone/Webcam support
- Support for more streaming services

<!-- CONTRIBUTING -->

## Contributing

Any contributions would be greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<!-- LICENSE -->

## License

To be determined

<!-- CONTACT -->

## Contact

Simon Huang - shuang85497@gmail.com

Discord Link: [https://discord.gg/NEw3Msu](https://discord.gg/NEw3Msu)

<!-- ACKNOWLEDGEMENTS -->

## Acknowledgements

- [Best README Template](https://github.com/othneildrew/Best-README-Template)
- [React Player](https://github.com/CookPete/react-player)
- [Metastream](https://github.com/samuelmaddock/metastream)
- [Stream Party](https://github.com/jengmicah/streamparty)

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[product-screenshot]: public/assets/screenshot.png
