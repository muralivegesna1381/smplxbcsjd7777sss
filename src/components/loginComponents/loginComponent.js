import React, { useState, useEffect,useRef } from 'react';
import { View, NativeModules, Platform,BackHandler } from 'react-native';
import LoginUI from './loginUi';
import * as ApolloClient from "../../config/apollo/apolloConfig";
import * as Queries from "../../config/apollo/queries";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { useLazyQuery } from "@apollo/react-hooks";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import messaging from '@react-native-firebase/messaging';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

let trace_inLoginScreen;
let trace_Login_Get_Pets_API_Complete;
let trace_Login_API_Complete;
let trace_Login_Get_UserDetails_API_Complete;

const LoginComponent = ({ navigation, route, ...props }) => {

  /**
   * Login API : Validates the user and returns user email, token and client Id
   * GetPetDetails : by passing the client id after login, returns the pets information.
   * GetModularityDetails : By passing the client Id, returns the screen funtion names.
   */
  const [loginRequest, { loading: loginLoading, error: loginError, data: loginData },] = useMutation(Queries.GET_USER_LOGIN);
  // const [getPetDetails, { loading: getPatientInfoLoading, error: getPatientInfoError, data: getPatientInfoData, },] = useLazyQuery(Queries.GET_DEVICE_INFO,);
  // const [getModularityDetails, { loading: getModularityLoading, error: getModularityError, data: getModularityData, },] = useLazyQuery(Queries.GET_MODULARITY_DETAILS);
  const [getUserDetails, { loading: userDetailsLoading, error: userDetailsError, data: userDetailsData, },] = useLazyQuery(Queries.GET_CLIENT_INFO);

  const [clientId, set_clientId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [psdEncrypt, set_psdEncrypt] = useState(undefined);
  const [firstTimeUser, set_firstTimeUser] = useState(false);
  const [date, set_Date] = useState(new Date());

  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  React.useEffect(() => {

    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

    const focus = navigation.addListener("focus", () => {
      set_Date(new Date());
      loginSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_login);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_login, "User in Login Screen", ''); 
      
    });

    const unsubscribe = navigation.addListener('blur', () => {
      loginSessionStop();
    });

    return () => {
      loginSessionStop();
      focus();
      unsubscribe();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  /**
  * This useeffect returns the login success / failure info from Login API
  * Success : returns email,token,clientid will be saved and can be used across the app
  * User credentials will be saved for auto login feature after successfull login
  * when error a proper message will be shown to user
  */
  useEffect(() => {

    console.log('Login ', loginData)
    if (loginData) {
      stopFBTraceLogin();
      if (loginData.login.success && loginData.login.result) {
        setBasicValues(loginData.login.result.email, loginData.login.result.clientID, loginData.login.result.token);
        firebaseHelper.logEvent(firebaseHelper.event_login_success, firebaseHelper.screen_login, "Login Service Success", 'email : ', loginData.login.result.email);
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_login_fail, firebaseHelper.screen_login, "Login Service Fail", 'Invali Credentials');
        set_popUpAlert(Constant.LOGIN_FAILED_ALERT);
        set_popUpMessage(Constant.LOGIN_FAILED_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
        set_isLoading(false);
        isLoadingdRef.current = 0;
      }

    }

    if (loginError) {
      firebaseHelper.logEvent(firebaseHelper.event_login_fail, firebaseHelper.screen_login, "Login Service Fail", 'Login service fail' + loginError);
      stopFBTraceLogin();
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_popUpAlert(Constant.LOGIN_FAILED_ALERT);
      set_popUpMessage(Constant.LOGIN_FAILED_MSG);
      set_isPopUp(true);
      popIdRef.current = 1;
    }

  }, [loginLoading, loginError, loginData]);

  // Getting the user details in responce
  useEffect(() => {

    console.log('userDetailsData ', userDetailsData)
    if (userDetailsData) {
      stopFBTraceUserDetails();
      saveUserDetails(userDetailsData.ClientInfo.result);

    }

    if (userDetailsError) {
      stopFBTraceUserDetails();
      set_isLoading(false);
      isLoadingdRef.current = 0;
    }

  }, [userDetailsLoading, userDetailsError, userDetailsData]);

  const loginSessionStart = async () => {
    trace_inLoginScreen = await perf().startTrace('t_inLoginScreen');
  };

  const loginSessionStop = async () => {
    await trace_inLoginScreen.stop();
  };

  const stopFBTraceLogin = async () => {
    await trace_Login_API_Complete.stop();
  };

  const stopFBTraceUserDetails = async () => {
    await trace_Login_Get_UserDetails_API_Complete.stop();
  };

  /**
   * Saving the email,Token,ClientId within the calss
   * Calling getPetDetails API using client Id
   */

  const setBasicValues = async (emailValue, clientIdValue, tokenValue) => {

    await DataStorageLocal.saveDataToAsync(Constant.APP_TOKEN, tokenValue);
    await DataStorageLocal.saveDataToAsync(Constant.CLIENT_ID, "" + clientIdValue);
    await DataStorageLocal.saveDataToAsync(Constant.USER_EMAIL_LOGIN, "" + emailValue);
    await DataStorageLocal.saveDataToAsync(Constant.USER_PSD_LOGIN, "" + psdEncrypt);
    set_clientId(clientIdValue);

    firebaseHelper.setUserId(emailValue + "");
    firebaseHelper.setUserProperty(emailValue + "", clientIdValue + "");
    getLoginPets(clientIdValue);

  };

  // Getting the Pets details of the user from backend
  const getLoginPets = async (client) => {
    
    trace_Login_Get_Pets_API_Complete = await perf().startTrace('t_Login_Screen_Get_Pets_API');
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    set_isLoading(true);
    isLoadingdRef.current = 1;
    
    console.log('getLoginPets ', EnvironmentJava.uri + "getPetDevicesByPetParent/" + client)
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
      console.log('getLoginPets ', getLoginPets)
      set_isLoading(false);
      isLoadingdRef.current = 0;
      stopFBTraceGetPets();

      if (data && data.status.success) {
        
        if (data.response) {
          
          firebaseHelper.logEvent(firebaseHelper.event_login_getPets_success, firebaseHelper.screen_login, "Login Getpets Service Success", 'Getting pet details success in Login' + data.status.success);
          let tempArray = [];
          set_petsArray(data.response.petDevices);
          if (data.response.petDevices.length > 0) {
            set_firstTimeUser(false);
            saveFirstTimeUser(false);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            saveUserLogStatus();
            saveDefaultPet(data.response.petDevices);

          } else {
            firebaseHelper.logEvent(firebaseHelper.event_login_getPets_success, firebaseHelper.screen_login, "Login Getpets Service Success", 'User Total Pets : ' + '0');
            set_firstTimeUser(true);
            saveFirstTimeUser(true, client);
            saveUserLogStatus();
          }

        }

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_login_getPets_fail, firebaseHelper.screen_login, "Login Getpets Service Fail", 'Unable to fetch Pet details' + data.status.success);
        stopFBTraceGetPets();
        set_isLoading(false);
        set_popUpAlert(Constant.ALERT_DEFAULT_TITLE);
        set_popUpMessage(Constant.SERVICE_FAIL_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      }

    }).catch((error) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        firebaseHelper.logEvent(firebaseHelper.event_login_getPets_fail, firebaseHelper.screen_login, "Login Getpets Service Fail", 'Unable to fetch Pet details' + error);
        stopFBTraceGetPets();
        set_popUpAlert(Constant.ALERT_DEFAULT_TITLE);
        set_popUpMessage(Constant.SERVICE_FAIL_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
    });

  };

  const stopFBTraceGetPets = async () => {
    await trace_Login_Get_Pets_API_Complete.stop();
  };

  // Saves the User details
  const saveUserDetails = async (objUser) => {

    if (objUser) {

      if (objUser.firstName) {
        await DataStorageLocal.saveDataToAsync(Constant.SAVE_FIRST_NAME, objUser.firstName);
      }

      if (objUser.lastName) {
        await DataStorageLocal.saveDataToAsync(Constant.SAVE_SECOND_NAME, objUser.lastName);
      }

    }

    set_isLoading(false);
    isLoadingdRef.current = 0;
    if (firstTimeUser) {
      navigation.navigate("AppOrientationComponent", { loginPets: petsArray, isFromScreen: 'LoginPage' });
    } else {
      updateDashboardData(petsArray);
    }

  };

  // Saves the pet that has Setup done as a default pet
  const saveDefaultPet = async (arrayOfAllPets) => {

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
    if (firstTimeUser) {
      navigation.navigate("AppOrientationComponent", { loginPets: arrayOfAllPets, isFromScreen: 'LoginPage' });
    } else {
      updateDashboardData(petsArray);
      // navigation.navigate("DashBoardService", { loginPets: arrayOfAllPets });
    }

  }

  // Saves the User details
  const saveUserLogStatus = async () => {
    await DataStorageLocal.saveDataToAsync(Constant.IS_USER_LOGGED_INN, JSON.stringify(true));
  }

  // When user has no pets, saves the status as First time user
  const saveFirstTimeUser = async (value, client) => {

    await DataStorageLocal.saveDataToAsync(Constant.IS_FIRST_TIME_USER, JSON.stringify(value));
    if (value) {
      getUserDetailsDB(client);
    }

  };

  // Api to fetch the user details
  const getUserDetailsDB = async (client) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let json = {
      ClientID: "" + client,
    };
    trace_Login_Get_UserDetails_API_Complete = await perf().startTrace('t_Login_Screen_Get_UserDetails_API');
    getUserDetails({ variables: { input: json } });

  };

  /**
   * Fetching the fcm token generated from firebase
   * @param {*} email
   * @param {*} psd
   * @param {*} fcmToken (Firebase Notification)
   */
  const getFCMToken = (email, psd) => {

    if (Platform.OS === 'android') {
      //If the user is using an android device
      NativeModules.Device.getDeviceName(psd, (convertedVal) => {
        set_psdEncrypt(convertedVal);
        validateLogin(email, convertedVal);
      });

    }
    else {
      //If the user is using an iOS device
      NativeModules.EncryptPassword.encryptPassword(psd, (value) => {
        set_psdEncrypt(value);
        validateLogin(email, value);
      })
    }

  };

  // Login API
  const validateLogin = async (email, psd) => {

    const fcmToken = await messaging().getToken();
    if (fcmToken) {
      await DataStorageLocal.saveDataToAsync(Constant.FCM_TOKEN, fcmToken);
    }
    set_isLoading(true);
    isLoadingdRef.current = 1;
    set_loaderMsg(Constant.LOGIN_LOADER_MSG);

    let json = {
      Email: email,
      Password: psd,
      FCMToken: fcmToken,
    };
    firebaseHelper.logEvent(firebaseHelper.event_login, firebaseHelper.screen_login, "Login button clicked", "email: " + email);
    trace_Login_API_Complete = await perf().startTrace('t_Login_Screen_Login_API');
    await loginRequest({ variables: { input: json } });

  }

  // Login Action
  const loginAction = async (email, psd) => {

    let internet = await internetCheck.internetCheck();
    if (!internet) {
      set_popUpAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUp(true);
      popIdRef.current = 1;
    } else {
      getFCMToken(email, psd);
    }

  }

  // Navigates to Forgot psd
  const forgotPswdAction = async (userEmail) => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_login_forgotPswd, firebaseHelper.screen_login, "Forgot Password button clicked", "Internet Status: " + internet.toString());
    if (!internet) {
      set_popUpAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUp(true);
      popIdRef.current = 1;
    } else {

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if (userEmail) {
        if (re.test(userEmail.replace(/ /g, ''))) {
          navigation.navigate("ForgotPasswordComponent", { userEmail: userEmail });
        } else {
          navigation.navigate("ForgotPasswordComponent", { userEmail: undefined });
        }
      } else {
        navigation.navigate("ForgotPasswordComponent", { userEmail: undefined });
      }

    }

  };

  const updateDashboardData = (petsArray) => {
    // ApolloClient.client.writeQuery({ query: Queries.UPDATE_DASHBOARD_DATA, data: { data: { isRefresh: 'refresh', __typename: 'UpdateDashboardData' } }, });
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  // Navigates to Registration process
  const registerAction = async () => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_login_registration, firebaseHelper.screen_login, "Registration button clicked", "Internet Status: " + internet.toString());
    if (!internet) {
      set_popUpAlert(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUp(true);
      popIdRef.current = 1;
    } else {
      navigation.navigate("PetParentProfileComponent");
    }

  };

  // Popup Actions
  const popOkBtnAction = async () => {
    set_popUpMessage(undefined);
    set_isPopUp(false);
    popIdRef.current = 0;
  };

  const handleBackButtonClick = () => {
    backBtnAction();
    return true;
  };

  const backBtnAction = () => {

    if(isLoadingdRef.current === 0 && popIdRef.current === 0){
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_login, "User clicked on back button to navigate to WelcomeComponent", '');
      navigation.navigate("WelcomeComponent");
    } else {
     
    }
    
  };

  return (
    <LoginUI
      isLoading={isLoading}
      loaderMsg={loaderMsg}
      popUpAlert={popUpAlert}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      loginAction={loginAction}
      forgotPswdAction={forgotPswdAction}
      registerAction={registerAction}
      popOkBtnAction={popOkBtnAction}
      backBtnAction = {backBtnAction}

    />
  );

}

export default LoginComponent;