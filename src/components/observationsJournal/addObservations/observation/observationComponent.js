import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import ObservationUI from './observationUI';
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../../utils/constants/constant";
import { useLazyQuery } from "@apollo/react-hooks";
import * as Queries from "./../../../../config/apollo/queries";
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import BuildEnvJAVA from './../../../../config/environment/enviJava.config';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../../../utils/authorisedComponent/authorisedComponent';

let trace_inAddObservation_SelectBehvaior_ObsText;
let trace_Get_Behaviors_API_Complete;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  ObservationComponent = ({navigation, route, ...props }) => {

    const [getBehavioursRequest,{loading: getBehavioursLoading, error: getBehavioursError, data: getBehavioursData,}] = useLazyQuery(Queries.GET_BEHAVIORS);

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [obsText , set_obsText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [obsObject, set_obsObject] = useState(undefined);
    const [behName, set_behName] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
    const [obserItem, set_obserItem] = useState("");
    const [isPets, set_isPets] = useState(false);
    const [behType,set_behType] = useState(1);

    let fromScreen = useRef();
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {    
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          observationsAddObsTextSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_text_beh);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_text_beh, "User in Add Observations Obs Text and behavior Selection Screen", '');
          getObsDetails();
        });

        const unsubscribe = navigation.addListener('blur', () => {
          observationsAddObsTextSessionStop();
        });

        return () => {
            observationsAddObsTextSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
            unsubscribe();
          };

    }, [navigation]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const observationsAddObsTextSessionStart = async () => {
      trace_inAddObservation_SelectBehvaior_ObsText = await perf().startTrace('t_inObservationsList');
    };  

    const observationsAddObsTextSessionStop = async () => {
      await trace_inAddObservation_SelectBehvaior_ObsText.stop();
    }; 

    const getObsDetails = async () => {

      let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      oJson = JSON.parse(oJson);
      if(oJson){
          set_obsObject(oJson);
          set_selectedPet(oJson.selectedPet);
          fromScreen.current = oJson.fromScreen;
          set_obsText(oJson.obsText);
          if(oJson.obsText && oJson.obserItem){
            set_nxtBtnEnable(true)
          } else {
            set_nxtBtnEnable(false)
          }
          
          if(oJson.obserItem){
            set_behName(oJson.obserItem.behaviorName); 
            set_behType(oJson.obserItem.behaviorTypeId);
          }
          
          set_obserItem(oJson.obserItem); 
          set_isPets(oJson.isPets);

          set_isLoading(true);
          isLoadingdRef.current = 1;
          firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api, firebaseHelper.screen_add_observations_text_beh, "Initiating the Behaviors api", 'Species Id : '+oJson.selectedPet.speciesId);
          behavioursAPIRequest(oJson.selectedPet.speciesId);
      }
    };

    function findArrayElementByBehId(array, behaviorType) {
      return array.find((element) => {
        return element.behaviorType === behaviorType;
      })
    };

    function sortByAscending(arrayBeh) {
      const sortedList = arrayBeh.sort((a, b) => a.behaviorName.localeCompare(b.behaviorName));
        return sortedList;
    }
    
    const behavioursAPIRequest = async (sId) => {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderMsg(Constant.BEHAVIOURS_LOADING_MSG);
        getBehavioursFromBckEnd(sId);

    };

    const getBehavioursFromBckEnd = async (sId) => {

      if(!sId){
        sId = 1;
      }

      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      trace_Get_Behaviors_API_Complete = await perf().startTrace('t_Get_Behaviors_API');
      // trace_Get_Behaviors_API_Complete.putAttribute('PetId ', petId);
      fetch(EnvironmentJava.uri + "pets/getPetBehaviors/" + sId,
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
          isLoadingdRef.current = 0;
          stopFBTraceGetBehaviors();
          if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
          }
          if(data && data.status.success) {
            firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_success, firebaseHelper.screen_add_observations_text_beh, "Behaviors api success", '');
            let behArray = sortByAscending(data.response.petBehaviorList);
            set_behavioursData(behArray);
            
          }
          
        }).catch((error) => {
          set_isLoading(false);
          isLoadingdRef.current = 0;
          firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_api_fail, firebaseHelper.screen_add_observations_text_beh, "Behaviors api fail", 'error : '+error);
          stopFBTraceGetBehaviors();
        });

    };

    const stopFBTraceGetBehaviors = async () => {
      await trace_Get_Behaviors_API_Complete.stop();
    };

    const submitAction = async (obsText,item) => {
        set_obsText(obsText);
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_submit, firebaseHelper.screen_add_observations_text_beh, "User clicked on Submit ", 'Internet Status : '+internet);
        if(!internet){

            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;

        } else {

            let obsObj = {
              selectedPet : obsObject ? obsObject.selectedPet : '',
              obsText : obsText, 
              obserItem : item ? item : obsObject.obserItem, 
              selectedDate : obsObject ? obsObject.selectedDate : '',  
              mediaArray: obsObject ? obsObject.mediaArray : [],
              fromScreen : obsObject ? obsObject.fromScreen : '',
              isPets : obsObject ? obsObject.isPets : '',
              isEdit : obsObject ? obsObject.isEdit : false,
              behaviourItem : item ? item : obsObject.behaviourItem, 
              observationId : obsObject ? obsObject.observationId : '',
            }
            firebaseHelper.logEvent(firebaseHelper.event_add_observations_txtBeh_submit, firebaseHelper.screen_add_observations_text_beh, "Behaviour Text : "+obsText, 'Behavior Id : '+item.behaviorId);
            await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));

            navigation.navigate("SelectDateComponent");  
        }        
        
    };

    const navigateToPrevious = () => {   

      if(isLoadingdRef.current === 0 && popIdRef.current === 0){

        if(fromScreen.current==='obsList'){
          if(isPets){
            navigation.navigate("AddOBSSelectPetComponent"); 
          }else {
            navigation.navigate("ObservationsListComponent"); 
          }
          
        } else if(fromScreen.current==='quickVideo'){
  
          if(isPets){
            navigation.navigate("AddOBSSelectPetComponent"); 
          }else {
            navigation.navigate("QuickVideoComponent"); 
          }
  
          
        } else if(fromScreen.current==='viewObs'){
          navigation.navigate("ViewObservationService"); 
        }
        
        else {
          navigation.navigate("AddOBSSelectPetComponent"); 
        }

      }
          
    };

    const popOkBtnAction = () => {
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
    }

    return (
        <ObservationUI 
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            behavioursData = {behavioursData}
            obsText = {obsText}
            behName = {behName}
            obserItem = {obserItem}
            nxtBtnEnable = {nxtBtnEnable}
            behType = {behType}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default ObservationComponent;