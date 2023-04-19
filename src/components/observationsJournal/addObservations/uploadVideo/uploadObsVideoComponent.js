import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler,Platform,AppState} from 'react-native';
import UploadObsVideoUI from './uploadObsVideoUI';
import RNVideoHelper from "react-native-video-helper";
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import * as DataStorageLocal from "./../../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../../utils/constants/constant";
import * as ImagePicker from 'react-native-image-picker';
import RNThumbnail from "react-native-thumbnail";
import MediaMeta from "react-native-media-meta";
import { PermissionsAndroid } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import { createThumbnail } from "react-native-create-thumbnail";
import { Video } from 'react-native-compressor';
import moment from 'moment';
import * as firebaseHelper from './../../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

var RNFS = require('react-native-fs');

let trace_inMediaSelection;

const  UploadObsVideoComponent = ({navigation, route, ...props }) => {

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(false);
    const [imagePath, set_imagePath] = useState(undefined);
    const [videoPath, set_videoPath] = useState(undefined);
    const [thumbnailImage, set_thumbnailImage] = useState(undefined);
    const [imgName, set_imgName] = useState(undefined);
    const [videoName, set_videoName] = useState(undefined);
    const [isMediaSelection, set_isMediaSelection] = useState(false);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUpleftBtnEnable, set_popUpleftBtnEnable] = useState(true);
    const [date, set_Date] = useState(new Date());
    const [obsObject, set_obsObject] = useState(undefined);
    const [optionsArray, set_optionsArray] = useState(['CAMERA','GALLERY','CANCEL']);
    const [mediaSize, set_mediaSize] = useState(0);
    const [mediaArray, set_mediaArray] = useState([]);
    const [isEdit, set_isEdit] = useState(false);

    let deleteSelectedMediaFile = useRef(undefined);
    let deletedMediaArray = useRef([]);
    let popIdRef = useRef(0);

    const appState = useRef(AppState.currentState);

    React.useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      if(Platform.OS==='android'){
        requestCameraPermission();
      }   
      getObsDetails();

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        observationsMediaSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_add_observations_media);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_add_observations_media, "User in Add Observations Media selection Screen", ''); 
        deleteMedia();
      });

      const unsubscribe = navigation.addListener('blur', () => {
        observationsMediaSessionStop();
      });
  
      return () => {
        observationsMediaSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        focus();
        unsubscribe();
      };

    }, []);

    const observationsMediaSessionStart = async () => {
      trace_inMediaSelection = await perf().startTrace('t_inAdd_Observation_MediaSelection');
    };
  
    const observationsMediaSessionStop = async () => {
      await trace_inMediaSelection.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const getObsDetails = async () => {

      let oJson = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_DATA_OBJ);
      oJson = JSON.parse(oJson);
      if(oJson){
          set_obsObject(oJson);
          set_selectedPet(oJson.selectedPet);
          set_isEdit(oJson.isEdit);
          if(oJson && oJson.mediaArray){

            set_mediaArray(oJson.mediaArray);
            set_mediaSize(oJson.mediaArray.length);

          } else {
            set_mediaArray([]);
          }
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
        } else {
        }
      } catch (err) {}

      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "App Camera Permission",
            message:"App needs access to your camera ",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK"
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        } else {
        }
      } catch (err) {}
    };

    const deleteMedia = async () => {

      let delMedia =  await DataStorageLocal.getDataFromAsync(Constant.DELETE_MEDIA_RECORDS);
      delMedia = JSON.parse(delMedia);

      if(delMedia){
        set_mediaArray(delMedia);
      }
      
    }

    const submitAction = async () => {

      let obsObj = {
        selectedPet : obsObject ? obsObject.selectedPet : '',
        obsText : obsObject.obsText, 
        obserItem : obsObject.obserItem, 
        selectedDate : obsObject ? obsObject.selectedDate : '',   
        mediaArray: mediaArray,
        fromScreen : obsObject ? obsObject.fromScreen : '',
        isPets : obsObject ? obsObject.isPets : '',
        isEdit : obsObject ? obsObject.isEdit : false,
        behaviourItem : obsObject.behaviourItem, 
        observationId : obsObject ? obsObject.observationId : '',
      }

      firebaseHelper.logEvent(firebaseHelper.event_add_observations_media_submit, firebaseHelper.screen_add_observations_media, "User selected Media ", 'No of Media : '+mediaArray.length);
      await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ,JSON.stringify(obsObj));
      navigation.navigate("ObsReviewComponent",{deletedMedia:deletedMediaArray.current});

    };

    const navigateToPrevious = () => { 
      
      if(popIdRef.current === 1){
      } else {
        navigation.navigate("SelectDateComponent");
      }       
             
    };

    const selectMediaAction = async () => {

      if(mediaSize < 5){
        
        if(Platform.OS==='android') {
          // chooseMultipleMedia();
          set_optionsArray(['CAMERA','GALLERY','CANCEL']);
          set_isMediaSelection(!isMediaSelection);
        } else {
          
          set_optionsArray(['CAMERA','GALLERY','CANCEL']);
          set_isMediaSelection(!isMediaSelection);
        }

      } else {
        set_popUpMessage('You have choosen max media that can be uploaded for one Observation at a time.');
        set_popUpAlert('Sorry!');
        set_popUpleftBtnEnable(false);
        set_isPopUp(true);
        popIdRef.current = 1;
      }

    };

    const chooseImage = () => {

      ImagePicker.launchImageLibrary({
        mediaType: 'mixed',
        includeBase64: false,
        selectionLimit: 5 - mediaSize,
        durationLimit:1200,
        includeExtra : true
      },
      async (response) => {

        set_loaderMsg('');
        set_isLoading(false);
        if(response && response.assets){

            let mArray = mediaArray;

            for (let i = 0; i < response.assets.length; i++){

              if(response.assets[i].type.includes('image')){

                let isExists = undefined;
                if(mArray && mArray.length>0){

                  const isFound = mArray.some(element => {

                    if (element.fileName === response.assets[i].fileName) {
                      isExists = true;
                    } else {
                    }

                  });

                }

                if(isExists){

                } else {

                  let imgObj = {
                    'filePath':response.assets[i].uri,
                    'fbFilePath':'',
                    'fileName':response.assets[i].fileName,
                    'observationPhotoId' : '',
                    'localThumbImg': '',
                    'fileType':'image',
                    "isDeleted": 0,
                    "actualFbThumFile": '',
                    'thumbFilePath':'',
                    'compressedFile':''
                  };
    
                    mArray.push(imgObj);
                }
             
 
              } 
              
              if(response.assets[i].type.includes('video')){

                let _uri ='';
                _uri = response.assets[i].uri.replace("file:///", "/");
                
                // var dateFile = moment().utcOffset("+00:00").format("YYYYMMDDHHmmss");

                // await MediaMeta.get(_uri).then((metadata) => {
                //   dateFile = moment(metadata.creationDate).utcOffset("+00:00").format("YYYYMMDDHHmmss");    
                // }).catch((err) => 
                // );

                var dateFile = moment().utcOffset("+00:00").format("YYYYMMDDHHmmss");

                if(response.assets[i].timestamp){
                  dateFile = moment(response.assets[i].timestamp).utcOffset("+00:00").format("YYYYMMDDHHmmss");
                }
                let isExists = undefined;
                if(mArray && mArray.length>0){

                  const isFound = mArray.some(element => {

                    let spliTArray = element.fileName.split('_#');
                    if (spliTArray[1] === response.assets[i].fileName) {
                      isExists = true;
                    } else {
                    }

                  });

                }
                
                if(isExists){

                } else {
                  let thumImg = undefined;
                await createThumbnail({url: response.assets[i].uri,timeStamp: 10000,}).then(response => thumImg = response.path).catch(err => console.log({ err }));
                
                let vidObj = {
                  'filePath':response.assets[i].uri,
                  'fbFilePath':'',
                  'fileName':dateFile+"_#"+response.assets[i].fileName,
                  'observationVideoId' : '',
                  'localThumbImg': thumImg,
                  'fileType':'video',
                  "isDeleted": 0,
                  "actualFbThumFile": '',
                  'thumbFilePath':'',
                  'compressedFile':''
                };

                mArray.splice(0, 0, vidObj);
                }

              }
            }

            set_mediaArray(mArray);
            set_mediaSize(mArray.length);

        }

      },)

    };

    function formatBytes(a,b=2){
      if(0===a)
      return"0 Bytes";
      const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));
      return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]
    }


    const chooseCamera = async (value) => {

      let options = {
          mediaType: value,
          durationLimit: 1200,
          videoQuality: "medium", // 'low', 'medium', or 'high'
          allowsEditing: true, //Allows Video for trimming
          storageOptions: {
            skipBackup: true,
            path: "Wearables",
          },
        };
        ImagePicker.launchCamera(options, async (response) => {
    
          if (response.didCancel) {
          } else if (response.error) {
          } else {
            set_loaderMsg('');
            set_isLoading(false);

            let mArray = mediaArray;

              var promise = CameraRoll.save(response.assets[0].uri, {
                type: "video",
                album: "Wearables",
                filename: "video"+moment(new Date()).format('MMDDYYYYhhmmss'),
              });
              promise.then(async function(result) {
                  if(response.assets[0].type.includes('video')){

                    let thumImg = undefined;
                    await createThumbnail({url: response.assets[0].uri,timeStamp: 10000,}).then(response => thumImg = response.path)
                    .catch(err => console.log({ err }));
                    
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
                    };

                    mArray.splice(0, 0, vidObj);
                    set_mediaArray(mArray);
                    set_mediaSize(mArray.length);
    
                  }
                
                }) .catch(function(error) {});

              if(response.assets[0].type.includes('image')){

                let imgObj = {
                  'filePath':response.assets[0].uri,
                  'fbFilePath':'',
                  'fileName':response.assets[0].fileName,
                  'observationPhotoId' : '',
                  'localThumbImg': '',
                  'fileType':'image',
                  "isDeleted": 0,
                  "actualFbThumFile": '',
                  'thumbFilePath':response.assets[0].uri,
                  'compressedFile':''
                };
  
                mArray.splice(0, 0, imgObj);

              } 

            set_mediaArray(mArray);
            set_mediaSize(mArray.length);
            
          }
        });
    
    };

    const actionOnRow = (value,item) => {

      set_isMediaSelection(value);

      if(item==='GALLERY'){
        set_loaderMsg(Constant.LOADER_WAIT_MESSAGE);
        set_isLoading(true);
        if(Platform.OS==='android'){
          chooseMultipleMedia();
        } else {
          chooseImage();
        }

      } else if(item==='CAMERA'){
          set_optionsArray(['PHOTO','VIDEO','CANCEL']);
          set_isMediaSelection(true);
      }else if(item==='PHOTO'){
        chooseCamera('photo');
      } else if(item==='VIDEO'){
        chooseCamera('video');
      } 
      
    };

    const compressVideo = async () => {
      set_loaderMsg("Please wait.."); 
      set_isLoading(true);
      const result = await Video.compress(videoPath,
        {
          compressionMethod: 'auto',
        },
        (progress) => {

            set_loaderMsg(Math.floor(progress * 100) + "% converted"); 

        }
      );

        set_isLoading(false);
        set_loaderMsg(undefined);
        set_videoPath(result);
        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_popUpleftBtnEnable(false);
        set_isPopUp(false); 
        popIdRef.current = 1;

      };

      const deleteSelectedMedia = async () => {

        let obj = undefined;
        if(isEdit){

          if(deleteSelectedMediaFile.current.observationVideoId && deleteSelectedMediaFile.current.observationVideoId!==''){

            obj = {
              "actualFbThumFile": deleteSelectedMediaFile.current.actualFbThumFile,
              "fbFilePath": deleteSelectedMediaFile.current.fbFilePath ? deleteSelectedMediaFile.current.fbFilePath : '',
              "fileName": deleteSelectedMediaFile.current.fileName,
              "filePath": deleteSelectedMediaFile.current.filePath,
              "fileType": deleteSelectedMediaFile.current.fileType,
              "isDeleted": 1,
              "localThumbImg": deleteSelectedMediaFile.current.localThumbImg,
              "observationVideoId": deleteSelectedMediaFile.current.observationVideoId,
              'thumbFilePath':deleteSelectedMediaFile.current.thumbFilePath,
              'compressedFile':deleteSelectedMediaFile.current.compressedFile
            }

          } else if(deleteSelectedMediaFile.current.observationPhotoId && deleteSelectedMediaFile.current.observationPhotoId!==''){

            obj = {
              "actualFbThumFile": deleteSelectedMediaFile.current.actualFbThumFile,
              "fbFilePath": deleteSelectedMediaFile.current.fbFilePath ? deleteSelectedMediaFile.current.fbFilePath : '',
              "fileName": deleteSelectedMediaFile.current.fileName,
              "filePath": deleteSelectedMediaFile.current.filePath,
              "fileType": deleteSelectedMediaFile.current.fileType,
              "isDeleted": 1,
              "localThumbImg": deleteSelectedMediaFile.current.localThumbImg,
              "observationPhotoId": deleteSelectedMediaFile.current.observationPhotoId,
              'thumbFilePath':deleteSelectedMediaFile.current.thumbFilePath,
              'compressedFile':deleteSelectedMediaFile.current.compressedFile
            }

          }

          deletedMediaArray.current.push(obj);
        } else {
          deletedMediaArray.current = [];
        }
        
        let resultArray = await deleteObsObj(mediaArray,deleteSelectedMediaFile.current.fileName);

        set_mediaSize(resultArray.length);
        set_mediaArray(resultArray);
        
    };

    const deleteObsObj = async (arrayMedia,id) => {

      let tempArray = arrayMedia;
      const tasks = tempArray.filter(task => task.fileName !== id);
      let temp = tasks;
      return temp;

    };

    const removeMedia = (item) => {
      deleteSelectedMediaFile.current = item;
      set_popUpAlert('Alert');
      set_popUpMessage('Are you sure you want to delete this '+item.fileType+'?');
      set_popUpleftBtnEnable(true);
      set_isPopUp(true); 
      popIdRef.current = 1;   

    };

    const popOkBtnAction = () => {

      if(popUpMessage.includes('Are you sure you want to delete')){
        deleteSelectedMedia();
        popCancelBtnAction();

      } else if(popUpMessage.includes('Would you like to do the compression')) {

        set_popUpAlert('Alert');
        set_popUpMessage('We recommand you to stay with in the app to complete the upload process in the background. We will let you know once uploading the observation completed');
        set_popUpleftBtnEnable(false);
        set_isPopUp(true);  
        popIdRef.current = 1;

      } else if(popUpMessage === 'We recommand you to stay with in the app to complete the upload process in the background. We will let you know once uploading the observation completed'){

        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_popUpleftBtnEnable(false);
        set_isPopUp(false); 
        popIdRef.current = 0;

      } else {
        set_loaderMsg('');
        set_isLoading(false);
        popCancelBtnAction();
      }
      
    };

    const popCancelBtnAction = () => {

      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_popUpleftBtnEnable(false);
      set_isPopUp(false);
      popIdRef.current = 0; 
       
    };

    const chooseMultipleMedia = async () => {

      try {
        var response = await MultipleImagePicker.openPicker({
          selectedAssets: [],
          // isExportThumbnail: true,
          maxVideo: 5,
          usedCameraButton: false,
          singleSelectedMode: false,
          isCrop: false,
          isCropCircle: false,
          mediaType : "all",
          maxVideoDuration: 1200,
          singleSelectedMode: false,
          selectedColor: '#f9813a',
          maxSelectedAssets: 5 - mediaSize,
          allowedPhotograph : false,
          allowedVideoRecording : false,
          preventAutomaticLimitedAccessAlert : true,
          isPreview:true,
          
        });
  
        if(response){
        let mArray = mediaArray;
        for (let i = 0; i < response.length; i++){

          if(response[i].type.includes('image')){

            let imgObj = {
              'filePath':response[i].path,
              'fbFilePath':'',
              'fileName':response[i].fileName,
              'observationPhotoId' : '',
              'localThumbImg': '',
              'fileType':'image',
              "isDeleted": 0,
              "actualFbThumFile": '',
              "thumbFilePath":response[i].realPath,
              "compressedFile":''
            };
            mArray.splice(0, 0, imgObj);

          } 
          
          if(response[i].type.includes('video')){

            let thumImg1 = undefined;
            await createThumbnail({url: response[i].path,timeStamp: 10000,}).then(response => thumImg1 = response.path)
            .catch(err => console.log({ err }));

            let _uri ='';
                _uri = response[i].realPath.replace("file:///", "/");
                var dateFile = moment().utcOffset("+00:00").format("YYYYMMDDHHmmss");
                
                await MediaMeta.get(_uri).then((metadata) => {
                  dateFile = moment(metadata.creation_time).utcOffset("+00:00").format("YYYYMMDDHHmmss"); 
                }).catch((err) => 
                console.error('meta error ',err)
                );

            let vidObj = undefined;

             vidObj = {
              'filePath':response[i].realPath,
              'fbFilePath':'',
              'fileName':dateFile+"_"+response[i].fileName,
              'observationVideoId' : '',
              'localThumbImg': thumImg1,
              'fileType':'video',
              "isDeleted": 0,
              "actualFbThumFile": '',
              'thumbFilePath':response[i].path,
              'compressedFile':''
            };

            mArray.push(vidObj);

          }
        }
        set_mediaArray(mArray);
        set_mediaSize(mArray.length);
        set_loaderMsg(undefined);
        set_isLoading(false);

        }
      } catch (e) {
        set_loaderMsg(undefined);
        set_isLoading(false);
        set_isLoading(false);
      }
    }

    return (
        <UploadObsVideoUI 
            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            selectedPet = {selectedPet}
            imagePath = {imagePath}
            videoPath = {videoPath}
            imgName = {imgName}
            videoName = {videoName}
            thumbnailImage = {thumbnailImage}
            isMediaSelection = {isMediaSelection}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            popUpleftBtnEnable = {popUpleftBtnEnable}
            isPopUp = {isPopUp}
            optionsArray = {optionsArray}
            mediaArray = {mediaArray}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
            selectMediaAction = {selectMediaAction}
            actionOnRow = {actionOnRow}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
            removeMedia = {removeMedia}
        />
       
    );

  }
  
  export default UploadObsVideoComponent;