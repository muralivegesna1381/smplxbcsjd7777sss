import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import EatingEnthusiasticUI from './eatingEnthusiasticUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  EatingEnthusiasticComponent = ({navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [eatingEntArray, set_eatingEntArray] = useState(undefined);
    const [specieId, set_specieId] = useState("1");
    const [defaultPet, set_defaultPet] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let trace_inEatingEnthusiasmScreen;
    let trace_EatingEnthu_Get_Scale_API_Complete;

     // Setting the firebase screen name
     useEffect(() => {

        getDefaultPet();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            eatingEnthusiasmScaleScreenSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_eating_enthusiasm);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_eating_enthusiasm, "User in Eating Enthusiasm Screen", ''); 
        });

        const unsubscribe = navigation.addListener('blur', () => {
            eatingEnthusiasmScaleScreenSessionStop();
        });

        return () => {
          eatingEnthusiasmScaleScreenSessionStop();
          focus();
          unsubscribe();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const getDefaultPet = async () => {
        let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        defaultPet = JSON.parse(defaultPet);
        set_defaultPet(defaultPet);
        getPetEatingEnthusiasmScale(defaultPet);
        if(defaultPet){
            set_specieId(defaultPet.speciesId);
        }
    };

    // Fetches the Eating Enthusastic records from backend.
    const getPetEatingEnthusiasmScale = async (petObj) => {
        trace_EatingEnthu_Get_Scale_API_Complete = await perf().startTrace('t_Eating_Enthusiasm_Get_Scale_API');
        firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api", 'Pet Id : '+petObj ? petObj.petID : '');
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        if (token){

            set_isLoading(true);
            isLoadingdRef.current = 1;
            fetch(EnvironmentJava.uri + "pets/getPetEatingEnthusiasmScale/",
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
                isLoadingdRef.current = 0;
                if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                    AuthoriseCheck.authoriseCheck();
                    navigation.navigate('WelcomeComponent');
                }

                if(data.status.success){
                    stopFBTraceGetScale();
                    firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api_success, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api success", '');
                    set_eatingEntArray(data.response.eatingEnthusiasmScales);
                } else {
                    set_popupAlert('Alert');
                    stopFBTraceGetScale();
                    set_popupMsg(Constant.SERVICE_FAIL_MSG);
                    set_isPopUp(true);
                    popIdRef.current = 1;
                    
                }
            }).catch((error) => {
                firebaseHelper.logEvent(firebaseHelper.event_get_pet_eating_enthusiasm_scale_api_failure, firebaseHelper.screen_eating_enthusiasm, "Get eating enthusiasm scale api failed", ''+error);
                set_isLoading(false); 
                isLoadingdRef.current = 0;
                stopFBTraceGetScale();
                set_popupAlert('Alert');            
                set_popupMsg(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
            });

        } else {

        }      

    };

    const eatingEnthusiasmScaleScreenSessionStart = async () => {
        trace_inEatingEnthusiasmScreen = await perf().startTrace('t_inEating_Enthusiasm_Scale_Screen');
    };
    
    const eatingEnthusiasmScaleScreenSessionStop = async () => {
        await trace_inEatingEnthusiasmScreen.stop();
    };

    const stopFBTraceGetScale = async () => {
        await trace_EatingEnthu_Get_Scale_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
         return true;
    };

    // Navigates to Dashboard - backbutton action
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('DashBoardService');
        }
        
    }

    // After selection, creates the selected object and passes through the navigation to Select date class
    const submitAction = async (valueSlider) => {

        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        let eatTempObj = {};

        if(eatObj){

            eatTempObj = {
                sliderValue : eatingEntArray[valueSlider], 
                eDate : eatObj.eDate ? eatObj.eDate : '', 
                eTime : eatObj.eTime ? eatObj.eTime : '', 
            }

        } else {

                eatTempObj = {
                sliderValue : eatingEntArray[valueSlider], 
                eDate : '', 
                eTime :'', 
            }
        }
        firebaseHelper.logEvent(firebaseHelper.event_pet_eating_enthusiasm_scale_selection_trigger, firebaseHelper.screen_eating_enthusiasm, "User selection in eating enthusiasm scale", ''+eatingEntArray[valueSlider]);
        await DataStorageLocal.saveDataToAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ,JSON.stringify(eatTempObj));
        navigation.navigate('SelectDateEnthusiasmComponent',{sliderObj:eatingEntArray[valueSlider]});
        
    }

    // Popup Btn action, By setting false, Popup will dissappear from the screen
    const popOkBtnAction = (value) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupAlert(undefined);
        set_popupMsg(undefined);
        navigateToPrevious();
    }

    return (
        <EatingEnthusiasticUI 
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupMsg = {popupMsg}
            specieId = {specieId}
            eatingEntArray = {eatingEntArray}
            submitAction = {submitAction}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default EatingEnthusiasticComponent;