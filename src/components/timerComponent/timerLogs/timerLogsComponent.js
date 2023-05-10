import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import TimerLogsUI from './timerLogsUI';
import { useLazyQuery } from "@apollo/react-hooks";
import * as Queries from "./../../../config/apollo/queries";
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';

const  TimerLogsComponent = ({navigation, route, ...props }) => {

    const [getTimerDetails,{loading: getTimerLoading,error: getTimerError,data: getTimerData,},] = useLazyQuery(Queries.GET_TIMER_DETAILS,);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [timerLogsArray, set_timerLogsArray] = useState(undefined);
    const [timerPets, set_timerPets] = useState(undefined);
    const [isFrom, set_isFrom] = useState(undefined);
    const [noLogsShow, set_noLogsShow] = useState(false);

    let isLoadingdRef = useRef(0);

    useEffect(() => {

      firebaseHelper.reportScreen(firebaseHelper.screen_timer_logs);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_logs, "User in Timer Logs Screen", '');
      getTimerLogDetails();

      // BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      // return () => {
      //   BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      // };

    }, []);

    useEffect(() => {

      if(route.params?.timerPets){
        set_timerPets(route.params?.timerPets);
      }

      if(route.params?.isFrom){
        set_isFrom(route.params?.isFrom);
      }

    }, [route.params?.timerPets,route.params?.isFrom]);

    useEffect(() => {
      
          if (getTimerData && getTimerData.timerLogs.responseMessage) {
            
            set_timerLogsArray(getTimerData.timerLogs.result);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(getTimerData.timerLogs.result.length>0){
              set_noLogsShow(false);
            } else {
              set_noLogsShow(true);
            }
          }
    
          if(getTimerError){
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_noLogsShow(true);
          }
    
    }, [getTimerLoading, getTimerError, getTimerData]);

    // const handleBackButtonClick = () => {
    //     navigateToPrevious();
    //     return true;
    // };

    const getTimerLogDetails = async () => {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID,);
        let json = {
            ClientID: "" + client,
          };
         getTimerDetails({ variables: { input: json } });
      };

    const navigateToPrevious = () => {  
      
      if(isLoadingdRef.current === 0){

        if(isFrom === 'TimerWidget'){
          navigation.navigate('DashBoardService');  
        } else {
          navigation.navigate('TimerComponent');  
        }

      }
 
    };

    return (
        <TimerLogsUI 

            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            timerLogsArray = {timerLogsArray}
            timerPets = {timerPets}
            noLogsShow = {noLogsShow}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default TimerLogsComponent;