import firebase from '@react-native-firebase/app';
import { Platform } from 'react-native';// Your secondary Firebase project credentials for Android...

const androidCredentials = {
  clientId: '',
  appId: '',
  apiKey: '',
  databaseURL: '',
  storageBucket: '',
  messagingSenderId: '',
  projectId: '',};
  
  // Your secondary Firebase project credentials for iOS...
  
  const iosCredentials = {
  clientId: '725323713092-9smeq4fian673c5899ru5n3jn0cnighb.apps.googleusercontent.com',
  appId: '1:725323713092:ios:0155dca30b51d076a74a11',
  apiKey: 'AIzaSyBRXzP_OVqlGREMaGdVCin0xGKzWjaOn9Y',
  databaseURL: '',
  storageBucket: 'ct-wearables-portal-pf.appspot.com',
  messagingSenderId: '72532371309',
  projectId: 'ct-wearables-portal-pf'};// Select the relevant credentials
  
  const credentials = Platform.select({
  android: androidCredentials,
  ios: iosCredentials,});
  const config = {name: 'SECONDARY_APP',};
  await firebase.initializeApp(credentials, config);