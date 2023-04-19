import React, { useState, useEffect } from 'react';
import * as Queries from "../../config/apollo/queries";
import { useMutation } from "@apollo/react-hooks";
import { useLazyQuery } from "@apollo/react-hooks";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import InitialScreenUI from './initialScreenUI';
import messaging from '@react-native-firebase/messaging';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import SplashScreen from 'react-native-splash-screen';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());
let trace_inInitialScreen;
let trace_Get_Pets_API_Complete;
let trace_Login_API_Complete;
let trace_Get_UserDetails_API_Complete;

const InitialScreenComponent = ({ navigation, route, ...props }) => {

  /**
   * Login API : Validates the user and returns user email, token and client Id
   * GetPetDetails : by passing the client id after login, returns the pets information.
   * GetModularityDetails : By passing the client Id, returns the screen funtion names.
   */
  const [loginRequest, { loading: loginLoading, error: loginError, data: loginData },] = useMutation(Queries.GET_USER_LOGIN);
  const [getUserDetails, { loading: userDetailsLoading, error: userDetailsError, data: userDetailsData, },] = useLazyQuery(Queries.GET_CLIENT_INFO);

  const [clientId, set_clientId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderPercent, set_loaderPercent] = useState(10);
  const [internetStaus, set_internetStatus] = useState(true);

  useEffect(() => {

    set_loaderPercent(33);
    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_appInitial);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_appInitial, "User in App Initial Screen", '');

    setTimeout(() => {
      SplashScreen.hide();
      getInternetStatus();
      uploadMediaInitialisation();
    }, 3000)

    return () => {
      initialSessionStop();
    };

  }, []);


  /**
  * This useeffect returns the login success / failure info from Login API
  * Success : returns email,token,clientid will be saved and can be used across the app
  * User credentials will be saved for auto login feature after successfull login
  * when error a proper message will be shown to user
  */
   useEffect(() => {

    if (loginData) {
      stopFBTraceLogin();
      if (loginData.login && loginData.login.success && loginData.login.result) {
        firebaseHelper.logEvent(firebaseHelper.event_initial_login_success, firebaseHelper.screen_appInitial, "User auto log in success", 'Status : ' + loginData.login.responseMessage);
        setBasicValues(loginData.login.result.email, loginData.login.result.clientID, loginData.login.result.token);
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_initial_login_fail, firebaseHelper.screen_appInitial, "User auto log in fail", 'Reason : ' + loginData.login.responseMessage);
        set_isLoading(false);
        navigation.navigate('WelcomeComponent');
      }

    }

    if (loginError) {
      firebaseHelper.logEvent(firebaseHelper.event_initial_login_fail, firebaseHelper.screen_appInitial, "User auto log in fail", 'Reason : ' + loginError);
      stopFBTraceLogin();
      set_isLoading(false);
      navigation.navigate('WelcomeComponent');
    }

  }, [loginLoading, loginError, loginData]);

  useEffect(() => {

    if (userDetailsData) {
      saveUserDetails(userDetailsData.ClientInfo.result);
      firebaseHelper.logEvent(firebaseHelper.event_initial_user_details_success, firebaseHelper.screen_appInitial, "Getting User Details", 'Email : ' + userDetailsData.ClientInfo.result.email);
      stopFBTraceUserDetails();
    }

    if (userDetailsError) {
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_initial_user_details_fail, firebaseHelper.screen_appInitial, "Getting User Details", 'error : ' + userDetailsError);
      stopFBTraceUserDetails();
    }

  }, [userDetailsLoading, userDetailsError, userDetailsData]);

  const initialSessionStart = async () => {
    trace_inInitialScreen = await perf().startTrace('t_inInitialScreen');
  };

  const initialSessionStop = async () => {
    await trace_inInitialScreen.stop();
  };

  const stopFBTraceLogin = async () => {
    await trace_Login_API_Complete.stop();
  };

  const stopFBTraceUserDetails = async () => {
    await trace_Get_UserDetails_API_Complete.stop();
  };

  const getInternetStatus = async () => {

    // PushNotification.removeAllDeliveredNotifications();
    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_initial_internet_check, firebaseHelper.screen_appInitial, "Internet Check", 'Internet Status : ' + internet);
    if (internet) {

      set_internetStatus(true);
      getLoginStatus();

    } else {

      set_internetStatus(false);

    }
  }

  const uploadMediaInitialisation = async () => {

    firebaseHelper.logEvent(firebaseHelper.event_initial_background_upload, firebaseHelper.screen_appInitial, "Checking obs video uploads ", '');
    await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
    Apolloclient.client.writeQuery({ query: Queries.UPLOAD_VIDEO_BACKGROUND, data: { data: { obsData: 'checkForUploads', __typename: 'UploadVideoBackground' } }, });

  }

  const getLoginStatus = async () => {

    let userSkip = await DataStorageLocal.getDataFromAsync(Constant.IS_USER_SKIPPED);
    userSkip = JSON.parse(userSkip);

    let userLoggedIn = await DataStorageLocal.getDataFromAsync(Constant.IS_USER_LOGGED_INN);
    userLoggedIn = JSON.parse(userLoggedIn);

    if (userSkip) {

      if (userLoggedIn) {

        let userEmail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
        let userP = await DataStorageLocal.getDataFromAsync(Constant.USER_PSD_LOGIN);
        firebaseHelper.logEvent(firebaseHelper.event_initial_user_logged_status, firebaseHelper.screen_appInitial, "Checking User already logged", '');
        if (userEmail && userP) {
          getFCMToken(userEmail, userP);
        }

      } else {
        navigation.navigate('WelcomeComponent');
      }

    } else {
      navigation.navigate('InitialTutorialComponent');
    }

  };

  /**
   * Saving the email,Token,ClientId within the calss
   * Calling getPetDetails API using client Id
   */

  const setBasicValues = async (emailValue, clientIdValue, tokenValue) => {
    await DataStorageLocal.saveDataToAsync(Constant.APP_TOKEN, tokenValue);
    await DataStorageLocal.saveDataToAsync(Constant.CLIENT_ID, "" + clientIdValue);
    firebaseHelper.logEvent(firebaseHelper.event_initial_login_success, firebaseHelper.screen_appInitial, "User Client Id", 'Client id : ' + clientIdValue);
    
    set_loaderPercent(66);
    set_clientId(clientIdValue);
    getInitialPets(clientIdValue);
  };

  const getInitialPets = async (client) => {

    trace_Get_Pets_API_Complete = await perf().startTrace('t_Initial_Screen_Get_Pets_API');
    set_isLoading(true);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    fetch(EnvironmentJava.uri + "getPetDevicesByPetParent/" + client,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken": token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

      stopFBTraceGetPets();
      
      if (data && data.status.success) {
        
        if (data.response) {
          firebaseHelper.logEvent(firebaseHelper.event_initial_Pets_success, firebaseHelper.screen_appInitial, "Getting pets sucess", 'Client id : ' + client);
          let tempArray = [];
          set_petsArray(data.response.petDevices);
          if (data.response.petDevices.length > 0) {
            firebaseHelper.logEvent(firebaseHelper.event_initial_Pets_success, firebaseHelper.screen_appInitial, "Getting pets sucess", 'Total Pets : ' + data.response.petDevices.length);
            saveFirstTimeUser(false);
            set_isLoading(false);
            saveUserLogStatus();
            saveDefaultPet(data.response.petDevices);

          } else {
            firebaseHelper.logEvent(firebaseHelper.event_initial_Pets_success, firebaseHelper.screen_appInitial, "Getting pets sucess", 'Total Pets : ' + 0);
            saveFirstTimeUser(true);
            saveUserLogStatus();
          }

        }

      } else {
        set_isLoading(false);
        stopFBTraceGetPets();
      }

    }).catch((error) => {
      firebaseHelper.logEvent(firebaseHelper.event_initial_Pets_fail, firebaseHelper.screen_appInitial, "Getting pets unSucess", 'Error : ' + error);
      stopFBTraceGetPets();
      set_isLoading(false);
    });

  };

  const stopFBTraceGetPets = async () => {
    await trace_Get_Pets_API_Complete.stop();
  };

  const saveDefaultPet = async (arrayOfAllPets) => {

    set_loaderPercent(99);
    let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    let tempObj = undefined;
    if (defaultPet) {
      tempObj = defaultPet;
    } else {
      tempObj = arrayOfAllPets[0];
    }

    firebaseHelper.logEvent(firebaseHelper.event_initial_default_pet, firebaseHelper.screen_appInitial, "Default Pet", 'Pet id : ' + tempObj.petID);
    await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(tempObj));
    navigation.navigate("DashBoardService", { loginPets: arrayOfAllPets });
  }

  const saveUserLogStatus = async () => {
    firebaseHelper.logEvent(firebaseHelper.event_initial_user_status, firebaseHelper.screen_appInitial, "User Status", 'Status : ' + 'LoggedIn User');
    await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGED_INN, JSON.stringify(true));
  }

  const saveFirstTimeUser = async (value) => {
    await DataStorageLocal.saveDataToAsync(Constant.IS_FIRST_TIME_USER, JSON.stringify(value));
    if (value) {
      getUserDetailsDB();
    }
  };

  const getUserDetailsDB = async () => {

    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    if (client) {
      set_isLoading(true);
      let json = {
        ClientID: "" + client,
      };
      trace_Get_UserDetails_API_Complete = await perf().startTrace('t_Initial_Screen_Get_UserDetails_API');
      getUserDetails({ variables: { input: json } });
    }

  };

  const saveUserDetails = async (objUser) => {
    set_loaderPercent(99);
    if (objUser) {
      if (objUser) {

        if (objUser.firstName) {
          await DataStorageLocal.saveDataToAsync(Constant.SAVE_FIRST_NAME, objUser.firstName);
        }

        if (objUser.lastName) {
          await DataStorageLocal.saveDataToAsync(Constant.SAVE_SECOND_NAME, objUser.lastName);
        }

      }
    }

    set_isLoading(false);
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  /**
   *
   * @param {*} email
   * @param {*} password
   * @param {*} fcmToken (Firebase Notification)
   */
  const getFCMToken = async (email, password) => {
    serviceCall(email, password);
  };

  const serviceCall = async (email, password) => {

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await DataStorageLocal.saveDataToAsync(Constant.FCM_TOKEN, fcmToken);
    }

    set_isLoading(true);
    let json = {
      Email: email,
      Password: password,
      FCMToken: fcmToken,
    };

    trace_Login_API_Complete = await perf().startTrace('t_Initil_Page_Login_API');
    await loginRequest({ variables: { input: json } });

  }

  const callLoginAfterNet = () => {
    getInternetStatus();
  };

  return (
    <InitialScreenUI
      loaderPercent={loaderPercent}
      internetStaus={internetStaus}
      callLoginAfterNet={callLoginAfterNet}
    />

  );

}

export default InitialScreenComponent;