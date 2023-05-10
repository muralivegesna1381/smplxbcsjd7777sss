import React, { useState, useEffect } from 'react';
import {View,BackHandler,Platform} from 'react-native';
import ApproxTimeUI from './approxTimeUI';
import * as Storage from '../../../utils/storage/dataStorageLocal';
import * as Constant from "../../../utils/constants/constant";
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "./../../../config/apollo/queries";
import { Query } from 'react-apollo';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import { OpenOptimizationSettings, BatteryOptEnabled } from "react-native-battery-optimization-check";

let trace_inTimerApproxScreen;

const ApproxTimeComponent = ({navigation, route, ...props }) => {
    
    const [activityText, set_activityText] = useState(undefined);
    const [timerPet, set_timerPet] = useState(undefined);
    const [isPopup, set_isPopup] = useState(false)

     useEffect(() => {
         if(route.params?.activityText){
            set_activityText(route.params?.activityText);
         }

         if(route.params?.timerPet){
            set_timerPet(route.params?.timerPet);
        }
    }, [route.params?.activityText,route.params?.timerPet]);

    useEffect(() => {
        
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_timer_time_duration);  
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_time_duration, "User in Timer duration selection Screen", '');
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        getTimerValues();

        if(Platform.OS === 'android') {
            checkAndroidBtryPermissions();
        }

        return () => {
            initialSessionStop();
            focus();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const initialSessionStart = async () => {
        trace_inTimerApproxScreen = await perf().startTrace('t_inTimerApproxTimeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerApproxScreen.stop();
    };

    const handleBackButtonClick = () => {
        // navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {  
        navigation.navigate('TimerActivityComponent');
    }

    const getTimerValues = () => {

        <Query query={Queries.TIMER_WIDGET_QUERY}  fetchPolicy={'cache-only'}>
          {({ data }) => {
            if(data){

            }
            
        }}
        </Query>
    }

    const nextButtonAction = async (duration) => {

        firebaseHelper.logEvent(firebaseHelper.event_timer_selected_time, firebaseHelper.screen_timer_time_duration, "User selected time duration", "Duration : "+duration);
        let asyncJson= {
            startDate : new Date(),
            pauseDate : '',
            isTimerStarted : true,
            isTimerPaused : false,
            timerPetId : timerPet.petID,
            timerPetName : timerPet.petName,
            activityText : activityText,
            duration : duration,
            actualDuration : duration,
            resumeTime : new Date(),
            milsSecs : 0,
            isTimerIncreaseDone : false

        }
        await Storage.saveDataToAsync(Constant.TIMER_OBJECT,JSON.stringify(asyncJson));
        await Storage.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(timerPet));

        Apolloclient.client.writeQuery({
            query: Queries.TIMER_WIDGET_QUERY,
            data: {
              data: { 
                        screenName:'ApproxTime',stopTimerInterval:'Continue',__typename: 'TimerWidgetQuery'}
                    },
            })

        // Apolloclient.client.writeQuery({query: Queries.TIMER_START_QUERY,data: {data: {timerStart:'StartTimer',__typename: 'TimerStartQuery'}},});
        navigation.navigate('TimerComponent',{timerPetId:timerPet.petID,activityText:activityText,duration : duration});
    };

    const checkAndroidBtryPermissions = () => {

        BatteryOptEnabled().then((isEnabled)=>{
            if (isEnabled) {
                set_isPopup(true)            
            }
        });
    }

    const popOkBtnAction = () => {
        OpenOptimizationSettings();
        set_isPopup(false);
    };

    const popUpLeftBtnAction = () => {
        set_isPopup(false)
    };

    return (
        <ApproxTimeUI 
            timerPetsArray = {route.params?.timerPetsArray}
            isPopup = {isPopup}
            navigateToPrevious = {navigateToPrevious}
            nextButtonAction = {nextButtonAction}
            popOkBtnAction = {popOkBtnAction}
            popUpLeftBtnAction = {popUpLeftBtnAction}
        />
    );

  }
  
  export default ApproxTimeComponent;