import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import MenuUI from './menuUI';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";

let trace_inMenuScreen;

const  MenuComponent = ({navigation, route, ...props }) => {

  const [modularityArray, set_modularityArray] = useState(undefined);
  const [renderArray, set_renderArray] = useState();
  const [renderArrayFirstUser, set_renderArrayFirstUser] = useState(
      [
        {mobileAppConfigID : 0,title : 'Dashbaord', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuDashBoard.svg'), nav : "DashBoardService"},     
        {mobileAppConfigID : 0,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/OnboardPetMenu.svg'), nav : "PetNameComponent"},       
        {mobileAppConfigID : 0,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/accountMenu.svg'), nav : "AccountInfoService"},   
        {mobileAppConfigID : 0,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/supportMenu.svg'), nav : "SupportComponent"},    
      ]);

    const [questPetsArray, set_questPetsArray] = useState(undefined);
    const [timerPetsArray, set_timerPetsArray] = useState(undefined);
    const [obserPetsArray, set_obserPetsArray] = useState(undefined);
    const [ptPetsArray, set_ptPetsArray] = useState(undefined);
    const [isFirstUser, set_isFirstUser] = useState(false);

    let deviceType = useRef(undefined);
    let deviceStatus = useRef(undefined);

    useEffect(() => {

      menuSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_menu);  
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_menu, "User in Menu Screen", ''); 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const unsubscribe = navigation.addListener('blur', () => {
        menuSessionStop();
      });

      return () => {
        menuSessionStop();
        unsubscribe();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
  
    }, []);

    useEffect(() => {
        
        getModularityPermissions();
        if(route.params?.deviceType){         
          deviceType.current = route.params?.deviceType;
        }

        if(route.params?.isConfigured){         
          deviceStatus.current = route.params?.isConfigured;
        }

        renderList();

    }, [route.params?.deviceType,route.params?.isConfigured]);

    const menuSessionStart = async () => {
      trace_inMenuScreen = await perf().startTrace('t_inMenuScreen');
    };
    
    const menuSessionStop = async () => {
        await trace_inMenuScreen.stop();
    };
    /**
     * Based on device type below Features will be enabled in the menu.
     * When device type is HPN1, beacons feature will be enabled.
     */
    const renderList = () => {

      if(deviceType.current && deviceType.current.includes('HPN1')){

        if(deviceStatus.current==='SetupDone'){

          set_renderArray(
            [
              {mobileAppConfigID : 0,title : 'Dashbaord', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuDashBoard.svg'), nav : "DashBoardService"},
              {mobileAppConfigID : 1,title : 'Observations', iconImg : require('../../../assets/images/otherImages/svg/observationMenu.svg'), nav : "ObservationsListComponent"},
              {mobileAppConfigID : 0,title : 'Configure Sensor', iconImg : require('../../../assets/images/sideMenuImages/svg/sensor2.svg'), nav : "SensorInitialComponent"},
              {mobileAppConfigID : 2,title : 'Questionnaire', iconImg : require('../../../assets/images/sideMenuImages/svg/questionnaireMenu.svg'), nav : "QuestionnaireStudyComponent"},
              {mobileAppConfigID : 0,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/OnboardPetMenu.svg'), nav : "PetNameComponent"},
              {mobileAppConfigID : 5,title : 'Timer', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuTimer.svg'), nav : "Timer"},
              {mobileAppConfigID : 0,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/accountMenu.svg'), nav : "AccountInfoService"},
              {mobileAppConfigID : 0,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/supportMenu.svg'), nav : "SupportComponent"},  
              {mobileAppConfigID : 0,title : 'Beacons', iconImg : require('../../../assets/images/beaconsImages/svg/beaconMenu.svg'), nav : "BeaconsInitialComponent"}, 
              {mobileAppConfigID : 0,title : 'Feedback', iconImg : require('../../../assets/images/sideMenuImages/svg/feedbacksMenu.svg'),nav : "FeedbackComponent"},          
            ]
          )

        } else {

          set_renderArray(
            [
              {mobileAppConfigID : 0,title : 'Dashbaord', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuDashBoard.svg'), nav : "DashBoardService"},
              {mobileAppConfigID : 1,title : 'Observations', iconImg : require('../../../assets/images/otherImages/svg/observationMenu.svg'), nav : "ObservationsListComponent"},
              {mobileAppConfigID : 0,title : 'Configure Sensor', iconImg : require('../../../assets/images/sideMenuImages/svg/sensor2.svg'), nav : "SensorInitialComponent"},
              {mobileAppConfigID : 2,title : 'Questionnaire', iconImg : require('../../../assets/images/sideMenuImages/svg/questionnaireMenu.svg'), nav : "QuestionnaireStudyComponent"},
              {mobileAppConfigID : 0,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/OnboardPetMenu.svg'), nav : "PetNameComponent"},
              {mobileAppConfigID : 5,title : 'Timer', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuTimer.svg'), nav : "Timer"},
              {mobileAppConfigID : 0,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/accountMenu.svg'), nav : "AccountInfoService"},
              {mobileAppConfigID : 0,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/supportMenu.svg'), nav : "SupportComponent"},  
              {mobileAppConfigID : 0,title : 'Feedback', iconImg : require('../../../assets/images/sideMenuImages/svg/feedbacksMenu.svg'),nav : "FeedbackComponent"},          
            ]
          )

        }

      } else {

        set_renderArray(
          [
            {mobileAppConfigID : 0,title : 'Dashbaord', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuDashBoard.svg'), nav : "DashBoardService"},
            {mobileAppConfigID : 1,title : 'Observations', iconImg : require('../../../assets/images/otherImages/svg/observationMenu.svg'), nav : "ObservationsListComponent"},
            {mobileAppConfigID : 0,title : 'Configure Sensor', iconImg : require('../../../assets/images/sideMenuImages/svg/sensor2.svg'), nav : "SensorInitialComponent"},
            {mobileAppConfigID : 2,title : 'Questionnaire', iconImg : require('../../../assets/images/sideMenuImages/svg/questionnaireMenu.svg'), nav : "QuestionnaireStudyComponent"},
            {mobileAppConfigID : 0,title : 'Onboard Pet', iconImg : require('../../../assets/images/sideMenuImages/svg/OnboardPetMenu.svg'), nav : "PetNameComponent"},
            {mobileAppConfigID : 5,title : 'Timer', iconImg : require('../../../assets/images/sideMenuImages/svg/sMenuTimer.svg'), nav : "Timer"},
            {mobileAppConfigID : 0,title : 'Account', iconImg : require('../../../assets/images/sideMenuImages/svg/accountMenu.svg'), nav : "AccountInfoService"},
            {mobileAppConfigID : 0,title : 'Support', iconImg : require('../../../assets/images/sideMenuImages/svg/supportMenu.svg'), nav : "SupportComponent"},  
            {mobileAppConfigID : 0,title : 'Feedback', iconImg : require('../../../assets/images/sideMenuImages/svg/feedbacksMenu.svg'),nav : "FeedbackComponent"},          
          ]
        )

      }

    };

    const handleBackButtonClick = () => {
      menuHeaderBtnAction();
        return true;
    };

    // Setting the modular permissions. Based on this the features will be enabled
    const getModularityPermissions = async () => {

      // await DataStorageLocal.removeDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA); 
      let firstUser = await DataStorageLocal.getDataFromAsync(Constant.IS_FIRST_TIME_USER);
      firstUser = JSON.parse(firstUser);

      if(firstUser){

        set_isFirstUser(true);
        set_modularityArray([0]);

      } else {

        set_isFirstUser(false);
        let moduleArray =[0];
        let timerPets = await DataStorageLocal.getDataFromAsync(Constant.TIMER_PETS_ARRAY);
        timerPets = JSON.parse(timerPets);
  
        let obserPets = await DataStorageLocal.getDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
        obserPets = JSON.parse(obserPets);
  
        let ptPets = await DataStorageLocal.getDataFromAsync(Constant.POINT_TRACKING_PETS_ARRAY);
        ptPets = JSON.parse(ptPets);
  
        let questPets = await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
        questPets = JSON.parse(questPets);
  
        if(timerPets){
          set_timerPetsArray(timerPets)
          moduleArray.push(5);
        }
  
        if(obserPets){
          set_obserPetsArray(obserPets);
          moduleArray.push(1);
        }
  
        if(questPets){
          set_questPetsArray(questPets);
          moduleArray.push(2);
        }
  
        if(ptPets){
          set_ptPetsArray(ptPets);
          moduleArray.push(3);
        }
        set_modularityArray(moduleArray);   
        
      }

    };

    // Menu items button actions
    const menuBtnAction = async (item,index) => {

      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      firebaseHelper.logEvent(firebaseHelper.event_menu, firebaseHelper.screen_menu, "Button Clicks", "Button Clicked: " + item.nav.toString());

      if(item.nav === 'ObservationsListComponent'){

        if(defaultPet.devices.length > 0 && defaultPet.devices[0].isDeviceSetupDone){

          let isPet = await findArrayElementByPetId(obserPetsArray,defaultPet.petID);
          if(isPet){
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(defaultPet));
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(obserPetsArray[0]));
          }
          
        } else {
          await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(obserPetsArray[0]));
        }
        navigation.navigate(item.nav);

      }else if(item.nav === 'QuestionnaireStudyComponent'){

        if(defaultPet.devices.length > 0 && defaultPet.devices[0].isDeviceSetupDone){
          
          let isPet = await findArrayElementByPetId(questPetsArray,defaultPet.petID);
          if(isPet){
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(defaultPet));
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(questPetsArray[0]));
          }
        } else {
          await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(questPetsArray[0]));
        }       
        navigation.navigate(item.nav,{defaultPetObj:defaultPet});

      }else if(item.nav === 'SensorInitialComponent'){

        navigation.navigate('MultipleDevicesComponent',{petObject:defaultPet});

      }else if(item.nav === 'Timer'){

        Apolloclient.client.writeQuery({query: Queries.TIMER_START_QUERY,data: {data: {timerStart:'',__typename: 'TimerStartQuery'}},});

        if(defaultPet.devices.length > 0 && defaultPet.devices[0].isDeviceSetupDone){
          let isPet = await findArrayElementByPetId(timerPetsArray,defaultPet.petID);
          if(isPet){
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(defaultPet));
          } else {
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(timerPetsArray[0]));
          }
        } else {
          await DataStorageLocal.saveDataToAsync(Constant.TIMER_SELECTED_PET, JSON.stringify(timerPetsArray[0]));
        }        
        navigation.navigate('TimerComponent'); 

      } else if(item.nav === 'CampaignService'){

        let leaderBoardArray = await DataStorageLocal.getDataFromAsync(Constant.LEADERBOARD_ARRAY);
        leaderBoardArray = JSON.parse(leaderBoardArray);
        let leaderBoardCurrent = await DataStorageLocal.getDataFromAsync(Constant.LEADERBOARD_CURRENT);
        leaderBoardCurrent = JSON.parse(leaderBoardCurrent);
        navigation.navigate("CampaignService", {leaderBoardArray: leaderBoardArray, leaderBoardCurrent: leaderBoardCurrent});

      } else if(item.nav === 'BeaconsInitialComponent'){

        navigation.navigate("BeaconsInitialComponent");

      }else if(item.nav === 'PetNameComponent'){

        removeOnboardData();
        navigation.navigate("PetNameComponent");

      } else{
        navigation.navigate(item.nav);
      }
      
    };

    // Navigates to Dashboard
    const menuHeaderBtnAction = () => {
      navigation.navigate('DashBoardService');
    };

    const removeOnboardData = async () => {
      await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
    };

    function findArrayElementByPetId(array, petId) {
      return array.find((element) => {
        return element.petID === petId;
      })
    };

    return (
        <MenuUI
            renderArray = {isFirstUser ? renderArrayFirstUser : renderArray}
            modularityArray = {modularityArray}
            menuBtnAction = {menuBtnAction}   
            menuHeaderBtnAction = {menuHeaderBtnAction}   
        />
    );

  }
  
  export default MenuComponent;