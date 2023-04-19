import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import ManualNetworkUI from './manualNetworkUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorManualNetworkscreen;

const  ManualNetworkComponent = ({navigation, route, ...props }) => {

    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [deviceType, set_deviceType] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    
    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_sensor_add_manually);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_add_manually, "User in Sensor Add Manual Screen", ''); 
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

        if(route.params?.defaultPetObj){
            set_defaultPetObj(route.params?.defaultPetObj)
        }

        if(route.params?.deviceType){
            set_deviceType(route.params?.deviceType);
        }

    }, [route.params?.defaultPetObj,route.params?.deviceType]);
  
    const initialSessionStart = async () => {
        trace_inSensorManualNetworkscreen = await perf().startTrace('t_inSensorManualNetworkScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inSensorManualNetworkscreen.stop();
    };

    const handleBackButtonClick = () => {
          navigateToPrevious();
          return true;
    };

    const navigateToPrevious = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_back_btn_action, firebaseHelper.screen_sensor_add_manually, "User clicked on back button to navigate to Sensor WiFi list", '');
        navigation.navigate('SensorWiFiListComponent');
    }

    const submitAction = (id,psd) => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_submit_btn_action, firebaseHelper.screen_sensor_add_manually, "User clicked on Submit Button action : ", 'WiFi SSID : '+id);
        navigation.navigate('WriteDetailsToSensorComponent',{wifiName:id,wifiPsd:psd,defaultPetObj:defaultPetObj,isFromScreen:'manual'})
    }

    return (
        <ManualNetworkUI 
            deviceType={deviceType}
            submitAction = {submitAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default ManualNetworkComponent;