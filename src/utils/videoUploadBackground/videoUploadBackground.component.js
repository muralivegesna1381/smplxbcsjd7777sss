import React, { useState, useEffect, useRef } from 'react';
import * as Queries from "./../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import * as Constant from "./../../utils/constants/constant";
import * as internetCheck from "./../../utils/internetCheck/internetCheck";
import moment from 'moment';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import { Video } from 'react-native-compressor';
import { Image } from 'react-native-compressor';
import { getVideoMetaData } from 'react-native-compressor';
import { getRealPath } from 'react-native-compressor';
import storage, { firebase } from '@react-native-firebase/storage';
import { createThumbnail } from "react-native-create-thumbnail";
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import { convertString } from 'convert-string';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import {View,Alert,Platform,NativeModules,NativeEventEmitter} from 'react-native';
import RNThumbnail from "react-native-thumbnail";
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';

var RNFS = require('react-native-fs');

const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const VideoUploadComponent = ({navigation, route,...props }) => {

    const { loading, data } = useQuery(Queries.UPLOAD_VIDEO_BACKGROUND, { fetchPolicy: "cache-only" });

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);
    const [popId, set_popId] = useState(undefined);

    var actualVideoLength = useRef(0);
    var fbVideoLength = useRef(0);
    var actualFbVideoLength = useRef(0);
    var isVideoInProgress = useRef(false);
    var actualImageLength = useRef(0);
    var fbImageLength = useRef(0);
    var actualFbImageLength = useRef(0);
    var isImageInProgress = useRef(false);
    var subscriptionAndroid = useRef();
    var compressedFileVideoAndroid = useRef(undefined);
    
    useEffect (() => {

        // checkInternetStatus(data);
        if(data && data.data.__typename === 'UploadVideoBackground'){
            checkInternetStatus(data);
        }

    },[data]);


    const checkInternetStatus = async (dataNew) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);

        if(obsData && obsData.length>0){

            let internetType = await internetCheck.internetTypeCheck();
            if(internetType==='wifi'){

                if(dataNew){

                    if(Platform.OS==='android'){
                        eventVideoUpload();
                    }
                    startUploadingProcess(); 
        
                }
            } else {
                await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);  
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:'', statusUpload:'Please Wait... ',fileName:'', uploadProgress:'',progressTxt:'' ,stausType:'Uploading',mediaTYpe:'',internetType:'notWi-Fi',__typename: 'UploadVideoBackgroundStatus'}},})
            }

        }

    };

    const startUploadingProcess = async () => {
        let uploadProcess = await DataStorageLocal.getDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
        if(!uploadProcess){    
            checkUploadData();
        }
    }

    const eventVideoUpload = async () => {
        const eventEmitter = new NativeEventEmitter(NativeModules.VideoCompression.onProgress);
        subscriptionAndroid.current = eventEmitter.addListener('videoUploadRecieveProgressMsg', onRecieveCompressedFile);     
    };

    const checkUploadData = async () => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);

        if(obsData && obsData.length>0){
            await DataStorageLocal.saveDataToAsync(Constant.UPLOAD_PROCESS_STARTED,'Started');
        }
        if(obsData && obsData.length > 0) {
    
            if(obsData[0].photos.length > 0) {

                for (let i = 0; i < obsData[0].photos.length; i++){
                    if(obsData[0].photos[i].fbFileURL === ''){
                        actualImageLength.current = actualImageLength.current + 1;
                        
                    }
                }

                for (let i = 0; i < obsData[0].videos.length; i++){
                    if(obsData[0].videos[i].fbFileURL === ''){                       
                        actualVideoLength.current = i + 1;
                    }
                }

                for (let i = 0; i < obsData[0].photos.length; i++){
                    if(obsData[0].photos[i].fbFileURL === ''){
                        
                        fbImageLength.current = i;
                        actualFbImageLength.current = 0;
                        compressImage();
                        return;

                    }  
                }                             

                for (let i = 0; i < obsData[0].videos.length; i++){
                    if(obsData[0].videos[i].fbFileURL === ''){                                       
                        actualVideoLength.current = i + 1;                
                    }               
                }

                for (let i = 0; i < obsData[0].videos.length; i++){

                    if(obsData[0].videos[i].fbFileURL === ''){

                        fbVideoLength.current = i;
                        actualFbVideoLength.current = i;
                        compressVideo();
                        return;

                    } else if(obsData[0].videos[i].fbFileURL !== '' && obsData[0].videos[i].thumbnailURL === ''){

                        if(Platform.OS==='android'){
                            getThumbNail(obsData[0].videos[i].thumbFilePath);
                        } else {
                            getThumbNail(obsData[0].videos[i].localPath);
                        }
                                            
                        return;

                    } 
                } 

                if(obsData[0].uploadToBackendStatus==='') {
                    sendOBSToBackend(obsData[0])
                    return;     
                }

            }else if(obsData[0].videos.length > 0) {

                for (let i = 0; i < obsData[0].videos.length; i++){

                    if(obsData[0].videos[i].fbFileURL === ''){                      
                        actualVideoLength.current = i + 1;
                    }

                }

                for (let i = 0; i < obsData[0].videos.length; i++){

                    if(obsData[0].videos[i].fbFileURL === ''){

                        fbVideoLength.current = i;
                        actualFbVideoLength.current = i;
                        compressVideo();
                        return;

                    } else if(obsData[0].videos[i].fbFileURL !== '' && obsData[0].videos[i].thumbnailURL === ''){

                        if(Platform.OS==='android'){

                            getThumbNail(obsData[0].videos[i].thumbFilePath);

                        } else {

                            getThumbNail(obsData[0].videos[i].localPath);

                        }
                                            
                        return;

                    } 
                } 

                if(obsData[0].uploadToBackendStatus==='') {
                    sendOBSToBackend(obsData[0])
                    return;       
                }
            } 

        }
        
    };

    const compressImage = async () => {

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let pathExists = '';
        if(Platform.OS==='android') {
            pathExists = await RNFS.exists(obsDataArray[0].photos[fbImageLength.current].thumbFilePath);
        } else {
            pathExists = await RNFS.exists(obsDataArray[0].photos[fbImageLength.current].localPath);
        }

        if(pathExists){

            if(!isImageInProgress.current){

                isImageInProgress.current = true;
                const result = await Image.compress(obsDataArray[0].photos[fbImageLength.current].localPath, {
                    compressionMethod: 'auto',
                });
                isImageInProgress.current = false;
                uploadImageToFB(result);               
    
            }

        } else {
            // showAlert('Image not found');
            createPopup('OK','Sorry','Image not found');
            updateObservationImageData('','fileNotFound');
        }

    };

    const compressVideo = async () => { 

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let pathExists = await RNFS.exists(obsDataArray[0].videos[fbVideoLength.current].localPath);

            Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsDataArray[0].obsText, statusUpload:'Preparing Video ',fileName:'', uploadProgress:'0%',progressTxt:'Awaiting',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})

            if(Platform.OS==='android'){
                compressAndroidVideoFile();
            } else {

                if(!isVideoInProgress.current){

                        isVideoInProgress.current = true;
                        const result = await Video.compress(obsDataArray[0].videos[fbVideoLength.current].localPath,
                        {
                            compressionMethod: 'auto',
                        },
                        (progress) => {
                            Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsDataArray[0].obsText, statusUpload:'Preparing Video ',fileName:obsDataArray[0].videos[fbVideoLength.current].fileName.replace('/r','/').slice(0, 9)+"...", uploadProgress:(Math.floor(progress * 100))+'%',progressTxt:'Completed' ,stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})
    
                        });
    
                        compressedFileVideoAndroid.current = result;
                        uploadVideoToFB(result);                   
                        isVideoInProgress.current = false;

                    }

            }
 
    };

    const compressAndroidVideoFile = async () => {

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let pathExists = await RNFS.exists(obsDataArray[0].videos[fbVideoLength.current].localPath);

        if(pathExists){

            let _uri ='';
            _uri = obsDataArray[0].videos[fbVideoLength.current].localPath.replace("file:///", "/");
            if(!isVideoInProgress.current){
                isVideoInProgress.current = true;

                NativeModules.VideoCompression.getDeviceName(_uri ,(status) => {
                    uploadVideoToFB(status);
                    compressedFileVideoAndroid.current = status;
                });
                
                isVideoInProgress.current = false;
            }

        } else {
            // showAlert('Video Android '+pathExists.toString());
            updateObservationVideoData('','fileNotFound');          
        }
               
    };

    const onRecieveCompressedFile = async (event) => {
        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);
        Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsDataArray[0].obsText, statusUpload:'Preparing Video ',fileName:obsDataArray[0].videos[fbVideoLength.current].fileName.replace('/r','/').slice(0, 9)+"...", uploadProgress:parseInt(JSON.parse(event.eventProperty))+'%',progressTxt:'Completed' ,stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})        
    };

    const getThumbNail = async (result) => {

        let pathExists = await RNFS.exists(result);
        // if(pathExists) {

            if(Platform.OS==='android'){

                let thumImg1 = undefined;
                await createThumbnail({url: result,timeStamp: 10000,}).then(response => thumImg1 = response.path)
                .catch(err => console.log({ err }));
                uploadThumbnailToFB(thumImg1);
    
            } else {

                let thumImg = undefined;
                await createThumbnail({url: result,timeStamp: 10000,}).then(response => thumImg = response.path)
                .catch(err => console.log({ err }));
                uploadThumbnailToFB(thumImg);
    
            }       
            
            if(Platform.OS==='android' && compressedFileVideoAndroid.current){
                deleteAndroidCompressedFile(compressedFileVideoAndroid.current);
            }

    };

    const uploadImageToFB = async (fileUrl) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);

        let behId = !obsData[0].behaviorId ? 0 : parseInt(obsData[0].behaviorId);
        let dte = moment(new Date()).format("YYYYMMDDHHmmss");
        let filename = "Observation_Images/"+obsData[0].petId.toString() + behId.toString() + dte+obsData[0].photos[fbImageLength.current].fileName.replace('/r','/');
        let reference = storage().ref(filename);
        let task = reference.putFile(fileUrl);
            task.on('state_changed', taskSnapshot => {
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsData[0].obsText, statusUpload:'Uploading Image ',fileName:obsData[0].photos[fbImageLength.current].fileName.replace('/r','/').slice(0, 10)+"...", uploadProgress:(Math.round(`${taskSnapshot.bytesTransferred}` / `${taskSnapshot.totalBytes}` * 100) ) +'%' ,progressTxt:'Completed',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})
            });

            task.then(() => {

            storage().ref(filename).getDownloadURL().then((url) => {        
            updateObservationImageData(url,'');

            });

        }).catch((error) => {

            updateObservationImageData('','fileNotFound');
            // showAlert('FB Image failed'+error.toString());
        });

    };

    const uploadThumbnailToFB = async (fileUrl) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);

        let behId = !obsData[0].behaviorId ? 0 : parseInt(obsData[0].behaviorId);
        let dte = moment(new Date()).format("YYYYMMDDHHmmss");
        let filename = "Observation_ThumbImages/"+obsData[0].petId.toString() + behId.toString() + dte+"."+"jpg";
        let reference = storage().ref(filename); // 2
        let task = reference.putFile(fileUrl); // 3
            task.on('state_changed', taskSnapshot => {
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsData[0].obsText, statusUpload:'Please wait..',fileName:'', uploadProgress:"100%" ,progressTxt:'Validating',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})
            });

            task.then(() => {
            storage().ref(filename).getDownloadURL().then((url) => {        
            updateObservationThumbImageData(url,'');
            });
        }).catch((error) => {});

    };

    const uploadVideoToFB = async (fileUrl) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        let behId = !obsData[0].behaviorId ? 0 : parseInt(obsData[0].behaviorId);
        // let dte = moment(new Date()).format("YYYYMMDDHHmmss");
        // let filename = "Observations_Videos/"+obsData[0].petId.toString() + behId.toString() + obsData.fileName+"."+"mp4";
        let filename = "Observation_Videos/"+ obsData[0].videos[fbVideoLength.current].fileName;
        let reference = storage().ref(filename);
        let task = reference.putFile(fileUrl);
            task.on('state_changed', taskSnapshot => {
                Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obsData[0].obsText, statusUpload:'Uploading Video ',fileName:obsData[0].videos[fbVideoLength.current].fileName.replace('/r','/').slice(0, 10)+"...", uploadProgress:(Math.round(`${taskSnapshot.bytesTransferred}` / `${taskSnapshot.totalBytes}` * 100) )+'%' ,progressTxt:'Completed',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})
            });

            task.then(() => {
            storage().ref(filename).getDownloadURL().then((url) => {        
                updateObservationVideoData(url,'');
            });
        }).catch((error) => {
            updateObservationVideoData('','fileNotFound');
            // showAlert('Fb Video failed '+error.toString());
        });

    };

    const deleteAndroidCompressedFile = (url) => {

        const file = url;
        const filePath = file.split('///').pop()
        RNFS.exists(filePath).then((res) => {
            if (res) {
              RNFS.unlink(filePath).then(() => console.log('FILE DELETED'))
            }
          }) 
  
      }

    const updateObservationVideoData = async (fbFile,fileStatus) => {

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let updateVideoObj = {
            "id":obsDataArray[0].videos[fbVideoLength.current].id,
            "localPath":obsDataArray[0].videos[fbVideoLength.current].localPath,
            "fbFileURL":fileStatus === 'fileNotFound' ? fileStatus : fbFile,
            "fileName":obsDataArray[0].videos[fbVideoLength.current].fileName,
            "thumbnailURL":obsDataArray[0].videos[fbVideoLength.current].thumbnailURL,
            "thumbFilePath":obsDataArray[0].videos[fbVideoLength.current].thumbFilePath,  
            "observationMediaId": obsDataArray[0].videos[fbVideoLength.current].observationMediaId,
            "isDeleted": obsDataArray[0].videos[fbVideoLength.current].isDeleted          
        }

        let tempArray = obsDataArray[0].videos;
        let resultArray = await deleteObsObjFromAsync(tempArray,obsDataArray[0].videos[fbVideoLength.current].id);
        let addResult = addAfter(resultArray,fbVideoLength.current,updateVideoObj);

        let updateObjervations = {
            "id" : obsDataArray[0].id,
            "petId" : obsDataArray[0].petId,
            "obsText" : obsDataArray[0].obsText,
            "behaviorId": obsDataArray[0].behaviorId,
            "behaviorName": obsDataArray[0].behaviorName,
            "observationDateTime": obsDataArray[0].observationDateTime,
            "emotionIconsText": "",
            "seizuresDescription": "",
            "videos": addResult,
            "photos": obsDataArray[0].photos,
            "imageUploadStatus" : obsDataArray[0].imageUploadStatus,
            "videoUploadStatus" : obsDataArray[0].videoUploadStatus,
            "uploadToBackendStatus" : obsDataArray[0].uploadToBackendStatus,
            "thumbnailUploadStatus" : obsDataArray[0].thumbnailUploadStatus,
            "observationId": obsDataArray[0].observationId
            
        }

        let resultArray1 = await deleteObsObjFromAsync(obsDataArray,obsDataArray[0].id);
        let addResult1 = addAfter(resultArray1,0,updateObjervations)
        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_UPLOAD_DATA, JSON.stringify(addResult1));

        if(Platform.OS==='android'){
            getThumbNail(obsDataArray[0].videos[fbVideoLength.current].thumbFilePath);
        } else {
            getThumbNail(obsDataArray[0].videos[fbVideoLength.current].localPath);
        }       

    };

    const updateObservationThumbImageData = async (fbFile,fileStatus) => {

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let updateVideoObj = {
            "id":obsDataArray[0].videos[fbVideoLength.current].id,
            "localPath":obsDataArray[0].videos[fbVideoLength.current].localPath,
            "fbFileURL":obsDataArray[0].videos[fbVideoLength.current].fbFileURL,
            "fileName":obsDataArray[0].videos[fbVideoLength.current].fileName,
            "thumbnailURL":fileStatus === 'fileNotFound' ? fileStatus : fbFile,
            "thumbFilePath":obsDataArray[0].videos[fbVideoLength.current].thumbFilePath, 
            "observationMediaId": obsDataArray[0].videos[fbVideoLength.current].observationMediaId,
            "isDeleted": obsDataArray[0].videos[fbVideoLength.current].isDeleted
        }

        let tempArray = obsDataArray[0].videos;
        let resultArray = await deleteObsObjFromAsync(tempArray,obsDataArray[0].videos[fbVideoLength.current].id);
        let addResult = addAfter(resultArray,fbVideoLength.current,updateVideoObj);

        let updateObjervations = {
            "id" : obsDataArray[0].id,
            "petId" : obsDataArray[0].petId,
            "obsText" : obsDataArray[0].obsText,
            "behaviorId": obsDataArray[0].behaviorId,
            "behaviorName": obsDataArray[0].behaviorName,
            "observationDateTime": obsDataArray[0].observationDateTime,
            "emotionIconsText": "",
            "seizuresDescription": "",
            "videos": addResult,
            "photos": obsDataArray[0].photos,
            "imageUploadStatus" : obsDataArray[0].imageUploadStatus,
            "videoUploadStatus" : obsDataArray[0].videoUploadStatus,
            "uploadToBackendStatus" : obsDataArray[0].uploadToBackendStatus,
            "thumbnailUploadStatus" : obsDataArray[0].thumbnailUploadStatus,   
            "observationId": obsDataArray[0].observationId
            
        }

        let resultArray1 = await deleteObsObjFromAsync(obsDataArray,obsDataArray[0].id);
        let addResult1 = addAfter(resultArray1,0,updateObjervations)
        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_UPLOAD_DATA, JSON.stringify(addResult1));
        fbVideoLength.current = fbVideoLength.current + 1;
        actualFbVideoLength.current = actualFbVideoLength.current + 1;

        if(actualFbVideoLength.current < actualVideoLength.current){

            let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
            obsDataArray = JSON.parse(obsDataArray);

            for (let i = 0; i < obsDataArray[0].videos.length; i++){

                if(obsDataArray[0].videos[i].fbFileURL === ''){

                    fbVideoLength.current = i;
                    actualFbVideoLength.current = i;
                    compressVideo();
                    return;

                }  

            }

        } else {

            sendOBSToBackend(updateObjervations);
        }

    };

    const updateObservationImageData = async (fbFile,fileStatus) => {

        let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsDataArray = JSON.parse(obsDataArray);

        let updateImgObj = {
            "id":obsDataArray[0].photos[fbImageLength.current].id,
            "localPath":obsDataArray[0].photos[fbImageLength.current].localPath,
            "fbFileURL":fileStatus === 'fileNotFound' ? fileStatus : fbFile,
            "fileName":obsDataArray[0].photos[fbImageLength.current].fileName,  
            "thumbFilePath":obsDataArray[0].photos[fbImageLength.current].thumbFilePath, 
            "observationMediaId": obsDataArray[0].photos[fbImageLength.current].observationMediaId,
            "isDeleted": obsDataArray[0].photos[fbImageLength.current].isDeleted         
        }

        let tempArray = obsDataArray[0].photos;
        let resultArray = await deleteObsObjFromAsync(tempArray,obsDataArray[0].photos[fbImageLength.current].id);
        let addResult = addAfter(resultArray,fbImageLength.current,updateImgObj);

        let updateObjervations = {
            "id" : obsDataArray[0].id,
            "petId" : obsDataArray[0].petId,
            "obsText" : obsDataArray[0].obsText,
            "behaviorId": obsDataArray[0].behaviorId,
            "behaviorName": obsDataArray[0].behaviorName,
            "observationDateTime": obsDataArray[0].observationDateTime,
            "emotionIconsText": "",
            "seizuresDescription": "",
            "videos": obsDataArray[0].videos,
            "photos": addResult,
            "imageUploadStatus" : obsDataArray[0].imageUploadStatus,
            "videoUploadStatus" : obsDataArray[0].videoUploadStatus,
            "uploadToBackendStatus" : obsDataArray[0].uploadToBackendStatus,
            "thumbnailUploadStatus" : obsDataArray[0].thumbnailUploadStatus, 
            "observationId": obsDataArray[0].observationId  
            
        }

        let resultArray1 = await deleteObsObjFromAsync(obsDataArray,obsDataArray[0].id);
        let addResult1 = addAfter(resultArray1,0,updateObjervations)
        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_UPLOAD_DATA, JSON.stringify(addResult1));
        fbImageLength.current = fbImageLength.current+1;
        actualFbImageLength.current = actualFbImageLength.current + 1;

        if(actualFbImageLength.current < actualImageLength.current){

            let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
            obsDataArray = JSON.parse(obsDataArray);

            for (let i = 0; i < obsDataArray[0].photos.length; i++){

                if(obsDataArray[0].photos[i].fbFileURL === ''){
                    fbImageLength.current = i;
                    // actualFbImageLength.current = i;
                    compressImage();
                    return;
                }  

            }

        } else {

            let obsDataArray = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
            obsDataArray = JSON.parse(obsDataArray);

            for (let i=0; i<obsDataArray[0].videos.length; i++){

                if(obsDataArray[0].videos[i].fbFileURL === ''){
                    actualVideoLength.current = i + 1;
                }

            }

            for (let i = 0; i < obsDataArray[0].videos.length; i++){

                if(obsDataArray[0].videos[i].fbFileURL === ''){

                    fbVideoLength.current = i;
                    actualFbVideoLength.current = i;
                    compressVideo();
                    return;

                }  

            }

        }

    };

    const sendOBSToBackend = async (obj) => {

        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        let imgArray = [];
        let vidArray = [];
        let totalFilesFound = 0;
        let totalFilesNotfound = 0;

        if(obj.photos.length > 0 ){

            totalFilesFound = totalFilesFound + obj.photos.length;

            for (let i = 0; i < obj.photos.length; i++){

                if(obj.photos[i].fbFileURL!=='fileNotFound'){

                    let imgObj = {
                        "observationPhotoId": obj.photos[i].observationMediaId,
                        "fileName": obj.photos[i].fileName,
                        "filePath": ""+obj.photos[i].fbFileURL,
                        "isDeleted": obj.photos[i].isDeleted
                    }

                    imgArray.push(imgObj);

                } else {

                    totalFilesNotfound = totalFilesNotfound + 1;

                }
            }

        }

        totalFilesFound = totalFilesFound + obj.videos.length;

        for (let i = 0; i < obj.videos.length; i++){

            if(obj.videos[i].fbFileURL!=='fileNotFound'){
                
                let vidObj = {
                    "observationVideoId": obj.videos[i].observationMediaId,
                    "videoName": obj.videos[i].fileName,
                    "videoUrl": ""+obj.videos[i].fbFileURL,
                    "videoThumbnailUrl":""+obj.videos[i].thumbnailURL,
                    "isDeleted": obj.videos[i].isDeleted
                }
                vidArray.push(vidObj);

            } else {

                totalFilesNotfound = totalFilesNotfound + 1;

            }
            
        }

        let finalObj = {
              "observationId": obj.observationId && obj.observationId!=='' ? obj.observationId : null,
              "petId": ""+obj.petId,
              "obsText": obj.obsText,
              "behaviorId": ""+obj.behaviorId,
              "observationDateTime": ""+obj.observationDateTime,
              "emotionIconsText": "",
              "seizuresDescription": "",
              "loginUserId": client,
              "videos": vidArray,
              "photos": imgArray,
            
          }
            Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:obj.obsText, statusUpload:'Please wait..',fileName:'', uploadProgress:"done",progressTxt:'Finishing',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})

        fetch(EnvironmentJava.uri + "pets/savePetObservation/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },

            body: JSON.stringify(finalObj),

          }
        ).then((response) => response.json()).then(async (data) => {
            
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }
            if (data.status.success) {

                let filesNotFailed = totalFilesFound-totalFilesNotfound;
                let filesStatus = undefined;

                if(filesNotFailed === totalFilesFound){
                    filesStatus = 'success'
                } else {

                    if(filesNotFailed === 0){
                        filesStatus = 'ObsSuccessful'
                    } else {
                        filesStatus = 'someMediaFailed'
                    }

                }
                
                updateObservationData('success',obj,filesStatus);
            } else {
                updateObservationData('');
            }
          }).catch((error) => {
            updateObservationData('');
          });
      };

      const updateObservationData = async (status,obj,filesStatus) => {

        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);

        if(status==='success'){

            let alrtMsg = '';
            let alrtTitle = '';
            if(filesStatus === 'success'){
                alrtTitle = "Success!";
                alrtMsg = "The Observation " + '"' + obj.obsText + '"'+" is submitted successfully";
            } else if(filesStatus === 'ObsSuccessful'){
                alrtTitle = "Sorry!"
                alrtMsg = "The Observation  " + '"' + obj.obsText + '"'+" is submitted successfully, but we are unable to upload your media";
            }else {
                alrtTitle = "Sorry";
                alrtMsg = "The Observation  " + '"' + obj.obsText + '"'+" is submitted successfully, but we are unable to upload some of your media";
            }
            // Alert.alert(
            //     alrtTitle,
            //     alrtMsg,
            //     [
            //         {text: 'OK'},
            //     ],
            //     {cancelable: false},
            //   );

            createPopup('OK',alrtTitle,alrtMsg);

            deleteObsObj(obj.id);

        } else {
            // Alert.alert(
            //     'Sorry',
            //     "The Observation " + '"' + obj.obsText + '"'+" is can't be uploaded. Please try again later",
            //     [
            //         {text: 'OK'},
            //     ],
            //     {cancelable: false},
            //   );

              createPopup('OK',"Sorry","The Observation " + '"' + obj.obsText + '"'+" is can't be uploaded. Please try again later",);
        }

    };

    const deleteObsObj = async (id) => {
        
        let obsData = await DataStorageLocal.getDataFromAsync(Constant.OBSERVATION_UPLOAD_DATA);
        obsData = JSON.parse(obsData);
        let tempArray = obsData;
        const tasks = tempArray.filter(task => task.id !== id);

        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_UPLOAD_DATA, JSON.stringify(tasks)); 
        // Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:'', statusUpload:'',fileName:'', uploadProgress:'', progressTxt:'',stausType:'Uploading',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})

        fbImageLength.current=0;
        actualFbImageLength.current=0;
        fbVideoLength.current=0;
        actualFbVideoLength.current = 0;
        actualImageLength.current=0;
        actualVideoLength.current=0;

        if(tasks.length>0){            
            checkUploadData();
        } else {
            
            Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND_STATUS,data: {data: {observationName:'', statusUpload:'',fileName:'', uploadProgress:'', progressTxt:'',stausType:'Uploading Done',mediaTYpe:'Image',internetType:'wifi',__typename: 'UploadVideoBackgroundStatus'}},})
            await DataStorageLocal.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);   
        }

    };

    const deleteObsObjFromAsync = async (tempArray,id) => {

        let tempArray1 = tempArray;
        const tasks = tempArray1.filter(task => task.id !== id);
        let temp = tasks;
        return temp;

    };

    function addAfter(array, index, updateObjervations) {
        return [
            ...array.slice(0, index),
            updateObjervations,
            ...array.slice(index)
        ];
    };

    const createPopup = (rgtBtnTitle, title, message) => {

        set_popRightBtnTitle(rgtBtnTitle);
        set_popAlert(title);
        set_popUpMessage(message);
        // set_popId(popIdValue);
        set_isPopUp(true);

    };

    const showAlert  = (msg) => {
        Alert.alert(
            'Alert',
            msg,
            [
                {text: 'OK'},
            ],
            {cancelable: false},
          );
    };

    const popOkBtnAction = () => {
        popCancelBtnAction();
    };

    const popCancelBtnAction = () => {

        set_isPopUp(false);
        set_popRightBtnTitle(undefined);
        set_popAlert(undefined);
        set_popUpMessage(undefined);
        // set_popId(popIdValue);
        
    };

    return (
        <>      

            {isPopUp ? <View style={CommonStyles.customPopUpGlobalStyle}>
                <AlertComponent
                    header = {popAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {popRightBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
        </>
        
    );
};

export default VideoUploadComponent;