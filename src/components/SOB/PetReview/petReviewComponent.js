import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import PetReviewUI from './petReviewUI';
import { useLazyQuery, useMutation } from "@apollo/react-hooks";
import * as Queries from "./../../../config/apollo/queries";
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from "./../../../utils/constants/constant";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as ApolloClient from "./../../../config/apollo/apolloConfig";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_in_petReview_Screen;
let trace_Submit_SOB_Details_Api_Complete;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const PetReviewComponent = ({ navigation, route, ...props }) => {

  const [getUserDetails, { loading: userDetailsLoading, error: userDetailsError, data: userDetailsData, },] = useLazyQuery(Queries.GET_CLIENT_INFO);
  const [sobRequest, { loading: sobLoading, error: sobError, data: sobData },] = useMutation(Queries.ON_BOARD_PET);
  const [getPetDetails, { loading: getPetInfoLoading, error: getPetInfoError, data: getPetInfoData, },] = useLazyQuery(Queries.GET_DEVICE_INFO);

  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpTitle, set_popUpTitle] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popLeftTitle, set_popLeftTitle] = useState(false);
  const [popRightTitle, set_popRightTitle] = useState(false);
  const [sobJson, set_sobJson] = useState(undefined);
  const [isLoading, set_isLoading] = useState(false);
  const [email, set_email] = useState(undefined);
  const [name, set_name] = useState(undefined);
  const [phNo, set_phNo] = useState(undefined);
  const [petId, set_petId] = useState(undefined);
  const [petsArray, set_petsArray] = useState(undefined);
  const [defaultPet, set_defaultPet] = useState(undefined);
  const [firstName, set_firstName] = useState(undefined);
  const [lastName, set_lastName] = useState(undefined);
  const [isSOBSubmitted, set_isSOBSubmitted] = useState(false);

  let petIdRef = useRef();
  let popIdRef = useRef(0);
  let isLoadingdRef = useRef(0);

  useEffect(() => {
    initialSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_SOB_Review);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_Review, "User in SOB Pet Review selection Screen", '');
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    getUserData();
    getSOBDetails();
    return () => {
      initialSessionStop();
      BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
    };

  }, []);

  useEffect(() => {

    if (userDetailsData) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_userData_api_Success, firebaseHelper.screen_SOB_Review, "Getting Userdata in Review page success", '');
      set_name(userDetailsData.ClientInfo.result.fullName);
      set_firstName(userDetailsData.ClientInfo.result.firstName);
      set_lastName(userDetailsData.ClientInfo.result.lastName);
      set_email(userDetailsData.ClientInfo.result.email);
      set_phNo(userDetailsData.ClientInfo.result.phoneNumber);
      set_isLoading(false);
      isLoadingdRef.current = 0;
    }

    if (userDetailsError) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_userData_api_fail, firebaseHelper.screen_SOB_Review, "Getting Userdata in Review page Fail", 'error : ' + userDetailsError);
      set_isLoading(false);
      isLoadingdRef.current = 0;
    }

  }, [userDetailsLoading, userDetailsError, userDetailsData]);

  useEffect(() => {

    if (sobData) {

      stopFBTrace();
      if (sobData.onBoardPet.success) {
        firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_Success, firebaseHelper.screen_SOB_Review, "Onboarding Api Success", '');
        set_petId(sobData.onBoardPet.result.petID);
        petIdRef.current = sobData.onBoardPet.result.petID;
        saveFirstTimeUser(false);
        set_isSOBSubmitted(true);
        getUserPets();
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api Success", 'Service Issue');
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;

      }

    }

    if (sobError) {
      firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api_fail, firebaseHelper.screen_SOB_Review, "Onboarding Api Success", 'error : ' + sobError);
      stopFBTrace();
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_isSOBSubmitted(false);
      set_popUpTitle('Alert');
      set_popLeftTitle('CANCEL');
      set_popRightTitle('OK');
      set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
      set_isPopUp(true);
      popIdRef.current = 1;
    }

  }, [sobData, sobError, sobLoading]);

  useEffect(() => {

    if (getPetInfoData && getPetInfoData.SensorInfo.result) {

      setDefaultPet(getPetInfoData.SensorInfo.result, petId);
      set_petsArray(getPetInfoData.SensorInfo.result);
      set_isLoading(false);
      isLoadingdRef.current = 0;
      set_popUpTitle('Congratulations');
      set_popLeftTitle('CANCEL');
      set_popRightTitle('OK');
      set_popUpMessage(Constant.PET_CREATE_SUCCESS_MSG);
      set_isPopUp(true);
      popIdRef.current = 1;
    }

    if (getPetInfoError) {

      set_isLoading(false);
      isLoadingdRef.current = 0;
    }

  }, [getPetInfoData, getPetInfoError, getPetInfoLoading]);

  const stopFBTrace = async () => {
    await trace_Submit_SOB_Details_Api_Complete.stop();
  };

  const handleBackButtonClick = () => {
    navigateToPrevious();
    return true;
  };

  const initialSessionStart = async () => {
    trace_Submit_SOB_Details_Api_Complete = await perf().startTrace('t_inSOBReviewScreen');
  };

  const initialSessionStop = async () => {
    await trace_Submit_SOB_Details_Api_Complete.stop();
  };

  const getSOBDetails = async () => {

    let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
    sJson = JSON.parse(sJson);
    if (sJson) {
      set_sobJson(sJson);
    }

  };

  const getUserData = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let json = {
      ClientID: "" + clientIdTemp,
    };
    getUserDetails({ variables: { input: json } });

  };

  const submitAction = async () => {
    jsonSerivceAPICall();
  };

  const setDefaultPet = async (pets, petId) => {

    let obj = findArrayElementByPetId(pets, petId);
    set_defaultPet(obj);
    await DataStorageLocal.saveDataToAsync(Constant.DEFAULT_PET_OBJECT, JSON.stringify(obj));

  }

  function findArrayElementByPetId(pets, petId) {
    return pets.find((element) => {
      return element.petID === petId;
    })
  };

  const getUserPets = async () => {

    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    getSOBPets(clientId);

  };

  const getSOBPets = async (client) => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
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

      set_isLoading(false);
      isLoadingdRef.current = 0;
      if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

      if (data && data.status.success) {
        if (data.response) {
          setDefaultPet(data.response.petDevices, petIdRef.current);
          set_petsArray(data.response.petDevices);
          sendFeedingPrefsToBackend();
        }

      } else {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      }

    })
      .catch((error) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      });

  };

  const jsonSerivceAPICall = async () => {

    let internet = await internetCheck.internetCheck();
    firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api, firebaseHelper.screen_SOB_Review, "Initiating the Onboarding Pet Api", 'Internet Status : ' + internet);
    if (!internet) {

      set_popLeftTitle('');
      set_popRightTitle('OK');
      set_popUpTitle(Constant.ALERT_NETWORK);
      set_popUpMessage(Constant.NETWORK_STATUS);
      set_isPopUp(true);
      popIdRef.current = 1;
      return;

    }

    var todayDate = new Date();
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    firebaseHelper.logEvent(firebaseHelper.event_SOB_review_api, firebaseHelper.screen_SOB_Review, "Initiating the Onboarding Pet Api : " + clientId, 'Internet Status : ' + internet);
    if (sobJson) {

      let spayedVal = sobJson.isNeutered === "YES" ? true : false;
      let unknownVal = sobJson.knownAge ? true : false;
      let sensorType = sobJson.deviceType;

      var finalJSON = {
        About: {
          PetID: "",
          PetName: sobJson.petName,
          PetBirthday: sobJson.petAge,
          PetGender: sobJson.gender,
          IsNeutered: spayedVal + "",
          PetWeight: sobJson.weight + "",
          WeightUnit: sobJson.weightType,
          PetBFI: "",
          PetAge: "",
          IsMixed: "false",
          PetBreedID: sobJson.breedId + "",
          PetBreedName: sobJson.breedName,
          PetMixBreed: "",
          IsUnknown: unknownVal + "",
          ExtPatientID: "",
          ExtPatientIDValue: "",
        },
        Plan: {
          PlanTypeID: "55",
          IsFree: "false",
          IsPickup: "false",
          IsApplyCoupon: "false",
          IsJoinCompetition: "false",
          DiagnosisData: [
            {
              DiagnosisTypeID: "3677",
              DiagnosisOrder: "1",
              DiagnosisTypeName: "None",
              DiagnosisDateTime: null,
              TreatmentCount: "0",
              Treatment: [],
            },
          ],
        },

        Goals: {
          GoalData: [],
        },

        Device: {
          SensorAssigned: false,
          SensorNumber: sobJson.deviceNo,
          BasestationNumber: null,
          DeviceAddDate: todayDate.toString(),
          DeviceType: "Sensor" + "###" + sensorType,
        },

        Client: {
          ClientID: clientId + "",
          ClientEmail: email,
          ClientFullName: name,
          ClientFirstName: firstName,
          ClientLastName: lastName,
          ClientPhone: phNo,
        },

        Billing: {
          Token: "",
          CustomerID: "",
          SubscriptionID: "",
          IsFree: false,
        },

        BillingAddress: {
          ClientShippingAddressID: null,
          Address1: "",
          Address2: "",
          ClientID: null,
          StateCode: "",
          City: "",
          ZipCode: "",
          Country: null,
          CountryCode: "US",
          FullName: "",
        },

        Products: [],

        ProductSubscription: {
          SubscriptionFrequency: "",
          FirstShippentInterval: "",
          EstimateOrderTotal: "",
          EstitmateOrderTax: "0",
          EstimatedOrderShipping: "",
        },
      };

    }
    ////// JSON preparation, all the data entered by user is validated and then preparing the JSON ////////  
    /////// Sending this JSON to backend service API ///////
    set_isLoading(true);
    isLoadingdRef.current = 1;
    trace_Submit_SOB_Details_Api_Complete = await perf().startTrace('t_CompleteOnboardingInfo_API');
    await sobRequest({ variables: { input: finalJSON } });
  };

  const sendFeedingPrefsToBackend = async () => {

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    let tempArray = []
    if (sobJson) {
      for (let i = 0; i < sobJson.eatTimeArray.length; i++) {
        tempArray.push(sobJson.eatTimeArray[i].feedingPreferenceId)
      }
    }

    let obj = {

      "petId": petIdRef.current,
      "userId": clientId,
      "petFeedingPreferences": tempArray

    };

    fetch(EnvironmentJava.uri + "pets/addPetFeedingPreferences/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken": token
        },
        body: JSON.stringify(obj)
      }
    ).then((response) => response.json()).then(async (data) => {

      set_isLoading(false);
      isLoadingdRef.current = 0;
      if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

      if (data && data.status.success) {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_popUpTitle('Congratulations');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_SUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;

      } else {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      }

    })
      .catch((error) => {
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isSOBSubmitted(false);
        set_popUpTitle('Alert');
        set_popLeftTitle('CANCEL');
        set_popRightTitle('OK');
        set_popUpMessage(Constant.PET_CREATE_UNSUCCESS_MSG);
        set_isPopUp(true);
        popIdRef.current = 1;
      });

  };

  const navigateToPrevious = () => {

    if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
      firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_SOB_Review, "User clicked on back button to navigate to DeviceValidationComponent", '');
      navigation.navigate('DeviceValidationComponent');
    }

  }

  const popOkBtnAction = () => {

    if (popUpMessage === Constant.PET_CREATE_SUCCESS_MSG) {

      set_popLeftTitle('LATER');
      set_popRightTitle('YES');
      set_popUpTitle('Thank You');
      set_popUpMessage('Would you like to setup your pet now?');
      set_isPopUp(true);
      popIdRef.current = 1;

    } else if (popUpMessage === 'Would you like to setup your pet now?') {

      if (popRightTitle === 'YES') {
        savePetsForDashBoardAfterNotiSetting(petsArray);
      } else {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popLeftTitle('');
        set_popRightTitle('');
        set_popUpTitle('');
        set_popUpMessage('');

      }

    } else {

      set_isPopUp(false);
      popIdRef.current = 0;
      set_popLeftTitle('CANCEL');
      set_popRightTitle('OK');
      set_popUpTitle(undefined);
      set_popUpMessage(undefined);

    }

  };

  const popCancelBtnAction = () => {
    removeOnboardData();
    updateDashboardData(petsArray);
  };

  const updateDashboardData = (petsArray) => {
    ApolloClient.client.writeQuery({ query: Queries.UPDATE_DASHBOARD_DATA, data: { data: { isRefresh: 'refresh', __typename: 'UpdateDashboardData' } }, });
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  const saveFirstTimeUser = async (value) => {
    await DataStorageLocal.saveDataToAsync(Constant.IS_FIRST_TIME_USER, JSON.stringify(value));
  };

  const savePetsForDashBoardAfterNotiSetting = async (arrayPet) => {
    removeOnboardData();

    await DataStorageLocal.saveDataToAsync(Constant.SENOSR_INDEX_VALUE, '' + 0);

    if (defaultPet.devices[0].deviceModel && defaultPet.devices[0].deviceModel.includes("HPN1")) {
      await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'HPN1Sensor');
    } else {
      await DataStorageLocal.saveDataToAsync(Constant.SENSOR_TYPE_CONFIGURATION, 'Sensor');
    }
    await DataStorageLocal.saveDataToAsync(Constant.SAVE_SOB_PETS, JSON.stringify(arrayPet));
    navigation.navigate('SensorInitialComponent', { defaultPetObj: defaultPet });
  };

  const removeOnboardData = async () => {
    await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
  }

  return (
    <PetReviewUI
      sobJson={sobJson}
      name={name}
      phNo={phNo}
      email={email}
      isLoading={isLoading}
      isPopUp={isPopUp}
      popUpMessage={popUpMessage}
      popUpTitle={popUpTitle}
      popLeftTitle={popLeftTitle}
      popRightTitle={popRightTitle}
      isSOBSubmitted={isSOBSubmitted}
      popOkBtnAction={popOkBtnAction}
      popCancelBtnAction={popCancelBtnAction}
      navigateToPrevious={navigateToPrevious}
      submitAction={submitAction}
    />
  );

}

export default PetReviewComponent;