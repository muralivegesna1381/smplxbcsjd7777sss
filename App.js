/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { useState, useEffect } from 'react';
import { View, Alert,StatusBar,Platform } from 'react-native';
import { ApolloProvider } from '@apollo/react-hooks';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Tabbar from "./src/navigation/tabbar"
import AppNavigator from './src/navigation/appNavigator';
import * as DataStorageLocal from "./src/utils/storage/dataStorageLocal";
import * as Constant from "./src/utils/constants/constant";
import * as Apolloclient from './src/config/apollo/apolloConfig';
import TimerWidgetComponent from './src/components/timerComponent/timerWidget/timerWidgetComponent';
import messaging from '@react-native-firebase/messaging';
import VideoUploadComponent from './src/utils/videoUploadBackground/videoUploadBackground.component';
import PushNotification, {Importance} from 'react-native-push-notification'; 

// import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/analytics';
import crashlytics from '@react-native-firebase/crashlytics';
// import crashlytics from '@react-native-firebase/crashlytics';
import SplashScreen from 'react-native-splash-screen';
import { GiftedChat } from 'react-native-gifted-chat'

const App = () => {

  useEffect(() => {
    checkPermission();
    onAppBootstrap();
    messageListener();
    enableFirebaseFeatures();
    saveDefaultChatbotMessage();

    if(Platform.OS==='android'){
      crateChannelPushNotifications();; 
    }

  }, []);

  async function enableFirebaseFeatures() {
    await firebase.analytics().setAnalyticsCollectionEnabled(true);
    await crashlytics().setCrashlyticsCollectionEnabled(true)
    await firebase.perf().setPerformanceCollectionEnabled(true);
  }

  async function onAppBootstrap() {

    auth().signInAnonymously().then(() => {
      console.log('User signed in anonymously');
    }).catch(error => {
      console.log('Enable anonymous in your firebase console.', error);
    })

  };

  const checkPermission = async () => {
    getFcmToken();
    const enabled = await messaging().hasPermission();
    if (enabled) {

    } else {
      requestPermission();
    }
  };

  const crateChannelPushNotifications = () => {

    PushNotification.createChannel(
      {
        channelId: "Wearables_Mobile_Android", // (required)
        channelName: "Wearables_Android_Channel", // (required)
        channelDescription: "Local Notifications", // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: false, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );

  }

  const getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    console.log('fcmToken.. App : ', fcmToken);

  }

const saveDefaultChatbotMessage = () =>{
  let tempArray = [        
    {
      id:"12345",
        text:"Hey! I am your virtual assistant. How may I help you?",
        timeStamp: new Date(),
        type: "agentMessage"
    },
      ]

      if(Platform.OS==='ios'){
        saveChatMessages(tempArray); 
      }
}
 const saveChatMessages = async(msgArray) => {
   await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_MESSAGES_ARRAY,JSON.stringify(msgArray) )
   saveDefaultDateSetValue("chatEnded");
}

const saveDefaultDateSetValue  = async (value) => {
  await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_DEFAULT_DATE_SET_VALUE,value.toString() )

};

  const requestPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      
    }
  };

  const messageListener = async () => {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      const { title, body } = remoteMessage.notification;
    });
    messaging().onMessage(async remoteMessage => {
      const { title, body } = remoteMessage.notification;
      Alert.alert(title, body);
    });
  }


  return (

    <ApolloProvider client={Apolloclient.client}>
      <StatusBar translucent={true} />
      <View style={{ flex: 1 }}>
        <AppNavigator style={{ flex: 1 }} />
        <TimerWidgetComponent />
        <VideoUploadComponent />
        
      </View>
    </ApolloProvider>

  );

}

export default App;

