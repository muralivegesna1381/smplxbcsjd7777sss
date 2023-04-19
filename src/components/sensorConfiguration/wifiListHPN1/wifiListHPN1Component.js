import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler,Linking } from 'react-native';
import WifiListHPN1UI from './wifiListHPN1UI';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import SensorHandler from '../sensorHandler/sensorHandler';
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorHPN1ConfigScreen;
var Buffer = require("buffer/").Buffer;

const DELETE_WIFI = 1;
const EDIT_WIFI = 2;
const CONNECT_SENSOR = 3;

const WifiListHPN1Component = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [loaderText, set_loaderText] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupLeftBtnEnable, set_popupLeftBtnEnable] = useState(undefined);
    const [popupLeftBtnTitle, set_popupLeftBtnTitle] = useState(undefined);
    const [popupRightBtnTitle, set_popupRightBtnTitle] = useState(undefined);
    const [popupId, set_popupId] = useState(undefined);
    const [popupAlert,set_popupAlert] = useState(undefined);
    const [isRefresh, set_isRefresh] = useState(false);
    const [congiguredWIFIArray, set_congiguredWIFIArray] = useState(undefined);
    const [actionType, set_actionType] = useState(undefined);
    const [deleteIndexValue, set_deleteIndexValue] = useState(undefined);
    const [peripharalId, set_peripharalId] = useState(undefined);
    const [btnTitle,set_btnTitle] = useState(undefined);
    const [isLeftBtnEnable,set_isLeftBtnEnable] = useState(undefined);
    const [addBtnEnable, set_addBtnEnable] = useState(undefined);
    const [delay, setDelay] = useState(null);
    const [date, set_Date] = useState(new Date());

    let wifiTotalCount = useRef(0);
    let popIdRef = useRef(0);
    let isLoadingRef = useRef(0);

    useEffect(() => {

      connectSensor();

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_sensor_HPN1_WiFi);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_HPN1_WiFi, "User in Sensor HPN1 Configured WiFi List Screen", '');
      });
  
      const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
      });

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

  }, []);

    const initialSessionStart = async () => {
      trace_inSensorHPN1ConfigScreen = await perf().startTrace('t_inSensorHPN1ConfigWiFiListScreen');
    };

    const initialSessionStop = async () => {
      await trace_inSensorHPN1ConfigScreen.stop();
    };

    const connectSensor = async () => {

      set_isLoading(true);
      isLoadingRef.current = 1;
      set_loaderText('Please wait..');
      SensorHandler.getInstance().readDataFromSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_SYSTEM_STATUS,readWIFISystemStatusFromHPN1Sensor);   

    };

    const readWIFISystemStatusFromHPN1Sensor = ({ data, dissconnectError, error }) => {
        
        if (data) {
          
          if (data.sensorData) {

            if(data.sensorData[2] > 0){

              let command = 1;
              let value = Buffer.from([data.sensorData[2]]);
              let totalWifiCount = value.readUInt8(0, true);
              wifiTotalCount.current = data.sensorData[2];
              firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_wifi_max_limit, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetched no of configured WiFi SSIDs ", 'Configured WiFi Count : '+data.sensorData[2]);
              set_loaderText('Total Configured Wi-Fi SSIDS found : '+data.sensorData[2].toString());    
              SensorHandler.getInstance().configuredWIFIList(command,totalWifiCount,getConfiguredWIFINames);

            } else {
              firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_wifi_max_limit, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetched no of configured WiFi SSIDs ", 'Configured WiFi Count : 0');
              set_isLoading(false);
              isLoadingRef.current = 0;
              setPopup('','Alert','OK',"No Wi-Fi is configured for this sensor!",true,false,'');
            }

          }

          if (data.sensorData && data.sensorData[2] > 7) {
            set_addBtnEnable(false);
          } else {
            set_addBtnEnable(true);
          }

        } else if(dissconnectError){

          firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_wifi_max_limit, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetching no of configured WiFi SSIDs failed", 'error : '+error);
          set_isLoading(false);
          isLoadingRef.current = 0;
          set_btnTitle('SEARCH AGAIN...');
          set_isLeftBtnEnable(true);
          setPopup('','Alert','OK',"Unable to connect! Please ensure your sensor is plugged in and charging (Green long flash).1",true,false,'');

        } else {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_wifi_max_limit, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetching no of configured WiFi SSIDs failed", 'error : '+error);
          set_isLoading(false);
          isLoadingRef.current = 0;
          set_btnTitle('SEARCH AGAIN...');
          set_isLeftBtnEnable(true);
          setPopup('','Alert','OK',"Unable to connect! Please ensure your sensor is plugged in and charging (Green long flash).1",true,false,'');

        }
    };

    const getConfiguredWIFINames = ({ data, error }) => {

        if (data) {
          // if(data.status===201 && data.wifiList.length > 0){
          if (data.status && data.status === 201) {
            set_isLoading(false);
            isLoadingRef.current = 0;
            set_btnTitle('SEARCH AGAIN...');
            set_isRefresh(true);
            setPopup('','Alert','OK',"Unable to retrieve all the configured Wi-Fi SSIDs. Please try again.",true,false,'');

          } else if (data.status && data.status === 200 && data.wifiList && data.wifiList.length < 1) {
            set_isRefresh(false);
          } else {
            set_isRefresh(false);
          }

          let mainCount = parseInt( wifiTotalCount.current);
          let subCount = undefined;
          if(data.wifiListNames){
            subCount = data.wifiListNames.length;
          }
    
          set_congiguredWIFIArray(data.wifiList);
          set_loaderText('Remaining Configured Wi-Fi SSIDS : '+(mainCount-subCount).toString());

          if(data.completionMsg && (data.completionMsg==='Completed'|| data.completionMsg==='InComplete')){
            firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_list, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetched Configured WiFi SSIDs", 'SSID List : '+data.wifiListNames);
            saveWiFilistAsyncStorage(data.wifiListNames);
            set_isLoading(false);
            isLoadingRef.current = 0;
            SensorHandler.getInstance().clearConfiguredWIFIArray();
          }
          
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_list, firebaseHelper.screen_sensor_HPN1_WiFi, "Fetching Configured WiFi SSIDs fail", 'error : '+error);
            set_btnTitle('SEARCH AGAIN...');
            set_isLeftBtnEnable(true);
            set_isLoading(false);
            isLoadingRef.current = 0;
            setPopup('','Alert','OK',"Unable to get Configured WIFI list. Please try again",true,false,'');

        }
    };

    const editWIFIAction = (item) => {
      set_actionType("editAction");
      set_deleteIndexValue(item.indexValue + 1);
      set_btnTitle(undefined);
      set_isLeftBtnEnable(false);
      setPopup(EDIT_WIFI,'Alert','YES',"Are you sure you want to edit this configuration? These changes cant be reverted.",true,true,'NO');

    };

    ////////////////// Starts Delete Configured WIFI Methods ////////////////////
  const deleteWIFIAction = (item) => {

      firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_action, firebaseHelper.screen_sensor_HPN1_WiFi, "User deleting the SSID", 'SSID Name : '+item.ssidName);
      set_actionType("deleteAction");
      set_deleteIndexValue(item.indexValue + 1);
      set_btnTitle(undefined);
      set_isLeftBtnEnable(false);
      setPopup(DELETE_WIFI,'Alert','YES',"Are you sure you want to delete this configuration? These changes cant be reverted.",true,true,'NO');

  };

  const deleteCommandAction = (index) => {

    if (actionType === "editAction") {

      set_loaderText("Please wait while we reconfigure the SSID");
 
    } else if (actionType === "deleteAction") {

      set_loaderText("Please wait while we delete the SSID");

    } else {

      set_loaderText("Please wait while we retrieve configuring SSID list");

    }
   
    let command = [deleteIndexValue];
    SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_LIST_INDEX, command,writeWIFIDeleteIndex);

  };

  const writeWIFIDeleteIndex = ({ data, dissconnectError,error }) => {

    if (data) {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_index, firebaseHelper.screen_sensor_HPN1_WiFi, "Deleting WiFI SSID Index is successfull", '');
      let command = [deleteIndexValue];
      SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_ENTRY_DELETE,command,writeWIFIEntryDelete);

    } else {
      if (actionType === "editAction") {

        set_btnTitle(undefined);
        set_isLeftBtnEnable(false);
        setPopup('','Alert','OK',"Unable to modify the configured Wi-Fi SSID. Please try again.",true,false,'NO');

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_index, firebaseHelper.screen_sensor_HPN1_WiFi, "Deleting WiFI SSID Index is Failed", 'error : '+error);
        set_btnTitle(undefined);
        set_isLeftBtnEnable(false);
        setPopup('','Alert','OK',"Unable to delete the configured Wi-Fi SSID. Please try again.",true,false,'NO');

      }
    }
  };

  const writeWIFIEntryDelete = ({ data, error }) => {
    
    if (data) {

      const items = congiguredWIFIArray;
      const i = deleteIndexValue-1;
      const filteredItems = items.slice(0, i).concat(items.slice(i + 1, items.length));

      set_congiguredWIFIArray(filteredItems);
      set_isLoading(false);
      isLoadingRef.current = 0;
      set_loaderText(undefined);
      saveWiFilistAsyncStorage(filteredItems);

      if (actionType === "editAction") {

        editWiFiSSID();

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_index_confirm, firebaseHelper.screen_sensor_HPN1_WiFi, "Confirm Deleting WiFI SSID Index is successfull", 'Initiating rescan the remaining SSIDs');
        SensorHandler.getInstance().clearConfiguredWIFIArray();
        connectSensor();

      }

    } else {
      if (this.state.actionType === "editAction") {

        set_btnTitle(undefined);
        set_isLeftBtnEnable(false);
        setPopup('','Alert','OK',"Unable to modify the configured Wi-Fi SSID. Please try again.",true,false,'NO');

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_index_confirm, firebaseHelper.screen_sensor_HPN1_WiFi, "Confirm Deleting WiFI SSID Index failed", 'error : '+error);
        set_btnTitle(undefined);
        set_isLeftBtnEnable(false);
        setPopup('','Alert','OK',"Unable to delete the configured Wi-Fi SSID. Please try again.",true,false,'NO');

      }
    }
  };

  const editWiFiSSID =async ()=> {

    if (actionType === "editAction") {
      await SensorHandler.getInstance().stopScanProcess(false);
      let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
      defaultObj = JSON.parse(defaultObj);
      navigation.navigate('SensorWiFiListComponent',{periId:peripharalId,defaultPetObj:defaultObj,isFromScreen:'configuredWifiScreen'});

    } else if (actionType === "deleteAction") {

    } else {
      set_loaderText(undefined);
      set_isLoading(false);
      isLoadingRef.current = 0;
    }
  };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const navigateToPrevious = async () => {
      
      if(isLoadingRef.current === 0 && popIdRef.current === 0){

        await SensorHandler.getInstance().dissconnectSensor();
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_HPN1_WiFi, "User clicked on back button to navigate to Select Sensor Action Page", '');
        navigation.navigate('SelectSensorActionComponent');

      }
        
    }

    const nextButtonAction = () => {
      set_btnTitle(undefined);
      set_isLeftBtnEnable(false);
      connectSensor();
    };

    const setPopup = (popId,alertTitle,rbtnTitle,popMsg,isPop,isLftBtnEnable,lftBtnTitle) => {

      set_popupId(popId);
      set_popupAlert(alertTitle);
      set_popupRightBtnTitle(rbtnTitle);
      set_popupMsg(popMsg);
      set_isPopUp(isPop);
      if(isPop){
        popIdRef.current = 1;
      } else {
        popIdRef.current = 0;
      }
      set_popupLeftBtnEnable(isLftBtnEnable);
      set_popupLeftBtnTitle(lftBtnTitle);

    };

    const popOkBtnAction = async () => {

      popCancelBtnAction();

        if(popupId === DELETE_WIFI || popupId === EDIT_WIFI){

          firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_configured_WiFi_delete_action, firebaseHelper.screen_sensor_HPN1_WiFi, "User confirmed to deleting the SSID", '');
          set_loaderText('Please wait..');
          set_isLoading(true);
          isLoadingRef.current = 1;
          deleteCommandAction();

        } else if(popupId === CONNECT_SENSOR) {
          if(popupRightBtnTitle==='EMAIL'){
            mailToHPN();
          }
        }
      
    };

    const popCancelBtnAction = () => {

        set_popupLeftBtnEnable(false);
        set_popupLeftBtnTitle(undefined);
        set_popupRightBtnTitle(undefined);
        set_popupMsg(undefined);
        set_popupAlert(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;

    };

    const editDeleteAction = (value, item) => {
        if(value==='deleteWifi'){
          deleteWIFIAction(item);
        } else {
          editWIFIAction(item);
        }
    };

    const saveWiFilistAsyncStorage = async (wifiArray) => {

      if(wifiArray){
        await DataStorageLocal.saveDataToAsync(Constant.CONFIGURED_WIFI_LIST,JSON.stringify(wifiArray));
      }    

    };

    const rightBtnActions = async () => {
      await SensorHandler.getInstance().dissconnectHPN1Sensor();
      navigation.navigate('FindSensorComponent',{fromScreen:'configured'});
    }

    const mailToHPN = () => {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_sensor_HPN1_WiFi, "User clicked on Mail to contact Support team", '');
      Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='");
    };

    return (

        <WifiListHPN1UI
            isPopUp={isPopUp}
            popupMsg={popupMsg}
            popupAlert = {popupAlert}
            popupLeftBtnEnable = {popupLeftBtnEnable}
            popupRightBtnTitle = {popupRightBtnTitle}
            popupLeftBtnTitle = {popupLeftBtnTitle}
            isLoading={isLoading}
            loaderText = {loaderText}
            congiguredWIFIArray={congiguredWIFIArray}
            btnTitle = {btnTitle}
            addBtnEnable = {addBtnEnable}
            isLeftBtnEnable = {isLeftBtnEnable}
            navigateToPrevious={navigateToPrevious}
            nextButtonAction={nextButtonAction}
            popOkBtnAction={popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
            editDeleteAction={editDeleteAction}
            rightBtnActions = {rightBtnActions}
        />
        
    );

}

export default WifiListHPN1Component;