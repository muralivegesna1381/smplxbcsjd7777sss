import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler,Linking} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import SensorFirmwareUI from './sensorFirmwareUI';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import SensorHandler from '../sensorHandler/sensorHandler';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorFirmwarescreen;

const  SensorFirmwareComponent = ({ route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [isUpdateRequired, set_isUpdateRequired] = useState(false);
    const [isEnoughBattery, set_isEnoughBattery] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);
    const [firmwareVersion, set_firmwareVersion] = useState(false);
    const [newFirmwareVersion, set_newFirmwareVersion] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderText, set_loaderText] = useState(undefined);
    const [batteryLevel, set_batteryLevel] = useState(undefined);
    const [isTryAgain, set_isTryAgain] = useState(false);
    const [retryCount, set_retryCount] = useState(0);
    const [isPopupLftBtnEnable, set_isPopupLftBtnEnable] = useState(false);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    const navigation = useNavigation();

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_sensor_firmware);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_firmware, "User in Sensor Firmware Screen", ''); 

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
      
    }, []);

     useEffect(() => {
        getDefaultPet();
        set_isLoading(false);
        isLoadingdRef.current = 0;
    }, []);

    const initialSessionStart = async () => {
      trace_inSensorFirmwarescreen = await perf().startTrace('t_inSensorFirmwareScreen');
    };

    const initialSessionStop = async () => {
        await trace_inSensorFirmwarescreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const getDefaultPet = async () => {

        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);

        defaultObj = JSON.parse(defaultObj);
        set_deviceNumber(defaultObj.devices[parseInt(sensorIndex)].deviceNumber);
        set_petName(defaultObj.petName);
        set_firmwareVersion(defaultObj.devices[parseInt(sensorIndex)].firmware);
        firebaseHelper.logEvent(firebaseHelper.event_firmware_details, firebaseHelper.screen_sensor_firmware, "details : "+defaultObj.devices[parseInt(sensorIndex)].deviceNumber, 'Current Firmware : '+defaultObj.devices[parseInt(sensorIndex)].firmware);     
        if(defaultObj.devices[parseInt(sensorIndex)].isFirmwareVersionUpdateRequired){
          firebaseHelper.logEvent(firebaseHelper.event_firmware_details, firebaseHelper.screen_sensor_firmware, "Update Required : "+defaultObj.devices[parseInt(sensorIndex)].isFirmwareVersionUpdateRequired, 'New Firmware : '+defaultObj.devices[parseInt(sensorIndex)].firmwareNew);     
            set_isUpdateRequired(defaultObj.devices[parseInt(sensorIndex)].isFirmwareVersionUpdateRequired);
            set_newFirmwareVersion(defaultObj.devices[parseInt(sensorIndex)].firmwareNew);
            set_isLoading(true);
            isLoadingdRef.current = 1;
            set_loaderText("Please wait while we connect with your sensor");
            SensorHandler.getInstance();
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(defaultObj.devices[parseInt(sensorIndex)].deviceNumber,handleSensorCallback);
            }, 1000)
            
        }
    }

    const nextBtnAction = (value) => {

      if(value==='Try Again'){
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderText("Please wait while we connect with your sensor");
        // await SensorHandler.getInstance();
        // setTimeout(() => {  
            SensorHandler.getInstance().startScan(deviceNumber,handleSensorCallback);
        // }, 1000)
      } else {
        firwareUpdateAction();
      }
    }

    const navigateToPrevious = () => { 
        // SensorHandler.getInstance().dissconnectSensor(); 

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_firmware, "User clicked on back button to navigate to Select Sensor Action Page", '');     
          navigation.navigate("SelectSensorActionComponent");  
        }
           
    }

    const popOkBtnAction = (value,) => {

        if(popupRBtnTitle==='EMAIL'){
          firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_sensor_firmware, "User clicked on Mail to contact Support team", '');
          Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='");
        }
        set_isPopUp(value);
        if(value){
          popIdRef.current = 1;
        } else {
          popIdRef.current = 0;
        }
        set_popUpTitle(undefined);
        set_isPopupLftBtnEnable(false)
        set_popUpMessage(undefined);
    };

    const firwareUpdateAction = async() => {
      firebaseHelper.logEvent(firebaseHelper.event_firmware_update_action_Trigger, firebaseHelper.screen_sensor_firmware, "Sensor Firmware Update command intiated", 'Device Number : '+deviceNumber);
        const cmd = [175];
        writeData(cmd);
    };

    const tryAgainAction = async() => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderText("Please wait while we connect with your sensor");
        SensorHandler.getInstance();
        setTimeout(() => {  
            SensorHandler.getInstance().startScan(deviceNumber,handleSensorCallback);
        }, 1000)

    };

    const  handleSensorCallback = ({ data, error }) => {

        if (data) {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_firmware, "Sensor connected Successfully : "+retryCount+1, 'Device Number : '+deviceNumber);
          set_isTryAgain(false);
          readBatteryLevel();
        } else if (error) {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_firmware, "Sensor connection Fail : "+retryCount+1, 'Device Number : '+deviceNumber);
          if (retryCount===0){
            set_retryCount(retryCount+1);
            set_popupRBtnTitle('OK');
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
            set_isPopupLftBtnEnable(false);
        } else if (retryCount===1){
            set_retryCount(retryCount+1);
            set_popupRBtnTitle('OK');
            set_isPopupLftBtnEnable(false);
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
        } else if (retryCount===2){
            set_retryCount(0);
            set_popupRBtnTitle('EMAIL');
            set_isPopupLftBtnEnable(true);
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3);              
        } else {
          set_isPopupLftBtnEnable(false);
            set_popUpMessage('Unable to Connect Please try again');
        }

            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isTryAgain(true);
            set_isPopUp(true);
            popIdRef.current = 1;
            set_popUpTitle("Alert");
        }
      };

    /**
   * After connecting to sensor, this method will retriew the battery percentage from sensor
   * Battery percentage will shown to User
   * Battery Percentage less than 80 will not allows the user to upgrade the sensor software and shows the alert
   * After succesfull upgrate navigates to homepage
   */
  const readBatteryLevel = () => {

    set_loaderText("Please wait while we retrieve your sensor battery level");
    set_isLoading(true);
    isLoadingdRef.current = 1;
    SensorHandler.getInstance().readDataFromSensor("A1731EF1-A5B8-11E5-A837-0800200C9A66","A1734604-A5B8-11E5-A837-0800200C9A66",
      ({ data: batteryData, error: batteryError }) => {

        set_loaderText("");
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isTryAgain(false);
        if (batteryData) {
          let byteArray = new Uint8Array(batteryData.sensorData);
          let hexString = toHexString(byteArray);

          let srting1 = hexString.substring(0, 2);
          let srting2 = hexString.substring(2, 4);
          let formulatedString = "0x" + srting2 + srting1;

          let battery = ((parseInt(formulatedString, 16) - 3600) * 100) / (4100 - 3600);
          firebaseHelper.logEvent(firebaseHelper.event_firmware_battery, firebaseHelper.screen_sensor_firmware, "Sensor Battery Level : "+battery, 'Device Number : '+deviceNumber);

          if (battery > 100) {
            set_batteryLevel(100);
            set_isEnoughBattery(true);
          } else {
            set_isEnoughBattery(true);
            set_batteryLevel(battery);
          }
          if (battery < 80) {
            set_isUpdateRequired(false);
            set_isTryAgain(false);
            set_popUpTitle("Alert");
            set_popupRBtnTitle('OK');
            set_popUpMessage("Your sensor is not sufficiently charged (>80%) for the firmware update. Please plug in the sensor charger and try again after some time.");
            set_isPopUp(true);
            popIdRef.current = 1;

          }
        } else {

          firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_firmware, "Sensor connection Fail while fetching Battery level : "+retryCount+1, 'Device Number : '+deviceNumber);
          if (retryCount===0){
            set_retryCount(retryCount+1);
            set_popupRBtnTitle('OK');
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
            set_isPopupLftBtnEnable(false);
        } else if (retryCount===1){
            set_retryCount(retryCount+1);
            set_popupRBtnTitle('OK');
            set_isPopupLftBtnEnable(false);
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
        } else if (retryCount===2){
            set_retryCount(0);
            set_popupRBtnTitle('EMAIL');
            set_isPopupLftBtnEnable(true);
            set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3);              
        } else {
            set_isPopupLftBtnEnable(false);
            set_popUpMessage('Unable to Connect Please try again');
        }
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isTryAgain(true);
            set_isPopUp(true);
            popIdRef.current = 1;
            set_popUpTitle("Alert");

        }
      }
    );
  };

  const toHexString = (byteArray) => {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      }).join("");
  };

  const writeData = (command) => {

    set_loaderText("Initiating sensor firmware update. Please wait…");
    set_isLoading(true);
    isLoadingdRef.current = 1;
    SensorHandler.getInstance().writeDataToSensor("A173E240-A5B8-11E5-A837-0800200C9A66","A173E241-A5B8-11E5-A837-0800200C9A66",
      command,
      ({ data, error }) => {
        if (data) {
          firebaseHelper.logEvent(firebaseHelper.event_firmware_update_success, firebaseHelper.screen_sensor_firmware, "Sensor Firmware Updated Successfully", 'Device Number : '+deviceNumber);
            set_popUpTitle("SUCCESS");
            set_popUpMessage("The sensor update process is initiated and is expected to be completed soon. If your sensor is successfully updated, your current Firmware version will be updated to "+ newFirmwareVersion);
            set_isPopUp(true);
            popIdRef.current = 1;
            set_popupRBtnTitle('OK');
            set_loaderText(undefined);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isTryAgain(false);

        } else if (error) {
          //debugger;
            firebaseHelper.logEvent(firebaseHelper.event_firmware_update_fail, firebaseHelper.screen_sensor_firmware, "Sensor Firmware Updated Failed", 'error : '+error);
            set_isTryAgain(true);
            set_loaderText(undefined);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpTitle("Failed");
            set_popUpMessage("Unable to Update the sensor firmware. Please try after some time");
            set_isPopUp(true);
            popIdRef.current = 1;
        }
      }
    );
  };

  const popCancelBtnAction = () => {

        set_loaderText(undefined);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
  };

    return (
        <SensorFirmwareUI 
            deviceNumber = {deviceNumber}
            petName = {petName}
            isUpdateRequired = {isUpdateRequired}
            firmwareVersion = {firmwareVersion}
            newFirmwareVersion = {newFirmwareVersion}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            loaderText = {loaderText}
            batteryLevel = {batteryLevel}
            isEnoughBattery = {isEnoughBattery}
            isTryAgain = {isTryAgain}
            popupRBtnTitle = {popupRBtnTitle}
            isPopupLftBtnEnable = {isPopupLftBtnEnable}
            popOkBtnAction = {popOkBtnAction}
            nextBtnAction = {nextBtnAction}
            navigateToPrevious = {navigateToPrevious}
            firwareUpdateAction = {firwareUpdateAction}
            tryAgainAction = {tryAgainAction}
            popCancelBtnAction = {popCancelBtnAction}
        />
    );

  }
  
  export default SensorFirmwareComponent;