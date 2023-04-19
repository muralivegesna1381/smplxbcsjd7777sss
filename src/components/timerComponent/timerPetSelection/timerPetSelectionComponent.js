import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import TimerPetSelectionUI from './timerPetSelectionUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inTimerPetSelScreen;

const  TimerPetSelectionComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    useEffect(() => {

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_timer_pets);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_timer_pets, "User in Timer Pets Selection Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

     useEffect(() => {
         if(route.params?.petsArray){
            let duplicates = getUnique(route.params?.petsArray, 'petID');
            set_petsArray(duplicates);
            if(duplicates && route.params?.defaultPetObj){
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

    const initialSessionStart = async () => {
        trace_inTimerPetSelScreen = await perf().startTrace('t_inTimerPetSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inTimerPetSelScreen.stop();
    };

    // removes the duplicate objects from the Pets array
    function getUnique(petArray, index) {
        const uniqueArray = petArray.map(e => e[index]).map((e, i, final) => final.indexOf(e) === i && i).filter(e => petArray[e]).map(e => petArray[e]);
        return uniqueArray;
    };

    const submitAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_timer_selected_pet, firebaseHelper.screen_timer_activity, "User selected Pet for Timer ", "Pet Id : "+selectedPet ? selectedPet.petID : '');
        navigation.navigate('TimerActivityComponent',{timerPet : selectedPet});
    }

    const navigateToPrevious = () => {        
       navigation.navigate('TimerComponent');     
    }

    const selectPetAction = (item) => {
       set_selectedPet(item);
       set_nxtBtnEnable(true);
    }

    return (
        <TimerPetSelectionUI 
            petsArray = {petsArray}
            defaultPetObj = {defaultPetObj}
            nxtBtnEnable = {nxtBtnEnable}
            selectedIndex = {selectedIndex}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default TimerPetSelectionComponent;