import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import QuestionnaireStudyUI from './questionnaireStudyUI';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inQuestionnaireScreen;
let trace_Questionnaire_API_Complete;
const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  QuestionnaireStudyComponent = ({navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [petsArray, set_petsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [questionnaireData, set_questionnaireData] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

     /**
   * This Useeffect calls when there is cahnge in API responce
   * All the Observations data will be saved for rendering in UI
   */
    React.useEffect(() => {
      
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          initialSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_questionnaire_study);  
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_questionnaire_study, "User in Questionnaire Study Screen", '');
          getQuestPets();
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

    }, [navigation]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inQuestionnaireScreen = await perf().startTrace('t_inQuestionnaireScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inQuestionnaireScreen.stop();
    };

    const getQuestPets = async () => {

        let questPets =  await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIR_PETS_ARRAY);
        questPets = JSON.parse(questPets);
        let duplicates = getUnique(questPets, 'petID');
        set_petsArray(duplicates);
        
        let defPet = await DataStorageLocal.getDataFromAsync(Constant.QUESTIONNAIRE_SELECTED_PET);
        set_defaultPetObj(JSON.parse(defPet));
        getQuestionnaireData(JSON.parse(defPet).petID);
        
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
      const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
      return uniqueArray;
    };

    const getQuestionnaireData = async (petId) => {

      trace_Questionnaire_API_Complete = await perf().startTrace('t_GetQuestionnaireByPetId_API');
      firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api, firebaseHelper.screen_questionnaire_study, "Initiated API to get Questionnaires", 'Pet Id : '+petId);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        if(petId){
          
          set_isLoading(true);
          isLoadingdRef.current = 1;
          fetch(EnvironmentJava.uri+ "getQuestionnaireByPetId/"  + petId,
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
            stopFBTrace();
            isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }
            if (data.status.success) {
              firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_success, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API success", '');
              if(data.response && data.response.questionnaireList.length>0){   
                firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_success, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API success", 'Questionnaires : '+data.response.questionnaireList.length);        
                set_questionnaireData(data.response.questionnaireList);
              }else {
                firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_success, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API success", 'Questionnaires : '+data.response.questionnaireList.length);        
                 set_questionnaireData(undefined);
              }
              
            }else {
              firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", 'error : '+error);        
              set_popUpMessage(Constant.SERVICE_FAIL_MSG);
              set_isPopUp(true);
              popIdRef.current = 1;
              set_isLoading(false);
              isLoadingdRef.current = 0;
            } 
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_api_fail, firebaseHelper.screen_questionnaire_study, "Get Questionnaires API Fail", 'error : '+error); 
            stopFBTrace();       
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;
            set_isLoading(false);
            isLoadingdRef.current = 0;
          });
        }
    };

    const stopFBTrace = async () => {
      await trace_Questionnaire_API_Complete.stop();
    };

    const navigateToPrevious = () => { 
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_questionnaire_study, "User clicked on back button to navigate to DashBoardService", '');
        navigation.navigate("DashBoardService");  
      }    
    }

    const popOkBtnAction = (value,) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
    }

    const questPetSelection = (pObject) => {
        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_pet_swipe_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected another Pet for Questionnaires", 'Pet Id : '+pObject.petID);
        getQuestPets();
        
    };

    const selectQuetionnaireAction = (item) => {
        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_study_question_button_trigger, firebaseHelper.screen_questionnaire_study, "User selected Question : ", 'Questionnaire Name : '+item.questionnaireName);
        navigation.navigate('QuestionnaireQuestionsService',{questionObject : item, petObj : defaultPetObj});
    };

    return (
        <QuestionnaireStudyUI 
            defaultPetObj = {defaultPetObj}
            petsArray = {petsArray}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            popUpTitle = {popUpTitle}
            isLoading = {isLoading}
            questionnaireData = {questionnaireData}
            popOkBtnAction = {popOkBtnAction}
            questPetSelection = {questPetSelection}
            navigateToPrevious = {navigateToPrevious}
            selectQuetionnaireAction = {selectQuetionnaireAction}
        />
    );

  }
  
  export default QuestionnaireStudyComponent;