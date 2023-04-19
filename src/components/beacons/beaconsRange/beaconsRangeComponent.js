import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import BeaconsRangeUI from './beaconsRangeUI';
import BeaconsHandler from '../beaconsHandler';
import { stringToBytes ,bytesToString} from 'convert-string';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inBeaconsRangecreen;
const beaconServiceUUID = 'F0CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_0 = 'F1CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_1 = 'F2CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_2 = 'F3CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconCharcter_5 = 'F6CEC428-2EBB-47AB-A753-0CE09E9FE64B';
const beaconURL = 'https://wearables-mobileapp-webapis-ygue7fpaba-uc.a.run.app/app/managebeaconconfiguration';

const BEACONS_SINGLE = 1;
const BEACONS_MULTIPLE = 2;

const  BeaconsRangeComponent = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [popupID, set_popupID] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popAlert, set_popAlert] = useState('Alert');
    const [loaderMessage, set_loaderMessage] = useState('Please wait..')
    const [isPopUp, set_isPopUp] = useState(false);
    const [isPopUpLftBtn, set_isPopUpLftBtn] = useState(false);
    const [selectedRange, set_selectedRange] = useState(undefined);
    const [lName, set_lName] = useState(undefined);
    const [bInstanceID, set_bInstanceID] = useState(undefined);
    const [txPower, set_txPower] = useState("-18");
    const [beaconItem, set_beaconItem] = useState(undefined);
    const [txId, set_txId] = useState("0");
    const [beaconsCount, set_beaconsCount] = useState(0);
    const [rangeTxt, set_rangeTxt] = useState(undefined);
    const [rangesArray, set_rangesArray] = useState([
      {'id': '0', 'txValue':'Low (Recommended)'},
      {'id': '5', 'txValue':'Medium'},
      {'id': '7', 'txValue':'High'},
    ]);

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);
  let instanceRef = useRef('');

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_beacons_range_screen);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_beacons_range_screen, "User in Beacons Range Configure Screen", '');
      set_rangeTxt(rangesArray[0].txValue);
      set_txId(rangesArray[0].id);
      set_selectedRange(rangesArray[0]);

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    }, []);

    useEffect(() => {

      if(route.params?.locationName){
        set_lName(route.params?.locationName);
      }

      if(route.params?.beaconItem){
        set_beaconItem(route.params?.beaconItem);
      }
        
      if(route.params?.beaconsCount){
        set_beaconsCount(route.params?.beaconsCount);
      }
    }, [route.params?.locationName,route.params?.beaconItem,route.params?.beaconsCount]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inBeaconsRangecreen = await perf().startTrace('t_inBeaconsRangeScreen');
    };

    const initialSessionStop = async () => {
        await trace_inBeaconsRangecreen.stop();
    };

    const nextButtonAction = async () => {
      set_isLoading(true);
      isLoadingdRef.current = 1;
      firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_submit, firebaseHelper.screen_beacons_range_screen, "Location Name : "+lName, 'Range : '+selectedRange ? selectedRange.txValue : '');
      BeaconsHandler.getInstanceforBeacons().connectToBeacon(beaconItem.id,beaconWiteDataCallback);
    };

    const backBtnAction = () => {
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_beacons_range_screen, "User clicked on back button to navigate to BeaconsLocationComponent", '');
        navigation.navigate('BeaconsLocationComponent'); 
      }        
    };

    const popOkBtnAction = () => {

      if(popupID){
        if(popupID === BEACONS_MULTIPLE){
          
        }
      }

      if(popupMessage.includes('The beacon is configured successfully.') ){
        
        set_popAlert('Alert');
        set_popupMessage('');
        set_isPopUpLftBtn(false);
        set_isPopUp(false);
        set_popupID(undefined);
        popIdRef.current = 0;
        navigation.navigate('BeaconsInitialComponent'); 

      } else {
        set_isPopUp(false);
        set_popupID(undefined);
        popIdRef.current = 0;
        set_isPopUpLftBtn(false);
        set_popAlert(undefined);
        set_popupMessage(undefined);
      }
        
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        set_popupID(undefined);
        popIdRef.current = 0;
        set_isPopUpLftBtn(false);
        set_popAlert(undefined);
        set_popupMessage(undefined);
        navigation.navigate('DashBoardService'); 
  };

    const actionOnRow = () => {
      navigation.navigate('BeaconsLocationComponent');  
    };

    const actionOnSearch = (item) => {
      set_selectedRange(item);
      set_txId(item.id);
    };

    const beaconWiteDataCallback = async ({data,error}) => {

      if(error || (data && data.error)){
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection fail", '');
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popAlert('Alert');
        set_isPopUpLftBtn(false);
        set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
        set_isPopUp(true);
        set_popupID(undefined);
        popIdRef.current = 1;

      }else {
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success", 'Writing Beacon Name : '+lName);
        let cName =  stringToBytes(lName);
        let cNameLength;
        let temp = [];
        if (cName.length <= 20){
          cNameLength = 20 - cName.length;
        }
        for (let i = 0; i < cNameLength ; i++){
           temp.push(0);
        }
        set_loaderMessage('Configuring the beacon location.....');
        let name = cName.concat(temp);
        await BeaconsHandler.getInstanceforBeacons().writeDataToBeacon(beaconServiceUUID,beaconCharcter_2,name,beaconItem.id,beaconWiteNameCallback);
      }
     
    }

    const beaconWiteNameCallback = async ({data,error}) => {

      if(data) {

        if(data.error){
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_popAlert('Alert');
          set_isPopUpLftBtn(false);
          set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
          set_isPopUp(true);
          set_popupID(undefined);
          popIdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Name", 'Beacon Name : '+lName);
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success while Written the name", 'Beacon Name : '+lName);
          set_loaderMessage('Configuring the transmission range.....');
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success and Writing the Range", 'Range : '+selectedRange ? selectedRange.txValue : '');
          let txAdvWrite = stringToBytes(txId);
          await BeaconsHandler.getInstanceforBeacons().writeDataToBeacon(beaconServiceUUID,beaconCharcter_1,txAdvWrite,beaconItem.id,beaconWiteTXADVRateCallback);

        }

      }else {
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Name", 'Beacon Name : '+lName);
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popAlert('Alert');
        set_isPopUpLftBtn(false);
        set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
        set_isPopUp(true);
        set_popupID(undefined);
        popIdRef.current = 1;

      }

    };

    const beaconWiteTXADVRateCallback = async ({data,error}) => {

      if(data){

        if(data.error){

          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_popAlert('Alert');
          set_isPopUpLftBtn(false);
          set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
          set_isPopUp(true);
          set_popupID(undefined);
          popIdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Range", 'Range : '+selectedRange ? selectedRange.txValue : '');
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success while writing the Range", 'Range : '+selectedRange ? selectedRange.txValue : '');
          set_loaderMessage('Completing the beacon setup.....');
          let maxPower = undefined;
          if(selectedRange.txValue ==='Low (Recommended)'){
              maxPower=-18;
          }else if(selectedRange.txValue ==='Medium'){
            maxPower=-3;
          }else if(selectedRange.txValue ==='High'){
            maxPower=+3;
          }

          set_txPower(maxPower);
          let calBytes = [maxPower];
          let bconInstance = '';
          if(lName==='Basement'){
            bconInstance='000000000100';

          }else if(lName==='Bathroom'){
            bconInstance='000000000110';

          }else if(lName==='Bed room'){
            bconInstance='000000000120';

          }else if(lName==='Dining room'){
            bconInstance='000000000130';

          }else if(lName==='Garden'){
            bconInstance='000000000140';

          }else if(lName==='Hall'){

            bconInstance='000000000150';
          }else if(lName==='Kitchen'){
            bconInstance='000000000160';

          }else if(lName==='Living room'){
            bconInstance='000000000170';

          }else if(lName==='Office'){
            bconInstance='000000000180';

          }else if(lName==='Porch'){
            bconInstance='000000000190';
            //setbInstanceID('000000000190');

          }
          instanceRef.current = bconInstance;
          let nameSpaceBytes = hexStringToByte('5CEB820AE029661DD0ED');
          let instanceId = hexStringToByte(bconInstance);

          var tempArray = [...calBytes,...nameSpaceBytes,...instanceId];
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success and writing the Instance Id", 'Id : '+bconInstance);
          set_bInstanceID(bconInstance);
          saveBeconInstanceId(bconInstance);
          await BeaconsHandler.getInstanceforBeacons().writeDataToBeacon(beaconServiceUUID,beaconCharcter_5,tempArray,beaconItem.id,beaconWritInstanceNameSpaceCallback);

        }

      }else {
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Range", 'Range : '+selectedRange ? selectedRange.txValue : '');
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popAlert('Alert');
        set_isPopUpLftBtn(false);
        set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
        set_isPopUp(true);
        set_popupID(undefined);
        popIdRef.current = 1;

      }
      
    };

    const beaconWritInstanceNameSpaceCallback = async ({data,error}) => {

      if(error || (data && data.error)){
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popAlert('Alert');
        set_isPopUpLftBtn(false);
        set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
        set_isPopUp(true);
        set_popupID(undefined);
        popIdRef.current = 1;
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Instance Id", 'Id : '+instanceRef.current);
      }else {

        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success while writing the Instance Id", 'Id : '+instanceRef.current);
        set_loaderMessage('Completing the beacon setup.....');
        let array = stringToBytes('00000000');
        let updateComand = [1];
        let finalArray = updateComand.concat(array);
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success and writing the Password to confirm", '');
        await BeaconsHandler.getInstanceforBeacons().writeDataToBeacon(beaconServiceUUID,beaconCharcter_0,finalArray,beaconItem.id,beaconWiteTXADVPaswdCallback);
      }

    };

    const beaconWiteTXADVPaswdCallback = async ({data,error}) => {

      if(error || data.error){
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popAlert('Alert');
        set_isPopUpLftBtn(false);
        set_popupMessage('Unable to connect to the beacon. Please ensure the beacons configuration mode is On and its in close proximity with the mobile device.');
        set_isPopUp(true);
        set_popupID(undefined);
        popIdRef.current = 1;
        firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Password to confirm", '');
      }else {

        let instanceId = await DataStorageLocal.getDataFromAsync(Constant.BEACON_INSTANCE_ID);
        await BeaconsHandler.getInstanceforBeacons().disconnectAllBeacons(beaconItem.id);
        if(instanceId){
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Success while writing the Password to confirm", 'Beacon Configuration is success');
          // sendBeaconDetailsToBackend(instanceId);
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_popAlert('Success');
          if(beaconsCount>1){
            set_isPopUpLftBtn(true);
            set_popupMessage('The beacon is configured successfully. Would you like to configure another beacon?'); 
            set_popupID(BEACONS_MULTIPLE);        
          } else {
            set_isPopUpLftBtn(false);
            set_popupMessage('The beacon is configured successfully.');
            set_popupID(BEACONS_SINGLE);
          }
          set_isPopUp(true);
          popIdRef.current = 1;

        }else {
          firebaseHelper.logEvent(firebaseHelper.event_beacons_configure_connection, firebaseHelper.screen_beacons_range_screen, "Beacon Connection Fail while writing the Password to confirm", '');
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_popAlert('Alert');
          set_popupMessage('Unable to save the details. Please try again');
          set_isPopUp(true);
          set_popupID(undefined);
          popIdRef.current = 1;

        }
        
      }

    };

    const sendBeaconDetailsToBackend = async (instanceId) => {

      await BeaconsHandler.getInstanceforBeacons().disconnectAllBeacons(beaconItem.id);
      let userId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

      let json = {
          PET_PARENT_ID: parseInt(userId),
          BEACON_MAC_ID: instanceId,//bInstanceID,
          BEACON_NAME: lName,
          IS_CONFIGURED: 1,
          BEACON_NOTES: txPower.toString()// send Signal strength -18
       };
        fetch(beaconURL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'ClientToken': token,
             },
            body: JSON.stringify(json)
            }).then((response) => response.json()).then(async (data) =>
                {
                  set_isLoading(false);
                  isLoadingdRef.current = 0;
                  if(data.ResponseCode === "SUCCESS"){

                    set_popAlert('Success');
                    if(beaconsCount>1){
                      set_isPopUpLftBtn(true);
                      set_popupMessage('This beacon is configured successfully. Would you like to configure another beacon?');
                      set_popupID(BEACONS_MULTIPLE);
                    } else {
                      set_isPopUpLftBtn(false);
                      set_popupMessage('This beacon is configured successfully.');
                      set_popupID(BEACONS_SINGLE);
                    }
                    
                    set_isPopUp(true);
                    popIdRef.current = 1;

                  }else {

                    set_popAlert('Alert');
                    set_popupMessage('Unable to save the details. Please try again');
                    set_isPopUp(true);
                    set_popupID(undefined);
                    popIdRef.current = 1;

                  }
                  
             }).catch((error) => {

              set_isLoading(false);
              isLoadingdRef.current = 0;
              set_popAlert('Alert');
              set_isPopUpLftBtn(false);
              set_popupMessage('Unable to save the details. Please try again');
              set_isPopUp(true);
              set_popupID(undefined);
              popIdRef.current = 1;

          });
  }

    const hexStringToByte = (str) =>{
      if (!str) {
        return new Uint8Array();
      }
      
      var a = [];
      for (var i = 0, len = str.length; i < len; i+=2) {
        a.push(parseInt(str.substr(i,2),16));
      }
      
      return new Uint8Array(a);
    }

    const saveBeconInstanceId = async (id) => {

      await DataStorageLocal.saveDataToAsync(Constant.BEACON_INSTANCE_ID, id)

   };

    return (

        <BeaconsRangeUI
          popupMessage = {popupMessage}
          isPopUp = {isPopUp}
          loaderMessage = {loaderMessage}
          isLoading = {isLoading}
          popAlert = {popAlert}
          isPopUpLftBtn = {isPopUpLftBtn}
          lName = {lName}
          rangeTxt = {rangeTxt}
          actionOnSearch = {actionOnSearch}
          rangesArray = {rangesArray}
          backBtnAction = {backBtnAction}
          actionOnRow = {actionOnRow}
          nextButtonAction = {nextButtonAction}
          popOkBtnAction = {popOkBtnAction}
          popCancelBtnAction = {popCancelBtnAction}
        />

    );
  }
  
  export default BeaconsRangeComponent;
