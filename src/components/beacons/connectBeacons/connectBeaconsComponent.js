import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler,Platform} from 'react-native';
import ConnectBeaconsUI from './connectBeaconsUI';
import BeaconsHandler from './../beaconsHandler';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const beaconServiceUUID = 'F0CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_1 = 'F2CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_2 = 'F3CEC428-2EBB-47AB-A753-0CE09E9FE64B';
let trace_inConnectBeaconscreen;
let connectBeaconTimeOut = undefined;

const  ConnectBeaconsComponent = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState('No beacons were found around! Please ensure the beacons and mobile device are in close proximity.');
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [beaconsArray, set_beaconsArray] = useState(undefined);
    const [isBeaconsFound, set_isBeaconsFound] = useState(true);
    const [date, set_Date] = useState(new Date());

    let isLoadingdRef = useRef(0);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        getNearbyBeacons();

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_connect_beacons);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_connect_beacons, "User in Connect Beacons Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            if(connectBeaconTimeOut){
                clearTimeout(connectBeaconTimeOut);
            }
            
          };
        
    }, []);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inConnectBeaconscreen = await perf().startTrace('t_inConnectBeaconsScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inConnectBeaconscreen.stop();
    };

    const getNearbyBeacons = async () => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        
        connectBeaconTimeOut = setTimeout( async () => {  

            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isBeaconsFound(false);
           
        }, 30000)

        firebaseHelper.logEvent(firebaseHelper.event_beacons_scan_initiated, firebaseHelper.screen_connect_beacons, "Finding nearby beacons process initiated", '');
        if(Platform.OS==='ios'){
            // await BeaconsHandler.getInstanceforBeacons();
            await BeaconsHandler.getInstanceforBeacons().clearBeaconArray();
            setTimeout( async () => {  
                await BeaconsHandler.getInstanceforBeacons().startScanBeacons(handleSensorCallbackBeacons);
            }, 1000)
        } else {
            await BeaconsHandler.getInstanceforBeacons().startScanBeacons(handleSensorCallbackBeacons);
        }

    };

    const handleSensorCallbackBeacons = async ({data,error}) => {

        if(data){

          const filteredBeaconsArray = Array.from(new Set(data));
          set_beaconsArray(filteredBeaconsArray);
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_isBeaconsFound(true);
          firebaseHelper.logEvent(firebaseHelper.event_beacons_scan_completed, firebaseHelper.screen_connect_beacons, "Finding nearby beacons process Completed", 'No of Beacons Identified : '+filteredBeaconsArray ? filteredBeaconsArray.length : 0);
          navigation.navigate('BeaconsListComponent',{beaconsArray:filteredBeaconsArray})
   
        }else {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isBeaconsFound(false);
            firebaseHelper.logEvent(firebaseHelper.event_beacons_scan_completed, firebaseHelper.screen_connect_beacons, "Finding nearby beacons process Completed", 'No Beacons Identified');
        }  
       
      }

    const nextButtonAction = async () => {
        set_isBeaconsFound(true);
        getNearbyBeacons();
    };

    const backBtnAction = () => {
        if(isLoadingdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_connect_beacons, "User clicked on back button to navigate to BeaconsInitialComponent", '');
            navigation.navigate('BeaconsInitialComponent');  
        }
        
    };

    const popOkBtnAction = () => {
        // set_isPopUp(false);
        // backBtnAction();
        // set_popupMessage(undefined);
    };

    return (

        <ConnectBeaconsUI
            isLoading = {isLoading}
            popUpMessage = {popupMessage}
            isPopUp = {isPopUp}
            isBeaconsFound = {isBeaconsFound}
            backBtnAction={backBtnAction}
            nextButtonAction = {nextButtonAction}
            popOkBtnAction = {popOkBtnAction}
        />

    );
  }
  
  export default ConnectBeaconsComponent;
