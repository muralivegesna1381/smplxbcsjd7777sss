import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import ScoringImagePickerUI from './scoringImagePickerUI';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import storage, { firebase } from '@react-native-firebase/storage';
import * as internetCheck from "./../../utils/internetCheck/internetCheck";
import moment from 'moment';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const ScoringImagePickerComponent = ({ navigation, route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [isMediaSelection, set_isMediaSelection] = useState(false);
    const [imagePath, set_imagePath] = useState(undefined);
    const [loadingMsg, set_loadingMsg] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popupBtnTitle, set_popupBtnTitle] = useState(undefined);
    const [popupLftBtnEnable, set_popupLftBtnEnable] = useState(false);
    const [selectedObj, set_selectedObj] = useState(undefined);
    const [title, set_title] = useState(undefined);
    const [scoringTypeId, set_scoringTypeId] = useState(undefined);
    const [imageScoringId, set_imageScoringId] = useState(undefined);

    let trace_inImage_Scoring_ImagePicker_Screen;

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

     // Setting the firebase screen name
    useEffect(() => {
        
        firebaseHelper.reportScreen(firebaseHelper.screen_image_based_score_image_upload);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_image_based_score_image_upload, "User in ImageBased Image selection Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        imageScoringImagePickerPageSessionStart();
     
         return () => {
           imageScoringImagePickerPageSessionStop();
           BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    // Setting the prams values to local variables
    useEffect(() => {

        if (route.params?.selectedObj) {
            set_selectedObj(route.params?.selectedObj);
        }

        if (route.params?.scoreObj) {
            set_title(route.params?.scoreObj.scoringType);
        }

        if (route.params?.scoringTypeId) {
            set_scoringTypeId(route.params?.scoringTypeId);
        }

        if (route.params?.imageScoringId) {
            set_imageScoringId(route.params?.imageScoringId);
        }

    }, [route.params?.selectedObj, route.params?.scoreObj,route.params?.scoringTypeId,route.params?.imageScoringId]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    // Uploading image to firebase
    const submitAction = async () => {
        uploadImgToCLoud(imagePath);
    };

    // Navigates to previous screen
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_image_based_score_image_upload, "User clicked on back button to navigate to ImageScoringMainComponent", '');
            navigation.navigate("ImageScoringMainComponent");
        }
        
    };

    const imageScoringImagePickerPageSessionStart = async () => {
        trace_inImage_Scoring_ImagePicker_Screen = await perf().startTrace('t_Image_Scoring_ImagePicker_Screen');
      };
    
      const imageScoringImagePickerPageSessionStop = async () => {
        await trace_inImage_Scoring_ImagePicker_Screen.stop();
      };

    // Selecting the Image from Camera/Gallery
    const selectMediaAction = async () => {
        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_imagepicker_trigger, firebaseHelper.screen_image_based_score_image_upload, "User opened Camera/Gallery to chose image", "");
        chooseMultipleMedia();
    };

    // Selecting the image
    const chooseMultipleMedia = async () => {

        try {
            var response = await MultipleImagePicker.openPicker({
                selectedAssets: [],
                maxVideo: 0,
                usedCameraButton: true,
                singleSelectedMode: true,
                isCrop: false,
                isCropCircle: false,
                mediaType: "image",
                singleSelectedMode: true,
                selectedColor: '#f9813a',
                haveThumbnail: true,
                maxSelectedAssets: 1,
                allowedPhotograph: true,
                allowedVideoRecording: false,
                preventAutomaticLimitedAccessAlert: true,
                isPreview: true
            });
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_loaderMsg(undefined);
            if (response) {
                set_imagePath(response.path);
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_imagepicker_selected_trigger, firebaseHelper.screen_image_based_score_image_upload, "User selected/captured image for image based scoring", ""+response.path);
            }
        } catch (e) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_imagepicker_cancelled_trigger, firebaseHelper.screen_image_based_score_image_upload, "Image for image based scoring failed", ""+e.message);

        }
    };

    // Uploading the image to Firebase
    const uploadImgToCLoud = async (fileUrl) => {

        let internet = await internetCheck.internetCheck();
        set_loadingMsg('Please wait..');

        if (!internet) {
            set_popUpAlert(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_popupBtnTitle('OK');
            set_popupLftBtnEnable(false);
            set_isPopUp(true);
            popIdRef.current = 1;
        } else {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
            let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
            petObj = JSON.parse(petObj);
            firebaseHelper.logEvent(firebaseHelper.event_image_scoring_image_upload_api, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring image upload Api", "");
            let dte = moment(new Date()).format("YYYYMMDDHHmmss");
            let filename = "Wearables_Scoring_Images/" + petObj.petID.toString() + client.toString() + dte + "." + 'jpg';
            let reference = storage().ref(filename); // 2
            let task = reference.putFile(fileUrl); // 3
            task.on('state_changed', taskSnapshot => {
                set_loadingMsg("Uploading Image..." + '\n' +  + (Math.round(`${taskSnapshot.bytesTransferred}` / `${taskSnapshot.totalBytes}` * 100)) + ' % Completed');
            });

            task.then(() => {
                storage().ref(filename).getDownloadURL().then((url) => {
                    set_isLoading(false);
                    isLoadingdRef.current = 0;
                    set_loaderMsg(undefined);
                    firebaseHelper.logEvent(firebaseHelper.event_image_scoring_image_upload_api_success, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring image upload Api success", "");
                    sendScoringDetailsToBackend(url, client, petObj.petID);
                });

            }).catch((error) => {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_loaderMsg(undefined);
                set_popUpAlert(Constant.ALERT_DEFAULT_TITLE);
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_popupBtnTitle('OK');
                set_popupLftBtnEnable(false);
                set_isPopUp(true);
                popIdRef.current = 1;
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_image_upload_api_fail, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring image upload Api success", ""+error);
            });
        }

    };

    // Uploading the BCS,BFI or Stool object to backend
    const sendScoringDetailsToBackend = async (url, clientId, petId) => {

        let jsonScoring = {
            "imageScoreType": scoringTypeId,
            "imageScoringId": imageScoringId,
            "petId": petId,
            "petImgScoreDetails": [
              {
                "imageScoringDtlsId": selectedObj.imageScoringDetailsId,
                "imageUrl": url,
                "thumbnailUrl": "",
                "value": "",
                "uom": 0
              }
            ],
            "petParentId": clientId
          }

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_final_api, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring final Api", "");
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
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }

            if (data.status.success) {
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_success, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring final Api success", "");
                set_popUpAlert("Success");
                if(title==='BFI Scoring'){
                    set_popUpMessage(Constant.BFISCORING_SUCCESS_MSG);
                } else if(title==='BCS Scoring'){
                    set_popUpMessage(Constant.BCSCORING_SUCCESS_MSG);
                } else {
                    set_popUpMessage(Constant.STOOL_SCORING_SUCCESS_MSG);
                }
                
                set_popupBtnTitle('OK');
                set_isPopUp(true);
                popIdRef.current = 1;

            } else {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_loaderMsg(undefined);
                set_popUpAlert(Constant.ALERT_DEFAULT_TITLE);
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_popupBtnTitle('OK');
                set_popupLftBtnEnable(false);
                set_isPopUp(true);
                popIdRef.current = 1;

            }
        }).catch((error) => {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_loaderMsg(undefined);
                set_popUpAlert(Constant.ALERT_DEFAULT_TITLE);
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_popupBtnTitle('OK');
                popIdRef.current = 1;
                set_popupLftBtnEnable(false);
                set_isPopUp(true);
                firebaseHelper.logEvent(firebaseHelper.event_image_scoring_page_api_final_failure, firebaseHelper.screen_image_based_score_image_upload, "Image based scoring final Api failed", ""+error);
            });

    }

    // Removes the selected image from the memory
    const removeImageAction = () => {
        set_popUpAlert('Alert');
        set_popupBtnTitle('YES');
        set_popupLftBtnEnable(true);
        set_popUpMessage('Are you sure you want to delete the Image?');
        set_isPopUp(true);
        popIdRef.current = 1;
    };

    // Popup actions
    const popOkBtnAction = () => {

        if (popUpMessage === 'Are you sure you want to delete the Image?') {
            set_imagePath(undefined);
        } else if (popUpMessage === Constant.BCSCORING_SUCCESS_MSG || popUpMessage === Constant.BFISCORING_SUCCESS_MSG || popUpMessage === Constant.STOOL_SCORING_SUCCESS_MSG) {
            navigation.navigate("DashBoardService");
        }
        popCancelBtnAction();
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpAlert(undefined);
        set_popupBtnTitle('YES');
        set_popupLftBtnEnable(false);
        set_popUpMessage(undefined);
    };

    // Selection to take image
    const actionOnRow = (item) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
        if (item === 'GALLERY') {
            chooseImage();
        } if (item === 'CAMERA') {
            chooseCamera();
        }
        set_isMediaSelection(false);
        
    }

    return (

        <ScoringImagePickerUI
            title={title}
            isLoading={isLoading}
            loaderMsg={loadingMsg}
            isMediaSelection={isMediaSelection}
            popUpMessage={popUpMessage}
            popUpAlert={popUpAlert}
            isPopUp={isPopUp}
            imagePath={imagePath}
            popupBtnTitle={popupBtnTitle}
            popupLftBtnEnable={popupLftBtnEnable}
            navigateToPrevious={navigateToPrevious}
            submitAction={submitAction}
            selectMediaAction={selectMediaAction}
            removeImageAction={removeImageAction}
            popOkBtnAction={popOkBtnAction}
            popCancelBtnAction={popCancelBtnAction}
            actionOnRow={actionOnRow}
        />

    );

}

export default ScoringImagePickerComponent;