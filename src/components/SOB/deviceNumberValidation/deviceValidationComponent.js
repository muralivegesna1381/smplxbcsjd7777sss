import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import DeviceValidationUI from './deviceValidationUI';
import * as Queries from "./../../../config/apollo/queries";
import { useMutation, useLazyQuery } from "@apollo/react-hooks";
import * as Constant from "./../../../utils/constants/constant";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck"
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import moment from "moment";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as ApolloClient from "./../../../config/apollo/apolloConfig";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_indeviceValidationScreen;
let trace_ValidateDeviceNumber_API_Complete;
let trace_Validate_DeviceNumber_API_Complete;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const DeviceValidationComponent = ({ navigation, route, ...props }) => {

  const [deviceNoRequest, { loading: dNoRequestLoading, error: dNoRequestError, data: dNoRequestData },] = useMutation(Queries.DEVICE_VALIDATION);
  // const [getPetDetails,{loading: getPatientInfoLoading,error: getPatientInfoError,data: getPatientInfoData,},] = useLazyQuery(Queries.GET_DEVICE_INFO,);

  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popupLeftBtnEnable, set_popupLeftBtnEnable] = useState(false);
  const [deviceNo, set_deviceNo] = useState(undefined);
  const [isDeviceValidated, set_isDeviceValidated] = useState(false);
  const [isLoading, set_isLoading] = useState(false);
  const [deviceType, set_deviceType] = useState(undefined);
  const [petId, set_petId] = useState(undefined);
  const [sobJson, set_sobJson] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [isFromType, set_isFromType] = useState(undefined);

  let petIdRef = useRef();
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_SOB_deviceNumber);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_deviceNumber, "User in Device Validation Screen", '');
        getPetIdValue();
        getSOBDetails();
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

    if (route.params?.value) {
      set_isFromType(route.params?.value);
    }

    if (route.params?.sensorType) {
      set_deviceType(route.params?.sensorType);
    }

  }, [route.params?.value, route.params?.deviceType]);

  useEffect(() => {

    if (dNoRequestData) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      stopDeviceFBTrace();
      if (dNoRequestData.deviceValidation.result.responseCode === "ERROR") {
        set_popUpTitle('Alert');
        set_popUpMessage(dNoRequestData.deviceValidation.result.message);
        set_popupLeftBtnEnable(false);
        set_isPopUp(true);
        popIdRef.current = 1;
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_success, firebaseHelper.screen_SOB_deviceNumber, "Device number Api Success", '');
        if (isFromType === 'AddDevice') {
          assigntheSensor();
        } else {
          navigateToReview();
        }

      }
    }

    if (dNoRequestError) {
      set_isLoading(false);
      isLoadingdRef.current = 0;
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Device number Api fail", 'error : ' + dNoRequestError);
      stopDeviceFBTrace();
    }

  }, [dNoRequestError, dNoRequestLoading, dNoRequestData]);

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_indeviceValidationScreen = await perf().startTrace('t_inDeviceValidationScreen');
  };

  const initialSessionStop = async () => {
    await trace_indeviceValidationScreen.stop();
  };

  const stopDeviceFBTrace = async () => {
    await trace_Validate_DeviceNumber_API_Complete.stop();
  };

  const getSOBDetails = async () => {

    let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
    sJson = JSON.parse(sJson);

    if (sJson) {
      set_sobJson(sJson);
      set_deviceType(sJson.deviceType);
      if (sJson.deviceNo) {

        set_deviceNo(sJson.deviceNo);
        set_isDeviceValidated(true);

      }
    }
  };

  const navigateToReview = async () => {

    let sobJson1 = {
      breedId: sobJson ? sobJson.breedId : '',
      breedName: sobJson ? sobJson.breedName : '',
      deviceNo: deviceNo,
      deviceType: sobJson ? sobJson.deviceType : '',
      gender: sobJson ? sobJson.gender : '',
      isNeutered: sobJson ? sobJson.isNeutered : '',
      petAge: sobJson ? sobJson.petAge : '',
      petName: sobJson ? sobJson.petName : '',
      knownAge: sobJson ? sobJson.knownAge : '',
      weight: sobJson ? sobJson.weight : '',
      weightType: sobJson ? sobJson.weightType : '',
      speciesId: sobJson ? sobJson.speciesId : '',
      speciesName: sobJson ? sobJson.speciesName : '',
      eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
    }
    await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_submit, firebaseHelper.screen_SOB_deviceNumber, "User entered Device Number", 'Device Number : ' + deviceNo);
    navigation.navigate('PetReviewComponent');
  };

  const getPetIdValue = async () => {

    let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    petObj = JSON.parse(petObj);
    if (petObj) {
      set_petId(petObj.petID);
      petIdRef.current = petObj.petID;
    }

  };

  const submitAction = async () => {

    let internet = await internetCheck.internetCheck();
    if (!internet) {
      set_popUpTitle(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_popupLeftBtnEnable(false);
      set_isPopUp(true);
      popIdRef.current = 1;
    } else {
      if (deviceType && deviceType.includes('HPN1')) {

        if (isFromType === 'AddDevice') {
          assigntheSensor();
        } else {
          navigateToReview();
        }

      } else {
        validateDeviceFromBackend();
      }

    }
  }

  const navigateToPrevious = () => {

    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_deviceNumber, "User clicked on back button to navigate to SensorTypeComponent", '');
      navigation.navigate('SensorTypeComponent');
    }
  };

  const popOkBtnAction = async (value) => {
    set_isPopUp(false);
    popIdRef.current = 0;
    set_popUpTitle(undefined);
    set_popUpMessage(undefined);
    set_popupLeftBtnEnable(false);

    if (value === "CONFIGURE") {
      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      updateDashboardDataOnConfigure()
      if (defaultPet && defaultPet.devices.length > 0) {

        for (let i = 0; i < defaultPet.devices.length; i++) {

          if (defaultPet.devices[i].deviceNumber && defaultPet.devices[i].deviceNumber !== '') {

            if (defaultPet.devices[i].deviceModel && defaultPet.devices[i].deviceModel.includes('HPN1')) {

              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'HPN1Sensor');
              await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, "" + i);

            } else {

              await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'Sensor');
              await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, "" + i);

            }

          }

        }

      }

      navigation.navigate('SensorInitialComponent', { defaultPetObj: defaultPet });
    }

  };

  const popCancelBtnAction = () => {
    set_isPopUp(false);
    popIdRef.current = 0;
    set_popUpTitle(undefined);
    set_popUpMessage(undefined);
    set_popupLeftBtnEnable(false);
    updateDashboardData();

  };

  const updateDashboardData = () => {
    ApolloClient.client.writeQuery({ query: Queries.UPDATE_DASHBOARD_DATA, data: { data: { isRefresh: 'refresh', __typename: 'UpdateDashboardData' } }, });
    navigation.navigate("DashBoardService");
  };

  const updateDashboardDataOnConfigure = () => {
    ApolloClient.client.writeQuery({ query: Queries.UPDATE_DASHBOARD_DATA, data: { data: { isRefresh: 'refresh', __typename: 'UpdateDashboardData' } }, });
  };

  const validateDeviceNo = (dNo) => {
    set_deviceNo(dNo.toUpperCase());

    if (deviceType.includes('HPN1')) {
      if (dNo.length > 18) {
        set_isDeviceValidated(true);
      } else {
        set_isDeviceValidated(false);
      }

    } else {
      if (dNo.length === 7) {
        validateSensor(dNo.toUpperCase());
      } else {
        set_isDeviceValidated(false);
      }
    }

  };

  /* User entered device number is validated through pre-defined validations
     * On success the device number will be validated again through service API
     * The abouve API validation is to check that the user entered Device number is associated to the current user ot not
     * if not an alert message will be shown to user
     */
  const validateSensor = (deviceNo) => {
    
    var value = deviceNo;
    var tempValue;

    var thisIsValid = true;
    if (value.length == 0) {
      thisIsValid = false;
    }

    if (thisIsValid) {

      tempValue = value.replace(/_/g, "").replace(/-/g, "");
      if (new RegExp(/[^0-9A-F]/g).test(tempValue)) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      if (value.replace(/_/g, "").length != 7) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      var lastChar = tempValue.substr(tempValue.length - 1, 1);
      tempValue = "0C8A87" + tempValue.substr(0, tempValue.length - 1);

      var hex;
      var sum = 0;
      var n = 16;
      var checkedChar = "";

      for (var i = tempValue.length - 1; i >= 0; i--) {
        var currentValue = 0;
        var codePoint = parseInt(tempValue.substr(i, 1), n);
        if ((i + 1) % 2 == 0) {
          hex = (codePoint * 2).toString(n);
          for (var j = 0; j < hex.length; j++) {
            if (isFinite(hex.substr(j, 1))) {
              currentValue += parseInt(hex.substr(j, 1));
            } else {
              currentValue += parseInt(hex.substr(j, 1), n);
            }
          }
        } else {
          currentValue += codePoint;
        }
        sum += currentValue;
      }
      if (sum % 16 > 0) {
        checkedChar = 16 - (sum % 16);
      } else {
        checkedChar = 0;
      }

      if (checkedChar.toString(n).toUpperCase() != lastChar) {
        thisIsValid = false;
      }
    }

    if (thisIsValid) {
      set_isDeviceValidated(true);
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_Sequence_validation, firebaseHelper.screen_SOB_deviceNumber, "Validating Device number sequence", 'Validated : Valid Device Number');
    } else {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_Sequence_validation, firebaseHelper.screen_SOB_deviceNumber, "Validating Device number sequence", 'Validated : InValid Device Number');
      set_popUpTitle('Alert');
      set_popUpMessage("Please enter Valid Device Number (DN)");
      set_popupLeftBtnEnable(false);
      set_isDeviceValidated(false);
      set_isPopUp(true);
      popIdRef.current = 1;
    }

  };

  const validateDeviceFromBackend = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_number_api, firebaseHelper.screen_SOB_deviceNumber, "Checks the Device number from backend Initialising : " + deviceNo, 'Client Id : ' + Constant.CLIENT_ID);
    let json = {
      SensorNumber: "" + deviceNo,
      ClientID: "" + clientID,
    };
    trace_Validate_DeviceNumber_API_Complete = await perf().startTrace('t_ValidateDeviceNumber_API');
    await deviceNoRequest({ variables: { input: json } });

  };

  const assigntheSensor = async () => {
    // set_isLoading(true);
    let clientID = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    petObj = JSON.parse(petObj);
    let newDate = moment(new Date()).format("YYYY-MM-DD")
    var finalJSON = {
      "petId": petObj.petID,
      "petParentId": clientID,
      "deviceNumber": deviceNo,
      "deviceType": "Sensor" + "###" + deviceType,
      "assignedDate": newDate
    };

    firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Flow : " + deviceNo, 'pet Id : ' + petObj.petID);
    configurePetBackendAPI(finalJSON,petObj.petID);
  };

  const configurePetBackendAPI = async (json,petid) => {

    trace_ValidateDeviceNumber_API_Complete = await perf().startTrace('t_AssignSensorToPet_API');
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);;
    fetch(EnvironmentJava.uri + 'assignSensorToPet', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "ClientToken": token,
      },
      body: JSON.stringify(json),
    }).then((response) => response.json()).then(async (data) => {
      // set_isLoading(false);
      stopFBTrace();
      if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

      if (data.status.success) {
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_success, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Success", '');
        // set_popUpTitle('Congratulations!');
        // set_popUpMessage(Constant.SENSOR_ASSIGN_PET_SUCCESS_MSG);
        // set_popupLeftBtnEnable(true);
        // set_isPopUp(true);
        // popIdRef.current = 1;
        getDefaultPet(petid);

      } else {

        set_isLoading(false);
        if (data.errors[0].message !== '' && data.errors[0].message) {

          set_popUpTitle(Constant.ALERT_DEFAULT_TITLE);
          set_popUpMessage(data.errors[0].message);
          set_popupLeftBtnEnable(false);
          set_isPopUp(true);
          popIdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : ' + data.errors[0].message);
        } else {

          set_popUpTitle(Constant.ALERT_DEFAULT_TITLE);
          set_popUpMessage(Constant.SERVICE_FAIL_MSG);
          set_popupLeftBtnEnable(false);
          set_isPopUp(true);
          popIdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : ' + Constant.SERVICE_FAIL_MSG);
        }

      }
    })
      .catch((error) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popUpTitle(Constant.ALERT_DEFAULT_TITLE);
        set_popUpMessage(Constant.SERVICE_FAIL_MSG);
        set_popupLeftBtnEnable(false);
        set_isPopUp(true);
        popIdRef.current = 1;
        firebaseHelper.logEvent(firebaseHelper.event_SOB_device_numbe_missing_assign_api_fail, firebaseHelper.screen_SOB_deviceNumber, "Assigning the Device number Device missing Api Fail", 'error : ' + error);
        stopFBTrace();
      });
  };

  const getDefaultPet = async (petid) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

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

      set_isLoading(false);
      isLoadingdRef.current = 0;
      if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

      if (data && data.status.success) {
        if (data.response) {
          setDefaultPet(data.response.petDevices,petid);
          set_popUpTitle('Congratulations!');
          set_popUpMessage(Constant.SENSOR_ASSIGN_PET_SUCCESS_MSG);
          set_popupLeftBtnEnable(true);
          set_isPopUp(true);
          popIdRef.current = 1;
        }

      } else {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popUpTitle('Alert');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      }

    }).catch((error) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      });

  };

  const setDefaultPet = async (pets, petId) => {

    let obj = findArrayElementByPetId(pets, petId);
    await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(obj));
    await DataStorageLocal.saveDataToAsync(Constant.TOTAL_PETS_ARRAY, JSON.stringify(pets));

  };

  function findArrayElementByPetId(pets, petId) {
    return pets.find((element) => {
      return element.petID === petId;
    })
  };

  const stopFBTrace = async () => {
    await trace_ValidateDeviceNumber_API_Complete.stop();
  };

  return (
    <DeviceValidationUI
      isDeviceValidated={isDeviceValidated}
      deviceNo={deviceNo}
      deviceType={deviceType}
      isLoading={isLoading}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      popupLeftBtnEnable={popupLeftBtnEnable}
      popOkBtnAction={popOkBtnAction}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
      validateDeviceNo={validateDeviceNo}
      popCancelBtnAction={popCancelBtnAction}
    />
  );

}

export default DeviceValidationComponent;