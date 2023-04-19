import React, { useState, useEffect, useRef } from 'react';
import {View,BackHandler} from 'react-native';
import ViewObservationComponent from './viewObservationComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import storage, { firebase } from '@react-native-firebase/storage';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';

const OBS_DELETE = 1;
const OBS_EDIT = 2;

let trace_Get_Behaviors_API_Complete;
let trace_inViewObservation;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  ViewObservationService = ({navigation, route, ...props }) => {

    // const [getBehavioursRequest,{loading: getBehavioursLoading, error: getBehavioursError, data: getBehavioursData,}] = useLazyQuery(Queries.GET_BEHAVIORS);

    const [obsObject, set_obsObject] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [behavioursData, set_behavioursData] = useState(undefined);
    const [mediaArray, set_mediaArray] = useState([]);
    const [behItem, set_behItem] = useState([]);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUplftBtnEnable, set_popUplftBtnEnable] = useState(false);
    const [popUplftBtnTitle, set_popUplftBtnTitle] = useState('');
    const [popupId, set_popupId] = useState(0);
    const [popupRgtBtnTitle, set_popupRgtBtnTitle] = useState('')

    let deleteCount = useRef(0);
    let totalCount = useRef(0);
    let behTypeId = useRef(0);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_view_observations);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_view_observations, "User in View Observation Screen", ''); 
        viewObservationsSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        set_isLoading(true);
        isLoadingdRef.current = 1;
        behavioursAPIRequest();

      return () => {
        viewObservationsSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
    }, []);

    useEffect(() => {

       if(route.params?.obsObject){
           set_obsObject(route.params?.obsObject);
           behTypeId.current = route.params?.obsObject.behaviorId
           let tempArray = [];
           if(route.params?.obsObject.photos && route.params?.obsObject.photos.length>0){
             for (let i = 0; i < route.params?.obsObject.photos.length; i++){

              if(route.params?.obsObject.photos[i].filePath!==''){
                let pObj = {
                  fileName: route.params?.obsObject.photos[i].fileName,
                  filePath: route.params?.obsObject.photos[i].filePath,
                  isDeleted: route.params?.obsObject.photos[i].isDeleted,
                  observationPhotoId:route.params?.obsObject.photos[i].observationPhotoId,
                  type:'image'
                 }
                 tempArray.push(pObj);
              }
               
             }
            
           }

           if(route.params?.obsObject.videos && route.params?.obsObject.videos.length>0){
            for (let i = 0; i < route.params?.obsObject.videos.length; i++){
              let pObj = {
                videoName: route.params?.obsObject.videos[i].videoName,
                videoUrl: route.params?.obsObject.videos[i].videoUrl,
                isDeleted: route.params?.obsObject.videos[i].isDeleted,
                observationVideoId: route.params?.obsObject.videos[i].observationVideoId,
                type:'video',
                videoThumbnailUrl:route.params?.obsObject.videos[i].videoThumbnailUrl
               }
              tempArray.push(pObj);
             }
          }

          set_mediaArray(tempArray);
          totalCount.current = tempArray.length;
       }

   }, [route.params?.obsObject]);

    const viewObservationsSessionStart = async () => {
      trace_inViewObservation = await perf().startTrace('t_inViewObservation');
    };

    const viewObservationsSessionStop = async () => {
      await trace_inViewObservation.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const behavioursAPIRequest = async () => {
        getBehavioursFromBckEnd();
    };

    const getBehavioursFromBckEnd = async () => {

        let defPet = await DataStorageLocal.getDataFromAsync(Constant.OBS_SELECTED_PET);
        defPet = JSON.parse(defPet);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        let id = 1;
        if(defPet && defPet.speciesId){
          id = defPet.speciesId;
        }
        firebaseHelper.logEvent(firebaseHelper.event_behaviors_api, firebaseHelper.screen_view_observations, "Initiated Get Behaviors Api", 'Species Id : '+id);
        trace_Get_Behaviors_API_Complete = await perf().startTrace('t_Get_Behaviors_API');
        fetch(EnvironmentJava.uri + "pets/getPetBehaviors/" + id,
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
              firebaseHelper.logEvent(firebaseHelper.event_behaviors_api_success, firebaseHelper.screen_view_observations, "Get Behaviors Api success", 'Species Id : '+id);
              set_isLoading(false);
              isLoadingdRef.current = 0;
              set_behavioursData(data.response.petBehaviorList);
              getBehaviourName(data.response.petBehaviorList);
              
            }
            
          }).catch((error) => {
            stopFBTraceGetBehaviors();
            firebaseHelper.logEvent(firebaseHelper.event_behaviors_api_fail, firebaseHelper.screen_view_observations, "Get Behaviors Api Failed", 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
          });

    };

    const stopFBTraceGetBehaviors = async () => {
      await trace_Get_Behaviors_API_Complete.stop();
    };

    const getBehaviourName = async (bData) => {
        let bText = await findArrayElement(bData,behTypeId.current);
        set_behItem(bText);      
    };

    function findArrayElement(array, behaviorType) {
        return array.find((element) => {
          return element.behaviorId === behaviorType;
        })
    };

    const deleteButtonAction = (item) => {

        set_popUpAlert('Alert');
        set_popUpMessage(Constant.DELETE_OBS_MSG);
        set_popupId(OBS_DELETE);
        set_popUplftBtnEnable(true);
        set_popupRgtBtnTitle('YES');
        set_popUplftBtnTitle('NO');
        set_isPopUp(true);
        popIdRef.current = 1;

    };

    const navigateToPrevious = () => { 
      
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_view_observations, "User clicked on back button to navigate to ObservationsListComponent", '');
        navigation.navigate('ObservationsListComponent');
      }
      
    };

    const viewAction = async (item) => {
        if(item.type==='video'){
            navigation.navigate('ViewPhotoComponent',{mediaURL:item.videoUrl,mediaType:item.type});
        } else {
        }
        
    };

    const leftButtonAction = () => {

        set_popUpAlert('Alert');
        set_popUpMessage(Constant.EDIT_OBS_MSG);
        set_popupId(OBS_EDIT);
        set_popUplftBtnEnable(true);
        set_popupRgtBtnTitle('YES');
        set_popUplftBtnTitle('NO');
        set_isPopUp(true);
        popIdRef.current = 1;
      
    };

    const deleteObservationBcknd = async (obsId,petId) => {

        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api, firebaseHelper.screen_view_observations, "User deleting the Observation(id) : "+obsId, 'Pet Id : '+petId);
        fetch(EnvironmentJava.uri + "pets/" + obsId+'/'+petId+'/'+clientId,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }
            
            if(data && data.status.success) {
              firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_success, firebaseHelper.screen_view_observations, "Deleting Observation(id) Successfull : "+obsId, 'Pet Id : '+petId);
              if(totalCount.current > 0){
                deleteFBFile();
              } else {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                navigateToPrevious();
              }
              
            } else {
              firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail : "+obsId, 'Pet Id : '+petId);
              set_isLoading(false);
              isLoadingdRef.current = 0;
              set_popUpAlert('Alert');
              set_popUpMessage(Constant.SERVICE_FAIL_MSG);
              // set_popupId(NETWORK_TYPE);
              set_popUplftBtnEnable(false);
              set_popupRgtBtnTitle('OK');
              set_isPopUp(true);
              popIdRef.current = 1;
            }
            
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_delete_observation_api_fail, firebaseHelper.screen_view_observations, "Deleting Observation(id) Fail : "+obsId, 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpAlert('Alert');
              set_popUpMessage(Constant.SERVICE_FAIL_MSG);
              set_popUplftBtnEnable(false);
              set_popupRgtBtnTitle('OK');
              set_isPopUp(true);
              popIdRef.current = 1;
          });

    };

    const deleteFBFile =()=> {

        let filePath;

        if(mediaArray[deleteCount.current].filePath) {
          filePath = mediaArray[deleteCount.current].filePath;
        } 

        if(filePath){

          const storageRef = storage().refFromURL(filePath);
          const imgRef = storage().ref(storageRef.fullPath);
          imgRef.delete().then(()=> {
            deleteCount.current = deleteCount.current + 1;
            if(deleteCount.current < totalCount.current){
                deleteFBFile();
            } else {
              set_isLoading(false);
              isLoadingdRef.current = 0;
              navigateToPrevious();
            }
          }).catch((e)=>{
            
            deleteCount.current = deleteCount.current + 1;
            if(deleteCount.current < totalCount.current){
                deleteFBFile();
            } else {
              set_isLoading(false);
              isLoadingdRef.current = 0;
              navigateToPrevious();
            }

            console.log('FB File Delete Error ',e)
          })

        } else {

              set_isLoading(false);
              isLoadingdRef.current = 0;
              navigateToPrevious();

        }    

    };

    const popOkBtnAction = async () => {

      if(popupId===OBS_DELETE){
        set_isLoading(true);
        isLoadingdRef.current = 1;
        deleteObservationBcknd(obsObject.observationId,obsObject.petId);
      } else if(popupId===OBS_EDIT){
        let defPet = await DataStorageLocal.getDataFromAsync(Constant.OBS_SELECTED_PET);
        defPet = JSON.parse(defPet);

        let tempArray = [];

        if(obsObject){

          if(obsObject.photos && obsObject.photos.length>0){

            for (let i = 0; i < obsObject.photos.length; i++){

              if(obsObject.photos[i].filePath && obsObject.photos[i].filePath!==''){

                let imgObj = {
                  'filePath':'',
                  'fbFilePath':obsObject.photos[i].filePath,
                  'fileName': obsObject.photos[i].fileName,
                  'observationPhotoId' : obsObject.photos[i].observationPhotoId,
                  'localThumbImg': '',
                  'fileType':'image',
                  "isDeleted": 0,
                  "actualFbThumFile": '',
                  "thumbFilePath":'',
                  "compressedFile":''
                };

                tempArray.push(imgObj);

              }

            }

          } 
          if (obsObject.videos && obsObject.videos.length>0){

            for (let i = 0; i < obsObject.videos.length; i++){

              if(obsObject.videos[i].videoUrl && obsObject.videos[i].videoUrl!==''){

                let vidObj = {
                  'filePath':'',
                  'fbFilePath':obsObject.videos[i].videoUrl,
                  'fileName': obsObject.videos[i].videoName,
                  'observationVideoId' : obsObject.videos[i].observationVideoId,
                  'localThumbImg': obsObject.videos[i].videoThumbnailUrl,
                  'fileType':'video',
                  "isDeleted": 0,
                  "actualFbThumFile": obsObject.videos[i].videoThumbnailUrl,
                  'thumbFilePath':'',
                  'compressedFile':''
                };
                tempArray.push(vidObj);

              }

            }

          }

        }

        let obsObj = {
          selectedPet : defPet,
          obsText : obsObject ? obsObject.obsText : '', 
          obserItem : behItem, 
          selectedDate : obsObject ? obsObject.observationDateTime : new Date(),  
          mediaArray: tempArray,
          fromScreen : 'viewObs',
          isPets : false,
          isEdit : true,
          behaviourItem : behItem, 
          observationId : obsObject.observationId
      }

        firebaseHelper.logEvent(firebaseHelper.event_edit_observation_Action, firebaseHelper.screen_view_observations, "User clicked on the Observation(iD) Edit button : "+obsObject.observationId, 'Pet Id : '+defPet.petID);
        await DataStorageLocal.saveDataToAsync(Constant.OBSERVATION_DATA_OBJ, JSON.stringify(obsObj));
        navigation.navigate('ObservationComponent');

      }

      popCancelBtnAction();
      
    };

    const popCancelBtnAction = () => {

        set_popUpAlert(undefined);
        set_popUpMessage(undefined);
        set_popupId(undefined);
        set_popUplftBtnEnable(false);
        set_popupRgtBtnTitle(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
       
    };

    return (
        <ViewObservationComponent 
            obsObject = {obsObject}
            isLoading = {isLoading}
            behavioursData = {behavioursData}
            mediaArray = {mediaArray}
            popupRgtBtnTitle = {popupRgtBtnTitle}
            popUplftBtnEnable = {popUplftBtnEnable}
            popUplftBtnTitle = {popUplftBtnTitle}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            navigateToPrevious = {navigateToPrevious}
            deleteButtonAction = {deleteButtonAction}
            viewAction = {viewAction}
            leftButtonAction = {leftButtonAction}
            popCancelBtnAction = {popCancelBtnAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default ViewObservationService;