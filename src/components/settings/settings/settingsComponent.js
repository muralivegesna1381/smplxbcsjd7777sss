import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import SettingsUi from './settingsUI';

import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';


const SettingsComponent = ({navigation, route, ...props }) => {

  let trace_inSettings_Screen;

   // Setting the firebase screen name
   useEffect(() => {
    
  }, []);


  useEffect(() => {
    settingsSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_settings);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_settings, "User in Settings Screen", ''); 
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

     return () => {
       settingsSessionStop();
       BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
     };
 
   }, []);
  
  const handleBackButtonClick = () => {
      navigateToPrevious();
      return true;
  };

    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
    }

    const settingsSessionStart = async () => {
      trace_inSettings_Screen = await perf().startTrace('t_Settings_Screen');
    };
  
    const settingsSessionStop = async () => {
      await trace_inSettings_Screen.stop();
    };

    return (
        <SettingsUi 
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default SettingsComponent;