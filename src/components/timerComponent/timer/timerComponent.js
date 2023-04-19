import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import TimerData from './timerData';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inTimerMainActivityScreen;

const TimerComponent = ({navigation, route, ...props }) => {

    const [timerPetsArray, set_timerPetsArray] = useState(undefined);
    const [duration, set_duration] = useState(undefined);
    const [activityText, set_activityText] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_timer_main);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_main, "User in Main Timer selection Screen", '');
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
        
        if(route.params?.timerPetsArray){
            set_timerPetsArray(route.params?.timerPetsArray);
        }

        if(route.params?.duration){
            set_duration(route.params?.duration);
        }

        if(route.params?.activityText){
            set_activityText(route.params?.activityText)
        }
        
    }, [route.params?.timerPetsArray,route.params?.duration,route.params?.activityText]);
  
    const initialSessionStart = async () => {
        trace_inTimerMainActivityScreen = await perf().startTrace('t_inTimerMainSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerMainActivityScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
    }

    const goBtnAction = async () => {

        let timerPets = await DataStorageLocal.getDataFromAsync(Constant.TIMER_PETS_ARRAY);
        timerPets = JSON.parse(timerPets);
        let timerPetObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_SELECTED_PET);
        timerPetObj = JSON.parse(timerPetObj);
        firebaseHelper.logEvent(firebaseHelper.event_timer_go_action, firebaseHelper.screen_timer_main, "Timer Go button clicked", "");
        if(timerPets && timerPets.length>1){
            navigation.navigate('TimerPetSelectionComponent',{petsArray : timerPets,defaultPetObj:timerPetObj});
        } else {
            navigation.navigate('TimerActivityComponent',{timerPet : timerPetObj,fromScreen:'Timer'});
        }
        
    }

    const minmizeBtnAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_timer_minimize_time, firebaseHelper.screen_timer_main, "Timer Minimize button clicked", "");
        navigateToPrevious();
    };

    const timerLogsBtnAction = async () => {
        let timerPets = await DataStorageLocal.getDataFromAsync(Constant.TIMER_PETS_ARRAY);
        timerPets = JSON.parse(timerPets);
        firebaseHelper.logEvent(firebaseHelper.event_timer_logs_action, firebaseHelper.screen_timer_main, "Timer Logs button clicked", "");
        navigation.navigate('TimerLogsComponent',{timerPets:timerPets,isFrom:'Timer'});
    };

    return (
        <TimerData 
            // defaultPetObj = {timerPetObj}
            timerPetsArray = {timerPetsArray}
            duration = {duration}
            activityText = {activityText}
            navigateToPrevious = {navigateToPrevious}
            goBtnAction = {goBtnAction}
            minmizeBtnAction = {minmizeBtnAction}
            timerLogsBtnAction = {timerLogsBtnAction}
            
        />
    );

  }
  
  export default TimerComponent;