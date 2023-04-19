import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import AddOBSSelectPetUI from './addOBSSelectePetUI';
import * as internetCheck from "./../../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inObservationsList;

const  AddOBSSelectPetComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [fromScreen, set_fromScreen] = useState(undefined);

    const fromScreen1 = useRef(undefined);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick); 
        getObsDetails(); 
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            observationSelectPetStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_pets);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_pets, "User in Add Observations Pets Selection Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            observationSelectPetStop();
        });
    
        return () => {
            observationSelectPetStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
      }, []);

    useEffect(() => {

        if(route.params?.petsArray){
            let duplicates = getUnique(route.params?.petsArray, 'petID');
            set_petsArray(duplicates);

            if(route.params?.defaultPetObj){
                for (let i=0; i < duplicates.length; i++){
                    if(duplicates[i].petID === route.params?.defaultPetObj.petID){
                        set_selectedPet(duplicates[i]);
                        set_selectedIndex(i);
                        set_nxtBtnEnable(true);                    
                    }
                }
            }
        }

        if(route.params?.defaultPetObj){
            set_defaultPetObj(route.params?.defaultPetObj);
        }

    }, [route.params?.petsArray,route.params?.defaultPetObj]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
        const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
        return uniqueArray;
    };

    const observationSelectPetStart = async () => {
        trace_inObservationsList = await perf().startTrace('t_inAddObservationSelectPet');
    };
    
    const observationSelectPetStop = async () => {
        await trace_inObservationsList.stop();
    };

    const getObsDetails = async () => {

        let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
        oJson = JSON.parse(oJson);
       
        if(oJson){

            set_fromScreen(oJson.fromScreen);
            fromScreen1.current = oJson.fromScreen;

        }
      };

    const submitAction = async () => {
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_add_observations_pet_selection, firebaseHelper.screen_add_observations_pets, "Pet selection to add observation", 'Pet Id : '+selectedPet ? selectedPet.petID : '');
        if(!internet){

            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);

        } else {

            let obsObject = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
            obsObject = JSON.parse(obsObject);

            let obsObj = {
                selectedPet : selectedPet,
                obsText : obsObject ? obsObject.obsText : '', 
                obserItem : obsObject ? obsObject.obserItem : '', 
                selectedDate : obsObject ? obsObject.selectedDate : new Date(),  
                mediaArray: obsObject ? obsObject.mediaArray : [],
                fromScreen : 'fromPets',
                isPets : obsObject ? obsObject.isPets : '',
                isEdit : obsObject ? obsObject.isEdit : false,
                behaviourItem : obsObject ? obsObject.behaviourItem : '', 
                observationId : ''
            }
      
            await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
            navigation.navigate('ObservationComponent');
        }
        
    }

    const navigateToPrevious = () => {      
        
        if(fromScreen1.current==='quickVideo'){
            navigation.navigate('QuickVideoComponent');  
        } else {
            navigation.navigate('ObservationsListComponent');  
        }
          
    }

    const selectPetAction = (item) => {
       set_selectedPet(item);
       set_nxtBtnEnable(true);
    };

    const popOkBtnAction = () => {
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_isPopUp(false);
    };

    return (
        <AddOBSSelectPetUI 
            petsArray = {petsArray}
            nxtBtnEnable = {nxtBtnEnable}
            selectedIndex = {selectedIndex}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            fromScreen = {fromScreen}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectPetAction = {selectPetAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default AddOBSSelectPetComponent;