import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import ImageScoringMainUI from './imageScoringMainUI';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const ImageScoringMainComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [isDetailsView, set_isDetailsView] = useState(false);
    const [scoreObj, set_scoreObj] = useState(undefined);
    const [selectedObj, set_selectedObj] = useState(undefined);
    const [scoringTypeId, set_scoringTypeId] = useState(undefined);
    const [imageScoringId, set_imageScoringId] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let trace_inImage_Scoring_Main_Screen;
    let trace_ImageScoring_Send_Score_Details_API_Complete;

      // Setting the firebase screen name
      useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
     
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score_measurements);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score_measurements, "User in ImageBased Measurements Screen", ''); 
            imageScoringMainPageSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            imageScoringMainPageSessionStop();
        });

         return () => {
           imageScoringMainPageSessionStop();
           focus();
           unsubscribe();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

      }, []);

    // Setting the selected scoring obi from previous screen to local variable
    useEffect(() => {

        if (route.params?.scoreObj) {
            set_scoreObj(route.params?.scoreObj);
            set_scoringTypeId(route.params?.scoreObj.scoringTypeId);
            set_imageScoringId(route.params?.scoreObj.imageScoringScaleId);
        }

    }, [route.params?.scoreObj]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Navigates previous creen
    const navigateToPrevious = () => {

        if(popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_image_based_score_measurements, "User clicked on back button to navigate to SelectBSCScoringComponent", '');
            navigation.navigate('SelectBSCScoringComponent');
        }
       
    };

    // Navigates to Date selection class if the objecct relates to BCS,BFI or Stool, or submits the record to backend
    const submitAction = (dataArray) => {

        if(scoringTypeId===4){
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_final_api, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api called", "Scoring type: "+scoringTypeId);
            sendScoringDetailsToBackend(dataArray);
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_measurement_button_trigger, firebaseHelper.screen_image_based_score_measurements, "User clicked on next to image upload for image based scoring", "Data: "+dataArray);
            navigation.navigate('ScoringImagePickerComponent', { selectedObj: selectedObj, scoreObj:scoreObj, scoringTypeId:scoringTypeId, imageScoringId:imageScoringId });
        }

    };

    // API call to submit the HWP Measurements Object
    const sendScoringDetailsToBackend = async (dataArray) => {
        trace_ImageScoring_Send_Score_Details_API_Complete = await perf().startTrace('t_Image_Scoring_Send_Scoring_Details_API');
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        let tempArray = [];

        for (let i = 0; i < dataArray.length; i++){

            let obj = {
                "imageScoringDtlsId": dataArray[i].imageScoringDetailsId,
                "imageUrl": "",
                "thumbnailUrl": "",
                "value": dataArray[i].txtValue,
                "uom": 0
            }
            tempArray.push(obj);

        }

        let jsonScoring = {
            "imageScoreType": scoringTypeId,
            "imageScoringId": imageScoringId,
            // "petImageScoringId": scoringTypeId,
            "petId": petObj.petID,
            "petImgScoreDetails": tempArray,
            "petParentId": client
          }

        set_isLoading(true);
        isLoadingdRef.current = 1;
        fetch(EnvironmentJava.uri + "pets/addPetImageScoring/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "ClientToken" : token
                },

                body: JSON.stringify(jsonScoring),
            }
        ).then((response) => response.json()).then(async (data) => {

            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                stopFBTraceSendScoringData();
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }

            if (data.status.success) {
                stopFBTraceSendScoringData();
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_success, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api success", "");
                set_popupAlert('Success');
                set_popupMsg(Constant.HWPMEASUREMENT_SUCCESS_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
                
            } else {
                stopFBTraceSendScoringData();
                set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_popupMsg(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;

            }
        }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_measurements, "Final image based scoring Api failed", ""+err);
            stopFBTraceSendScoringData();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
            set_popupMsg(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;
        });

    }

    // By setting false, Popup will dissappear from the screen
    const popOkBtnAction = () => {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popupAlert(undefined);
        set_popupMsg(undefined);
        if(scoringTypeId===4){
            navigation.navigate("DashBoardService");
        }
    };

    const selectImageAction = (item) => {
        set_selectedObj(item)
    };

    const imageScoringMainPageSessionStart = async () => {
        trace_inImage_Scoring_Main_Screen = await perf().startTrace('t_Image_Scoring_Main_Screen');
      };
    
      const imageScoringMainPageSessionStop = async () => {
        await trace_inImage_Scoring_Main_Screen.stop();
      };

      const stopFBTraceSendScoringData = async () => {
        await trace_ImageScoring_Send_Score_Details_API_Complete.stop();
    };

    return (
        <ImageScoringMainUI
            isLoading={isLoading}
            isPopUp={isPopUp}
            popupMsg={popupMsg}
            popupAlert = {popupAlert}
            isDetailsView={isDetailsView}
            scoreObj={scoreObj}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
            selectImageAction={selectImageAction}
        />
    );

}

export default ImageScoringMainComponent;