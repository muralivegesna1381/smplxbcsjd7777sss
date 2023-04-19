import React, { useState, useEffect, useRef } from 'react';
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import DasBoardComponent from './dashBoardComponent';
import * as Storage from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import { Platform } from 'react-native';

const PERMISSION_OBSERVATIONS = 1;
const PERMISSION_QUESTIONNAIRE = 2;
const PERMISSION_POINTTRACKING = 3;
const PERMISSION_TIMER = 5;
const PERMISSION_PETWEIGHT = 7;
const Permission_EatingEnthusiasm = 8;
const PERMISSION_IMAGESCORING = 9;

let trace_Dashboard_GetPets_Complete;
let trace_inDashBoard;
let trace_Questionnaire_API_Complete;
let trace_Get_Support_Meterials_API_Complete;
let trace_campaign_API_Complete;
let trace_LeaderBoard_Campaign_API_Complet;
let trace_Modularity_API_Complet;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const DasBoardService = ({ navigation, route, ...props }) => {

  const { loading, data } = useQuery(Queries.LOG_OUT_APP, { fetchPolicy: "cache-only" });
  const { loading:logoutNaviLoading, data:logoutNaviData } = useQuery(Queries.LOG_OUT_APP_NAVI, { fetchPolicy: "cache-only" });
  const { loadingData, data:uploadDashboardData } = useQuery(Queries.UPDATE_DASHBOARD_DATA, { fetchPolicy: "cache-only" });

  const [defaultPetObj, set_defaultPetObj] = useState(undefined);
  const [date, set_Date] = useState(new Date());
  const [petsArray, set_petsArray] = useState([]);
  const [isLoading, set_isLoading] = useState(true);
  const [loaderMsg, set_loaderMsg] = useState(undefined);
  const [isSwipingPet, set_isSwipingPet] = useState(false);
  const [isPTEnable, set_isPTEnable] = useState(false);
  const [isQuestionnaireEnable, set_isQuestionnaireEnable] = useState(false);
  const [isTimerEnable, set_isTimerEnable] = useState(false);
  const [isObsEnable, set_isObsEnable] = useState(false);
  const [isFirstUser, set_isFirstUser] = useState(false);
  const [isQuestLoading, set_isQuestLoading] = useState(false);
  const [isPTLoading, set_isPTLoading] = useState(false);
  const [questionnaireData, set_questionnaireData] = useState(undefined);

  const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
  const [leaderBoardArray, set_leaderBoardArray] = useState([]);
  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
  const [campagainArray, set_campagainArray] = useState([]);
  const [campagainName, set_campagainName] = useState("");
  const [activeSlide, set_activeSlide] = useState(0);

  const [isModularityService, set_isModularityService] = useState(false);
  const [isEatingEnthusiasm, set_isEatingEnthusiasm] = useState(false);
  const [isImageScoring, set_isImageScoring] = useState(false);
  const [isPetWeight, set_isPetWeight] = useState(false);
  const [petWeightUnit, set_petWeightUnit] = useState(undefined);

  const [setuPendingDetailsArray, set_setuPendingDetailsArray] = useState([]);
  const [isSwipedModularity, set_isSwipedModularity] = useState(true);

  var modularityServiceCount = useRef(0);
  var pushTimerPetsArray = useRef([]);
  var pushObservationsPetsArray = useRef([]);
  var pushQuestionnairePetsArray = useRef([]);
  var pushPTPetsArray = useRef([]);
  var enableLoader = useRef([true]);
  const isSwipingPetRef = useRef(false);
  const setupDonePetsRef = useRef();
  const ptExists = useRef(false);

  //////////////////////////// Dashboard Service ///////////////////////////////////
  // All the Pets info related to pet parent will be fetched from the backend in this class //
  /**
   * This useEffect calls when ever the dashboard loads
   * Checks for the User status.
   * When first time user(User has no pets) diasbles all the service calls.
   * Clear Objects - Clears all the saved data within the class.
   */

  React.useEffect(() => {

    clearObjects();
    const focus = navigation.addListener("focus", () => {

      set_Date(new Date());
      dashBoardSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_dashboard);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_dashboard, "User in Dashboard Screen", ''); 
      defaultPetsDashBoard();

    });

    const unsubscribe1 = navigation.addListener('blur', () => {
      dashBoardSessionStop();
      setTimeout(async () => {  
        enableLoader.current = false;
      }, 2000)
      // enableLoader.current = false;
    });

    return () => {
      focus();
      unsubscribe1();
    };

  }, []);

  /**
   * This useEffect calls when user logsout the app.
   * Removes the widgets with loaded data.
   */
  useEffect(() => {

    if (data && data.data.__typename === 'LogOutApp' && data.data.isLogOut === 'logOut') {
      removeItems();
      clearObjects();
      enableLoader.current = true;
      set_isLoading(true);
    }

  }, [data]);

  useEffect(() => {

    if (logoutNaviData && logoutNaviData.data.__typename === 'LogOutAppNavi' && logoutNaviData.data.isLogOutNavi === 'logOutNavi') {
      removeItems();
      clearObjects();
      AuthoriseCheck.authoriseCheck();
      navigation.navigate('WelcomeComponent');
    }

  }, [logoutNaviData]);

  useEffect(() => {

    if (uploadDashboardData && uploadDashboardData.data.__typename === 'UpdateDashboardData' && uploadDashboardData.data.isRefresh === 'refresh') {
      clearObjects();
      defaultPetsDashBoard();
    }

  }, [uploadDashboardData]);

  /**
   * Loads the pets and related info initially.
   */

  useEffect(() => {
    if (route.params?.loginPets && route.params?.loginPets.length > 0) {
      set_petsArray(route.params?.loginPets);
    }

  }, [route.params?.loginPets]);

  const dashBoardSessionStart = async () => {
    trace_inDashBoard = await perf().startTrace('t_inDashBoard');
  };

   const dashBoardSessionStop = async () => {
    await trace_inDashBoard.stop();
   }

  /**
   * Save the modularity permissions data async
   * This is used across the app where the details need to be hidden based on this permissions
   * Modularity permisssions includes Walk Timer, Observation/Journaling, Questionnaire, Point Tracking, Pet Weight, Eating Enthusiasm Scale, Image Scoring
   * @param {*} moduleArray 
   */

  const saveModularityAsync = async (moduleArray,petId) => {
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_defaultPet_modularity, firebaseHelper.screen_dashboard, "Dashboard Modularity Permissions Pet Id : "+petId, 'Permissions : ' + JSON.stringify(moduleArray));
    await Storage.saveDataToAsync(Constant.MODULATITY_OBJECT, JSON.stringify(moduleArray));
  }

  const checkModularPermissions = async (modularArray1) => {

    let tempArray = [];
    let modularArray = [];

    for (let i = 0; i < modularArray1.length; i++) {

      tempArray.push(modularArray1[i].mobileAppConfigId);

      if (modularArray1[i].mobileAppConfigId === PERMISSION_PETWEIGHT) {
        set_petWeightUnit(modularArray1[i].weightUnit);
      }

    }

    modularArray = tempArray;
    console.log('Modular Permissions ',modularArray)
    if (modularArray.includes(PERMISSION_OBSERVATIONS)) {
      set_isObsEnable(true);
    } else {
      set_isObsEnable(false);
    }

    if (modularArray.includes(PERMISSION_POINTTRACKING)) {
      // set_isPTEnable(true);
      // ptExists.current = true;
      // if(enableLoader.current){
      //   getPTDetails();
      // }
      
      if(enableLoader.current){
        ptExists.current = true;
        await getPTDetails();
      } else {
        ptExists.current = false;
      }
      
    } else {
      ptExists.current = false;
      set_isPTEnable(false);
    }

    if (modularArray.includes(PERMISSION_QUESTIONNAIRE)) {
      set_isQuestionnaireEnable(true);
      getQuestionnaireData();
    } else {
      set_isQuestionnaireEnable(false);
    }

    if (modularArray.includes(PERMISSION_TIMER)) {
      set_isTimerEnable(true);
    } else {
      set_isTimerEnable(false);
    }

    if (modularArray.includes(PERMISSION_PETWEIGHT)) {
      set_isPetWeight(true);
    } else {
      set_isPetWeight(false);
    }

    if (modularArray.includes(Permission_EatingEnthusiasm)) {
      set_isEatingEnthusiasm(true);
    } else {
      set_isEatingEnthusiasm(false);
    }

    if (modularArray.includes(PERMISSION_IMAGESCORING)) {
      set_isImageScoring(true);
    } else {
      set_isImageScoring(false);
    }

    set_isModularityService(false);

    if(modularArray.includes(PERMISSION_POINTTRACKING) || modularArray.includes(PERMISSION_QUESTIONNAIRE) || modularArray.includes(PERMISSION_POINTTRACKING)) {

    } else {
      set_isLoading(false);
    }
    // set_isLoading(false);

  };

  /**
   * Checks if the logged in user is First Time User or not
   * When not First time user, initiates the getPetDevicesByPetParent Service call
   */
  const defaultPetsDashBoard = async () => {

    let firstUser = await Storage.getDataFromAsync(Constant.IS_FIRST_TIME_USER);
    firstUser = JSON.parse(firstUser);

    if (firstUser) {

      set_isFirstUser(true);
      set_isLoading(false);

    } else {
      
      if(enableLoader.current){
        set_isLoading(true);
      } else {
        // set_isLoading(false);
      }
      set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
      set_isFirstUser(false);
      getDashBoardPets('firstLoad');

    }
  }

  /**
   * Service call to fetch the Pet details from the backend.
   * @param {*} clientID 
   * Calculates the Sensor setup pending, setup done or Device missing status for each pet.
   * When atleat one pet is having the sensor Setup Staus as Done, calls the method to initiate the Modularity permissions check.
   */
  const getDashBoardPets = async (value) => {

    let clientID = await Storage.getDataFromAsync(Constant.CLIENT_ID);
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    // set_isLoading(true);
    trace_Dashboard_GetPets_Complete = await perf().startTrace('t_DashBoard_GetPets_Info_API');

    fetch(EnvironmentJava.uri + "getPetDevicesByPetParent/" + clientID,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

      // set_isLoading(false);
      if (data && data.status.success) {
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_success, firebaseHelper.screen_dashboard, "Dashboard Getpets Service Success", 'Fetching Pets in Dashboard success : ' + data.status.success);
        stopFBTraceGetPets();

        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
          set_isLoading(false);
          AuthoriseCheck.authoriseCheck();
          navigation.navigate('WelcomeComponent');
        }

        if (data.response) {

          // set_petsArray(data.response.petDevices);
          // if(enableLoader.current){
            set_petsArray(data.response.petDevices);
          // }
          let tempArray = [];

          if (data.response.petDevices.length > 0) {
            set_isFirstUser(false);
            for (let i = 0; i < data.response.petDevices.length; i++) {

              let devices = data.response.petDevices[i].devices;
              for (let j = 0; j < devices.length; j++) {

                if (devices.length > 0 && devices[j].isDeviceSetupDone) {
                  tempArray.push(data.response.petDevices[i]);
                }

              }

            }

            let duplicates = getUnique(tempArray, 'petID');
            tempArray = duplicates;
            
            if (tempArray.length > 0) {
              // set_setupDonePetsArray(tempArray);
              setupDonePetsRef.current = tempArray;
              if(value==='firstLoad'){   
                saveSwipePetObj('notSwiped', data.response.petDevices);
              } else {
                set_isLoading(false); 
              }
              
            } else {
              if(value==='firstLoad'){  
                saveSwipePetObj('notSwiped', data.response.petDevices);
              }
              clearModularityPets();
              set_isLoading(false); 
            }

          } else {
            set_isLoading(false);
            firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Fetching Pets in Dashboard failed : ' + data.status.success);
          }

        }

      } else {
        // set_isLoading(false);
        stopFBTraceGetPets();
      }

    }).catch((error) => {
      stopFBTraceGetPets();
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getPets_fail, firebaseHelper.screen_dashboard, "Dashboard Getpets Service failed", 'Fetching Pets in Dashboard failed : ' + error);
    });

  };

  const stopFBTraceGetPets = async () => {
    await trace_Dashboard_GetPets_Complete.stop();
  };

  /**
   * When the pet is having setup Done status, it will check the modularity permission for the pet
   * @param {*} petId 
   * Based on permissions, it will enable required widgets with data on the dashboard
   */
  const getDashBoardModularity = async (petId) => {

    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    trace_Modularity_API_Complet= await perf().startTrace('t_DashBoard_GetPets_Info_API');

    fetch(EnvironmentJava.uri + "pets/getMobileAppConfigs/" + petId,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

      if (data && data.status.success) {
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_success, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Success", 'Getting Modularity in Dashboard success : ' + data.status.success);
        stopFBTraceModularity();
        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
          AuthoriseCheck.authoriseCheck();
          navigation.navigate('WelcomeComponent');
        }

        if (data.response) {
          if (isSwipingPetRef.current) {

            set_isSwipingPet(!isSwipingPet);
            set_isSwipedModularity(false);
            isSwipingPetRef.current = false;
            set_isModularityService(false);

            if (data.response.petMobileAppConfigs.length > 0) {

              let moduleArray = [];
              for (let i = 0; i < data.response.petMobileAppConfigs.length; i++) {
                moduleArray.push(data.response.petMobileAppConfigs[i].mobileAppConfigId);
              }
              saveModularityAsync(moduleArray,petId);
              checkModularPermissions(data.response.petMobileAppConfigs);
              modularityServiceCount.current = 0;

            } else {
              set_isLoading(false);
              removeItems();
            }

          } else {

            let moduleArray = [];
            if (data.response.petMobileAppConfigs.length > 0) {
              
              for (let i = 0; i < data.response.petMobileAppConfigs.length; i++) {
                moduleArray.push(data.response.petMobileAppConfigs[i].mobileAppConfigId);
              }

              if (moduleArray.includes(PERMISSION_TIMER)) {
                
                pushTimerPetsArray.current.push(setupDonePetsRef.current[modularityServiceCount.current]);
                savePetsForTImer(pushTimerPetsArray.current);
              }

              if (moduleArray.includes(PERMISSION_OBSERVATIONS)) {
                pushObservationsPetsArray.current.push(setupDonePetsRef.current[modularityServiceCount.current]);
                savePetsForObservations(pushObservationsPetsArray.current);
              }

              if (moduleArray.includes(PERMISSION_QUESTIONNAIRE)) {
                
                pushQuestionnairePetsArray.current.push(setupDonePetsRef.current[modularityServiceCount.current]);
                savePetsForQuestionnaire(pushQuestionnairePetsArray.current);
              }

              modularityServiceCount.current = modularityServiceCount.current + 1;

              if (modularityServiceCount.current < setupDonePetsRef.current.length) {
                getDashBoardModularity(setupDonePetsRef.current[modularityServiceCount.current].petID);
              } else {
                getModularityDataPets();
                set_isLoading(false);
                set_isModularityService(false);
              }

            } else {
              modularityServiceCount.current = modularityServiceCount.current + 1;
              if (modularityServiceCount.current < setupDonePetsRef.current.length) {
                getDashBoardModularity(setupDonePetsRef.current[modularityServiceCount.current].petID);

              } else {

                getModularityDataPets();
                set_isLoading(false);
                set_isModularityService(false);

              }
            }

          }

        }

      } else {
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Failed", 'Getting Modularity in Dashboard failed : ' + data.status.success);
        stopFBTraceModularity();
      }
      
    }).catch((error) => {
      set_isLoading(false);
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getModularity_fail, firebaseHelper.screen_dashboard, "Dashboard Modularity Service Failed", 'Getting Modularity in Dashboard failed : ' + error);
      stopFBTraceModularity();
    });

  };

  const stopFBTraceModularity = async () => {
    await trace_Modularity_API_Complet.stop();
  };

  /**
   * When default pet is having setup Pending or device missing,
   * Dashboard shows the pdf or videos related to abouve status.
   * This service call fetches the required meterials and loads the data in the dashboard.
   * Setup Pending id = 16 and Device missing id = 17
   * @param {*} id 
   */
  const getsupportMeterials = async (id) => {

    firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_Api, firebaseHelper.screen_dashboard, "Initiating Dashboard Support Meterials Api", 'Meterial Id : ' + id);
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    trace_Get_Support_Meterials_API_Complete = await perf().startTrace('t_Get_Support_Meterials_API');
    set_isLoading(true);
    set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);

    fetch(EnvironmentJava.uri + "supportDocs/getAppSupportDocs/" + id,
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
      if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
        AuthoriseCheck.authoriseCheck();
        navigation.navigate('WelcomeComponent');
      }

      if(data && data.status.success){
        stopFBTraceGetSupportMeterials();
        let dataArray = [];

        if(data.response.supportMaterials.userGuides && data.response.supportMaterials.userGuides.length > 0){

          for (let i = 0; i < data.response.supportMaterials.userGuides.length; i++){
            dataArray.push(data.response.supportMaterials.userGuides[i]);
          }

          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_success, firebaseHelper.screen_dashboard, "Dashboard Support Meterials Success", 'UserGuide Meterials : ' + JSON.stringify(dataArray));
          
        }

        if(data.response.supportMaterials.videos && data.response.supportMaterials.videos.length > 0){

          for (let i = 0; i < data.response.supportMaterials.videos.length; i++){
            dataArray.push(data.response.supportMaterials.videos[i]);
          }
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_success, firebaseHelper.screen_dashboard, "Dashboard Support Meterials Success", 'Video Meterials : ' + JSON.stringify(dataArray));
        }
        set_setuPendingDetailsArray(dataArray)

      } else {
        stopFBTraceGetSupportMeterials();
      }

    }).catch((error) => {
      firebaseHelper.logEvent(firebaseHelper.event_dashboard_getMeterials_success, firebaseHelper.screen_dashboard, "Dashboard Support Meterials Failed", 'error : ' + error);
      stopFBTraceGetSupportMeterials();
      set_isLoading(false);
    });

  };

  const stopFBTraceGetSupportMeterials = async () => {
    await trace_Get_Support_Meterials_API_Complete.stop();
  }

  // removes the duplicate objects from the Pets array
  function getUnique(petArray, index) {
    const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
    return uniqueArray;
  };

  const getModularityDataPets = async (pets) => {

    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    set_isSwipingPet(true);
    isSwipingPetRef.current = true;
    getDashBoardModularity(defaultPet.petID);

  }

  /**
   * This method initiates when ever the user Swipes the pet to make it default.
   * The previous pet details will be swiped off from the dashboard widgets and loads the new pet details.
   * Based on the status of the pet, Dependent service call will be initiated.
   * @param {*} swipeValue 
   * @param {*} arrayPets 
   */
  const saveSwipePetObj = async (swipeValue, arrayPets) => {

    if(enableLoader.current){
      set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
      set_isLoading(true);
    }
    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    firebaseHelper.logEvent(firebaseHelper.event_dashboard_petSwipe, firebaseHelper.screen_dashboard, "Dashboard Pet Swipe Action", 'Default Pet Id : ' + defaultPet.petID);

    let tempPets = undefined;
    tempPets = arrayPets && arrayPets.length > 0 ? arrayPets : petsArray;

    let obj = findArrayElementByPetId(tempPets, defaultPet.petID);
    defaultPet = obj;

    clearModularityArrays();

    if (defaultPet && tempPets) {
      set_defaultPetObj(defaultPet);
      let index = 0;
      for (var i = 0; i < tempPets.length; i++) {
        if (tempPets[i].petID == defaultPet.petID) {
          index = i;
          break;
        }
      }
      set_activeSlide(index);
    }

    if (defaultPet && defaultPet.devices.length > 0 && defaultPet.devices[0].isDeviceSetupDone) {

      if (swipeValue === 'swiped') {
        set_isSwipingPet(true);
        isSwipingPetRef.current = true;
        enableLoader.current = true;
        getDashBoardModularity(defaultPet.petID);
      } else {
        if(setupDonePetsRef.current){
          getDashBoardModularity(setupDonePetsRef.current[modularityServiceCount.current].petID)
        }       
      }

      // set_loaderMsg(undefined);
      // set_isLoading(false);
      if(enableLoader.current){
        // set_isLoading(true);
        set_isModularityService(true);
      }
      
      // set_isSwipedModularity(true);

    } else {

      if(defaultPet){
        await Storage.saveDataToAsync(Constant.DEFAULT_PET_OBJECT,JSON.stringify(defaultPet));
      }
      
      if(enableLoader.current){
        set_isModularityService(true);
      }
      checkModularPermissions([]);
      // set_isLoading(false);
      // clearModularityArrays();

      if(defaultPet){

        if(defaultPet.devices.length > 0 && defaultPet.devices[0].deviceNumber){
          getsupportMeterials(16);
        } else {
          getsupportMeterials(17);
        }
        
      }
      
    }

    // set_loaderMsg(Constant.DASHBOARD_LOADING_MSG);
    // await getDashBoardPets('secondLoad');

  };

  function findArrayElementByPetId(pets, petId) {
    return pets.find((element) => {
      return element.petID === petId;
    })
  };

  // Clears the default pet modularity permissions
  const clearModularityArrays = async () => {
    await Storage.removeDataFromAsync(Constant.MODULATITY_OBJECT);
  };

  // Clears the Modularity permission for all the pets
  const clearModularityPets = async () => {
    await Storage.removeDataFromAsync(Constant.TIMER_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
    await Storage.removeDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
  };

  /**
   * Clears the Widget enable permissions
   */
  const removeItems = () => {
    set_isObsEnable(false);
    set_isQuestionnaireEnable(false);
    set_isPTEnable(false);
    set_isTimerEnable(false);
    set_isPTLoading(false);
    set_isQuestLoading(false);
    set_isEatingEnthusiasm(false);
    set_isImageScoring(false);
    set_isPetWeight(false);
    set_questionnaireData(undefined);
    set_campagainArray(undefined);
  };

  // Clears the Modularity based arrays data. Calls when user navigates away from the dashboard.
  const clearObjects = async () => {

      modularityServiceCount.current = 0;
      setupDonePetsRef.current=undefined;
      pushTimerPetsArray.current=[];
      pushObservationsPetsArray.current=[];
      pushQuestionnairePetsArray.current=[];
      pushPTPetsArray.current=[];

  };

  /**
   * Saves the Timer permission enabled pets.
   * Used while initiating the timer.
   * @param {*} setupDonePet 
   */
  const savePetsForTImer = async (setupDonePet) => {
    if (setupDonePet) {
      await Storage.saveDataToAsync(Constant.TIMER_PETS_ARRAY, JSON.stringify(setupDonePet));
    }
  };

  /**
   * Saves the Questionnaire permission enabled pets.
   * Used in Questionnaire feature.
   * @param {*} setupDonePet 
   */
  const savePetsForQuestionnaire = async (setupDonePet) => {
    if (setupDonePet) {
      await Storage.saveDataToAsync(Constant.QUESTIONNAIR_PETS_ARRAY, JSON.stringify(setupDonePet));
    }
  };

  /**
   * Saves the Observations permission enabled pets.
   * Used in Observations feature.
   * @param {*} obsPets 
   */

  const savePetsForObservations = async (obsPets) => {
    if (obsPets) {
      await Storage.saveDataToAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY, JSON.stringify(obsPets));
    }
  };

  /**
   * When the default pet is having the Questionnaire permission, this service call will be initiated
   * Pet id is rquired.
   * With this data, default Question and no of Questionnaires short info shown in the dashboard
   */
  const getQuestionnaireData = async () => {
    
    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    trace_Questionnaire_API_Complete = await perf().startTrace('t_DashBoard_Questionnaire_Info_API');
    // trace_Questionnaire_API_Complete.putAttribute('PetId', defaultPet.petID);
    if (defaultPet) {
      let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
      set_isQuestLoading(true);

      fetch(EnvironmentJava.uri + "getQuestionnaireByPetId/" + defaultPet.petID,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken" : token
          },
        }
      ).then((response) => response.json()).then(async (data) => {

          set_isQuestLoading(false);
          if(!ptExists.current){
            set_isLoading(false);
          }
          stopFBTraceQuestionnaire();
          if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
          }

          if (data.status.success) {
            firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_success, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Success", 'Getting Questionnaires in Dashboard success : ' + data.status.success);

            if (data.response && data.response.questionnaireList.length > 0) {
              set_questionnaireData(data.response.questionnaireList);
            } else {
              set_questionnaireData(undefined);
            }

          } else {
            firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'Getting Questionnaires in Dashboard Failed : ' + data.status.success);
            set_isLoading(false);
          }
        }).catch((error) => {
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getQuestionnaire_fail, firebaseHelper.screen_dashboard, "Dashboard Get Questionnaire Service Failed", 'Getting Questionnaires in Dashboard Failed : ' + error);
          stopFBTraceQuestionnaire();
          set_isQuestLoading(false);
          set_isLoading(false);
        });
    }
  };

  const stopFBTraceQuestionnaire = async () => {
    await trace_Questionnaire_API_Complete.stop();
  }

  /**
   * When the default pet is having the PT pertmissions,
   * Widget with Point tracking data will be loaded in the dashboard.
   * Which also initiates the leader board details for the User
   */
  const getPTDetails = async () => {

    trace_campaign_API_Complete = await perf().startTrace('t_Campaign_Details_API');
    if(enableLoader.current){
      set_leaderBoardArray(undefined);
    }
    
    let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
    defaultPet = JSON.parse(defaultPet);
    // set_isPTLoading(true);
    set_leaderBoardPetId(defaultPet.petID);
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);

    fetch(EnvironmentJava.uri + "getCampaignListByPet/" + defaultPet.petID,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {

        stopFBTraceCampaignDetails();
      console.log('Modular Pt ', data)
        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
          AuthoriseCheck.authoriseCheck();
          navigation.navigate('WelcomeComponent');
          set_isLoading(false);
        }

        if (data && data.status.success && data.response.campaigns.length > 0) {
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_success, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Success", 'Getting Campaign in Dashboard Success : ' + data.status.success);
          set_campagainArray(data.response.campaigns);
          set_isPTEnable(true);
          set_isPTLoading(true);
          set_campagainName(data.response.campaigns[0].campaignName);
          getLeaderBoardDetails(data.response.campaigns[0].campaignId, defaultPet.petID);

        } else {
          set_isPTLoading(false);
          set_isLoading(false);
          set_isPTEnable(false);
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'Getting Campaign in Dashboard Failed : ' + data.status.success);
        }
      }).catch((error) => {
        stopFBTraceCampaignDetails();
        set_isPTEnable(false);
        set_isPTLoading(false);
        set_isLoading(false);
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getCampaign_fail, firebaseHelper.screen_dashboard, "Dashboard Get Campaign Service Failed", 'Getting Campaign in Dashboard Failed : ' + error);
      });

  };

  const stopFBTraceCampaignDetails = async () => {
    await trace_campaign_API_Complete.stop();
  }

  // Gets the leader board details from the backend.

  const getLeaderBoardDetails = async (campId, campaignPet) => {

    trace_LeaderBoard_Campaign_API_Complet = await perf().startTrace('t_Campaign_Details_API');
    let token = await Storage.getDataFromAsync(Constant.APP_TOKEN);
    fetch(EnvironmentJava.uri + "getLeaderBoardByCampaignId/" + campId + "/" + campaignPet,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "ClientToken" : token
        },
      }
    ).then((response) => response.json()).then(async (data) => {
        set_isPTLoading(false);
        set_isLoading(false);
        stopFBTraceLeaderBoardDetails();
        if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
          AuthoriseCheck.authoriseCheck();
          navigation.navigate('WelcomeComponent');
        }
        if (data && data.status.success && data.response.leaderBoards.length > 0) {
          firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_success, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Success", '');
          if(enableLoader.current){
            set_leaderBoardArray(data.response.leaderBoards);
          }
          set_isPTEnable(true);
          set_leaderBoardCurrent(data.response.currentPet);
          saveLeaderBoardAsync(data.response.leaderBoards, data.response.currentPet);
        } else {

          set_leaderBoardArray([]);
          set_isPTEnable(false);
          set_leaderBoardCurrent(undefined);
          await Storage.removeDataFromAsync(Constant.LEADERBOARD_ARRAY);
          await Storage.removeDataFromAsync(Constant.LEADERBOARD_CURRENT);

        }
      }).catch((error) => {
        stopFBTraceLeaderBoardDetails();
        set_isPTEnable(false);
        set_isPTLoading(false);
        firebaseHelper.logEvent(firebaseHelper.event_dashboard_getLeaderboard_fail, firebaseHelper.screen_dashboard, "Dashboard Get Leaderboard Details Service Failed", 'Getting Leaderboard Details in Dashboard Failed : ' + error);
      });

  };

  const stopFBTraceLeaderBoardDetails = async () => {
    await trace_LeaderBoard_Campaign_API_Complet.stop();
  }

  // This saved details of the leader board will be used in the Leaderboard class
  const saveLeaderBoardAsync = async (lArray, lCurrent) => {

    await Storage.saveDataToAsync(Constant.LEADERBOARD_ARRAY, JSON.stringify(lArray));
    await Storage.saveDataToAsync(Constant.LEADERBOARD_CURRENT, JSON.stringify(lCurrent));

  };

  /**
   * All the locally saved data will be passed to Dashboard Component.
   */

  return (

    <DasBoardComponent
      petsArray={petsArray}
      defaultPetObj={defaultPetObj}
      activeSlide={activeSlide}
      isLoading={isLoading}
      isModularityService={isModularityService}
      loaderMsg={loaderMsg}
      isObsEnable={isObsEnable}
      isQuestionnaireEnable={isQuestionnaireEnable}
      isPTEnable={isPTEnable}
      isTimerEnable={isTimerEnable}
      isFirstUser={isFirstUser}
      isQuestLoading={isQuestLoading}
      isPTLoading={isPTLoading}
      questionnaireData={questionnaireData}
      leaderBoardArray={leaderBoardArray}
      leaderBoardPetId={leaderBoardPetId}
      leaderBoardCurrent={leaderBoardCurrent}
      campagainName={campagainName}
      campagainArray={campagainArray}
      isEatingEnthusiasm={isEatingEnthusiasm}
      isImageScoring={isImageScoring}
      isPetWeight={isPetWeight}
      petWeightUnit={petWeightUnit}
      setuPendingDetailsArray = {setuPendingDetailsArray}
      isSwipingPet = {isSwipingPet}
      isSwipedModularity = {isSwipedModularity}
      enableLoader = {enableLoader.current}
      saveSwipePetObj={saveSwipePetObj}
      clearObjects={clearObjects}
    />
  );

}

export default DasBoardService;