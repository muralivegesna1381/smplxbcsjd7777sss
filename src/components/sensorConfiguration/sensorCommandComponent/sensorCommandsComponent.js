import React, {useState,useEffect,useRef} from 'react';
import {StyleSheet,Text, View,Platform,Linking,BackHandler} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import SensorHandler from '../sensorHandler/sensorHandler';
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import ImageSequence from 'react-native-image-sequence';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_insensorCommandscreen;

const POPUP_COMMAND_CONFIRM =1;
const POPUP_COMMAND_SUCCESS = 2;
const POPUP_COMMAND_FAIL = 3;

const SensorCommandComponent = ({navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [popUpRBtnTitle, set_popUpRBtnTitle] = useState(undefined);
    const [popUplBtnTitle, set_popUplBtnTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isPopUpLeft, set_isPopUpLeft] = useState(false);
    const [popupId, set_popupId] = useState(undefined);
    const [loaderText, set_loaderText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [retryCount, set_retryCount] = useState(0);
    const [sensorImages, set_sensorImages] = useState([]);

    let commandType = useRef();
    let executeCommand = useRef(true);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    let maxRetryCount = 3;

    const eSImages = [
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor00.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor04.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor08.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor12.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor16.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor20.png"),   
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor24.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor28.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor32.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor36.png"),
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor40.png"),   
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor44.png"),   
        require("./../../../../assets/images/sequenceImgs/eraseSensor/eraseSensor48.png"),          
      ];

    const fSImages = [
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync00.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync03.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync06.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync09.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync12.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync15.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync18.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync21.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync24.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync27.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync30.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync33.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync36.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync39.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync43.png"),
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync46.png"), 
        require("./../../../../assets/images/sequenceImgs/forceSync/forceSync49.png"),        
    ];

    const rSImages = [
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor00.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor05.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor10.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor15.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor20.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor25.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor30.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor35.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor40.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor45.png"),
        require("./../../../../assets/images/sequenceImgs/factoryReset/resetFactorySensor49.png"),
    ];

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_sensor_command_component);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_command_component, "User in Sensor Command Screen", ''); 
        initialSessionStart();

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
            return () => {
                initialSessionStop();
                BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            };

    }, []);

    useEffect(() => {

        if(route.params?.commandType){
            commandType.current = route.params?.commandType;
            if(commandType.current==='Force Sync'){
                set_sensorImages(fSImages);
                set_popUpMessage(Constant.SYNC_CONFIRMATION);
                set_popUpTitle('Alert');
                set_popUpRBtnTitle('YES');
                set_popUplBtnTitle("NO");
                set_isPopUpLeft(true);
                popIdRef.current = 1;
                set_isPopUp(true); 
                set_popupId(POPUP_COMMAND_CONFIRM);
                getDevice();              

            } else if(commandType.current==='Erase Data'){
    
                set_sensorImages(eSImages);
                set_popUpMessage(Constant.ERASE_CONFIRMATION);
                set_popUpTitle('Alert');
                set_popUpRBtnTitle('YES');
                set_popUplBtnTitle("NO");
                set_isPopUpLeft(true);
                popIdRef.current = 1;
                set_isPopUp(true); 
                set_popupId(POPUP_COMMAND_CONFIRM);
                getDevice();

            } else if(commandType.current==='Restore'){
    
                set_sensorImages(rSImages);
                set_popUpMessage(Constant.RESTORE_FACTOTY_CONFIRMATION);
                set_popUpTitle('Alert');
                set_popUpRBtnTitle('YES');
                set_popUplBtnTitle("NO");
                set_isPopUpLeft(true);
                popIdRef.current = 1;
                set_popupId(POPUP_COMMAND_CONFIRM);
                set_isPopUp(true); 
                getDevice();
            }            

        }
        
    }, [route.params?.commandType]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_insensorCommandscreen = await perf().startTrace('t_inSensorCommandScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_insensorCommandscreen.stop();
    };

    const getDevice = async () => {

        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
        defaultObj = JSON.parse(defaultObj);
        let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
        let devNumber = defaultObj.devices[parseInt(sensorIndex)].deviceNumber;
        
        set_deviceNumber(devNumber);
        set_petName(defaultObj.petName);
    };

    const connectSensor = async (devNumber) => {
        set_isLoading(true);
        isLoadingdRef.current = 1;
        set_loaderText('Please wait while we connect to sensor..');
        if(Platform.OS==='ios'){
            SensorHandler.getInstance();
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(devNumber,handleSensorCallback);
            }, 1000)
        } else {
            SensorHandler.getInstance().startScan(devNumber,handleSensorCallback);
        }

    };

    const handleSensorCallback = ({ data, error }) => {
        
        if(data && data.status===200){
            set_loaderText('Please wait while we process your request');
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_command_component, "Sensor connected Successfully : "+retryCount+1, 'Device Number : '+deviceNumber);
            sensorCommand();
        } else {      
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_command_component, "Sensor connection Fail : "+retryCount+1, 'Device Number : '+deviceNumber);
            if(retryCount < maxRetryCount){

                set_popUpRBtnTitle('RETRY');
                set_popUplBtnTitle("CANCEL");
                if (retryCount===0){
                    set_retryCount(retryCount+1);
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
                } else if (retryCount===1){
                    set_retryCount(retryCount+1);
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
                } else if (retryCount===2){
                    set_retryCount(0);
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3); 
                    set_popUpRBtnTitle('EMAIL');
                    set_popUplBtnTitle("NO");             
                } else {
                    set_popUpMessage('Unable to Connect Please try again');
                }

                set_popUpTitle('Alert');
                set_isPopUpLeft(true);
                popIdRef.current = 1;
                set_isPopUp(true);         
                set_loaderText(undefined);

            }
          
        }
    };

    const sensorCommand = () => {

        firebaseHelper.logEvent(firebaseHelper.event_command_btn_action, firebaseHelper.screen_sensor_command_component, "User sensor option to perform : "+commandType.current, 'Device Number : '+deviceNumber);
        if(commandType.current === 'Force Sync'){

            const writeVal = [1];
            writeData(writeVal);

        } else if(commandType.current === 'Erase Data'){

            const writeVal = [3];
            writeData(writeVal);
            
        } else if(commandType.current === 'Restore'){

            const writeVal = [4];
            writeData(writeVal);
            
        }
        
    }

    const writeData = (command) => {

        SensorHandler.getInstance().writeDataToSensor(bleUUID.COMM_SERVICE,bleUUID.COMMAND_CHAR,command,
          ({ data, error }) => {

            set_loaderText(undefined);
            set_isLoading(false);           
            isLoadingdRef.current = 0;
            if (data) {

                firebaseHelper.logEvent(firebaseHelper.event_command_success, firebaseHelper.screen_sensor_command_component, "Sensor Command Successfull : "+commandType.current, 'Device Number : '+deviceNumber);
                set_retryCount(0);
                set_popUpTitle('Success');
                set_popUpRBtnTitle('OK');
                set_isPopUpLeft(false);
                set_popupId(POPUP_COMMAND_SUCCESS);
                if(commandType.current === 'Force Sync'){

                    set_popUpMessage(Constant.SYNC_SUCCESS);
        
                } else if(commandType.current === 'Erase Data'){
        
                    set_popUpMessage(Constant.ERASE_SENSOR_SUCCESS);
                    
                } else if(commandType.current === 'Restore'){
        
                    set_popUpMessage(Constant.RESTORE_FACTORY_SUCCESS);
                    
                }
                
                set_isPopUp(true);   
                popIdRef.current = 1;      
                
            } else if (error) {

                firebaseHelper.logEvent(firebaseHelper.event_command_fail, firebaseHelper.screen_sensor_command_component, "Sensor Command Fail : "+commandType.current, 'Device Number : '+deviceNumber);
                set_popUpTitle('Failed');
                set_isPopUpLeft(true);
                popIdRef.current = 1;
                set_popUpRBtnTitle('RETRY');
                set_popUplBtnTitle("CANCEL");
                set_popupId(POPUP_COMMAND_FAIL);
                if(commandType.current==='Force Sync'){
                    executeCommand.current = true;
                    set_popUpMessage(Constant.SYNC_FAIL);
        
                } else if(commandType.current==='Erase Data'){
                    executeCommand.current = true;
                    set_popUpMessage(Constant.ERASE_SENSOR_FAIL);
                    
                } else if(commandType.current==='Restore'){
                    executeCommand.current = true;
                    set_popUpMessage(Constant.RESTORE_FACTORY_FAIL);
                    
                }

                set_isPopUp(true);
                popIdRef.current = 1;
              
            }
          }
        );
      };

    const backBtnAction = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_command_component, "User clicked on back button to navigate to Select Sensor Action Page", '');
            SensorHandler.getInstance().dissconnectSensor();
            navigation.navigate('SelectSensorActionComponent');
        }
        
    };

    const popOkBtnAction = () => {

        popIdRef.current = 0;
        if(executeCommand.current){
            executeCommand.current = false;
            set_isLoading(true);
            isLoadingdRef.current = 1;
            sensorCommand();
        } else {
            if(popUpMessage === Constant.SENSOR_RETRY_MESSAGE_3){
                mailToHPN();
                backBtnAction();
            } else {

                if(popupId === POPUP_COMMAND_CONFIRM){
                    connectSensor(deviceNumber);
                } 
                
                if(popupId === POPUP_COMMAND_SUCCESS) {
                    backBtnAction();
                }
                
            }
           
        }

        set_isPopUp(false);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        set_popUpRBtnTitle(undefined);
        set_popUplBtnTitle(undefined);

    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        set_popUpRBtnTitle(undefined);
        set_popUplBtnTitle(undefined);
        // SensorHandler.getInstance().dissconnectSensor();
        navigation.navigate('SelectSensorActionComponent');
    };

    const mailToHPN = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_sensor_command_component, "User clicked on Mail to contact Support team", '');
        Linking.openURL(
            "mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='"
          );
    }

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={!isLoading}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={commandType.current}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                    <Text style={styles.headerStyle}>{'Device : '}<Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{deviceNumber}</Text></Text>
                    <Text style={styles.headerStyle}>{'Pet Name : '}<Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{petName}</Text></Text>
                </View>

                 <View style = {styles.videoViewStyle}>

                    {sensorImages && sensorImages.length > 0 ? <ImageSequence
                        images={sensorImages}
                        framesPerSecond={5}
                        style={styles.videoStyle}
                    /> : null}

                    <Text style={[styles.txtStyleBold]}>{'Please wait..'}</Text>
                </View>

            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {isPopUpLeft}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {popUplBtnTitle}
                    rightBtnTilte = {popUpRBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default SensorCommandComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    videoStyle : {
        width:wp('100%'),
        minHeight:hp('35%'),
    },

    videoViewStyle : {
        flex:1,
        justifyContent:'center'
    },

    txtStyleBold : {
        color: 'black',
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        marginTop:wp('3%'), 
        marginLeft:wp('3%'),
        marginRight:wp('3%'),  
        textAlign:'center'
    },

    topViewStyle : {
        width:wp('100%'),
        height:hp('8%'),
        justifyContent:'center',
        borderBottomWidth:0.5,
        borderColor:'#dedede',
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%'),
        marginTop:wp('1%'), 
    },

});