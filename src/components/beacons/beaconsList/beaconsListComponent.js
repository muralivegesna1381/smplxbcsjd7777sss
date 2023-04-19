import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import BeaconsListUI from './beaconsListUI';
import BeaconsHandler from '../beaconsHandler';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let connectBeaconsTimeOut = undefined;
let trace_inBeaconsListscreen;

const beaconServiceUUID = 'F0CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_1 = 'F2CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_2 = 'F3CEC428-2EBB-47AB-A753-0CE09E9FE64B';

const  BeaconsListComponent = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [loaderMsg2, set_loaderMsg2] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [beaconsArray, set_beaconsArray] = useState([]);
    const [availableBeaconsArray, set_availableBeaconsArray] = useState(undefined);
    const [isBeaconsFound, set_isBeaconsFound] = useState(true);
    const [eMsg, set_eMsg] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let availableBeacons = useRef([]);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          initialSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_beacons_list);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_beacons_list, "User in Beacons List Screen", '');
        });
    
        const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
        });
    
        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
          if(connectBeaconsTimeOut){
            clearTimeout(connectBeaconsTimeOut);
          }
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if(route.params?.beaconsArray){
            set_beaconsArray(route.params?.beaconsArray);
            firebaseHelper.logEvent(firebaseHelper.event_beacons_locations_next_action, firebaseHelper.screen_beacons_list, "", 'No of Beacons Identified : '+route.params?.beaconsArray.length);
            if(route.params?.beaconsArray.length > 1){
              set_loaderMsg2(route.params?.beaconsArray.length + ' beacons');
              set_loaderMsg(' were identified. Please wait while we fetch information from these beacons.');
            } else {
              set_loaderMsg2(route.params?.beaconsArray.length + ' beacon');
              set_loaderMsg(' identified. Please wait while we fetch information from this beacon.');
            }
            
            getBeaconsDetails(route.params?.beaconsArray);
        }
        
    }, [route.params?.beaconsArray]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inBeaconsListscreen = await perf().startTrace('t_inBeaconsListScreen');
    };

    const initialSessionStop = async () => {
        await trace_inBeaconsListscreen.stop();
    };
    
    const getBeaconsDetails = async (beaconsArry) => {

        if(beaconsArry){

            set_isLoading(true);
            isLoadingdRef.current = 1;
            connectBeaconsTimeOut = setTimeout(() => {   
              setTimeoutFuntion();
            }, 30000);

            for (let i=0 ; i < beaconsArry.length; i++){
                    let dataId = await BeaconsHandler.getInstanceforBeacons().readDataFromBeacon(beaconServiceUUID,beaconCharcter_1,beaconsArry[i],'formatedId');
                    let dataBName = await BeaconsHandler.getInstanceforBeacons().readDataFromBeacon(beaconServiceUUID,beaconCharcter_2,beaconsArry[i],'beaconName');
                    let beaconId = await retriewBeaconID(dataId.sensorData);
                    //let beaconTXRate = await this.retriewBeaconTXAD(dataId.sensorData);
                    let beaconName = retriewBeaconName(dataBName.sensorData);
                    if(dataId.status === 200 && dataBName.status === 200 ){
                      let beaconObj = {'id': beaconsArry[i] , 'fId':beaconId, 'bName': beaconName, 'txRate':''}
                      availableBeacons.current.push(beaconObj);
                      set_loaderMsg2('');
                      set_loaderMsg(availableBeacons.current.length + ' of ' + beaconsArry.length + ' completed');
                      // availableBeaconsArray.current = availableBeacons.current;
                      set_availableBeaconsArray(availableBeacons.current);
                    }
                    // else{
                    //   set_isLoading(false);
                    // }
              }

              if(availableBeacons.current.length === beaconsArry.length){
                await disConnectFromAllBeacons();
                set_isLoading(false);
                isLoadingdRef.current = 0;
                if(connectBeaconsTimeOut){
                  clearTimeout(connectBeaconsTimeOut);
                }
                
              }
        }

    };

    const hex_to_ascii = (str1) => {
          var hex  = str1.toString();
          var str = '';
          for (var n = 0; n < hex.length; n += 2) {
            str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
          }
          return str;
    }

    const toHexString = (byteArray) => {
        return Array.prototype.map.call(byteArray, function(byte) {
          return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('');
      }

    const retriewBeaconID = (characteristics) => {
        let byteArray = new Uint8Array(characteristics);
        let hexString = toHexString(byteArray);
        let srting1 = hexString.substring(12, 14);
        let srting2 = hexString.substring(14, 16);
        let srting3 = hexString.substring(16, 18);
        let srting4 = hexString.substring(18, 20);
        let srting5 = hexString.substring(20, 22);
        let srting6 = hexString.substring(22, 24);
        return (srting6+srting5+srting4+srting3+srting2+srting1).toUpperCase();
  }

  const retriewBeaconName = (characteristics) => {
    let byteArray = new Uint8Array(characteristics);
    let hexString = toHexString(byteArray);
    return hex_to_ascii(hexString)
  };

  const disConnectFromAllBeacons = async () => {
    if(beaconsArray.length>0){
      for (let i=0 ; i < beaconsArray.length; i++){
        await BeaconsHandler.getInstanceforBeacons().disconnectAllBeacons(beaconsArray[i]);
      }
    }

  };

  const setTimeoutFuntion= async ()=> {

    set_isLoading(false);
    isLoadingdRef.current = 0;
    disConnectFromAllBeacons();
    if(availableBeacons.current.length < beaconsArray.length){
 
      if((beaconsArray.length - availableBeacons.current.length) > 1 ){

        if(availableBeacons.current.length === 0){

          set_isBeaconsFound(false);
          set_eMsg(' No beacons are in configuration mode! Please ensure the beacons are in configuration mode by pressing and holding on the beacon until it flashes green.');

        } else {

          set_popupMessage(beaconsArray.length - availableBeacons.current.length + ' beacons are not in configuration mode');
          set_isPopUp(true);
          popIdRef.current = 1;

        }

      } else {

        if(availableBeacons.current.length > 0){

          set_popupMessage(beaconsArray.length - availableBeacons.current.length + ' beacon is not in configuration mode');
          set_isPopUp(true);
          popIdRef.current = 1;

        } else {

          set_isBeaconsFound(false);
          set_eMsg(' No beacons are in configuration mode! Please ensure the beacons are in configuration mode by pressing and holding on the beacon until it flashes green.');

        }

      }

    }else if(availableBeacons.current.length === 0){

        set_isBeaconsFound(false);
        set_eMsg(' No beacons are in configuration mode! Please ensure the beacons are in configuration mode by pressing and holding on the beacon until it flashes green.');
    }
  
  };

    const nextButtonAction = async () => {

      set_eMsg(undefined);
      set_isBeaconsFound(true);

      if(beaconsArray.length > 1){
        set_loaderMsg2(beaconsArray.length + ' beacons');
        set_loaderMsg(' were identified. Please wait while we fetch information from these beacons.');
      } else {
        set_loaderMsg2(beaconsArray.length + ' beacon');
        set_loaderMsg(' identified. Please wait while we fetch information from this beacon.');
      }
      
      getBeaconsDetails(beaconsArray);

    };

    const backBtnAction = async () => {

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_beacons_list, "User clicked on back button to navigate to BeaconsInitialComponent", '');
        await disConnectFromAllBeacons();
        navigation.navigate('BeaconsInitialComponent'); 
      }
         
    };

    const popOkBtnAction = () => {

      set_isPopUp(false);
      popIdRef.current = 0;
      set_popupMessage(undefined);
        
    };

    const actionOnRow = (item,index) => {
      navigation.navigate('BeaconsLocationComponent',{beaconItem:item,beaconsCount:beaconsArray ? beaconsArray.length : 0});  
    };

    return (
        <BeaconsListUI
          
          availableBeaconsArray = {availableBeaconsArray}
          isLoading = {isLoading}
          popupMessage = {popupMessage}
          isPopUp = {isPopUp}
          loaderMsg = {loaderMsg}
          loaderMsg2 = {loaderMsg2}
          eMsg = {eMsg}
          isBeaconsFound = {isBeaconsFound}
          backBtnAction = {backBtnAction}
          actionOnRow = {actionOnRow}
          popOkBtnAction = {popOkBtnAction}
          nextButtonAction = {nextButtonAction}
        />

    );
  }
  
  export default BeaconsListComponent;
