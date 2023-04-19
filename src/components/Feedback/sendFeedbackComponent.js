import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import * as internetCheck from "./../../utils/internetCheck/internetCheck";
import * as Constant from "./../../utils/constants/constant";
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "./../../config/apollo/queries";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import SendFeedbackUI from './sendFeedbackUI';
import DeviceInfo from 'react-native-device-info';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_in_SendFeedback_Screen;
let trace_Submit_Feedback_Details_Api_Complete;
let popId = 0;

const  SendFeedbackComponent = ({navigation, route, ...props }) => {

    const [sendFeedbackRequest,{loading: sendFeedbackLoading, error: sendFeedbackError, data: sendFeedbackData,}] = useMutation(Queries.SEND_FEEDBACK);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [feedbackText , set_feedbackText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [feedBackScreensData, set_feedBackScreensData] = useState([
        "Get Started/Landing page", 
        "Splash", 
        "Login", 
        "Forgot Password", 
        "First Time user/Registration", 
        "Dashboard", "Quick Video for Seizures", 
        "Self On boarding", 
        "Menu tray",
        "Observation - List Observations", 
        "Observation - Add Observation",
        "Observation - View Observation",
        "Observation - Edit Observation",
        "Pets - Pet details",
        "Device - Device Details",
        "Device - Sensor Information",
        "Device - Manage Sensor", 
        "Account - Account Details", 
        "Account - Edit Account Details",
        "Support - Contact Us", "Support - Legal",
        "FAQs", 
        "How-To Videos",
        "Timer feature", 
        "App orientation feature", 
        "Chatbot", 
        "Eating enthusiasm scale", 
        "Addition of species field (dog/cat)", 
        "Add pet weight", 
        "View/List pet weight", 
        "Image-based BCS/BFI scoring, image-base Stool Scoring and image-based HWP measurements", 
        "Customer support videos, FAQs, PDFs of user guides", 
        "Pet parent app feedback - automated check-in", 
        "View the app feedback",
    ]);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
    const [screenName, set_screenName] = useState(undefined);
    const [deviceModel, set_deviceModel] = useState(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    //setting firebase helper
    useEffect(() => {

        sendFeedbackSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_send_feedback);   
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_send_feedback, "User in Send Feedback Screen", ''); 
        set_deviceModel(DeviceInfo.getModel());
        set_feedBackScreensData(feedBackScreensData.sort());
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
     
         return () => {
            sendFeedbackSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    } , []);

    // Responce after submitting the Feedback from the user
    useEffect(() => {

          if(sendFeedbackData){
            firebaseHelper.logEvent(firebaseHelper.event_send_feedback_details_api_success, firebaseHelper.screen_send_feedback, "Send Feedback details API success", '');
            stopFBTraceSubmitFeedbackByPetParent();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(sendFeedbackData.sendFeedback.success){
              createPopup(true,Constant.ALERT_INFO,'Your feedback has been submitted successfully',1,1);
              
            }else{ 
                createPopup(true,Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,1,0);                    
            }
            
          }
    
          if(sendFeedbackError) {
            firebaseHelper.logEvent(firebaseHelper.event_send_feedback_details_api_failure, firebaseHelper.screen_send_feedback, "Send Feedback details API failed", ''+sendFeedbackError);
            stopFBTraceSubmitFeedbackByPetParent();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_loaderMsg(undefined);
            createPopup(true,Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,1,0);
          }
    
    }, [sendFeedbackLoading, sendFeedbackError, sendFeedbackData]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const sendFeedbackSessionStart = async () => {
        trace_in_SendFeedback_Screen = await perf().startTrace('t_Send_Feedback_Screen');
      };
    
      const sendFeedbackSessionStop = async () => {
        await trace_in_SendFeedback_Screen.stop();
      };
  
      const stopFBTraceSubmitFeedbackByPetParent = async () => {
        await trace_Submit_Feedback_Details_Api_Complete.stop();
      };

    // API to submit the feedback
    const submitAction = async (fText,item) => {
        
        set_feedbackText(fText);
        set_screenName(item);
        let internet = await internetCheck.internetCheck();
        if(!internet){

            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;
        } else {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
            let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
            let defaultPetObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
            defaultPetObj = JSON.parse(defaultPetObj);

            let json = {
                ClientID: ""+client,//parseInt(client),
                PetId: ""+defaultPetObj.petID,//parseInt(defaultPetObj.petID),
                PageName: item,
                DeviceType: deviceModel,
                FeedbackText: fText,
            };
            firebaseHelper.logEvent(firebaseHelper.event_send_feedback_details_api, firebaseHelper.screen_send_feedback, "Send Feedback details API Initiated", 'Client Id : '+client ? client : '');
            trace_Submit_Feedback_Details_Api_Complete = await perf().startTrace('t_Submit_Feedback_Details_Api');
            await sendFeedbackRequest({ variables: { input: json } });

        }        
        
    };

    // Navigate to previous screen
    const navigateToPrevious = () => { 
      
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_send_feedback, "User clicked on back button to navigate to FeedbackComponent", '');
        navigation.navigate("FeedbackComponent"); 
      } 
          
    };

    const createPopup = (isPop,title,msg,refId,id) => {
      set_isPopUp(isPop);
      set_popUpAlert(title)
      set_popUpMessage(msg);
      popId = id;
      popIdRef.current = refId;      
  };

    // Popup Action
    const popOkBtnAction = () => {

        if(popId === 1) {
          popIdRef.current = 0;
          navigateToPrevious();
      }

      createPopup(false,'','',0,0);
    };

    return (
        <SendFeedbackUI 
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            feedBackScreensData = {feedBackScreensData}
            feedbackText = {feedbackText}
            screenName = {screenName}
            nxtBtnEnable = {nxtBtnEnable}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default SendFeedbackComponent;