import React, { useState, useEffect, useRef } from 'react';
import {View,Platform,Linking,BackHandler} from 'react-native';
import ConnectSensorUI from './connectSensorUI';
import { useNavigation } from "@react-navigation/native";
import SensorHandler from '../sensorHandler/sensorHandler';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inConnectSensorscreen;

const  ConnectSensorComponent = ({ route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [retryCount, set_retryCount] = useState(0);
    const [btnTitle, set_btnTitle] = useState(undefined);
    const [defaultPetObj,set_defaultPetObj] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let sensorType = useRef(undefined);
    let sensorNumber = useRef(undefined);
    let isLoadingdRef = useRef(0);
    const navigation = useNavigation();

    useEffect(() => {   
        
        getDefaultPet();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_connect_sensor);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_connect_sensor, "User in Connect Sensor Screen", ''); 
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
  
    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inConnectSensorscreen = await perf().startTrace('t_inConnectSensorScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inConnectSensorscreen.stop();
    };

    const getDefaultPet = async () => {
        
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
        defaultObj = JSON.parse(defaultObj);
        set_defaultPetObj(defaultObj);
        let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
        let devNumber = defaultObj.devices[parseInt(sensorIndex)].deviceNumber;
        let deviceType =  defaultObj.devices[parseInt(sensorIndex)].deviceModel;
        sensorType.current = deviceType;
        sensorNumber.current = devNumber;
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor - No of Attemts : "+retryCount+1, 'Device Number : '+sensorNumber.current);
        firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_connect_sensor, "Device Number : "+devNumber, 'Device Type : '+deviceType);
        SensorHandler.getInstance();
        await SensorHandler.getInstance().getSensorType();
        await SensorHandler.getInstance().clearPeriID();
        if(Platform.OS==='ios'){
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
            }, 1000)
        } else {
            SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
        }
    };

    const handleSensorCallback = ({ data, error }) => {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        if(data && data.status===200){
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_connect_sensor, "Connection with Sensor sucess", 'Device Number : '+sensorNumber.current);
            navigation.navigate('SensorWiFiListComponent',{periId:data.peripheralId,defaultPetObj:defaultPetObj,isFromScreen:'connectSensor',devNumber:sensorNumber.current});
        } else {

            if (retryCount===0){
                set_retryCount(retryCount+1);
                set_popupRBtnTitle('OK');
                if(sensorType.current && sensorType.current.includes('HPN1')){
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_HPN1);
                } else {
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
                }
                
            } else if (retryCount===1){
                set_retryCount(retryCount+1);
                set_popupRBtnTitle('OK');
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
            } else if (retryCount===2){
                set_retryCount(0);
                set_popupRBtnTitle('EMAIL');
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3);              
            } else {
                set_popUpMessage('Unable to Connect Please try again');
            }
            
            set_popUpTitle('Alert');
            set_isPopUp(true);         
            set_btnTitle('SEARCH AGAIN...');
        }
    };

    const nextBtnAction = async (value) => {
        set_btnTitle(undefined);
        getDefaultPet();
    }

    const navigateToPrevious = () => {   

        if(isLoadingdRef.current === 0){
            SensorHandler.getInstance().dissconnectSensor();     
            navigation.navigate("FindSensorComponent");  
        }
           
    }

    const popOkBtnAction = (value,) => {
        if(popUpMessage === Constant.SENSOR_RETRY_MESSAGE_3){
            set_retryCount(0);
            mailToHPN();
        }
        set_isPopUp(value);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
    };

    const mailToHPN = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_connect_sensor, "Connection with Sensor Fail", 'Device Number : '+sensorNumber.current);
        Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='");
    };

    return (
        <ConnectSensorUI 
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            popupRBtnTitle = {popupRBtnTitle}
            isLoading = {isLoading}
            btnTitle = {btnTitle}
            popOkBtnAction = {popOkBtnAction}
            nextBtnAction = {nextBtnAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default ConnectSensorComponent;