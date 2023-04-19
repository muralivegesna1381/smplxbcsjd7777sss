import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import CampaignUi from './campaignUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inCampaignScreen;

const  CampaignService = ({navigation, route, ...props }) => {

    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [leaderBoardArray, set_leaderBoardArray] = useState(undefined);
    const [date, set_Date] = useState(new Date());

     useEffect(() => {
        if(route.params?.leaderBoardArray){
            set_leaderBoardArray(route.params?.leaderBoardArray);
        }
        if(route.params?.leaderBoardCurrent){
            set_leaderBoardCurrent(route.params?.leaderBoardCurrent);
        }
    }, [route.params?.leaderBoardArray,route.params?.leaderBoardCurrent]);

    useEffect(() => { 
   
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_campaign);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_campaign, "User in Campaign Screen", '');   
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });


        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
  
    },[]);

    const initialSessionStart = async () => {
        trace_inCampaignScreen = await perf().startTrace('t_inCampaignScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inCampaignScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
    };

    const navigateToRewards = (petId,leaderBoard,screenName) => {
        firebaseHelper.logEvent(firebaseHelper.event_campaign_button_trigger, firebaseHelper.screen_campaign, "User Clicked to navigate to Reward Points", 'Pet Id : '+petId);
        navigation.navigate('RewardPointsService',{petId : petId, leaderBoardCurrent: leaderBoard, screen:screenName});
    }

    return (
        <CampaignUi 
            leaderBoardArray = {leaderBoardArray}
            leaderBoardCurrent = {leaderBoardCurrent}
            navigateToPrevious = {navigateToPrevious}
            navigateToRewards = {navigateToRewards}
        />
    );

  }
  
  export default CampaignService;