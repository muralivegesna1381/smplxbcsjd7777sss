import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import SelectBSCScoringUI from './SelectBSCScoringUI';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const SelectBSCScoringComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [scoringArray, set_scoringArray] = useState([]);
    const [date, set_Date] = useState(new Date());
    
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let trace_inBCS_Scoring_Screen;
    let trace_Get_Pet_ImageScoring_Scales_API_Complete;

    useEffect(() => {
        
        getPetImageScoringScales();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score, "User in ImageBased scoring Screen", ''); 
            imageScoringBCSScoringPageSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            imageScoringBCSScoringPageSessionStop();
        });

         return () => {
           imageScoringBCSScoringPageSessionStop();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };
     
    }, []);

    const imageScoringBCSScoringPageSessionStart = async () => {
        trace_inBCS_Scoring_Screen = await perf().startTrace('t_Image_Scoring_BCS_Scoring_Screen');
    };
    
    const imageScoringBCSScoringPageSessionStop = async () => {
        await trace_inBCS_Scoring_Screen.stop();
    };

    const stopFBTraceGetPetImageScoringScales = async () => {
        await trace_Get_Pet_ImageScoring_Scales_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // API to get the Imagebased scoring records from backend
    const getPetImageScoringScales = async () => {

        trace_Get_Pet_ImageScoring_Scales_API_Complete = await perf().startTrace('t_Image_Scoring_Get_Pet_Image_Scoring_Scales_API');
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api called", "Pet Id: "+petObj.petID);
        if (petObj) {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            fetch(EnvironmentJava.uri + "pets/getPetImageScoringScales/" + petObj.petID,
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
                if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                    stopFBTraceGetPetImageScoringScales();
                    AuthoriseCheck.authoriseCheck();
                    navigation.navigate('WelcomeComponent');
                }

                if (data.status.success) {
                    stopFBTraceGetPetImageScoringScales();
                    set_scoringArray(data.response.imageScoringScales);
                    firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_success, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api success", "Response length: "+data.response.imageScoringScales.length);
                } else {
                    stopFBTraceGetPetImageScoringScales();
                    set_popupMsg(Constant.SERVICE_FAIL_MSG);
                    set_isPopUp(true);
                    popIdRef.current = 1;

                }
            }).catch((error) => {
                    stopFBTraceGetPetImageScoringScales();
                    firebaseHelper.logEvent(firebaseHelper.event_image_scoring_pet_image_scoring_scales_api_failure, firebaseHelper.screen_image_based_score, "Get Pet Image Scoring scales Api failed", ""+error);
                    set_isLoading(false);
                    isLoadingdRef.current = 0;
                    set_popupMsg(Constant.SERVICE_FAIL_MSG);
                    set_isPopUp(true);
                    popIdRef.current = 1;
            });

        }

    };

    // Navigates to previous screen
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_image_based_score, "User clicked on back button to navigate to DashBoardService", '');
            navigation.navigate('DashBoardService');
        }
        
    };

    // Popup btn actions
    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupMsg(undefined);
    };

    // Navigates to Images scoring component
    const selectActivityAction = (item, index) => {
        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_button_trigger, firebaseHelper.screen_image_based_score, "User selected item", ''+item);
        navigation.navigate('ImageScoringMainComponent', { scoreObj: item });
    };

    return (
        <SelectBSCScoringUI
            isPopUp={isPopUp}
            popupMsg={popupMsg}
            isLoading={isLoading}
            scoringArray={scoringArray}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            selectActivityAction={selectActivityAction}
        />
    );

}

export default SelectBSCScoringComponent;