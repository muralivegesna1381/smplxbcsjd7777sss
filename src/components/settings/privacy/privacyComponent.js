import React, { useState, useEffect } from 'react';
import PrivacyUi from './privacyUI'
import perf from '@react-native-firebase/perf';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';

const PrivacyComponent = ({navigation, route, ...props }) => {

  let trace_inPrivacy_Screen;

  useEffect(() => {

    privacySessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_privacy);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_privacy, "User in Privacy Screen", ''); 
    return () => {
      privacySessionStop();
    };
     
  }, []);

    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
  }

  const privacySessionStart = async () => {
    trace_inPrivacy_Screen = await perf().startTrace('t_Privacy_Screen');
  };

  const privacySessionStop = async () => {
    await trace_inPrivacy_Screen.stop();
  };

    return (
        <PrivacyUi 
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default PrivacyComponent;