import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import FeedbackUI from './feedbackUI';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const FeedbackComponent = ({navigation, route, ...props }) => {

    const [feedbackArray, set_feedbackArray] = useState([])
    const [isLoading, set_isLoading] = useState(true);
    const [date, set_Date] = useState(new Date());
    const [noLogsShow, set_noLogsShow] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(1);
    let trace_inFeedback_Screen;
    let trace_Get_Feedback_Details_Api_Complete;

    React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        feedbackSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_feedback);   
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_feedback, "User in Feedback Screen", '');
        getFeedbackDetails();
      });

      const unsubscribe = navigation.addListener('blur', () => {
        feedbackSessionStop();
      });
  
      return () => {
        focus();
        unsubscribe();
        feedbackSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
      
    }, []);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Fetches the feedback records from the backe end
    const getFeedbackDetails = async () => {

        trace_Get_Feedback_Details_Api_Complete = await perf().startTrace('t_Get_Feedback_Details_Api');
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        firebaseHelper.logEvent(firebaseHelper.event_feedback_details_api, firebaseHelper.screen_feedback, "Getting Feedback details API Initiated", 'Client Id : '+client ? client : '');
        fetch(EnvironmentJava.uri + "getFeedbackByPetParent/"+client,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {

          if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
          }

            if(data.status.success){
                stopFBTraceGetFeedbackByPetParent();
                firebaseHelper.logEvent(firebaseHelper.event_feedback_details_api_success, firebaseHelper.screen_feedback, "Getting Feedback details API Success", 'Client Id : '+client ? client : '');
                if(data.response.mobileAppFeeback){
                    set_feedbackArray(data.response.mobileAppFeeback);
                    if(data.response.mobileAppFeeback.length>0){
                        set_noLogsShow(false);
                    } else {
                      set_noLogsShow(true);
                    }
                }

            }
            else{
              set_isPopUp(true);
              popIdRef.current = 1;
              stopFBTraceGetFeedbackByPetParent();
            }
            set_isLoading(false);
            isLoadingdRef.current = 0;
          }).catch((error) => {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isPopUp(true);
            popIdRef.current = 1;
            firebaseHelper.logEvent(firebaseHelper.event_feedback_details_api_failure, firebaseHelper.screen_feedback, "Getting Feedback details API Fail", 'error : '+error);
            stopFBTraceGetFeedbackByPetParent();
          });
      };

      // Navigates to Dashboard
    const navigateToPrevious = () => {  

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_feedback, "User clicked on back button to navigate to Dashboard", '');
        navigation.navigate('DashBoardService');
      }
       
    };

    // Navigates to Submit New feedback
    const nextButtonAction = () => {
      set_noLogsShow(false);
      navigation.navigate('SendFeedbackComponent');
    }

    // Navigates to view Feedback record selected
    const actionOnRow = (item) => {
      navigation.navigate('ViewFeedbackComponent',{feedbackItem:item});
    }

    const feedbackSessionStart = async () => {
      trace_inFeedback_Screen = await perf().startTrace('t_Feedback_Screen');
    };
  
    const feedbackSessionStop = async () => {
      await trace_inFeedback_Screen.stop();
    };

    const stopFBTraceGetFeedbackByPetParent = async () => {
      await trace_Get_Feedback_Details_Api_Complete.stop();
    };

    const popOkBtnAction = () => {

      set_isPopUp(false);
      popIdRef.current = 0;
      
    }


    return (
        <FeedbackUI 
            feedbackArray = {feedbackArray}
            isLoading = {isLoading}
            noLogsShow = {noLogsShow}
            isPopUp = {isPopUp}
            navigateToPrevious = {navigateToPrevious}
            nextButtonAction = {nextButtonAction}
            actionOnRow = {actionOnRow}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default FeedbackComponent;