import React, { useState, useEffect,useRef } from 'react';
import {View,Platform,BackHandler} from 'react-native';
import PetEditUI from './petEditUI';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as Constant from "./../../utils/constants/constant";
import BuildEnv from './../../config/environment//environmentConfig';
import { PermissionsAndroid } from 'react-native';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Apolloclient from './../../config/apollo/apolloConfig';
import * as Queries from "./../../config/apollo/queries";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());
const axios = require('axios').default;
let trace_inPetEditScreen;

const PetEditComponent = ({navigation, route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isEdit, set_isEdit] = useState(false);
    const [imagePathNew, set_imagePathNew] = useState(undefined);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_pet_edit);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_edit, "User in Edit Pet Screen", ''); 
      if(Platform.OS==='android'){
        requestCameraPermission();
      } 
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };
  
    }, []);

     useEffect(() => {

        if(route.params?.petObject){
            set_imagePathNew(route.params?.petObject.photoUrl);
            set_petObj(route.params?.petObject);
        }

    }, [route.params?.petObject]);

    const initialSessionStart = async () => {
      trace_inPetEditScreen = await perf().startTrace('t_inPetEditScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inPetEditScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
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
    };

    const navigateToPrevious = () => {  

      if(isLoadingdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_pet_edit, "User clicked on back button to navigate to DashBoardService", '');
        navigation.navigate('DashBoardService');
      }
        
    };

    const editButtonAction = () => {  
      chooseMultipleMedia()
    };

    const actionOnRow = (value,item) => {
      set_isEdit(value);
    };

    const chooseMultipleMedia = async () => {

      firebaseHelper.logEvent(firebaseHelper.event_pet_img_choose_action, firebaseHelper.screen_pet_edit, "User clicked on Update pet Image button", '');
      try {
        var response = await MultipleImagePicker.openPicker({
          selectedAssets: [],
          // isExportThumbnail: true,
          maxVideo: 0,
          usedCameraButton: true,
          singleSelectedMode: true,
          isCrop: true,
          isCropCircle: true,
          mediaType : "image",
          singleSelectedMode: true,
          selectedColor: '#f9813a',
          haveThumbnail: true,
          maxSelectedAssets: 1,
          allowedPhotograph : true,
          allowedVideoRecording : false,
          preventAutomaticLimitedAccessAlert : true,
          isPreview:true
        });
  
        if(response && response.path){
            firebaseHelper.logEvent(firebaseHelper.event_pet_img_selection_done, firebaseHelper.screen_pet_edit, "User selected/picked the Image", '');
            set_imagePathNew(response.path);
            saveImage(response.path);

        } else {
          set_isLoading(false);
          isLoadingdRef.current = 0;
        }
      } catch (e) {
        firebaseHelper.logEvent(firebaseHelper.event_pet_img_selection_cancel, firebaseHelper.screen_pet_edit, "User clicked on cancel button in Image library", '');
        set_isLoading(false);
        isLoadingdRef.current = 0;
      }
    }

    const saveImage =  async (fileUrl) => {

      set_isLoading(true);
      isLoadingdRef.current = 1;

        let photo = { uri: fileUrl };
        const fileType = fileUrl[fileUrl.length - 1];
    
        var formdata = new FormData();

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

        formdata.append("petId", petObj.petID);
        formdata.append("petParentId", client);
        formdata.append("FileExtension", "jpg");
        formdata.append("file", {
          uri: photo.uri,
          name: "image.jpg",
          type: `image/${fileType}`,
          path: fileUrl,
        });
    
        const headers = {
          "Content-Type": "application/octet-stream",
          "ClientToken": token
        }

        axios.post(EnvironmentJava.uri + 'fileUpload/uploadPetPhoto',
           
           formdata,{
            headers: headers
          }).then((response) => {
              set_isLoading(false);
              isLoadingdRef.current = 0;
              updateDashboardData();
            }).catch((err) => {
                set_isLoading(false);
                isLoadingdRef.current = 0;
              firebaseHelper.logEvent(firebaseHelper.event_pet_img_api_fail, firebaseHelper.screen_pet_edit, "Updating pet image failed", 'Pet Id : '+petObj.petID);
            });
    };

    const updateDashboardData = () => {
      firebaseHelper.logEvent(firebaseHelper.event_pet_img_api_success, firebaseHelper.screen_pet_edit, "User successfully updated the pet image", 'Pet Id : '+petObj.petID);
      Apolloclient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
    };

    return (
        <PetEditUI 
            petObj = {petObj}
            isLoading = {isLoading}
            isEdit = {isEdit}
            imagePathNew = {imagePathNew}
            editButtonAction = {editButtonAction}
            navigateToPrevious = {navigateToPrevious}
            actionOnRow = {actionOnRow}
        />
    );

  }
  
  export default PetEditComponent;