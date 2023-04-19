import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import SensorWiFiListUI from './sensorWiFiListUI';
import { useNavigation } from "@react-navigation/native";
import SensorHandler from '../sensorHandler/sensorHandler';
import useInterval from './../../../utils/intervalTimer/interval.hook';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorsWIFIListcreen;
const HPN1_WIFI_MAX_LIMIT = 1;
const WIFI_FAIL_FETCH = 2;
const HPN1_DUPLICATE_WIFI = 3;
const WIFI_SSID_LENGTH = 4;

const SensorWiFiListComponent = ({ route, ...props }) => {

  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popuLeftBtnEnable, set_popuLeftBtnEnable] = useState(false);
  const [leftpopupBtnTitle, set_leftpopupBtnTitle] = useState(undefined);
  const [rightpopupBtnTitle, set_rightpopupBtnTitle] = useState(undefined);
  const [popupId, set_popupId] = useState(0);
  const [date, set_Date] = useState(new Date());
  const [defaultPetObj, set_defaultPetObj] = useState(undefined);
  const [loaderText, set_loaderText] = useState('');
  const [isLoading, set_isLoading] = useState(false);
  const [wifiList, set_wifiList] = useState([{ 'wifiName': 'Add Network Manually', 'status': '' }]);
  const [retryCount, set_retryCount] = useState(0);
  const [btnName, set_btnName] = useState('');

  const [fetchedList, set_fetchedList] = useState(0);
  const [totalList, set_totalList] = useState(0);

  const [wifiName, set_wifiName] = useState(undefined);
  const [wifiPsd, set_wifiPsd] = useState(undefined);
  const [delay, setDelay] = useState(null);

  const maxRetryChances = 3;
  let nearByWiFiCount = useRef(0);
  var peripharal = useRef();
  var devNumber = useRef();
  var sensorType = useRef();
  var isFromScreen = useRef('');
  var totalCount = useRef('');
  var tempWifiList = useRef([]);
  var actionName = useRef([]);
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  const navigation = useNavigation();

  useEffect(() => {

    getSensorType();
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_sensor_nearby_wifi);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_nearby_wifi, "User in Sensor Nearby WiFI scan Screen", ''); 
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

    if (route.params?.defaultPetObj) {
      set_defaultPetObj(route.params?.defaultPetObj);
    }
    if (route.params?.isFromScreen) {
      isFromScreen.current = route.params?.isFromScreen;
    }
    if (route.params?.periId) {
      peripharal.current = route.params?.periId;
    };

    if (route.params?.devNumber) {
      devNumber.current = route.params?.devNumber;
    };

  }, [route.params?.periId, route.params?.defaultPetObj, route.params?.isFromScreen,route.params?.devNumber]);

  const initialSessionStart = async () => {
    trace_inSensorsWIFIListcreen = await perf().startTrace('t_inSensorWIFIListScreen');
  };

  const initialSessionStop = async () => {
      await trace_inSensorsWIFIListcreen.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const getSensorType = async () => {
    let sensorType1 = await DataStorageLocal.getDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
    if (sensorType1) {
      firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_sensor_nearby_wifi, "Getting Device details : "+devNumber.current, 'Sensor Type : '+sensorType1);
      sensorType.current = sensorType1;
      connectSensor(peripharal.current);
    }
  };

  useInterval(() => {
    setDelay(null);
    connectSensor(peripharal.current);
  }, delay);

  const connectSensor = async (pId) => {
    set_isLoading(true);
    isLoadingdRef.current = 1;
    set_loaderText('Please wait while we initiate the process');
    firebaseHelper.logEvent(firebaseHelper.event_sensor_connection, firebaseHelper.screen_sensor_nearby_wifi, "Device details : "+devNumber.current, 'Sensor Type : '+sensorType.current);
    firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_nearby_wifi, "Connection with Sensor - No of Attemts : "+retryCount+1, 'Device Number : '+devNumber.current);
    SensorHandler.getInstance();
    await SensorHandler.getInstance().stopScanProcess(false);
    SensorHandler.getInstance().connectToSensor(pId, connectSensorCallback);
  };

  const connectSensorCallback = ({ data, dissconnectError, error }) => {

    if (data) {
      set_retryCount(0);
      getWifiDetails();
    } else if (error || dissconnectError) {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_nearby_wifi, "Connection with Sensor Fail : "+error, 'error : '+dissconnectError);
      if (retryCount < maxRetryChances) {
        set_retryCount(retryCount + 1);
        setDelay(5000);
      } else {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_btnName('REFRESH NETWORK...');
        createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
      }
    }

  };

  const getWifiDetails = async () => {

    let sensorType1 = await DataStorageLocal.getDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
    if (sensorType1 && sensorType1 === 'HPN1Sensor') {
      sensorType.current = sensorType1;
      set_isLoading(true);
      isLoadingdRef.current = 1;
      firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_config_no_wifi, firebaseHelper.screen_sensor_nearby_wifi, "Initiating process to fetch the No of configured wifi SSIDs from the sensor : "+devNumber.current, 'Sensor Type : '+sensorType.current);
      SensorHandler.getInstance().readDataFromSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE, bleUUID.HPN1_WIFI_SYSTEM_STATUS, readWIFISystemStatusFromHPN1Sensor);
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_wifi_command, firebaseHelper.screen_sensor_nearby_wifi, "Initiating Command to fetch Nearby WiFi details : "+devNumber.current, 'Sensor Type : '+sensorType.current);
      set_isLoading(true);
      set_loaderText('Please wait while we get nearby Wi-Fi list');
      let writeVal = [5];
      SensorHandler.getInstance().readWifiCount(writeVal, handleWifiListCallback);
    }

  };

  const readWIFISystemStatusFromHPN1Sensor = ({ data, error }) => {

    if (data) {

      if (data.sensorData) {

        saveHPN1SSIDCount(data.sensorData[2]);
        if(data.sensorData[2] >= 8){

          set_isLoading(false);
          isLoadingdRef.current = 0;
          firebaseHelper.logEvent(firebaseHelper.event_sensor_hpn1_wifi_max_limit, firebaseHelper.screen_sensor_nearby_wifi, "Configured SSID count : "+data.sensorData && data.sensorData[2], 'Device Number : '+devNumber.current);
          createPopup(true,'No','You have reached the maximum number of Wi-Fi configurations permitted. Would you like to delete existing SSIDs ?','Alert',"YES",true,HPN1_WIFI_MAX_LIMIT);

        } else {
          //////Reads Wifilistcount from sensor ////////
          firebaseHelper.logEvent(firebaseHelper.event_sensor_wifi_command, firebaseHelper.screen_sensor_nearby_wifi, "Initiating Command to fetch Nearby WiFi details : "+devNumber.current, 'Sensor Type : '+sensorType.current);
          set_loaderText('Please wait while we get nearby Wi-Fi list');
          let command = [1, 60];
          SensorHandler.getInstance().readWifiCount(command, handleWifiListCallback);
        }        

      } else {
        //////Reads Wifilistcount from sensor ////////
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_readWIFISystemStatus_fail, firebaseHelper.screen_sensor_nearby_wifi, "Reading Total Configured WiFi SSID count from the Sensor failed : "+devNumber.current, 'Sensor Type : '+sensorType.current);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_btnName('REFRESH NETWORK...');
        createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH); 
      }

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_readWIFISystemStatus_fail, firebaseHelper.screen_sensor_nearby_wifi, "Reading Total Configured WiFi SSID count from the Sensor failed : "+devNumber.current, 'Sensor Type : '+sensorType.current);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_btnName('REFRESH NETWORK...');
      createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
    }
  };

  const handleWifiListCallback = ({ data, error }) => {

    if (data && data.wifiData) {

      if (data.status && data.status === 500) {
        let tempArray = [];
        if (sensorType.current === 'HPN1Sensor') {
          if (data.wifiDataCount && data.wifiDataCount > 1) {
            let obj = {};
            set_totalList(data.wifiDataCount - 1);
            totalCount.current = data.wifiDataCount-1;
            for (let i = 0; i < data.wifiDataCount; i++) {
              
              if (i === 0) {
                obj = { 'wifiName': '', 'status': 'fetching..' };
              } else {
                obj = { 'wifiName': '', 'status': 'awaiting..' };
              }
              tempArray.push(obj);
            }
            obj = { 'wifiName': 'Add Network Manually', 'status': '' };
            tempArray.push(obj);
            nearByWiFiCount.current = data.wifiDataCount - 1;

            set_wifiList(tempArray);
            firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_count, firebaseHelper.screen_sensor_nearby_wifi, "No of Nearby Wifi Count : "+nearByWiFiCount.current, 'Device Number : '+devNumber.current);
            set_loaderText('Total Nearby Wi-Fi SSIDs found: ' + nearByWiFiCount.current.toString());
            SensorHandler.getInstance().retrieceWifiListAfterCount(data.wifiData, readWiFiNames);

          } else {

            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_btnName('REFRESH NETWORK...');
            firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_count_fail, firebaseHelper.screen_sensor_nearby_wifi, "Unable to fetch nearby WiFi count", 'Device Number : '+devNumber.current);
            createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);

          }
          
        } else {

          if (data.wifiDataCount && data.wifiDataCount > 0) {

            set_totalList(data.wifiDataCount);
            totalCount.current = data.wifiDataCount;
            let obj = {};

            for (let i = 0; i < data.wifiDataCount; i++) {
              obj = { 'wifiName': '', 'status':  i == 0 ? 'fetching..' :  'awaiting..'};
              tempArray.push(obj);
            }

            obj = { 'wifiName': 'Add Network Manually', 'status': '' };
            tempArray.push(obj);
            nearByWiFiCount.current = data.wifiDataCount;

            set_wifiList(tempArray);
            set_loaderText('Total Nearby Wi-Fi SSIDs found: ' + nearByWiFiCount.current.toString());
            firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_count, firebaseHelper.screen_sensor_nearby_wifi, "No of Nearby Wifi Count : "+nearByWiFiCount.current, 'Device Number : '+devNumber.current);
            SensorHandler.getInstance().retrieceWifiListAfterCount(data.wifiData, readWiFiNames);

          } else {

            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_btnName('REFRESH NETWORK...');
            firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_count_fail, firebaseHelper.screen_sensor_nearby_wifi, "Unable to fetch nearby WiFi count", 'Device Number : '+devNumber.current);
            createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);

          }

        }

      } 
    } else {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_btnName('REFRESH NETWORK...');
      firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_count_fail, firebaseHelper.screen_sensor_nearby_wifi, "Unable to fetch nearby WiFi count", 'Device Number : '+devNumber.current);
      createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
    }
  };

  const readWiFiNames = ({ data, error }) => {

    if (data && data.wifiList) {
      if (data.wifiList.length > 0) {
        set_btnName('STOP SCANNING');
      }

      if (nearByWiFiCount.current === data.wifiList.length) {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_btnName('REFRESH NETWORK...');
        firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_list_fetch_completed, firebaseHelper.screen_sensor_nearby_wifi, "Fetching Total WiFi list from the sensor completed : "+sensorType.current, 'Device Number : '+devNumber.current);
      }

      if (data.wifiList.length > 0) {

        if (nearByWiFiCount.current < 1) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_btnName('REFRESH NETWORK...');
          createPopup(false,'No',"No Wi-Fi list found. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
        } else {

          let tempArray = [];
          var obj = undefined;
          for (let i = 0; i < totalCount.current; i++) {

            if (i < data.wifiList.length) {
              if(data.wifiList[i] && data.wifiList[i]!=''){
                obj = { 'wifiName': data.wifiList[i], 'status': '' };
              }
               
            }else if (i == data.wifiList.length){
               obj = { 'wifiName': '', 'status': 'fetching...' };
            }else {
              obj = { 'wifiName': '', 'status': 'awaiting..' };
            }

            if(obj){
              tempArray.push(obj);
            }
            
          }

          obj = { 'wifiName': 'Add Network Manually', 'status': '' };
          tempArray.push(obj);
          tempWifiList.current = tempArray;
          set_wifiList(tempArray);
          set_fetchedList(data.wifiList.length);
          firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_list_count_final, firebaseHelper.screen_sensor_nearby_wifi, "Total WiFi list from the sensor : "+data.wifiList.length, 'Device Number : '+devNumber.current);
        }

      }

      if (sensorType.current === 'HPN1Sensor') {
        if (nearByWiFiCount.current + 1 === data.wifiList.length) {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_list_fetch_completed, firebaseHelper.screen_sensor_nearby_wifi, "Fetching Total WiFi list from the sensor completed : "+sensorType.current, 'Device Number : '+devNumber.current);
          set_btnName('REFRESH NETWORK...');

        }
      }

      if (data.wifiList.length < 1) {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_list_fetch_completed, firebaseHelper.screen_sensor_nearby_wifi, "Fetching Total WiFi list from the sensor completed and WiFi SSID count is : "+data.wifiList.length, 'Device Number : '+devNumber.current);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_btnName('REFRESH NETWORK...');
        let tempArray = [{ 'wifiName': 'Add Network Manually', 'status': '' }];
        set_wifiList(tempArray);
        createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
        
      }
    } else if (error) {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_nearby_wifi_list_fetch_fail, firebaseHelper.screen_sensor_nearby_wifi, "Fetching Total WiFi list from the sensor failed : "+devNumber.current, 'error : '+error);
        let tempArray = [];
        tempArray = tempWifiList.current.filter(item => item.wifiName != '');
        set_wifiList(tempArray);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_btnName('REFRESH NETWORK...');
        if(actionName.current!='STOP SCANNING') {
          createPopup(false,'No',"Unable to retrieve the surrounding Wi-Fi details. Please enter the Wi-Fi SSID and password manually.",'Alert',"OK",true,WIFI_FAIL_FETCH);
        }

    }

  }

  const submitAction = async () => {

    if (btnName === 'STOP SCANNING') {

      await SensorHandler.getInstance().dissconnectSensor();     
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_btnName('REFRESH NETWORK...');
      actionName.current = 'STOP SCANNING';

      let tempArray = [];
      tempArray = wifiList.filter(item => item.wifiName != '');
      set_wifiList(tempArray);
      firebaseHelper.logEvent(firebaseHelper.event_sensor_stop_scanning, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on Stop Scanning button : "+devNumber.current, 'WiFi SSID count : '+tempArray.length);

    } else {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_refresh_scanning, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on Refresh Scanning button", 'Device Number : '+devNumber.current);
      set_btnName(undefined);
      actionName.current = '';
      set_wifiList([]);
      set_fetchedList(0);
      set_totalList(parseInt(0));
      totalCount.current = 0;
      let tempArray = [{'wifiName': 'Add Network Manually', 'status': '' }];
      set_wifiList(tempArray);
      getWifiDetails();
    }

  };

  const navigateToPrevious = async () => {

    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      await SensorHandler.getInstance().dissconnectSensor();
      if (isFromScreen.current === 'configuredWifiScreen') {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on back button to navigate to WifiListHPN1Component", '');
        navigation.navigate("WifiListHPN1Component");
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on back button to navigate to FindSensorComponent", '');
        navigation.navigate("FindSensorComponent");
      }
    }

  };

  const popOkBtnAction = (value,) => {

    if (popupId === HPN1_WIFI_MAX_LIMIT) {
      firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_max_limit_btn, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on button to navigate to HPN1 Configured list page", 'Device Number : '+devNumber.current);
      navigation.navigate('WifiListHPN1Component');

    } else if (popupId === HPN1_DUPLICATE_WIFI) {

      if(sensorType.current === 'HPN1Sensor' && wifiName.length > 32){
        firebaseHelper.logEvent(firebaseHelper.event_sensor_HPN1_duplicate_SSID_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User selected already configured SSID to configure : "+wifiName, 'Device Number : '+devNumber.current);
        set_popuLeftBtnEnable(false);
        set_leftpopupBtnTitle('');
        set_popUpMessage("SSID length should not be more than 32 characters. Please select another SSID from the list.");
        set_popUpTitle('Alert');
        set_rightpopupBtnTitle("OK");
        set_popupId(WIFI_SSID_LENGTH);
        set_isPopUp(true);
        popIdRef.current = 1;
  
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_configure_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User entered the password and clicked on Submit to configure the Sensor : "+wifiName, 'Device Number : '+devNumber.current);
        navigation.navigate('WriteDetailsToSensorComponent', { wifiName: wifiName, wifiPsd: wifiPsd, defaultPetObj: defaultPetObj, isFromScreen: isFromScreen.current, devNumber:devNumber.current });

      }

    }
    set_popuLeftBtnEnable(false);
    set_leftpopupBtnTitle('');
    set_popUpMessage("");
    set_popUpTitle('');
    set_rightpopupBtnTitle("OK");
    set_isPopUp(false);
    popIdRef.current = 0;

  };

  const popupCancelBtnAction = (value,) => {

    if (popupId === HPN1_WIFI_MAX_LIMIT) {
      navigateToPrevious();
    }
    set_popuLeftBtnEnable(false);
    set_leftpopupBtnTitle('');
    set_popUpMessage("");
    set_popUpTitle('');
    set_rightpopupBtnTitle("OK");
    set_isPopUp(false);
    popIdRef.current = 0;

  };

  const updateSensorWIFIPSD = async (value, ssid) => {

    set_wifiName(ssid);
    set_wifiPsd(value);

  };

  const writeDetailsToSensor = async () => {
    
    let wifiNamee = wifiName;

    if(sensorType.current === 'HPN1Sensor'){
       wifiNamee = wifiNamee.replace(/\0.*$/g,'');     
    }

    if(sensorType.current === 'Sensor' && wifiNamee.length>20){
      firebaseHelper.logEvent(firebaseHelper.event_sensor_select_max_ssid_length, firebaseHelper.screen_sensor_nearby_wifi, "User selected the SSID more than 20 characters in Length from the list : "+wifiNamee, 'Device Number : '+devNumber.current);
      set_popuLeftBtnEnable(false);
      set_leftpopupBtnTitle('');
      set_popUpMessage("SSID length should not be more than 20 characters. Please select another SSID from the list.");
      set_popUpTitle('Alert');
      set_rightpopupBtnTitle("OK");
      set_popupId(WIFI_SSID_LENGTH);
      set_isPopUp(true);
      popIdRef.current = 1;

    }else if(sensorType.current === 'HPN1Sensor' && wifiNamee.length > 32){
      firebaseHelper.logEvent(firebaseHelper.event_sensor_select_max_ssid_length, firebaseHelper.screen_sensor_nearby_wifi, "User selected the SSID more than 32 characters in Length from the List : "+wifiNamee, 'Device Number : '+devNumber.current);
      set_popuLeftBtnEnable(false);
      set_leftpopupBtnTitle('');
      set_popUpMessage("SSID length should not be more than 32 characters. Please select another SSID from the list.");
      set_popUpTitle('Alert');
      set_rightpopupBtnTitle("OK");
      set_popupId(WIFI_SSID_LENGTH);
      set_isPopUp(true);
      popIdRef.current = 1;

    } else {

      if (wifiNamee && wifiNamee.length > 0 && wifiPsd && wifiPsd.length > 0) {

        if (sensorType.current === 'HPN1Sensor') {
  
          let savedConfiguredWIFIArray = await DataStorageLocal.getDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
          savedConfiguredWIFIArray = JSON.parse(savedConfiguredWIFIArray);
  
          if (savedConfiguredWIFIArray) {
  
            let exists = savedConfiguredWIFIArray.includes(wifiNamee);
            if (exists) {
  
              createPopup(true,'NO',"This Wi-Fi SSID seems to be configured already. Click YES to proceed to add it again, and click NO to try adding another Wi-Fi.",'Alert',"YES",true,HPN1_DUPLICATE_WIFI);
  
            } else {
              firebaseHelper.logEvent(firebaseHelper.event_sensor_configure_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User entered the password and clicked on Submit to configure the Sensor : "+wifiNamee, 'Device Number : '+devNumber.current);
              navigation.navigate('WriteDetailsToSensorComponent', { wifiName: wifiNamee, wifiPsd: wifiPsd, defaultPetObj: defaultPetObj, isFromScreen: isFromScreen.current, devNumber:devNumber.current });
            }
          } else {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_configure_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User entered the password and clicked on Submit to configure the Sensor : "+wifiNamee, 'Device Number : '+devNumber.current);
            navigation.navigate('WriteDetailsToSensorComponent', { wifiName: wifiNamee, wifiPsd: wifiPsd, defaultPetObj: defaultPetObj, isFromScreen: isFromScreen.current, devNumber:devNumber.current });
          }
  
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_sensor_configure_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User entered the password and clicked on Submit to configure the Sensor : "+wifiNamee, 'Device Number : '+devNumber.current);
          navigation.navigate('WriteDetailsToSensorComponent', { wifiName: wifiNamee, wifiPsd: wifiPsd, defaultPetObj: defaultPetObj, isFromScreen: isFromScreen.current, devNumber:devNumber.current });
        }
  
      }

    }

  };

  const createPopup = (isLeftBtn,lftBtnTitle,popMsg,popHMsg,rBtnTitle,isPopupValue,popId) => {
        set_popuLeftBtnEnable(isLeftBtn);
        set_leftpopupBtnTitle(lftBtnTitle);
        set_popUpMessage(popMsg);
        set_popUpTitle(popHMsg);
        set_rightpopupBtnTitle(rBtnTitle);
        set_isPopUp(isPopupValue);
        if(isPopupValue){
          popIdRef.current = 1;
        }else {
          popIdRef.current = 0;
        }
        set_popupId(popId);
  };

  const navigateToManualNetwork = () => {
    firebaseHelper.logEvent(firebaseHelper.event_sensor_add_manual_btn_action, firebaseHelper.screen_sensor_nearby_wifi, "User clicked on button to add SSID and Password manually", 'Device Number : '+devNumber.current);
    navigation.navigate('ManualNetworkComponent', { defaultPetObj: defaultPetObj, deviceType:sensorType.current })
  };

  const saveHPN1SSIDCount = async (count) => {
    await DataStorageLocal.saveDataToAsync(Constant.CONFIGURED_WIFI_SSID_COUNT,''+count);
  };

  return (
    <SensorWiFiListUI

      isLoading={isLoading}
      wifiList={wifiList}
      loaderText={loaderText}
      btnName={btnName}
      defaultPetObj={defaultPetObj}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      popuLeftBtnEnable={popuLeftBtnEnable}
      leftpopupBtnTitle={leftpopupBtnTitle}
      rightpopupBtnTitle={rightpopupBtnTitle}
      totalList={totalList}
      fetchedList={fetchedList}
      sensorType={sensorType.current}
      updateSensorWIFIPSD={updateSensorWIFIPSD}
      writeDetailsToSensor={writeDetailsToSensor}
      popOkBtnAction={popOkBtnAction}
      submitAction={submitAction}
      navigateToPrevious={navigateToPrevious}
      navigateToManualNetwork={navigateToManualNetwork}
      popupCancelBtnAction={popupCancelBtnAction}

    />
  );

}

export default SensorWiFiListComponent;