import React, {useState,useEffect, useRef} from 'react';
import {View,BackHandler} from 'react-native';
import WriteDetailsToSensorUI from './writeDetailsToSensorUI';
import SensorHandler from '../sensorHandler/sensorHandler';
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import { stringToBytes, bytesToString } from "convert-string";
import * as Constant from "./../../../utils/constants/constant";
import BuildEnv from "./../../../config/environment/environmentConfig";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import * as Queries from "./../../../config/apollo/queries";
import  useInterval from './../../../utils/intervalTimer/interval.hook';
import * as ApolloClient from "./../../../config/apollo/apolloConfig";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inSensorWritDetailscreen;
const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

var Buffer = require("buffer/").Buffer;
const Environment = JSON.parse(BuildEnv.Environment());

let timerId = null;

const SensorMode = {
    GET_WIFI_LIST: "getWifiList",
    WRITE_WIFI_SERVICE: "writeWifiService",
    WRITE_WIFI_NAME: "writeWifiName",
    WRITE_WIFI_PASSWORD: "writeWifiPassword",
    WRITE_SECURITY: "writeWifiSecurity",
    FORCE_SYNC: "forceSync",
    EVENT_LOG: "eventlog",
    IDEAL_STATE: "idealState",
};

const WriteDetailsToSensorComponent = ({navigation, route, ...props }) => {

    const [sensorStatusRequest,{ loading: sensorStatusLoading, error: sensorStatusError, data: sensorStatusData },] = useMutation(Queries.GET_SENSOR_STATUS_UPDATE);
    const [getPetDetails,{loading: getPatientInfoLoading,error: getPatientInfoError,data: getPatientInfoData,},] = useLazyQuery(Queries.GET_DEVICE_INFO,);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [loaderMsg, set_loaderMsg] = useState('Please Wait..');
    const [isLoading, set_isLoading] = useState(true);
    const [defaultpet, set_defaultPet] = useState(undefined);
    const [wifiName, set_wifiName] = useState(undefined);
    const [wifiPsd, set_wifiPsd] = useState(undefined);
    const [setupSuccess, set_setupSuccess] = useState(undefined);
    const [retryCount, set_retryCount] = useState(0);
    const [delay, setDelay] = useState(null);
    const [sensorType, set_sensorType] = useState(undefined);
    const [hpn1ConfigWIFICount, set_hpn1ConfigWIFICount] = useState(9);
    const [isSensorAwaiting, set_isSensorAwaiting] = useState(false);
    const [date, set_Date] = useState(new Date());

    const maxRetryChances = 5;
    let sensorModeVal = useRef();
    let wifiSSID = useRef();
    let wifiSSIDPsd = useRef();
    let defaultPetSensor = useRef();
    var isFromScreen = useRef('');
    var devNumber = useRef('');
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);

    useEffect(() => {
       
      getSensorType();
      getDefaultPet();
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_sensor_write_details);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_write_details, "User in Sensor configuration Screen", '');
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

  }, []);

    useEffect(() => {

        if(route.params?.wifiName && route.params?.wifiPsd){
            set_wifiName(route.params?.wifiName);
            set_wifiPsd(route.params?.wifiPsd);
            wifiSSID.current = route.params?.wifiName;
            wifiSSIDPsd.current = route.params?.wifiPsd;
        }

        if(route.params?.isFromScreen){
          isFromScreen.current = route.params?.isFromScreen;
        }

        if(route.params?.devNumber){
          devNumber.current = route.params?.devNumber;
        }

    }, [route.params?.wifiName,route.params?.wifiPsd,route.params?.isFromScreen, route.params?.devNumber]);

    useEffect(() => { 

          if(sensorStatusData){
            set_isSensorAwaiting(false);
            if(sensorStatusData.sensorUpdate.success){
              firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_api_success, firebaseHelper.screen_sensor_write_details, "Confirming Configuration status to Backend Success", 'Device Number : '+devNumber.current);
                getTotalPets();
            } else {
                createPopups("Unable to Save the Wi-Fi details. Please try again.",'Alert',true);
                isLoadingdRef.current = 0;
                firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_api_fail, firebaseHelper.screen_sensor_write_details, "Confirming Configuration status to Backend Failed", 'Device Number : '+devNumber.current);
                set_setupSuccess('failed');
                set_loaderMsg('YOUR SENSOR SETUP IS UNSUCCESSFUL');
            }           
            
          }
    
          if(sensorStatusError) {
            createPopups("Unable to Save the Wi-Fi details. Please try again.",'Alert',true);
            set_isSensorAwaiting(false);
            clearTimeout(timerId);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_api_fail, firebaseHelper.screen_sensor_write_details, "Confirming Configuration status to Backend Failes : "+sensorStatusError, 'Device Number : '+devNumber.current);
          }
    
    }, [sensorStatusData, sensorStatusError, sensorStatusLoading]);

    useEffect(() => {

        if (getPatientInfoData && getPatientInfoData.SensorInfo.result) {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_getPets_api_success, firebaseHelper.screen_sensor_write_details, "Getting Pets from API Success", '');
            setDefaultPetAfterSetup(getPatientInfoData.SensorInfo.result, defaultPetSensor.current.petID);
            set_setupSuccess('success');
            set_loaderMsg('YOUR SENSOR SETUP IS SUCCESSFUL');        
        }
  
        if(getPatientInfoError){
          firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_getPets_api_fail, firebaseHelper.screen_sensor_write_details, "Getting Pets from API Failed", 'error : '+getPatientInfoError);
        }
  
    }, [getPatientInfoLoading, getPatientInfoError, getPatientInfoData]);

    useInterval(() => {
        setDelay(null);
        updateSensorRequest();
    }, delay);
  
    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inSensorWritDetailscreen = await perf().startTrace('t_inSensorWriteDetailsScreen');
    };

    const initialSessionStop = async () => {
      await trace_inSensorWritDetailscreen.stop();
    };

    const getDefaultPet = async () => {

        let defPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        let savedConfiguredWIFIArray = await DataStorageLocal.getDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
        savedConfiguredWIFIArray = JSON.parse(savedConfiguredWIFIArray);
        set_defaultPet(JSON.parse(defPet));
        defaultPetSensor.current = JSON.parse(defPet);

    };

    const getSensorType = async () => {
      let sensorType1 = await DataStorageLocal.getDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
      if(sensorType1){
        set_sensorType(sensorType1);

        if(sensorType1 === 'HPN1Sensor'){
          addNewHPN1SSID(wifiSSID.current,wifiSSIDPsd.current);
        } else {
          configureSensor(wifiSSID.current,wifiSSIDPsd.current);
        }
      }
    };

    const configureSensor = (wName,wPsd) => {

        set_retryCount(0);
        sensorModeVal.current = SensorMode.WRITE_WIFI_SERVICE;
        set_loaderMsg(Constant.SENSOR_LOADER_MSG);
        updateSensorRequest();

    };

    ////// Step by step modes writing to sensor //////
    const updateSensorMode = () => {
        let nextMode = sensorModeVal.current;
        switch (sensorModeVal.current) {
        case SensorMode.GET_WIFI_LIST:
            nextMode = SensorMode.WRITE_WIFI_SERVICE;
            break;
        case SensorMode.WRITE_WIFI_SERVICE:
            nextMode = SensorMode.WRITE_WIFI_NAME;
            break;
        case SensorMode.WRITE_WIFI_NAME:
            nextMode = SensorMode.WRITE_WIFI_PASSWORD;
            break;
        case SensorMode.WRITE_WIFI_PASSWORD:
            nextMode = SensorMode.WRITE_SECURITY;
            break;
        case SensorMode.WRITE_SECURITY:
            nextMode = SensorMode.FORCE_SYNC;
            break;
        case SensorMode.FORCE_SYNC:
            nextMode = SensorMode.EVENT_LOG;
            break;
        case SensorMode.EVENT_LOG:
            nextMode = SensorMode.IDEAL_STATE;
            break;
        default:
        }

        // set_sensorMode(nextMode);
        sensorModeVal.current = nextMode;
        updateSensorRequest();

    };

    const updateLoaderMsg = (mode) => {
        set_setupSuccess('pending');
        if(mode==='writeWifiService'){
          set_loaderMsg('Initiating the configuration process ');
        }else if(mode==='writeWifiName'){
          set_loaderMsg('Writing Wi-Fi SSID to the sensor');
        }else if(mode==='writeWifiPassword'){
          set_loaderMsg('Writing Wi-Fi password to the sensor');
        }else if(mode==='writeWifiSecurity' || mode==='forceSync'){
          set_loaderMsg('Finishing setup');
        }else if(mode==='eventlog'){
          set_loaderMsg('Awaiting configuration confirmation from the sensor');
          dataSyncMsgChange();
        }       
    };

    const updateSensorRequest = async () => {

      updateLoaderMsg(sensorModeVal.current);
        await SensorHandler.getInstance().stopScanProcess(true);

        switch (sensorModeVal.current) {

          case SensorMode.WRITE_WIFI_SERVICE:

            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Writing device URL to Sensor : "+Environment.deviceConnectUrl, 'Device Number : '+devNumber.current);           
            const url = stringToBytes(Environment.deviceConnectUrl);
            requestWriteSensorHandler(bleUUID.WIFI_SERVICE,bleUUID.AGL_SVRNAME_CHAR,url);
            break;

          case SensorMode.WRITE_WIFI_NAME:

            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Writing SSID to Sensor : "+ssid, 'Device Number : '+devNumber.current);           
            const ssid = stringToBytes(wifiSSID.current);
            requestWriteSensorHandler(bleUUID.WIFI_SERVICE,bleUUID.WIFI_SSID_CHAR,ssid);    
            break;

          case SensorMode.WRITE_WIFI_PASSWORD:
            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Writing Password to Sensor", 'Device Number : '+devNumber.current);           
            const psdVal = stringToBytes(wifiSSIDPsd.current);
            requestWriteSensorHandler(bleUUID.WIFI_SERVICE,bleUUID.WIFI_PSD_CHAR,psdVal);
            break;

          case SensorMode.WRITE_SECURITY:

            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Writing Security Wap to Sensor : 1", 'Device Number : '+devNumber.current);           
            const wep = [1];//this.state.isEncrypt ? [1] : [2];
            requestWriteSensorHandler(bleUUID.WIFI_SERVICE,bleUUID.WIFI_SECT_CHAR,wep);
            break;

          case SensorMode.FORCE_SYNC:

            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Initiating Force sync Command : 1", 'Device Number : '+devNumber.current);           
            const writeVal = [1];
            requestWriteSensorHandler(bleUUID.COMM_SERVICE,bleUUID.COMMAND_CHAR,writeVal);
            break;

          case SensorMode.EVENT_LOG:
            firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence, firebaseHelper.screen_sensor_write_details, "Reading log status from the sensor", 'Device Number : '+devNumber.current);           
            requestReadSensorHandler(bleUUID.EVENT_SERVICE,bleUUID.EVENT_SEVERLOG_CHAR);
            break;
          default:
        }
    };

    ////// Request sensor, when failed to connect max 3 attempts /////
    const requestWriteSensorHandler = (serviceId, characterId, writeVal) => {

        SensorHandler.getInstance().writeDataToSensor(serviceId,characterId,writeVal,
        ({ data, error }) => {

            if (data) {               
                set_retryCount(0);
                updateSensorMode();
            } else if (error) {
                firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_write_sequence_fail, firebaseHelper.screen_sensor_write_details, "Writing deteils to Sensor failed", 'Device Number : '+devNumber.current);           
                createPopups(Constant.SENSOR_RETRY_MESSAGE,Constant.ALERT_DEFAULT_TITLE,true);

            }
        });

    };

    //// Reads data from sensor after writing writeVal /////////
    const requestReadSensorHandler = (serviceId, characterId) => {

        SensorHandler.getInstance().readDataFromSensor(serviceId,characterId,({ data, dissconnectError, error }) => {

            if (data) {

                set_isLoading(false);  
                set_retryCount(0);
                sensorModeVal.current = SensorMode.IDEAL_STATE;
                const buffer = Buffer.from(data.sensorData);
                const eventLogType = buffer.readUInt8(0, true);
                firebaseHelper.logEvent(firebaseHelper.event_sensor_aglCmas_eventLog, firebaseHelper.screen_sensor_write_details, "Event Log : "+eventLogType, 'Device Number : '+devNumber.current);           
            if (eventLogType == 0) {
                clearTimeout(timerId);
                saveSensorStausToBackend();
            } else {
                set_isSensorAwaiting(false);
                isLoadingdRef.current = 0;
                clearTimeout(timerId);
                if (eventLogType == 2) {

                    createPopups(Constant.SENSOR_FAIL_2,Constant.ALERT_DEFAULT_TITLE,true);

                } else if (eventLogType == 3) {

                    createPopups(Constant.SENSOR_FAIL_3,Constant.ALERT_DEFAULT_TITLE,true);

                } else if (eventLogType == 4) {

                    createPopups(Constant.SENSOR_FAIL_4,Constant.ALERT_DEFAULT_TITLE,true);

                } else {

                    saveSensorStausToBackend();

                }
              }
            } else if (error) {
                if (retryCount < maxRetryChances) {
                    set_retryCount(retryCount + 1);
                    updateSensorRequest();
                } else {
                    set_isLoading(false);
                    isLoadingdRef.current = 0;
                    createPopups(Constant.SENSOR_RETRY_MESSAGE,Constant.ALERT_DEFAULT_TITLE,true);
                }

            } else if (dissconnectError){

                if(retryCount < maxRetryChances){
                    set_retryCount(retryCount  + 1);
                    setDelay(5000);
                } 
                
              }
          }
        );
    };

    const nextButtonAction = (value) => {
        
        if(value==='TRY AGAIN'){
            firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_try_action, firebaseHelper.screen_sensor_write_details, "User clicked on Try Again button to Write details to sensor", '');           
            set_isLoading(true);
            isLoadingdRef.current = 1;
            configureSensor(wifiSSID.current,wifiSSIDPsd.current);
        } else {
          updateDashboardData();                    
        }
    };

    const updateDashboardData = async () => {
      
      ApolloClient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
      let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      SensorHandler.getInstance().dissconnectSensor();  
      if(defaultPetSensor.current.devices[parseInt(sensorIndex)].isDeviceSetupDone){   
        firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_navi, firebaseHelper.screen_sensor_write_details, "User clicked on Next button to navigate to DashBoardService Page", 'Configuration Status : Reconfigured the sensor');           
        navigation.navigate('DashBoardService');
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_navi, firebaseHelper.screen_sensor_write_details, "User clicked on Next button to navigate to Pushnotification Instructions Page", 'Configuration Status : configured the sensor for first time');           
        navigation.navigate('SensorInitialPNQComponent');
      }  

    };

    const backBtnAction = async () => {

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_write_details, "User clicked on back button to navigate to SensorWiFiListComponent Page", '');
        await SensorHandler.getInstance().stopScanProcess(false);
        if(isFromScreen.current === 'manual'){
          navigation.navigate('ManualNetworkComponent');
        } else {
          navigation.navigate('SensorWiFiListComponent');
        }
        
      }
        
    };

    ///// HPN1 Sensor COde //////

    const addNewHPN1SSID = async (wName,wPsd) => {
  
        set_retryCount(0);
        sensorModeVal.current = SensorMode.WRITE_WIFI_SERVICE;
        set_loaderMsg(Constant.SENSOR_LOADER_MSG);
        updateHPNSensorRequest();

    };

    ///////////***********************Start of Adding WIFI details to HPN1 Sensor***********************************///////////////////
    const updateHPNSensorRequest = async () => {
      ////////////// Writing 0 command before writing WIFI name to HPN1 Sensor //////////////////
      firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_initiate_command_write_details, firebaseHelper.screen_sensor_write_details, "Writing 0 command to initiate the sensor to accept the SSID and password", 'Device Number : '+devNumber.current);
      await SensorHandler.getInstance().stopScanProcess(true);
      let command = [0];
      SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_LIST_INDEX,command,writeWIFIListIndexToHPN1Sensor);
    };

    const writeWIFIListIndexToHPN1Sensor = ({ data, error }) => {
      
      ////////////////// Writing WIFI name to HPN1 Sensor //////////////////
      if (data) { 
        set_loaderMsg('Writing Wi-Fi SSID to the sensor');

        let ssid1 = undefined;
        let ssid2 = undefined;

        if(wifiSSID.current.length > 20){

          if(wifiSSID.current.length > 20 && wifiSSID.current.length <= 40){
            firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_SSID_write, firebaseHelper.screen_sensor_write_details, "Writing SSID(first 20 characters) to the HPN1 Sensor and SSiD is : "+ wifiSSID.current, 'Device Number : '+devNumber.current);
            ssid1 = wifiSSID.current.slice(0, 20);
            ssid2 = wifiSSID.current.slice(20, wifiSSID.current.length);
            ssid1 = stringToBytes(ssid1);
            SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE, bleUUID.HPN1_WIFI_SSID1, ssid1, writeWIFISSIDTWOToHPN1Sensor);
          }
          
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_SSID_write, firebaseHelper.screen_sensor_write_details, "Writing SSID to the HPN1 Sensor and SSiD length is : "+ wifiSSID.current, 'Device Number : '+devNumber.current);
          let ssid = stringToBytes(wifiSSID.current);
          SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE, bleUUID.HPN1_WIFI_SSID1, ssid, writeWIFISSIDToHPN1Sensor);
        }

        
      } else {
        //error writing value o
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_initiate_command_write_details, firebaseHelper.screen_sensor_write_details, "Writing 0 command to initiate the sensor to accept the SSID and password failed", 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFISSIDTWOToHPN1Sensor = ({ data, error }) => {
      
      ////////////////// Writing WIFI name to HPN1 Sensor //////////////////
      if (data) { 
          set_loaderMsg('Writing Wi-Fi SSID to the sensor');
          let ssidTwo = wifiSSID.current.slice(20, wifiSSID.current.length);
          firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_SSID_write, firebaseHelper.screen_sensor_write_details, "Writing SSID(remaining characters) to the HPN1 Sensor and SSID length is : "+ wifiSSID.current, 'Device Number : '+devNumber.current);
          let ssid = stringToBytes(ssidTwo);
          SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE, bleUUID.HPN1_WIFI_SSID2, ssid, writeWIFISSIDToHPN1Sensor);
      } else {
        //error writing value o
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_SSID_write_fail, firebaseHelper.screen_sensor_write_details, "Writing SSID(first 20 characters) to the HPN1 Sensor Failed and SSiD length is : "+wifiSSID.current.length, 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFISSIDToHPN1Sensor = ({ data, error }) => {

      if (data) {
        ////////////////// Writing WIFI Password to HPN1 Sensor //////////////////
        //ssid success writing password
        set_loaderMsg('Writing Wi-Fi password to the sensor');

        let psd1 = undefined;
        let psd2 = undefined;
        if(wifiSSIDPsd.current.length > 20){

          if(wifiSSIDPsd.current.length > 20 && wifiSSIDPsd.current.length <= 40){
            psd1 = wifiSSIDPsd.current.slice(0, 20);
            psd2 = wifiSSIDPsd.current.slice(20, wifiSSIDPsd.current.length);
            psd1 = stringToBytes(psd1);
            firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_pswd_write, firebaseHelper.screen_sensor_write_details, "Writing Password(First 20 characters) to the HPN1 Sensor and Password length is : "+psd1.length, 'Device Number : '+devNumber.current);
            SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_PASSCODE1,psd1,writeWIFIPasswordTwoToHPN1Sensor);
          }
          
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_pswd_write, firebaseHelper.screen_sensor_write_details, "Writing Password to the HPN1 Sensor and Password length is : "+wifiSSIDPsd.current.length, 'Device Number : '+devNumber.current);
          psd1 = stringToBytes(wifiSSIDPsd.current);
          SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_PASSCODE1,psd1,writeWIFIPasswordToHPN1Sensor);
        }
        
      } else {
        ////////////Add popup when failed to write WIFI Name //////////////
        //failed to write SSID
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_SSID_write_fail, firebaseHelper.screen_sensor_write_details, "Writing SSID to the HPN1 Sensor Failed and SSiD is : "+wifiSSID.current, 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFIPasswordTwoToHPN1Sensor = ({ data, error }) => {

      if (data) {
        ////////////////// Writing WIFI Password to HPN1 Sensor //////////////////
        //ssid success writing password
        set_loaderMsg('Writing Wi-Fi password to the sensor');

        let psd2 = undefined;
        if(wifiSSIDPsd.current.length > 20){

          if(wifiSSIDPsd.current.length > 20 && wifiSSIDPsd.current.length <= 40){
            psd2 = wifiSSIDPsd.current.slice(20, wifiSSIDPsd.current.length);
            firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_pswd_write, firebaseHelper.screen_sensor_write_details, "Writing remaining Password to the HPN1 Sensor and Password length is : "+wifiSSIDPsd.current.length, 'Device Number : '+devNumber.current);
            psd2 = stringToBytes(psd2);
            SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_PASSCODE2,psd2,writeWIFIPasswordToHPN1Sensor);
          }
          
        }
        
      } else {
        ////////////Add popup when failed to write WIFI Name //////////////
        //failed to write SSID
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_pswd_write_fail, firebaseHelper.screen_sensor_write_details, "Writing Password(First 20 characters) to the HPN1 Sensor Failed : "+error, 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFIPasswordToHPN1Sensor = ({ data, error }) => {

      if (data) {
        ////////////////// Writing WIFI Security Type to HPN1 Sensor //////////////////
        set_loaderMsg('Finishing setup');
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_security_write, firebaseHelper.screen_sensor_write_details, "Writing Security Wap to the HPN1 Sensor", 'Device Number : '+devNumber.current);
        let sType = [1]; //this.state.isEncrypt ? [1] : [0];
        SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_SECURITY,sType,writeWIFISecurityToHPN1Sensor);
      } else {
        ////////////Add popup when failed to write Password //////////////
        //error writing password
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_pswd_write_fail, firebaseHelper.screen_sensor_write_details, "Writing Password(First 20 characters) to the HPN1 Sensor Failed : "+error, 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFISecurityToHPN1Sensor = ({ data, error }) => {

      if (data) {
        ////////////////// Writing Command 1 to confirm the SSID name , password and Security to HPN1 Sensor //////////////////
        //security type success writing 1 to save all values print all values here
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_write_details_confirm, firebaseHelper.screen_sensor_write_details, "Writing Command 1 to confirm SSID, password and security", 'Device Number : '+devNumber.current);
        let command = [1];
        SensorHandler.getInstance().writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_ENTRY_STORE,command,writeWIFIConformationToHPN1Sensor);

      } else {
        ////////////Add popup when failed to write Security //////////////
        //error writing security type
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_security_write_fail, firebaseHelper.screen_sensor_write_details, "Writing Security Wap to the HPN1 Sensor failed : "+error, 'Device Number : '+devNumber.current);
        isLoadingdRef.current = 0;
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const writeWIFIConformationToHPN1Sensor = ({ data, error }) => {
      // all values are to be printed here
      //////// Checking the values after confirmation /////////////
      if (data) {
        //show setup success/////////////////////eeeeeeeeeesssssss/////////////
        set_loaderMsg('Awaiting configuration confirmation from the sensor');
        dataSyncMsgChange();
        saveHPN1SSIDCount();
        saveSensorStausToBackend();
      } else {
        ////////////Add popup when failed to write Confirmation command //////////////
        set_isSensorAwaiting(false);
        isLoadingdRef.current = 0;
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_write_details_confirm_fail, firebaseHelper.screen_sensor_write_details, "Writing Command 1 to confirm SSID, password and security failed : "+error, 'Device Number : '+devNumber.current);
        createPopups("Unable to Save the Wi-Fi details. Please ensure the sensor is charging and try again.",'Alert',true);
      }
    };

    const dataSyncMsgChange = () => {

      timerId = setTimeout( () => {
        set_isSensorAwaiting(true);
      },60000);

    };

    const popOkBtnAction = () => {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage(undefined);
        set_popUpTitle(undefined); 
        backBtnAction();
        
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage(undefined);
        set_popUpTitle(undefined);  
    };

    const saveSensorStausToBackend = async () => {

      await SensorHandler.getInstance().stopScanProcess(false);
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);

        firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_api, firebaseHelper.screen_sensor_write_details, "Initiating Api to confirm Configuration status to backend", 'Device Number : '+devNumber.current);
        let json = {
            ClientID: clientId.toString(),
            PatientID: defaultPetSensor.current.petID.toString(),
            SetupStatus: "Setup Success",
            "DeviceNumber":defaultPetSensor.current.devices[parseInt(sensorIndex)].deviceNumber.toString(),
            SSIDList: wifiSSID.current,
          };

        await sensorStatusRequest({ variables: { input: json } });
    };

    const getTotalPets = async () => {

        let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        set_isLoading(true);
        isLoadingdRef.current = 1;
        firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_getPets_api, firebaseHelper.screen_sensor_write_details, "Initiating Api to get Pets info after Configuraation", 'Client Id : '+clientID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch(EnvironmentJava.uri + "getPetDevicesByPetParent/" + clientID,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
          set_isLoading(false);
            // isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }
            if(data && data.status.success){
              if(data.response){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_getPets_api_success, firebaseHelper.screen_sensor_write_details, "Getting Pets from API Success", '');            
                setDefaultPetAfterSetup(data.response.petDevices, defaultPetSensor.current.petID);
                set_setupSuccess('success');
                set_isSensorAwaiting(false);
                clearTimeout(timerId);
                set_loaderMsg('YOUR SENSOR SETUP IS SUCCESSFUL');  
              }             
            }
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_write_details_getPets_api_success, firebaseHelper.screen_sensor_write_details, "Getting Pets from API fail", 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isSensorAwaiting(false);
            clearTimeout(timerId);
          });
      };

    const setDefaultPetAfterSetup = async (pets,petId) => {
        let obj = findArrayElementByPetId(pets, petId);
        await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT,JSON.stringify(obj)); 
    }
  
    function findArrayElementByPetId(pets, petId) {
        return pets.find((element) => {
          return element.petID === petId;
        })
    };

    const leftButtonAction = async () => {

        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_write_details, "User clicked on Configure another SSID button and navigated to SensorWiFiListComponent Page", '');
        await SensorHandler.getInstance().stopScanProcess(false);
        // if(isFromScreen.current === 'manual'){
        //   navigation.navigate('ManualNetworkComponent');
        // } else {
          navigation.navigate('SensorWiFiListComponent');
        // }
    };

    const createPopups = (msg,title,isPop) => {
      set_popUpMessage(msg);
      set_popUpTitle(title);
      set_isPopUp(isPop)
      if(isPop){
        popIdRef.current = 1;
      } else {
        popIdRef.current = 0;
      }
    };

    const saveHPN1SSIDCount = async () => {

      let count = await DataStorageLocal.getDataFromAsync(Constant.CONFIGURED_WIFI_SSID_COUNT,);
      count = parseInt(count) + 1;
      await DataStorageLocal.saveDataToAsync(Constant.CONFIGURED_WIFI_SSID_COUNT,''+count);
      set_hpn1ConfigWIFICount(count);

    };

return (

       <WriteDetailsToSensorUI
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            isPopUp = {isPopUp}
            defaultpet = {defaultpet}
            setupSuccess = {setupSuccess}
            sensorType = {sensorType}
            hpn1ConfigWIFICount = {hpn1ConfigWIFICount}
            isSensorAwaiting = {isSensorAwaiting}
            backBtnAction = {backBtnAction}
            popOkBtnAction = {popOkBtnAction}
            nextButtonAction = {nextButtonAction}
            leftButtonAction = {leftButtonAction}
       />
    );
};

export default WriteDetailsToSensorComponent;