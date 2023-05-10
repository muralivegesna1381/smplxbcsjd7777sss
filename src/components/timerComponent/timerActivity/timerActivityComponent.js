import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import TimerActivityUI from './timerActivityUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inTimerActivityScreen;

const TimerActivityComponent = ({navigation, route, ...props }) => {

    const [timerPet, set_timerPet] = useState(undefined);
    const [fromScreen, set_fromScreen] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_timer_activity);  
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_activity, "User in Timer Activity selection Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

     useEffect(() => {

        if(route.params?.timerPet){
            set_timerPet(route.params?.timerPet);
        }

        if(route.params?.fromScreen){
            set_fromScreen(route.params?.fromScreen);
        }
        
    }, [route.params?.timerPet,route.params?.fromScreen]);
  
    const handleBackButtonClick = () => {
        // navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inTimerActivityScreen = await perf().startTrace('t_inTimerActivitySelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerActivityScreen.stop();
    };

    const navigateToPrevious = () => { 
        if(fromScreen === 'Timer'){
            navigation.navigate('TimerComponent');
        } else {
            navigation.navigate('TimerPetSelectionComponent');
        }        
    }

    const nextButtonAction = (activityText) => {
        firebaseHelper.logEvent(firebaseHelper.event_timer_activity, firebaseHelper.screen_timer_activity, "User selected Timer Activity ", "Activity : "+activityText);
        navigation.navigate('ApproxTimeComponent',{activityText:activityText,timerPet:timerPet});
    };

    return (
        <TimerActivityUI 
            timerPetsArray = {route.params?.timerPetsArray}
            navigateToPrevious = {navigateToPrevious}
            nextButtonAction = {nextButtonAction}
        />
    );

  }
  
  export default TimerActivityComponent;