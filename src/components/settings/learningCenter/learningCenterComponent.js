import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import LearningCenterUI from './learningCenterUI';
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const LearningCenterComponent = ({navigation, route, ...props }) => {

    const [faqsArray, set_faqsArray] = useState(undefined);
    const [videosArray, set_videosArray] = useState(undefined);
    const [userGuidesArray, set_userGuidesArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let trace_inLearing_Center_Screen;

      useEffect(() => {

        learningCenterSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_learning_center);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_learning_center, "User in Learning Center Screen", ''); 
        getsupportDocs();  
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

         return () => {
           learningCenterSessionStop();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };
     
       }, []);
  
      const handleBackButtonClick = () => {
          navigateToPrevious();
          return true;
      };

      const getsupportDocs = async () => {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api, firebaseHelper.screen_learning_center, "Get Support Docs Api requested", "");

        fetch(EnvironmentJava.uri + "supportDocs/getSupportDocs",
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

            if (data.status.success && data.response.supportMaterials) {
                firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_success, firebaseHelper.screen_learning_center, "Get Support Docs Api success", "");
                set_faqsArray(data.response.supportMaterials.fags);
                set_videosArray(data.response.supportMaterials.videos);
                set_userGuidesArray(data.response.supportMaterials.userGuides);

            } 

        }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_Learning_center_page_api_failure, firebaseHelper.screen_learning_center, "Get Support Docs Api success", error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popupMsg(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;
        });

    }

    const learningCenterSessionStart = async () => {
        trace_inLearing_Center_Screen = await perf().startTrace('t_Learning_Center_Screen');
      };
    
      const learningCenterSessionStop = async () => {
        await trace_inLearing_Center_Screen.stop();
      };

    /**
     * Will be navigated to Support page
     */
    const navigateToPrevious = () => {  
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_learning_center, "User clicked on back button to navigate to SupportComponent", '');
          navigation.navigate("SupportComponent");
        }
    }

    const popOkBtnAction = () => {
        set_popupMsg(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
      };

    return (
        <LearningCenterUI 
            faqsArray = {faqsArray}
            userGuidesArray = {userGuidesArray}
            videosArray = {videosArray}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popupMsg = {popupMsg}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default LearningCenterComponent;