import React, { useState, useEffect,useRef } from 'react';
import {BackHandler} from 'react-native';
import PetWeightHistoryUI from './petWeightHistoryUI';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inWeightHistoryScreen;
let trace_WeightHistory_API_Complete;
const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const PetWeightHistoryComponent = ({navigation, route, ...props }) => {

    const [weightHistoryArray, set_weightHistoryArray] = useState([]);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [noLogsShow, set_noLogsShow] = useState(undefined);
    const [petWeightUnit, set_petWeightUnit] = useState(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);

    React.useEffect(() => {
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_pet_history_weight);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_history_weight, "User in Pet Weight History Screen", '');
      });

      const unsubscribe = navigation.addListener('blur', () => {
        initialSessionStop();
      });

      return () => {
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
          focus();
          unsubscribe();
        };

    }, []);

    useEffect(() => {

      if(route.params?.petObject){
        getWeightHistory(route.params?.petObject.petID);
        set_selectedPet(route.params?.petObject);
      } else {         
        getWeightHistory(selectedPet.petID);
      }

      if(route.params?.petWeightUnit){
          set_petWeightUnit(route.params?.petWeightUnit);
      }
    }, [route.params?.petObject,route.params?.petWeightUnit]);

    const initialSessionStart = async () => {
      trace_inWeightHistoryScreen = await perf().startTrace('t_inWeightHistoryScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inWeightHistoryScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const getWeightHistory = async (petID) => {

      firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_api, firebaseHelper.screen_pet_history_weight, "Initiated Pet Weight History API", 'Pet Id : '+petID);
      trace_WeightHistory_API_Complete = await perf().startTrace('t_WeightHistory_API');
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

      fetch(EnvironmentJava.uri + "pets/weightHistory/"+petID,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
            stopFBTrace();
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }

            if(data && data.status.success){
              firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_api_success, firebaseHelper.screen_pet_history_weight, "Pet Weight History API Success", 'No of weight entries : '+data.response.petWeightHistories.length);
                if(data.response.petWeightHistories){
                    set_weightHistoryArray(data.response.petWeightHistories);
                }

            } else {

                set_popupMessage(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
            set_isLoading(false);
            isLoadingdRef.current = 0;
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_api_fail, firebaseHelper.screen_pet_history_weight, "Pet Weight History API Fail", 'error : '+error);
            stopFBTrace();
            set_isLoading(false);   
            isLoadingdRef.current = 0;
            set_popupMessage(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);  
            popIdRef.current = 1;    
          });
    };

    const stopFBTrace = async () => {
      await trace_WeightHistory_API_Complete.stop();
    };

    const navigateToPrevious = () => {  

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_pet_history_weight, "User clicked on back button to navigate to DashBoardService", '');
        navigation.navigate('DashBoardService');
      }
        
    };

    const enterWeightAction = (value,item) => {

      set_noLogsShow(false);
      if(value==='edit'){
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_button_trigger, firebaseHelper.screen_pet_history_weight, "User clicked on Edit Weight Button", 'Previous Weight : '+item.weight);
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_history_button_trigger, firebaseHelper.screen_pet_history_weight, "User clicked on Add Weight Button", 'Pet Id : '+selectedPet.petID);
      }
      navigation.navigate('EnterWeightComponent',{selectedPet:selectedPet,value:value,weightitem:item,petWeightUnit:petWeightUnit});

    };

    const popOkBtnAction = () => {
        set_popupMessage(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
    };

    return (
        <PetWeightHistoryUI 
            weightHistoryArray = {weightHistoryArray}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupMessage = {popupMessage}
            noLogsShow = {noLogsShow}
            navigateToPrevious = {navigateToPrevious}
            enterWeightAction = {enterWeightAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default PetWeightHistoryComponent;