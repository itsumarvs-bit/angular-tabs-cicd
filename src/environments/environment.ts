// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: 'AIzaSyD2C1rmetG0NAOJj_XdXV1o1CYQdJSJRgg',
  authDomain: 'ionic-iot-lab-e2d5a.firebaseapp.com',
  databaseURL:
    'https://ionic-iot-lab-e2d5a-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'ionic-iot-lab-e2d5a',
  storageBucket: 'ionic-iot-lab-e2d5a.firebasestorage.app',
  messagingSenderId: '130556521496',
  appId: '1:130556521496:web:afe27e84e874679734676d',
  measurementId: 'G-NSR35BNJNH',
};

export const environment = {
  production: false,
  firebaseConfig: firebaseConfig,
};

export const firebaseApp = initializeApp(firebaseConfig);
