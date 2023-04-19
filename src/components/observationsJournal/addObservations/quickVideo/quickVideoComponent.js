import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler,Platform} from 'react-native';
import QuickVideoUI from './quickVideoUI';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../../utils/constants/constant";
import * as ImagePicker from 'react-native-image-picker';
import CameraRoll from "@react-native-community/cameraroll";
import { PermissionsAndroid } from 'react-native';
import { createThumbnail } from "react-native-create-thumbnail";
import moment from 'moment';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inQuickVideo;

const  QuickVideoComponent = ({navigation, route, ...props }) => {

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [videoPath, set_videoPath] = useState(undefined);
    const [thumbnailImage, set_thumbnailImage] = useState(undefined);
    const [videoName, set_videoName] = useState(undefined);
    const [isMediaSelection, set_isMediaSelection] = useState(false);
    const [mediaArray, set_mediaArray] = useState([]);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);

    React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      if(Platform.OS==='android'){
        requestCameraPermission();
        
      } else {
        chooseCamera();
      } 
      getObsDetails();

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        observationsQuickVideoSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_quick_video);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_quick_video, "User in Add Observations Quick Video Screen", ''); 
        deleteMedia();       
      });

      const unsubscribe = navigation.addListener('blur', () => {
        observationsQuickVideoSessionStop();
      });
  
      return () => {
        observationsQuickVideoSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        focus();
        unsubscribe();
      };

    }, []);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const observationsQuickVideoSessionStart = async () => {
      trace_inQuickVideo = await perf().startTrace('t_inQuickVideo');
    };
  
    const observationsQuickVideoSessionStop = async () => {
      await trace_inQuickVideo.stop();
    };

    const getObsDetails = async () => {

      let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      oJson = JSON.parse(oJson);
      if(oJson){
          firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video, firebaseHelper.screen_quick_video, "User Selected Quick Video option", 'Pet Id : '+oJson.selectedPet.petID);
          set_selectedPet(oJson.selectedPet);
      }
      
    };

    const requestCameraPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          chooseCamera();
        } else {
        }
      } catch (err) {}
    };

    const submitAction = async () => {

        let obsPets =  await DataStorageLocal.getDataFromAsync(Constant.ADD_OBSERVATIONS_PETS_ARRAY);
        obsPets = JSON.parse(obsPets);
        let obsObject = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
        obsObject = JSON.parse(obsObject);

        let obsObj = {
          selectedPet : obsObject ? obsObject.selectedPet : '',
          obsText : obsObject ? obsObject.obsText : '',
          obserItem : obsObject ? obsObject.obserItem : '', 
          selectedDate : obsObject ? obsObject.observationDateTime : new Date(),  
          mediaArray: mediaArray,
          fromScreen : obsObject ? obsObject.fromScreen : '',
          isPets : false,
          isEdit : false,
          behaviourItem : obsObject ? obsObject.behaviourItem : '', 
          observationId : obsObject ? obsObject.observationId : ''
      }

        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
        firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_action, firebaseHelper.screen_quick_video, "User clicked on Next", 'Pet Id : '+obsObject ? obsObject.selectedPet.petID : '');
        if(obsPets && obsPets.length>1){
            navigation.navigate('AddOBSSelectPetComponent',{petsArray : obsPets,defaultPetObj:obsObject.selectedPet});
        } else {
            navigation.navigate('ObservationComponent');
        }
              
    };

    const navigateToPrevious = () => { 
      
      if(popIdRef.current === 1){
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_quick_video, "User clicked on back button to navigate to Dashboard", '');     
        navigation.navigate("DashBoardService");  
      }
           
    };

    const selectMediaAction = async () => {
      firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_media_action, firebaseHelper.screen_quick_video, "User clicked on Choose Camera option", '');     
      chooseCamera();
    };

    const chooseCamera = async () => {

        let options = {
            mediaType: "video",
            durationLimit: 1200,
            videoQuality: "medium", // 'low', 'medium', or 'high'
            allowsEditing: true, //Allows Video for trimming
            storageOptions: {
              skipBackup: true,
              path: "Wearables",
            },
          };
          
          ImagePicker.launchCamera(options, (response) => {
      
            if (response.didCancel) {
            } else if (response.error) {
            } else {
      
              let sourceUri = "";
              let duration = undefined;

                sourceUri = response.assets[0].uri;               
           
                duration = response.assets[0].duration;
                // set_isLoading(true);

                var promise = CameraRoll.save(response.assets[0].uri, {
                  type: "video",
                  album: "Wearables",
                  // filename: "video"+moment(new Date()).format('MMDDYYYYhhmmss'),
                });
                promise.then(async function(result) {
                    let thumImg = undefined;
                    await createThumbnail({url: response.assets[0].uri,timeStamp: 10000,}).then(response => thumImg = response.path)
                    .catch(err => console.log({ err }));
                    set_videoPath(result);
                    set_thumbnailImage(thumImg)

                    var dateFile = moment().utcOffset("+00:00").format("YYYYMMDDHHmmss");

                    let vidObj = {
                      'filePath':response.assets[0].uri,
                      'fbFilePath':'',
                      'fileName':dateFile+"_"+response.assets[0].fileName,
                      'observationVideoId' : '',
                      'localThumbImg': thumImg,
                      'fileType':'video',
                      "isDeleted": 0,
                      "actualFbThumFile": '',
                      'thumbFilePath':response.assets[0].uri,
                      'compressedFile':''
                    }
                    set_mediaArray([vidObj]);

                  }) .catch(function(error) {});
            }
          });
      
    }

    const deleteMedia = async () => {

      let vid = await DataStorageLocal.getDataFromAsync(Constant.DELETE_VIDEO);
      vid = JSON.parse(vid);
      firebaseHelper.logEvent(firebaseHelper.event_observation_quick_video_delete_media_action, firebaseHelper.screen_quick_video, "User deleted recorded Video from list", '');     
      if(vid){

        set_videoPath(undefined);
        set_thumbnailImage(undefined);
        await DataStorageLocal.removeDataFromAsync(Constant.DELETE_VIDEO);

      }
      
    };

    const removeVideo = () => {

      set_popUpAlert('Alert');
      set_popUpMessage('Are you sure you want to delete the Video?');
      set_isPopUp(true);  
      popIdRef.current = 1;

    };

    const popOkBtnAction = () => {

      set_videoPath(undefined);
      set_thumbnailImage(undefined);
      popCancelBtnAction();
    };

    const popCancelBtnAction = () => {
      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_isPopUp(false);  
      popIdRef.current = 0;
    };

    return (
        <QuickVideoUI 
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            selectedPet = {selectedPet}
            videoPath = {videoPath}
            videoName = {videoName}
            thumbnailImage = {thumbnailImage}
            isMediaSelection = {isMediaSelection}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectMediaAction = {selectMediaAction}
            removeVideo = {removeVideo}
            // actionOnRow = {actionOnRow}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
        />
       
    );

  }
  
  export default QuickVideoComponent;
