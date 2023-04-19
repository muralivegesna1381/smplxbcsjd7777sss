import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import AccountInfoUi from './accountInfoUI';
import { useLazyQuery } from "@apollo/react-hooks";
import * as Queries from "./../../config/apollo/queries";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as Constant from "./../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import VersionNumber from 'react-native-version-number';
import BuildEnv from "./../../config/environment/environmentConfig";
import * as Apolloclient from './../../config/apollo/apolloConfig';
var PushNotification = require("react-native-push-notification");
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inAccountService_Screen;
let trace_Account_API_Complete;

const Environment = JSON.parse(BuildEnv.Environment());

const AccountInfoService = ({ navigation, route, ...props }) => {

  const [getUserDetails, { loading: userDetailsLoading, error: userDetailsError, data: userDetailsData, },] = useLazyQuery(Queries.GET_CLIENT_INFO);

  const [email, set_email] = useState(undefined);
  const [fullName, set_fullName] = useState(undefined);
  const [phoneNo, set_phoneNo] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [isPopUpLeft, set_isPopUpLeft] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popAlert, set_popAlert] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [popBtnName, set_popBtnName] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [versionNumber, set_VersionNumber] = useState("");
  const [buildVersion, set_buildVersion] = useState("");
  const [enviName, set_enviName] = useState("");
  const [firstName, set_firstName] = useState('');
  const [secondName, set_secondName] = useState('');

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  //Fetches the Userdata from backend
  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    getDetailsDeviceDetails();
    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_account_main);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_dashboard, "User in Accounts Screen", '');
      getUserData();
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

    if (userDetailsData) {
        firebaseHelper.logEvent(firebaseHelper.event_account_main_api_success, firebaseHelper.screen_account_main, "Account Api Seccess", 'Email : ' + userDetailsData.ClientInfo.result.email);
        stopFBTrace();
        set_email(userDetailsData.ClientInfo.result.email);
        set_fullName(userDetailsData.ClientInfo.result.fullName);
        set_firstName(userDetailsData.ClientInfo.result.firstName);
        set_secondName(userDetailsData.ClientInfo.result.lastName);
        set_phoneNo(userDetailsData.ClientInfo.result.phoneNumber);
        set_isLoading(false);
        isLoadingdRef.current = 0;

    }

    if (userDetailsError) {
      firebaseHelper.logEvent(firebaseHelper.event_account_main_api_fail, firebaseHelper.screen_account_main, "Account Api Failed", 'error : '+userDetailsError);
      stopFBTrace();
      set_isLoading(false);
      isLoadingdRef.current = 0;
    }

  }, [userDetailsLoading, userDetailsError, userDetailsData]);

  // Android physical backbutton
  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_inAccountService_Screen = await perf().startTrace('t_inAccountsMainScreen');
  };

  const initialSessionStop = async () => {
    await trace_inAccountService_Screen.stop();
  };

  const stopFBTrace = async () => {
    await trace_Account_API_Complete.stop();
  };

  // Fetching the user data from backend by passing the clien id
  const getUserData = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    firebaseHelper.logEvent(firebaseHelper.event_account_main_api, firebaseHelper.screen_account_main, "Initiated the user details Api ", 'Client ID : ' + clientIdTemp);
    let json = {
      ClientID: "" + clientIdTemp,
    };
    trace_Account_API_Complete = await perf().startTrace('t_GetClientInfo_API');
    getUserDetails({ variables: { input: json } });

  };

  const getDetailsDeviceDetails = () => {
    set_VersionNumber("App Version : " + VersionNumber.appVersion);
    set_buildVersion("Build Version : " + VersionNumber.buildVersion);
    set_enviName(Environment.deviceConnectUrl.substring(0, 3));
  };

  const navigateToPrevious = () => {

    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      navigation.navigate('DashBoardService');
    } 
    
  };

  // Log out of the app
  const logOutAction = async () => {

    let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
    timerData = JSON.parse(timerData);

    let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
    obsData = JSON.parse(obsData);

    if (obsData && obsData.length > 0) {
      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when Observation is being uploaded", 'Email : '+email);
      set_popAlert('Sorry!');
      set_popUpMessage(Constant.UPLOAD_OBS_LOGOUT_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");

    } else if (timerData && (timerData.isTimerStarted || timerData.isTimerPaused)) {
      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User tried to logout when timer is running", 'Email : '+email);
      set_popAlert('Sorry!');
      set_popUpMessage(Constant.TIMER_LOGOUT_MSG);
      set_isPopUpLeft(false);
      set_popBtnName("OK");

    } else {
      set_popAlert('Alert');
      set_isPopUpLeft(true);
      set_popUpMessage(Constant.LOG_OUT_MSG);
      set_popBtnName("LOG OUT");
    }
    set_isPopUp(true);
    popIdRef.current=1;
  };

  // Navigations to edit Password, user name and phone number
  const btnAction = async (value) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit", 'Internet Status : '+ internet);
    if (!internet) {
      set_popAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUpLeft(false);
      set_isPopUp(true);
      popIdRef.current=1;

    } else {
      if (value === "Name") {
        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Name", 'Name : '+ fullName);
        navigation.navigate('UpdateNameService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo });
      } else if (value === "Phone Number") {
        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Phone", 'Phone : '+ phoneNo);
        navigation.navigate('UpdatePhoneService', { fullName: fullName, firstName: firstName, secondName: secondName, phoneNo: phoneNo });
      } else if (value === "Password") {
        firebaseHelper.logEvent(firebaseHelper.event_account_edit_action, firebaseHelper.screen_account_main, "User tried to edit Password", 'Email : '+ email);
        navigation.navigate('ChangePasswordComponent');
      }
    }
  };

  // Clears all the async saved data and logs out of the app
  const popOkBtnAction = async () => {

    set_isPopUp(false);
    popIdRef.current=0;
    if (popUpMessage.includes('logout')) {
      firebaseHelper.logEvent(firebaseHelper.event_account_logout, firebaseHelper.screen_account_main, "User logged out", 'Email : '+ email);
      Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP, data: { data: { isLogOut: 'logOut', __typename: 'LogOutApp' } }, });
      PushNotification.cancelAllLocalNotifications();
      await DataStorageLocal.removeDataFromAsync(Constant.IS_USER_LOGGED_INN);
      await DataStorageLocal.removeDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.APP_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.CLIENT_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.PET_ID);
      await DataStorageLocal.removeDataFromAsync(Constant.MODULATITY_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT);
      await DataStorageLocal.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.IS_FIRST_TIME_USER);
      await DataStorageLocal.removeDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.OBS_SELECTED_PET);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN);
      await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
      await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
      await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
      await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
      await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
      await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);

       //////// New ////////
       await DataStorageLocal.removeDataFromAsync(Constant.TOTAL_PETS_ARRAY);
       await DataStorageLocal.removeDataFromAsync(Constant.USER_PSD_LOGIN);
       await DataStorageLocal.removeDataFromAsync(Constant.FCM_TOKEN);
       await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
       await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS);
       await DataStorageLocal.removeDataFromAsync(Constant.SAVE_FIRST_NAME);
       await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SECOND_NAME);
       await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
       await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
       await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
       await DataStorageLocal.removeDataFromAsync(Constant.TIMER_DATA_FLOW_OBJ);
       await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
       await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
       await DataStorageLocal.removeDataFromAsync(Constant.SENOSR_INDEX_VALUE);
       await DataStorageLocal.removeDataFromAsync(Constant.MULTY_SENSOR_INDEX);

       await DataStorageLocal.removeDataFromAsync(Constant.VIDEO_PATH_OBSERVATION);
       await DataStorageLocal.removeDataFromAsync(Constant.DELETE_IMG);
       await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);
       await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
       await DataStorageLocal.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);
       await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
       await DataStorageLocal.removeDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
       await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
       await DataStorageLocal.removeDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
       await DataStorageLocal.removeDataFromAsync(Constant.CONFIGURED_WIFI_LIST);
       await DataStorageLocal.removeDataFromAsync(Constant.BEACON_INSTANCE_ID);

      navigation.navigate('WelcomeComponent');

    }

  };

  // Popup cancel action
  const popCancelBtnAction = (value) => {
    set_popAlert(undefined);
    set_popUpMessage(undefined);
    set_isPopUpLeft(false);
    set_isPopUp(false);
    popIdRef.current=0;
  };

  return (
    <AccountInfoUi
      email={email}
      phoneNo={phoneNo}
      fullName={fullName}
      firstName={firstName}
      secondName={secondName}
      popAlert={popAlert}
      popUpMessage={popUpMessage}
      isPopUp={isPopUp}
      popBtnName={popBtnName}
      isLoading={isLoading}
      isPopUpLeft={isPopUpLeft}
      versionNumber={versionNumber}
      buildVersion={buildVersion}
      enviName={enviName}
      navigateToPrevious={navigateToPrevious}
      logOutAction={logOutAction}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      btnAction={btnAction}
    />
  );

}

export default AccountInfoService;