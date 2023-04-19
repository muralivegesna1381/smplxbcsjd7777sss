import React, { useState, useEffect } from 'react';
import {BackHandler,Platform,PermissionsAndroid,Linking} from 'react-native';
import DashBoardUI from './dashBoardUI';
import { useQuery} from "@apollo/react-hooks";
import { useNavigation } from "@react-navigation/native";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "../../config/apollo/queries";
import RNExitApp from 'react-native-exit-app';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';

const  DasBoardComponent = ({route, ...props }) => {

    const { loading, data : timerWidgetNavigationData } = useQuery(Queries.DASHBOARD_TIMER_WIDGET, { fetchPolicy: "cache-only" });

    const navigation = useNavigation();
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isTimer, set_isTimer] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
    const [isPopupLeft, set_isPopupLeft] = useState(false);
    const [arrayPets, set_arrayPets] = useState(undefined);
    const [questionnaireData,set_questionnaireData] = useState(undefined);
    const [questionnaireDataLength,set_questionnaireDataLength] = useState(undefined);
    const [isTimerEnable, set_isTimerEnable] = useState(undefined);
    const [isPTLoading, set_isPTLoading] = useState(false);
    const [date, set_Date] = useState(new Date());

      //////////////////////////// Dashboard Component ///////////////////////////////////
                // All the Navigations from the Dashboard will happens here //

    React.useEffect(() => {

      if(Platform.OS==='android'){
        requestStoragePermission();
      } 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        getTimerDetails();
      });

      return () => {
        focus();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
    }, []);

    useEffect(() => {
        if(props.defaultPetObj){
            set_defaultPetObj(props.defaultPetObj);
        }
        set_arrayPets(props.petsArray);
        set_isTimerEnable(props.isTimerEnable);
        set_isPTLoading(props.isPTLoading);

      }, [props.defaultPetObj,props.petsArray,props.isTimerEnable,props.isPTLoading]);

    useEffect(() => {

        if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerStatus==='StopTimer'){
          updateTimer('Settings','Continue');
          set_isTimer(false);
        }

        if(timerWidgetNavigationData && timerWidgetNavigationData.data.__typename === 'DashboardTimerWidget' && timerWidgetNavigationData.data.timerBtnActions==='TimerLogs' ){
          navigateToTimerLogs();
        }
        
    }, [timerWidgetNavigationData]);

    useEffect(() => {
        set_isLoading(props.isLoading);
    }, [props.isLoading]);

    useEffect(() => {

      if(props.questionnaireData && props.questionnaireData.length>0) {
        let statusArray = [];
        
        for (let i=0; i < props.questionnaireData.length ; i++){
           if(props.questionnaireData[i].status === 'Elapsed' || props.questionnaireData[i].status === 'Open'){
              statusArray.push(props.questionnaireData[i]);
           }
        }
        set_questionnaireDataLength(statusArray.length);
        set_questionnaireData(statusArray);
      } else {
        set_questionnaireDataLength(undefined);
        set_questionnaireData(undefined);
      }
      
    }, [props.questionnaireData]);

    const getTimerDetails = async () => {

        let timerObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerObj = JSON.parse(timerObj);
        if(timerObj){   

          if(timerObj.isTimerStarted || timerObj.isTimerPaused){
            set_isTimer(true);

            Apolloclient.client.writeQuery({
                query: Queries.TIMER_WIDGET_QUERY,
                data: {
                  data: { 
                          screenName:'Dashboard',stopTimerInterval:'Continue',__typename: 'TimerWidgetQuery'}
                        },
                })
          }   
        }
   
    };

    // Navigation to Timer logs when Timer widget is enabled on the dashboard
    const navigateToTimerLogs = async () => {
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_timer_widget, firebaseHelper.screen_dashboard, "Timerlogs button in Widget clicked", "Internet Status: ");
      updateTimer('Settings','Continue');
      set_isTimer(false);
      let timerPets = await DataStorageLocal.getDataFromAsync(Constant.TIMER_PETS_ARRAY);
      timerPets = JSON.parse(timerPets);
      navigation.navigate('TimerLogsComponent',{timerPets:timerPets,isFrom:'TimerWidget'});
  };

  // Android physical back button
    const handleBackButtonClick = () => {
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Android_bk, firebaseHelper.screen_dashboard, "Physical back button clicked", "");
        set_popUpAlert('Exit App');
        set_popUpMessage('Are you sure?');
        set_popUpRBtnTitle('YES');
        set_isPopupLeft(true);
        set_isPopUp(true);
        return true;
    }

    // Navigates to Timer module from Dashboard Quick actions widget
    const timerAction = async () => {
        
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Timer_Quick, firebaseHelper.screen_dashboard, "Timer Quick action button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_popUpRBtnTitle('OK');
          set_isPopupLeft(false);
          set_isPopUp(true);
  
        } else {
            updateTimer('Timer','Stop');
            props.clearObjects();
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(defaultPetObj));
            Apolloclient.client.writeQuery({query: Queries.TIMER_START_QUERY,data: {data: {timerStart:'',__typename: 'TimerStartQuery'}},});
            navigation.navigate('TimerComponent');  
        } 
    };

    // Navigates to Settings from Dashboard Quick actions widget
    const settingsAction = async () => {
        
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Menu, firebaseHelper.screen_dashboard, "Menu button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
            props.clearObjects();
            updateTimer('Settings','Continue');
            navigation.navigate('MenuComponent',{deviceType:defaultPetObj && defaultPetObj.devices.length > 0 ? defaultPetObj.devices[0].deviceModel : '', isConfigured:defaultPetObj && defaultPetObj.devices.length > 0 ? (defaultPetObj.devices[0].isDeviceSetupDone ? 'SetupDone' : 'SetupPending') : undefined});
        }
    };

    // Query to timer when button actions on Timer widget
    const updateTimer = (value,stopValue) => {
        set_isTimer(false);
        Apolloclient.client.writeQuery({
           query: Queries.TIMER_WIDGET_QUERY,
                data: {
                  data: { 
                    screenName:value,stopTimerInterval:stopValue,__typename: 'TimerWidgetQuery'}
                  },
        })
    };

    const refreshDashBoardDetails = async (swipeValue) => {
        props.saveSwipePetObj(swipeValue);
    };

    // Navigates to add Observations from Dashboard Quick actions widget
    const quickObservationAction = async () => {
        
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Quick_Video, firebaseHelper.screen_dashboard, "Quick VIdeo button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {

            let obsObj = {
              selectedPet : props.defaultPetObj, 
              obsText : '', 
              obserItem : '', 
              selectedDate : '', 
              imagePath : '', 
              videoPath: '',
              imgName : '',
              videoName : '',
              thumbnailImage : '',
              fromScreen : 'quickVideo',
              isPets : false, 
            }
  
            await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
            props.clearObjects();
            updateTimer('Observations','Continue');
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(props.defaultPetObj));
            navigation.navigate('QuickVideoComponent');
        }
        
    }

    const quickSetupAction = async (value) => {

        let internet = await internetCheck.internetCheck();
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
         
          if(value==='Timer'){
            timerAction();
          } else if(value==='Quick Video'){

            updateTimer('SetupPet','Continue');
            quickObservationAction();
            
          } else if(value==='Observation'){
            quickObservationAction();
            
          } else if(value==='Support'){
            props.clearObjects();
            updateTimer('Support','Continue');
            firebaseHelper.logEvent(firebaseHelper.event_dashboard_Support, firebaseHelper.screen_dashboard, "Support button clicked", "Internet Status: " + internet.toString());
            navigation.navigate('SupportComponent');
            
          }
          else if (value === 'Chat'){
            updateTimer('Chatboat','Continue');
            navigation.navigate('ChatBotComponent');
          //  set_isChatbotVisible(true);

          }
            
        }
        
    }

    // Navigates to Setup Sensor page from Dashboard when pet is having setup status as pending
    const setupDeviceAction = async (value) => {

      let internet = await internetCheck.internetCheck();
      if(!internet){

        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('OK');
        set_isPopUp(true);

      } else {
        updateTimer('Settings','Continue');
        props.clearObjects();

        if(value==='ADD A DEVICE?'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Adding a Device button clicked", "Device Missing");
            navigation.navigate('SensorTypeComponent',{value:'AddDevice'});
        }else if(value==='COMPLETE SENSOR SETUP'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_sensor_setup, firebaseHelper.screen_dashboard, "Complete Setup button clicked", "Setup Pending");
          let objTemp = undefined;
          let index=0;
          for (let i = 0; i < defaultPetObj.devices.length; i++){

              if(defaultPetObj.devices[i].isDeviceSetupDone && index===0){
                index=index+1;
                objTemp = defaultPetObj.devices[i];

              }
                    
          }

          if(defaultPetObj && defaultPetObj.devices.length>0){

            for(let i = 0; i < defaultPetObj.devices.length; i++){
  
              if(defaultPetObj.devices[i].deviceNumber && defaultPetObj.devices[i].deviceNumber!==''){

                if(defaultPetObj.devices[i].deviceModel && defaultPetObj.devices[i].deviceModel.includes('HPN1')){

                  await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE,""+i);

                } else {

                  await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE,""+i);

                }
                
              } 
  
            }
            
          }

          if(objTemp){

            if(objTemp.deviceModel && objTemp.deviceModel.includes("HPN1")){
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
            }

          } else {

            if(defaultPetObj.devices[0].deviceModel && defaultPetObj.devices[0].deviceModel.includes("HPN1")){
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'HPN1Sensor');
            } else {
              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION,'Sensor');
            }

          }

            navigation.navigate('SensorInitialComponent',{defaultPetObj:defaultPetObj});

        } else if(value==='ONBOARD YOUR PET'){
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_onBoaring, firebaseHelper.screen_dashboard, "Onboard your Pet button clicked", "New User");
            await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
            navigation.navigate('PetNameComponent');

        }

      }

    }

    // Navigates to Qutestions page directly from Dashboard
    const quickQuestionAction = async (item) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Questionnaire, firebaseHelper.screen_dashboard, "Questionnaire Question button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
            updateTimer('Questionnaire','Continue');
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPetObj));
            props.clearObjects();
            navigation.navigate('QuestionnaireStudyComponent');
            navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : defaultPetObj});
        }
        
    };

    // Navigates to Questionnaire from Dashboard
    const quickQuestionnaireAction = async () => {

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_Questionnaire, firebaseHelper.screen_dashboard, "Questionnaires button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
          updateTimer('Questionnaire','Continue');
          props.clearObjects();
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPetObj));
          navigation.navigate('QuestionnaireStudyComponent');
        }

    };

    // Navigates to take quick video to add observations from Dashboard Quick actions widget
    const quickVideoAction = async () => {
        
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Quick_Video, firebaseHelper.screen_dashboard, "Quick VIdeo button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
            updateTimer('Observations');
            props.clearObjects();
            let obsPets = await DataStorageLocal.getDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);       
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(props.defaultPetObj));
            navigation.navigate('ObservationsListComponent');
            navigation.navigate('AddOBSSelectPetComponent',{petsArray : JSON.parse(obsPets), isFromScreen: 'Observations'});
            
        }
    };

    // Navigates to Edit the Pet information(Pet Image) from Dashboard on clicking right top Corner button in Pet Widget
    const editPetAction = async (item) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_Quick_Video, firebaseHelper.screen_dashboard, "Quick Video button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_popUpRBtnTitle('OK');
          set_isPopUp(true);
  
        } else {
          updateTimer('Observations','Continue');
          props.clearObjects();
          navigation.navigate('PetEditComponent',{petObject:item});
        }
        // navigation.navigate('CheckinQuestionnaireComponent');
    };

    // Navigates to Enter/Edit the weight of the pet from Dashboard Weight Widget
    const weightAction = async () => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_editpet, firebaseHelper.screen_dashboard, "Edit pet button clicked", "Internet Status: " + internet.toString());
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopupLeft(false);
          set_isPopUp(true);
  
        } else {
          updateTimer('WeighAction','Continue');
          props.clearObjects();
          navigation.navigate('PetWeightHistoryComponent',{petObject:props.defaultPetObj,petWeightUnit:props.petWeightUnit});
        }
        
    };

    // Navigates to List of device availble for the selected pet from Dashboard Sensor Widget
    const devicesSelectionAction = async () => {

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_devices_selection, firebaseHelper.screen_dashboard, "Devices button clicked", "Internet Status: " + internet.toString());
      if(!internet){
        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('OK');
        set_isPopUp(true);

      } else {
        updateTimer('Settings','Continue');
        props.clearObjects();
        navigation.navigate('MultipleDevicesComponent',{petObject:props.defaultPetObj});
      }
      
    };

    // Navigates to Sensor Instructions page from Dashboard Sensor Widget
    const firmwareUpdateAction = async () => {

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_firmwareUpdate, firebaseHelper.screen_dashboard, "FirmwareUpdate button clicked", "Internet Status: " + internet.toString());
      if(!internet){

        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('OK');
        set_isPopUp(true);

      } else {
        updateTimer('Sensor','Continue');
        props.clearObjects();
        await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, ""+0);
        navigation.navigate('SensorInitialComponent',{defaultPetObj:props.defaultPetObj});

      }
      
    };

    // Alert Actions
    const popOkBtnAction = () => {

        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('');
        set_isPopUp(false);

      if(popUpMessage==='Are you sure?'){
        RNExitApp.exitApp()
      }
        
    };

    // Alert Actions
    const popCancelBtnAction = () => {

      set_isPopUp(false);
      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_isPopupLeft(false);
      set_popUpRBtnTitle('');
      
    };

     // Navigates to Eating Enthusiastic page from Dashboard.
    const enthusiasticAction = async () => {

      await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_enthusiasm, firebaseHelper.screen_dashboard, "Eating Enthusiasm button clicked", "Internet Status: " + internet.toString());
      if(!internet){

        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('OK');
        set_isPopUp(true);

      } else {
        props.clearObjects();
        updateTimer('EatingEnthusiasticComponent','Continue');
        navigation.navigate('EatingEnthusiasticComponent');
      }
      
    };

    // Navigates to Image Scoring page from Dashboard.
    const imageScoreAction = async () => {

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_imageScoring, firebaseHelper.screen_dashboard, "ImageScoring button clicked", "Internet Status: " + internet.toString());
      if(!internet){

        set_popUpAlert(Constant.ALERT_NETWORK);
        set_popUpMessage(Constant.NETWORK_STATUS);
        set_isPopupLeft(false);
        set_popUpRBtnTitle('OK');
        set_isPopUp(true);

      } else {
        props.clearObjects();
        updateTimer('SelectBSCScoringComponent','Continue');
        navigation.navigate('SelectBSCScoringComponent');
      }
     
    };

    const requestStoragePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          
        } else {
         
        }
      } catch (err) {
        console.warn(err);
      }
    };

    // Navigates to PDF view page/Browser based on selection(Document/Video) from Dashboard when pet is having Setup Pending/Device Missing.
    const supportBtnAction = (item) => {

      if(item.urlOrAnswer){

          if(item.materialTypeId === 3){
              updateTimer('PDFViewerComponent','Continue');
              navigation.navigate('PDFViewerComponent',{'pdfUrl' : item.urlOrAnswer,'title':item.titleOrQuestion})
          } else {
              Linking.openURL(item.urlOrAnswer);
          }
          
        }

    }

    return (
      <>
          <DashBoardUI 
              petsArray = {arrayPets}
              defaultPetObj = {props.defaultPetObj}
              activeSlide = {props.activeSlide}
              isTimer = {isTimer}
              timerObj = {props.timerObj}
              isLoading = {props.isLoading}
              isModularityService = {props.isModularityService}
              loaderMsg = {props.loaderMsg}
              isObsEnable = {props.isObsEnable}
              isQuestionnaireEnable = {props.isQuestionnaireEnable}
              isPTEnable = {props.isPTEnable}
              isTimerEnable = {isTimerEnable} 
              isFirstUser = {props.isFirstUser}
              isQuestLoading = {props.isQuestLoading}
              isPTLoading = {isPTLoading}
              isEatingEnthusiasm = {props.isEatingEnthusiasm}
              isImageScoring = {props.isImageScoring}
              isPetWeight = {props.isPetWeight}
              questionnaireData = {questionnaireData}
              questionnaireDataLength = {questionnaireDataLength}
              leaderBoardArray = {props.leaderBoardArray}
              leaderBoardPetId = {props.leaderBoardPetId}
              leaderBoardCurrent = {props.leaderBoardCurrent}
              campagainName = {props.campagainName}
              campagainArray = {props.campagainArray}
              popUpMessage = {popUpMessage}
              popUpAlert = {popUpAlert}
              isPopUp = {isPopUp}
              isPopupLeft = {isPopupLeft}
              enableLoader = {props.enableLoader}
              isSwipedModularity = {props.isSwipedModularity}
              setuPendingDetailsArray = {props.setuPendingDetailsArray}
              quickObservationAction = {quickObservationAction}
              quickSetupAction = {quickSetupAction}
              timerAction = {timerAction}
              settingsAction = {settingsAction}
              // chatBtnAction = {chatBtnAction}
              refreshDashBoardDetails = {refreshDashBoardDetails}
              setupDeviceAction = {setupDeviceAction}
              quickQuestionAction = {quickQuestionAction}
              quickQuestionnaireAction = {quickQuestionnaireAction}
              quickVideoAction = {quickVideoAction}
              popOkBtnAction = {popOkBtnAction}
              popCancelBtnAction = {popCancelBtnAction}
              editPetAction = {editPetAction}
              weightAction = {weightAction}
              devicesSelectionAction = {devicesSelectionAction}
              firmwareUpdateAction = {firmwareUpdateAction}
              enthusiasticAction = {enthusiasticAction}
              imageScoreAction = {imageScoreAction}
              supportBtnAction = {supportBtnAction}
            />
      </>
       
    );

  }
  
  export default DasBoardComponent;