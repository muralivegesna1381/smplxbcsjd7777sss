import React, { useState, useEffect } from 'react';
import {View,ScrollView,Text,Image,TouchableOpacity,ImageBackground,Linking,ActivityIndicator,FlatList} from 'react-native';
import DashBoardStyles from './dashBoardStyles';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import PetsSelectionCarousel from "./../../utils/petsSelectionCarousel/petsSelectionCarousel";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LeaderBoardService from './../pointTracking/leaderBoard/leaderBoardService';
import moment from "moment";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Storage from './../../utils/storage/dataStorageLocal';
import * as Constant from "./../../utils/constants/constant";
import * as Queries from "./../../config/apollo/queries";
import { useQuery } from "@apollo/react-hooks";
import * as Apolloclient from './../../config/apollo/apolloConfig';
import Highlighter from 'react-native-highlight-words';

const  DashBoardUI = ({route, ...props }) => {

    const { loading, data:uploadMediaData } = useQuery(Queries.UPLOAD_VIDEO_BACKGROUND_STATUS, { fetchPolicy: "cache-only" });

    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [isDeviceMissing, set_isDeviceMissing] = useState(false);
    const [isDeviceSetupDone, set_isDeviceSetupDone] = useState(true);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [firmware, set_firmware] = useState(undefined);
    const [birthday, set_birthday] = useState(undefined);
    // const [deviceType, set_deviceType] = useState(undefined);
    // const [gender, set_gender] = useState(undefined);
    const [lastSeen, set_lastSeen] = useState(undefined);
    // const [petAge, set_petAge] = useState(undefined);
    // const [petName, set_petName] = useState(undefined);
    // const [photoUrl, set_photoUrl] = useState(undefined);
    const [weight, set_weight] = useState(undefined);
    const [weightUnit, set_weightUnit] = useState(undefined);
    const [battery, set_battery] = useState(undefined);
    const [deviceStatusText, set_deviceStatusText] = useState(undefined);
    const [petsArray, set_petsArray] = useState([]);
    const [buttonTitle, set_buttonTitle] = useState(undefined);
    const [isTimer, set_isTimer] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isPTEnable, set_isPTEnable] = useState(false);
    const [isQuestionnaireEnable, set_isQuestionnaireEnable] = useState(true);
    const [isTimerEnable, set_isTimerEnable] = useState(false);
    const [isObsEnable, set_isObsEnable] = useState(false);
    const [isFirstUser, set_isFirstUser] = useState(false);
    const [isQuestLoading, set_isQuestLoading] = useState(false);
    const [isPTLoading, set_isPTLoading] = useState(false);
    const [questionnaireData, set_questionnaireData] = useState(undefined);
    const [isModularityService, set_isModularityService] = useState(false);
    const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
    const [leaderBoardArray, set_leaderBoardArray] = useState([]);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [campagainArray, set_campagainArray] = useState([]);
    const [campagainName, set_campagainName] = useState("");
    const [activeSlide, set_activeSlide] = useState(0);
    const [firstName, set_firstName] = useState(undefined);
    const [secondName, set_secondName] = useState(undefined);
    const [questionnaireDataLength,set_questionnaireDataLength] = useState(undefined);
    const [devicesCount, set_devicesCount] = useState(undefined);
    const [isFirmwareUpdate, set_isFirmwareUpdate] = useState(false);
    const [isEatingEnthusiasm, set_isEatingEnthusiasm] = useState(false);
    const [isImageScoring, set_isImageScoring] = useState(false);
    const [isPetWeight, set_isPetWeight] = useState(false);
    const [uploadStatus, set_uploadStatus] = useState(undefined);
    const [observationText, set_observationText] = useState(undefined);
    const [fileName, set_fileName] = useState(undefined);
    const [uploadProgress, set_uploadProgress] = useState(undefined);
    const [progressTxt, set_progressTxt] = useState(undefined);
    const [internetType, set_internetType] = useState(undefined);
    const [setuPendingDetailsArray, set_setuPendingDetailsArray] = useState();
    const [isDeceased, set_isDeceased] = useState(undefined);
    const [enableLoader, set_enableLoader] = useState (false);

    /**
     * setting the default pet object
     * Active slide - passes this value to Pet carousel page sets the default pet
     */
    useEffect(() => {
        set_petsArray(props.petsArray);
        // if(props.defaultPetObj){
            setDefaultValues(props.defaultPetObj);
            set_activeSlide(props.activeSlide);
            getDevicesCount(props.defaultPetObj);
            
        // }
        
      }, [props.petsArray,props.activeSlide,props.defaultPetObj]);

      // setting the values to local variables
    useEffect(() => {

        set_isTimer(props.isTimer);
        set_isLoading(props.isLoading);
        set_isFirstUser(props.isFirstUser);
        set_enableLoader(props.enableLoader);
        if(props.isFirstUser){
            set_buttonTitle('ONBOARD YOUR PET');
            getUserDeatils();
        }

    }, [props.isTimer,props.isLoading,props.isFirstUser,props.enableLoader]);

    // setting the PT, Questionnaire, timer, and observation permission values
    useEffect(() => {

        set_isPTEnable(props.isPTEnable); 
        set_isQuestionnaireEnable(props.isQuestionnaireEnable);
        set_isTimerEnable(props.isTimerEnable);
        set_isObsEnable(props.isObsEnable);

    }, [props.isPTEnable, props.isQuestionnaireEnable,props.isTimerEnable,props.isObsEnable]);

    // setting the Questionnaire data and updating the loader values
    useEffect(() => {

        set_isQuestLoading(props.isQuestLoading);
        set_isPTLoading(props.isPTLoading);
        set_questionnaireData(props.questionnaireData);
        set_questionnaireDataLength(props.questionnaireDataLength);

    }, [props.isQuestLoading,props.isPTLoading, props.questionnaireData,props.questionnaireDataLength]);

    // setting the Point tracking data
    useEffect(() => {

        set_leaderBoardPetId(props.leaderBoardPetId);
        set_leaderBoardArray(props.leaderBoardArray);
        set_leaderBoardCurrent(props.leaderBoardCurrent);
        set_campagainArray(props.campagainArray);
        set_campagainName(props.campagainName);

    }, [props.leaderBoardPetId,props.leaderBoardArray, props.leaderBoardCurrent, props.campagainArray, props.campagainName]);

    // setting th Popup's related data
    useEffect(() => {
        
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);

    }, [props.isPopUp,props.popUpMessage,props.popUpAlert]);

    // setting the Eating enthusiasim, Imagebased scoring, pet Weight data
    useEffect(() => {
        
        set_isModularityService(props.isModularityService);
        set_isEatingEnthusiasm(props.isEatingEnthusiasm);
        set_isImageScoring(props.isImageScoring);
        set_isPetWeight(props.isPetWeight);

    }, [props.isModularityService,props.isEatingEnthusiasm,props.isImageScoring,props.isPetWeight]);

    useEffect(() => {
        set_setuPendingDetailsArray(props.setuPendingDetailsArray)
    }, [props.setuPendingDetailsArray]);

    /**
     * This useEffect calls only when Observations with Video background upload process initiates
     * calls everytime when ever the valuse and progress of the Video upload changes
     * based on this the UI related Video upload will be visible and dissappears
     */
    useEffect (() => {

        if(uploadMediaData){

            if(uploadMediaData.data.stausType==='Uploading Done'){
                set_uploadStatus(undefined);
            } else {
                set_uploadStatus(uploadMediaData.data.statusUpload);
            }

            if(uploadMediaData.data.observationName){
                set_observationText(uploadMediaData.data.observationName);
            } else {
                set_observationText('');
            }

            if(uploadMediaData.data.fileName){
                set_fileName(uploadMediaData.data.fileName);
            } else {
                set_fileName('');
            }

            if(uploadMediaData.data.uploadProgress){
                set_uploadProgress(uploadMediaData.data.uploadProgress);
            }

            if(uploadMediaData.data.progressTxt){
                set_progressTxt(uploadMediaData.data.progressTxt);
            }

            if(uploadMediaData.data.internetType==='notWi-Fi'){
                set_internetType('cellular');
            } else {
                set_internetType('Wi-Fi');
            }
        }
  
    },[uploadMediaData]);

      /**
       * 
       * @param {*} pObject 
       */
    const refreshDashBoardDetails = (pObject) => {

        saveDefaultPetAsync(pObject);
        props.refreshDashBoardDetails('swiped');

    };

    // this method is used when pet parent doesnt have at least one pet within the account
    const getUserDeatils = async () => {
        let firtName = await Storage.getDataFromAsync(Constant.SAVE_FIRST_NAME);
        let secName = await Storage.getDataFromAsync(Constant.SAVE_SECOND_NAME);
        set_firstName(firtName);
        set_secondName(secName);
    };

    /**
     * Here no of devices associated to the selected pet will be set
     * based on the count - when multiple deices associated, 
     * the option to navigate to multiple devices screen will be enabled.
     * if the default sensor for this pet is having firmware update,
     * Button to navigate to Connect the sensor will also be enabled
     * @param {*} devObj 
     */
    const getDevicesCount = (devObj) => {

        if(devObj && devObj.devices.length > 1){
            let count = 0;
            for (let i = 0; i < devObj.devices.length; i++){
                if(devObj.devices[i].deviceNumber && devObj.devices[i].deviceNumber!==""){

                    count = count + 1;
                }
            }
            set_devicesCount(count);

        } else {
            set_devicesCount(1);
        }

        if(devObj && devObj.devices.length > 0 && devObj.devices[0].isFirmwareVersionUpdateRequired){
            set_isFirmwareUpdate(true);
        } else {
            set_isFirmwareUpdate(false);
        }

    };

    /**
     * Setting default values for selected pet
     * By default - the first pet in the array will be default
     * all the pet related information will be populated in dashboard
     * @param {*} pObject 
     */
    const setDefaultValues = async (pObject,index) => {
        
        if(pObject){
            set_defaultPetObj(pObject);           
            set_birthday(pObject.birthday);            
            // set_gender(pObject.gender);           
            // set_petAge(pObject.petAge);
            // set_petName(pObject.petName);
            // set_photoUrl(pObject.photoUrl);
            set_weight(pObject.weight);
            set_weightUnit(pObject.weightUnit);
            updateCurrentPetObj(props.petsArray);
        }

        if(pObject){

            if(pObject && parseInt(pObject.petStatus) === 3){
                set_isDeceased(true);               
            } else {
                set_isDeceased(false);    
            }
            
            let index1 = 0;
            if(index) {
                index1 = index;
            }


            if(pObject.devices.length > 0 && (pObject.devices[index1].deviceNumber || pObject.devices[index1].deviceNumber != "")){
                set_isDeviceMissing(false);               
            } else {
                set_isQuestLoading(false);
                set_isDeviceMissing(true);
                set_buttonTitle('ADD A DEVICE?');
                set_deviceStatusText(Constant.DEVICE_MISSING_DASHBOARD);
                return;
            }

            if(pObject.devices.length > 0 && pObject.devices[index1].isDeviceSetupDone){
                set_isDeviceSetupDone(true);
            } else {
                set_isQuestLoading(false);
                set_isDeviceSetupDone(false);
                set_buttonTitle('COMPLETE SENSOR SETUP');
                set_deviceStatusText(Constant.DEVICE_PENDING_DASHBAORD);
            }

        } 

        if(pObject){

            if(pObject.devices.length>0){

                let objTemp = undefined;
                for (let i = 0; i < pObject.devices.length; i++){

                    if(pObject.devices.length > 0 && pObject.devices[i].isDeviceSetupDone){
                        objTemp = pObject.devices[i];
                        return;
                    }
                    
                }

                if(objTemp){

                    set_battery(objTemp.battery);
                    // set_deviceType(objTemp.deviceType);
                    set_lastSeen(objTemp.lastSeen);
                    set_deviceNumber(objTemp.deviceNumber);
                    set_firmware(objTemp.firmware);

                }
                
            } else {

                if(pObject.devices.length > 0){
                    set_battery(index ? pObject.devices[index].battery : pObject.devices[0].battery);
                    // set_deviceType(index ? pObject.devices[index].deviceType : pObject.devices[0].deviceType);
                    set_lastSeen(index ? pObject.devices[index].lastSeen : pObject.devices[0].lastSeen);
                    set_deviceNumber(index ? pObject.devices[index].deviceNumber : pObject.devices[0].deviceNumber);
                    set_firmware(index ? pObject.devices[index].firmware : pObject.devices[0].firmware);
                }

            }          

        }
        
    };
    
    /**
     * When default pet is changed it updates the newly selected pet and updates the dashboard widgets
     * @param {*} petsNew 
     */
    const updateCurrentPetObj = async (petsNew) => {

        let defaultPet = await Storage.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        defaultPet = JSON.parse(defaultPet);
        if(defaultPet) {

          let obj = findArrayElementByPetId(petsNew, defaultPet.petID);
          if(obj){

            set_defaultPetObj(obj);           
            set_birthday(obj.birthday);            
            // set_gender(obj.gender);           
            // set_petAge(obj.petAge);
            // set_petName(obj.petName);
            // set_photoUrl(obj.photoUrl);
            set_weight(obj.weight);
            set_weightUnit(obj.weightUnit);
            set_battery(obj.devices.length > 0 && obj.devices[0].battery);
            // set_deviceType(obj.devices.length > 0 && obj.devices[0].deviceType);
            set_lastSeen(obj.devices.length > 0 && obj.devices[0].lastSeen);
            set_deviceNumber(obj.devices.length > 0 && obj.devices[0].deviceNumber);
            set_firmware(obj.devices.length > 0 && obj.devices[0].firmware);

          }
          
        }
          
    };
  
    function findArrayElementByPetId(pets, petId) {
      return pets.find((element) => {
        return element.petID === petId;
      })
    };

    // saves the default pet async
    const saveDefaultPetAsync = async (obj) => {
        let pObj = JSON.stringify(obj);
        await Storage.saveDataToAsync(Constant.DEFAULT_PET_OBJECT,pObj);
    };

    // Settings button action
    const settingsBtnAction = () => {
        props.settingsAction();
    }

    // Popup OK button action
    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    // Popup Cancel button action
    const popCancelBtnAction = (value) => {
        props.popCancelBtnAction();
    };

    // Devices button action
    const devicesSelectionAction = () => {
        props.devicesSelectionAction();      
    };

    // Based on title navigates to particular feature
    const nextButtonAction = () => {
        props.setupDeviceAction(buttonTitle);       
    };

    const quickSetupAction = (value) => {
        props.quickSetupAction(value);
    };

    // Questionnaire button action
    const quickQuestionAction = (item) => {        
        props.quickQuestionAction(item);       
    };

    // Question button action
    const quickQuestionnaireAction = () => {
        props.quickQuestionnaireAction();
    };

    // Edit button action
    const editPetAction = (item) => {
        props.editPetAction(item);
    };

    // Edit Weight button action
    const weightAction = () => {
        props.weightAction();
    };

    // Firmware button action
    const firmwareUpdateAction = () => {
        props.firmwareUpdateAction();
    };

    // EnthusiasticAction button action
    const enthusiasticAction = () => {
        props.enthusiasticAction('EatingEnthusiasticComponent');
    };

    // Imagebase scoring button action
    const imageScoreAction = () => {
        props.imageScoreAction();
    };

    const internetBtnAction = async () => {
        await Storage.removeDataFromAsync(Constant.UPLOAD_PROCESS_STARTED);
        Apolloclient.client.writeQuery({query: Queries.UPLOAD_VIDEO_BACKGROUND,data: {data: { obsData:'checkForUploads',__typename: 'UploadVideoBackground'}},})
    };

    function replaceCommaLine(data) {
        let dataToArray = data.split('#').map(item => item.trim());
        return dataToArray.join("\n");
    };

    const actionOnRow = (item,index) => {
        props.supportBtnAction(item);      
    };

    const renderMeterials = ({ item, index }) => {
        return (

            <View style={flatcontainer1}>

                <TouchableOpacity onPress={() => actionOnRow(item,index)}>
                    <View style={meterialViewStyle}>
                        {item.materialTypeId === 1 ? 
                        (item.thumbnailUrl ? <ImageBackground source={{uri:item.thumbnailUrl}} style={backdrop} imageStyle={{borderRadius:5}}>
                            <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={playIconStyle}></Image>
                        </ImageBackground> : 
                        
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={backdrop} imageStyle={{borderRadius:5}}>
                            {item.materialTypeId === 1 ? <Image source={require('./../../../assets/images/otherImages/svg/play.svg')} style={playIconStyle}></Image> : null}
                        </ImageBackground> )
                        : 
                        <ImageBackground source={require("./../../../assets/images/otherImages/svg/pdf.svg")} style={backdrop1} imageStyle={{borderRadius:5}}>
                        </ImageBackground>}

                        <Text numberOfLines={2} style={[name]}>{item.titleOrQuestion && item.titleOrQuestion.length>35 ? item.titleOrQuestion.slice(0,35)+'...' : item.titleOrQuestion}</Text>
                    </View>
                </TouchableOpacity>

            </View>
            
        );
    };

    // DashBoard page Styles
    const {
        mainComponentStyle,
        headerView,
        firstTimeUserStyle,
        ftTopViewStyle,
        ftdownViewStyle,
        ftHeaderHeader1,
        ftHeaderHeader2,
        ftHeaderHeader3,
        ftHeaderHeader4,
        ftytLnksHeaderHeader,
        ytLinkViewStyle,
        youTubeThumbs,
        leadeBoardStyle,
        tilesViewStyle,
        sensorSelView,
        petDetailsView,
        questionnaireView,
        petDHeaderTextStyle,
        petDSubHeaderTextStyle,
        actyHeaderTextStyle,
        questionnaireTextStyle,
        sensorHeader2,
        sensorSubHeader2,
        actySubHeaderTextStyle,
        buttonstyle,
        btnTextStyle,
        openButtonstyle,
        openBtnTextStyle,
        missingTextStyle,
        missingTextStyle1,
        missingBackViewStyle,
        indexTextStyle,
        detailsImgsStyle,
        detailsBubImgStyle,
        missingDogImgStyle,
        qstButtonstyle,
        qstbtnImgStyle,
        wtbtnImgStyle,
        qstPointsHeaderTextStyle,
        quickselctionViewStyle,
        quickActionsInnerViewStyle,
        quickbtnInnerImgStyle,
        quickbtnInnerTextStyle,
        firmwareAlertStyle,
        eatingScoreViewStyle,
        eatingScoreSubViewStyle,
        enthusasticTextStyle,
        enthusiasticBtnStyle,
        imgScoreTextStyle,
        progressStyle,
        name,
        flatcontainer,
        meterialViewStyle,
        flatcontainer1,
        backdrop,
        playIconStyle,
        backdrop1,
        alertTextStyle,
        sensorSubHeader3

    } = DashBoardStyles;

    return (
            <View style={[mainComponentStyle]}>

                <View style={[headerView,{}]}>
                    <HeaderComponent
                        isBackBtnEnable={false}
                        isSettingsEnable={true}
                        isChatEnable={false}
                        isTImerEnable={false}
                        isTitleHeaderEnable={true}
                        title={'DASHBOARD'}
                        headerColor = {isFirstUser ? '#F5F7F9' : 'white'}
                        moduleName = {'firstTimeUser'}
                        timerBtnAction = {() => timerBtnAction()}
                        settingsBtnAction = {() => settingsBtnAction()}
                    />
                </View>
                
                {isFirstUser ? 
                
                <View style={firstTimeUserStyle}>

                    <View style={ftTopViewStyle}>
                        <Text style={ftHeaderHeader1}>{'Welcome'}</Text>
                        <Text style={ftHeaderHeader2}>{firstName}</Text>
                        <Text style={ftHeaderHeader3}>{secondName}</Text>
                        <Text style={[ftHeaderHeader4]}>{'In order to get the most benefit from this app, we recommend onboarding your pet. Please watch the below videos to learn how to onboard your pet'}</Text>
                    </View>

                    <View style={ftdownViewStyle}>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/kmEz_Co17YU')}>
                            <View style={ytLinkViewStyle}>
                                
                                <Image source={require("./../../../assets/images/otherImages/png/fUserMultiplePets.png")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Set Up Multiple Pets'}</Text>
                                <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3%'),aspectRatio:1}}/>

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/grLuxy0efvU')}>
                            <View style={ytLinkViewStyle}>
                            
                                <Image source={require("./../../../assets/images/otherImages/png/fUserChargeSensor.png")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Charge the Sensor'}</Text>
                                <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3%'),aspectRatio:1}}/>

                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Linking.openURL('https://youtu.be/O_seDWmcrQE')}>
                            <View style={ytLinkViewStyle}>

                                <Image source={require("./../../../assets/images/otherImages/png/fUserAddObs.png")} style={youTubeThumbs}/>
                                <Text style={[ftytLnksHeaderHeader]}>{'How to Enter an Observation'}</Text>
                                <Image source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('3  a%'),aspectRatio:1}}/>

                            </View>
                        </TouchableOpacity>

                    </View>

                </View> : 
                
                <View>
                    
                <View style={[CommonStyles.petsSelViewHeaderStyle]}>

                    <PetsSelectionCarousel
                        petsArray={petsArray}
                        isSwipeEnable = {!isModularityService && !isPTLoading && !isQuestLoading ? true : false}
                        defaultPet = {defaultPetObj}
                        activeSlides = {activeSlide}
                        isFromScreen = {'Dashboard'}
                        setValue={(pObject) => {
                            refreshDashBoardDetails(pObject);
                        }}
                        editPetAction = {editPetAction}
                    />

                </View>

                <View style={{marginBottom:hp('5%'),height:hp('75%')}}>

                <ScrollView>  

                    <View style={{marginTop: isTimer ? hp('12%') : hp('0%'), marginBottom: isTimer || !isDeviceSetupDone || isDeviceMissing ? hp('2%') : hp('2%')}}>

                    {uploadStatus ? <View style={{width:wp('100%'),height:hp('10%'),alignItems:'center',justifyContent:'center',backgroundColor:'#818588'}}>

                        {internetType === "cellular" ? 
                        
                        <View style={{width:wp('90%'),flexDirection:'row'}}>

                            <View style={{width:wp('60%'),justifyContent:'center',alignitems:'center'}}>
                                <Text style={alertTextStyle}>{'Media cannot be uploaded on cellular network. Please switch to Wi-Fi and try again.'}</Text>                               
                            </View>

                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>
                                <TouchableOpacity style= {{width:wp('25%'),height:hp('4%'),backgroundColor:'red',alignItems:'center',justifyContent:'center',borderRadius:5}} onPress={() => {internetBtnAction()}}>
                                <Text style={alertTextStyle}>{'TRY AGAIN'}</Text>
                                </TouchableOpacity>
                            </View>

                        </View> 
                        
                        : 
                        
                        <View style={{width:wp('90%'),height:hp('6%'),flexDirection:'row'}}>

                            <View style={{width:wp('60%'),height:hp('6%'),justifyContent:'center'}}>
                                <Text style={{color:'white'}}>{'Observation : '+(observationText && observationText.length > 15 ? observationText.replace('/r','/').slice(0, 15)+"..." : observationText)}</Text>
                                <Text style={{color:'white',marginTop:hp('1%')}}>{uploadStatus + " "+ fileName}</Text>
                            </View>

                            <View style={{width:wp('30%'),height:hp('6%'),alignItems:'center',justifyContent:'center'}}>

                                <View style={{width:wp('12%'),aspectRatio:1,backgroundColor:'#000000AA',borderRadius:100,borderColor:'#6BC100',borderWidth:2,alignItems:'center',justifyContent:'center'}}>
                                    <Text style={progressStyle}>{uploadProgress}</Text>
                                </View>

                                <Text style={{color:'white'}}>{progressTxt}</Text>
                               
                            </View>

                        </View>}

                    </View> : null}

                        {isPTEnable && !isDeviceMissing && isDeviceSetupDone? <View style={leadeBoardStyle}>
                                <LeaderBoardService
                                    leaderBoardArray = {leaderBoardArray}
                                    leaderBoardPetId = {leaderBoardPetId}
                                    leaderBoardCurrent = {leaderBoardCurrent}
                                    campagainName = {campagainName}
                                    campagainArray = {campagainArray}
                                    isSwipedModularity = {props.isSwipedModularity}
                                    enableLoader = {enableLoader}
                                ></LeaderBoardService>

                            </View> : (isPTLoading ? <View style={{height:hp('3%'),justifyContent:'center',marginTop:hp('1%')}}><ActivityIndicator size="small" color="gray"/></View> : null)}  

                        {!isDeviceMissing && isDeviceSetupDone ? <View>

                        <ImageBackground style={quickselctionViewStyle} resizeMode="stretch" source={require("../../../assets/images/dashBoardImages/png/quickGradient.png")}>

                             {isTimerEnable && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Timer')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashTimerIcon.svg")} style={quickbtnInnerImgStyle}/>
                                    <Text style={quickbtnInnerTextStyle}>{"TIMER"}</Text>
                                </TouchableOpacity>                          
                            </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {isObsEnable && !isModularityService ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Quick Video')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/dashQuickVideo.svg")} style={quickbtnInnerImgStyle}/>
                                    <Text style={quickbtnInnerTextStyle}>{"QUICK VIDEO"}</Text>
                                </TouchableOpacity>                          
                            </View> : (isModularityService ? <View style={quickActionsInnerViewStyle}><ActivityIndicator size="small" color="gray"/></View> : null)}

                            {!isDeviceMissing && isDeviceSetupDone ? <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Chat')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatIcon.svg")} style={quickbtnInnerImgStyle}/>
                                    <Text style={quickbtnInnerTextStyle}>{"CHAT"}</Text>
                                </TouchableOpacity>                          
                            </View> :  null}

                            <View style={quickActionsInnerViewStyle}>
                                <TouchableOpacity style={{alignItems:'center'}} onPress={() => {quickSetupAction('Support')}}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/chatQuickIcon.svg")} style={quickbtnInnerImgStyle}/>
                                    <Text style={quickbtnInnerTextStyle}>{"SUPPORT"}</Text>
                                </TouchableOpacity>                          
                            </View>

                        </ImageBackground>

                        </View> : null}

                        {!isDeviceMissing && isDeviceSetupDone ? <View style={[sensorSelView]}>
                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center',height:hp('8%'),}}>
                                <Text style={sensorHeader2}>{'SENSOR'}</Text>
                                {deviceNumber && deviceNumber.length < 10 ? <Text style={[sensorSubHeader2,{color:isDeviceMissing ? 'red' : '#6fc309'}]}>{isDeviceMissing ? 'Device Missing' : deviceNumber}</Text> 
                                : (deviceNumber ? <View>
                                    <Text style={[sensorSubHeader2,{color:isDeviceMissing ? 'red' : '#6fc309'}]}>{deviceNumber.substring(0,9)}</Text>
                                    <Text style={[sensorSubHeader2,{color:isDeviceMissing ? 'red' : '#6fc309'}]}>{deviceNumber.substring(9,deviceNumber.length)}</Text>
                                </View> : null)}
                            </View>

                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center'}}>
                                
                                <TouchableOpacity style={{alignItems:'center'}} disabled={isFirmwareUpdate ? false : true} onPress={() => {firmwareUpdateAction('firmwareUpdate')}}>
                                    
                                    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}>  
                                        <View style={{alignItems:'center',justifyContent:'space-between'}}>
                                            <Text style={sensorHeader2}>{'FIRMWARE'}</Text>
                                            <Text style={[sensorSubHeader2,{}]}>{firmware ? firmware : '--'}</Text>
                                        </View> 
                                        {isFirmwareUpdate ? <Image source={require("../../../assets/images/otherImages/svg/firmwareAlert.svg")} style={[firmwareAlertStyle,{}]}/> : null}
                                    </View>
                                </TouchableOpacity>
                                
                            </View> 

                            <View style={{flex:1.7,justifyContent:'center',alignItems:'center'}}>
                                <Text style={sensorHeader2}>{'LAST SYNC'}</Text>
                                <Text style={lastSeen && lastSeen.length > 10 ? [sensorSubHeader3,{}] : [sensorSubHeader2,{}]}>{lastSeen ? lastSeen : '--'}</Text>
                            </View>

                            {isDeviceSetupDone ? <View style={{flex:1.7,alignItems:'center',justifyContent:'center'}}>

                                    {<View style={{justifyContent:'space-between',alignItems:'center',}}>
                                        <Text style={sensorHeader2}>{'BATTERY'}</Text>
                                        <Text style={[sensorSubHeader2,{color: battery && parseInt(battery) < 20 ? 'red' : '#6fc309'}]}>{battery ? battery + "%" : ""}</Text>
                                    </View>}
                                
                            </View> : null}

                            {defaultPetObj && devicesCount > 1 ? <TouchableOpacity style={{width:wp("12%"),height:hp("7%"),justifyContent:'center',alignItems:'center',}} onPress={() => {devicesSelectionAction()}}>
                                    <View style={{width:wp("8%"),height:hp("3.5%"),backgroundColor:'#E0DCDC',justifyContent:'center',alignItems:'center',marginRight: hp("1%"),marginLeft: hp("1%"),borderRadius:5}}>
                                        <Image source={require("../../../assets/images/otherImages/svg/rightArrowLightImg.svg")} style={{marginLeft: wp("1%"), marginRight: wp("1%"),width:wp('2%'),height:hp('2%')}}/>
                                    </View>
                                        
                                    </TouchableOpacity> : null}

                        </View> : null}

                        {!isDeviceMissing && isDeviceSetupDone ? <View style={[petDetailsView]}>
                        <View style={{flexDirection:'row', marginTop:hp('1%'),justifyContent:'space-between'}}>

                            <View style={tilesViewStyle}>

                                <View style={detailsBubImgStyle}>
                                    <Image source={require("../../../assets/images/dashBoardImages/svg/birthday.svg")} style={detailsImgsStyle}/>
                                </View>

                                <View style={{justifyContent:'center'}}>
                                    <Text style={petDHeaderTextStyle}>{"BIRTH DAY"}</Text>
                                    <Text style={[petDSubHeaderTextStyle,{width:wp('25%')}]}>{birthday ? moment(new Date(birthday)).format("MM-DD-YYYY") : '--'}</Text>
                                </View>

                            </View>

                            <View style={[tilesViewStyle,{justifyContent:'space-between'}]}>

                                <View style={{flexDirection:'row'}}>
                                    <View style={detailsBubImgStyle}>
                                        <Image source={require("../../../assets/images/dashBoardImages/svg/weight.svg")} style={detailsImgsStyle}/>
                                    </View>

                                    <View style={{justifyContent:'center'}}>
                                        <Text style={petDHeaderTextStyle}>{"WEIGHT"}</Text>
                                        <Text style={petDSubHeaderTextStyle}>{weight ? weight + ' ' + (weightUnit? weightUnit : '' ): '--'}</Text>
                                    </View>
                                </View>

                                {isPetWeight ? <TouchableOpacity style={{width:wp("15%"),height:hp("7%"),justifyContent:'center',alignItems:'center',}} onPress={() => {weightAction()}}>
                                    <View style={[qstButtonstyle,{alignSelf:'flex-end',alignSelf:'center'}]}>
                                        <Image source={require("../../../assets/images/dashBoardImages/svg/greenRightArrowBtnImg.svg")} style={wtbtnImgStyle}/>
                                    </View>
                                    
                                </TouchableOpacity> : null}

                            </View>

                        </View>

                        {isEatingEnthusiasm ? <View>

                            <ImageBackground style={eatingScoreViewStyle} resizeMode="stretch" source={require("../../../assets/images/otherImages/png/eatingBackImg.png")}>

                                <View style={eatingScoreSubViewStyle}>
                                
                                    <View>
                                        <Text style={enthusasticTextStyle}>{'HOW'}</Text>
                                        <Text style={enthusasticTextStyle}>{'ENTHUSIASTIC'}</Text>
                                        <Text style={enthusasticTextStyle}>{'IS YOUR PET WHILE'}</Text>
                                        <Text style={enthusasticTextStyle}>{'HAVING THEIR FOOD ?'}</Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity style={[enthusiasticBtnStyle,{}]} onPress={() => {enthusiasticAction()}}>
                                            <Text style={[sensorSubHeader2,{color:'black'}]}>{'TELL US NOW'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                    
                            </ImageBackground>

                        </View> : null}

                        {isImageScoring ? <View>

                            <ImageBackground style={[eatingScoreViewStyle,{}]} resizeMode="stretch" source={require("../../../assets/images/otherImages/png/imageScaleBckImg.png")}>

                                <View style={eatingScoreSubViewStyle}>
                                
                                    <View>
                                        <Text style={imgScoreTextStyle}>{'SCORE YOUR'}</Text>
                                        <Text style={imgScoreTextStyle}>{'PET BASED'}</Text>
                                        <Text style={imgScoreTextStyle}>{'ON THE SCALE'}</Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity style={[enthusiasticBtnStyle,{}]} onPress={() => {imageScoreAction()}}>
                                            <Text style={[sensorSubHeader2,{color:'black'}]}>{'START NOW'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                    
                            </ImageBackground>

                        </View> : null}

                    </View> : null}

                    {isQuestionnaireEnable && questionnaireData && questionnaireData.length > 0 ? <View style={[questionnaireView]}>
                        <View style={{flexDirection:'row',justifyContent:'space-between', alignItems:'center'}}>
                            <Text style={[actyHeaderTextStyle,{alignSelf:'center'}]}>{"OPEN QUESTIONNAIRE"}</Text>
                            <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                            
                                {!isModularityService ? <TouchableOpacity style={{width:wp("15%"),}} onPress={() => {quickQuestionnaireAction()}}>
                                    <View  style={[qstButtonstyle,{flexDirection:'row',justifyContent:'center',alignItems:'center',width:wp("15%"),}]}>
                                        <Text style={[qstPointsHeaderTextStyle]}>{questionnaireDataLength < 10 ? '0'+questionnaireDataLength : questionnaireDataLength}</Text>
                                        <Image source={require("../../../assets/images/dashBoardImages/svg/greenRightArrowBtnImg.svg")} style={[qstbtnImgStyle]}/>
                                    </View>
                                </TouchableOpacity> : <View><ActivityIndicator size="small" color="gray"/></View>}
                            </View>

                        </View>

                        <View style={{flexDirection:'row', justifyContent:'space-between', marginTop:hp('1%')}}>
                            <View style={{flexDirection:'row',flex:1}}>
                                <Text style={[indexTextStyle]}>{"1   "}</Text>
                            <View style={{justifyContent:'center'}}>
                                    <Text style={questionnaireTextStyle}>{questionnaireData[0].questionnaireName && questionnaireData[0].questionnaireName.length > 30 ? questionnaireData[0].questionnaireName.slice(0, 30) + "..." : questionnaireData[0].questionnaireName}</Text>
                                    <Text style={actySubHeaderTextStyle}>{'Due by: '+questionnaireData[0].endDate}</Text>
                                </View>
                            </View>

                            {!isModularityService ? <TouchableOpacity style={[openButtonstyle]} onPress={() => {quickQuestionAction(questionnaireData[0])}}>
                                <Text style={questionnaireData[0].status === "Elapsed" ? [openBtnTextStyle,{color:'red'}] : [openBtnTextStyle]}>{questionnaireData[0].status.toUpperCase()}</Text>
                            </TouchableOpacity> : <View style={[openButtonstyle]}><ActivityIndicator size="small" color="gray"/></View>}

                        </View>

                    </View> : (isQuestLoading ? <View style={[questionnaireView,{alignItems:'center',justifyContent:'center'}]}>
                        <ActivityIndicator size="large" color="gray"/>
                    </View> : null)}

                    {isDeceased ? <View style={{width:wp('90%'),height:hp('50%'), alignSelf:'center',justifyContent:'center'}}>
                        <View style={[buttonstyle]}>
                            <Text style={[btnTextStyle,{color:'black',textAlign:'center'}]}>{'Some App features are restricted for this pet. \nPlease reach out to the customer support for more details.'}</Text>
                        </View>

                    </View> : (isDeviceMissing || !isDeviceSetupDone ? <View style={{width:wp('90%'), alignSelf:'center',justifyContent:'center'}}>
                        <Image source={require("../../../assets/images/dogImages/dogImg5.svg")} style={missingDogImgStyle}/>
                        <View style={[buttonstyle]}>
                            <Text style={[btnTextStyle]}>{isDeviceMissing ? 'DEVICE MISSING' : !isDeviceSetupDone ? 'SETUP PENDING' : ''}</Text>
                        </View>

                        <View style={missingBackViewStyle}>
                        
                            <Text style={missingTextStyle}>{deviceStatusText}</Text>
                            {setuPendingDetailsArray.length > 0 ? <Text style={missingTextStyle1} onPress={ ()=>                    
                                Linking.openURL(replaceCommaLine('mailto:support@wearablesclinicaltrials.com?subject=Support&body='))}>{<Highlighter
                                    highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
                                    searchWords={['wearables support']}
                                    textToHighlight={replaceCommaLine('If you are facing any difficulty in setting your sensor up, please go through the below items or contact wearables support.')}
                            />}</Text> : null}

                            <FlatList
                                style={flatcontainer}
                                data={setuPendingDetailsArray}
                                showsVerticalScrollIndicator={false}
                                renderItem={renderMeterials}
                                enableEmptySections={true}
                                keyExtractor={(item) => item.titleOrQuestion}
                                numColumns={3}
                            />

                        </View>

                    </View> : null)}

                    </View>

                </ScrollView>

                </View>
                    
                </View>}    

                {isDeceased ? null :(isDeviceMissing || !isDeviceSetupDone || isFirstUser ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {buttonTitle}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction(buttonTitle)}
                />
            </View> : null)}      

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {props.isPopupLeft}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {"YES"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
           
        </View>
    );
  }
  
  export default DashBoardUI;