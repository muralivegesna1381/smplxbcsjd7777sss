import React, { useState, useEffect } from 'react';
import {View,BackHandler} from 'react-native';
import SelectDateEnthusiasmUI from './selectDateEnthusiasmUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';


const  SelectDateEnthusiasmComponent = ({navigation, route, ...props }) => {

    const [eatingObj, set_eatingObj] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let trace_inEatingEnthusiasm_Date_Screen;

    // Setting the firebase screen name
    useEffect(() => {

        getEatingData(); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_eating_enthusiasm_date);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_eating_enthusiasm_date, "User in Eating Enthusiasm Date selection Screen", '');
            eatingEnthusiasmDateSelectionScreenSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            eatingEnthusiasmDateSelectionScreenSessionStop();
        });

         return () => {
            focus();
            unsubscribe();
            eatingEnthusiasmDateSelectionScreenSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    // Setting the Eating values selected in the previous screen
    const getEatingData = async () => {
        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        firebaseHelper.logEvent(firebaseHelper.event_get_scale_selection_value, firebaseHelper.screen_eating_enthusiasm_date, "User selection in eating enthusiasm scale in main page", ''+JSON.parse(eatObj));
        if(eatObj){
            set_eatingObj(eatObj);
        }
    }

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const eatingEnthusiasmDateSelectionScreenSessionStart = async () => {
        trace_inEatingEnthusiasm_Date_Screen = await perf().startTrace('t_inEating_Enthusiasm_Date_Selection_Screen');
    };
    
    const eatingEnthusiasmDateSelectionScreenSessionStop = async () => {
        await trace_inEatingEnthusiasm_Date_Screen.stop();
    };

    // Saving the date selected value
    const submitAction = async (dateValue) => {

        let eatTempObj = {};

        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);

        eatTempObj = {
            sliderValue : eatObj.sliderValue, 
            eDate : ""+dateValue, 
            eTime : eatObj.eTime, 
        }
      
        await DataStorageLocal.saveDataToAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ,JSON.stringify(eatTempObj));
        firebaseHelper.logEvent(firebaseHelper.event_get_scale_selection_value, firebaseHelper.screen_eating_enthusiasm_date, "User date selection object value", ''+JSON.stringify(eatTempObj));
        navigation.navigate('EatingTimeComponentUI');

    };

    // Navigates to previous screen
    const navigateToPrevious = () => {        
        navigation.navigate("EatingEnthusiasticComponent");     
    };

    return (

        <SelectDateEnthusiasmUI 
            eatingObj = {eatingObj}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
        />
    );

  }
  
  export default SelectDateEnthusiasmComponent;