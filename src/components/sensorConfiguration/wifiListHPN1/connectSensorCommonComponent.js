import React, { useState, useEffect, useRef } from 'react';
import {View,Platform,Linking,BackHandler,StyleSheet,Text} from 'react-native';
import SensorHandler from '../sensorHandler/sensorHandler';
import * as DataStorageLocal from "../../../utils/storage/dataStorageLocal";
import * as Constant from "../../../utils/constants/constant";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import ImageSequence from 'react-native-image-sequence';
import * as firebaseHelper from '../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorConnectSensorCommandScreen;

const  ConnectSensorCommonComponent = ({navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [retryCount, set_retryCount] = useState(0);
    const [btnTitle, set_btnTitle] = useState(undefined);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [comType, set_comType] = useState(undefined);
    const [naviType, set_naviType] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let sensorType = useRef(undefined);
    let navigationType = useRef(undefined);
    let popIdRef = useRef(0);
    let isLoadingRef = useRef(0);

    const cSImages = [
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni00.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni05.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni09.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni13.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni18.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni23.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni27.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni31.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni36.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni40.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni45.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni50.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni54.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni58.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni63.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni67.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni72.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni77.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni81.png"),
        require("./../../../../assets/images/sequenceImgs/connectSensorAni/connectSensorAni89.png"),       
        
      ];

    useEffect(() => {

        getDefaultPet();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_sensor_connect_common);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_connect_common, "User in Sensor Connect Common Screen", ''); 
        });
      
          const unsubscribe = navigation.addListener('blur', () => {
              initialSessionStop();
        });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        }; 

    }, []);

    useEffect(() => {

        if(route.params?.navType){
            set_naviType(route.params?.navType);
            navigationType.current = route.params?.navType;
        }

        if(route.params?.commandType){
            set_comType(route.params?.commandType);
        }

    }, [route.params?.navType,route.params?.commandType]);
  
    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inSensorConnectSensorCommandScreen = await perf().startTrace('t_inSensorConnectCommandScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inSensorConnectSensorCommandScreen.stop();
    };

    const getDefaultPet = async () => {
        
        set_isLoading(true);
        isLoadingRef.current = 1;
        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
        defaultObj = JSON.parse(defaultObj);
        let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
        let devNumber = defaultObj.devices[parseInt(sensorIndex)].deviceNumber;
        let deviceType =  defaultObj.devices[parseInt(sensorIndex)].deviceModel;
        sensorType.current = deviceType;
        set_deviceNumber(devNumber);
        SensorHandler.getInstance();
        await SensorHandler.getInstance().getSensorType();
        await SensorHandler.getInstance().clearPeriID();
        await SensorHandler.getInstance().clearConfiguredWIFIArray();
        if(Platform.OS==='ios'){
            setTimeout(() => {  
                SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
            }, 1000)
        } else {
            SensorHandler.getInstance().startScan(devNumber,handleSensorCallback); 
        }
    };

    const handleSensorCallback = ({ data, error }) => {
       
        set_isLoading(false);
        isLoadingRef.current = 0;
        if(data && data.status===200){
            if(navigationType.current==='HPN1Config'){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Successfull and navigated to WifiListHPN1Component", 'Device Number : '+deviceNumber);
                navigation.navigate('WifiListHPN1Component');
            } else if(navigationType.current==='ForceSync'){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Successfull and navigated to SensorCommandComponent", 'Device Number : '+deviceNumber);
                navigation.navigate('SensorCommandComponent',{commandType:'Force Sync',naviType:navigationType.current});
            } else if(navigationType.current==='SensorFirmware'){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Successfull and navigated to SensorFirmwareComponent", 'Device Number : '+deviceNumber);
                navigation.navigate('SensorFirmwareComponent',{commandType:'SensorFirmware',naviType:naviType});
            }else if(navigationType.current==='SensorErase'){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Successfull and navigated to SensorCommandComponent", 'Device Number : '+deviceNumber);
                navigation.navigate('SensorCommandComponent',{commandType:'Erase Data',naviType:naviType});
            } else if(navigationType.current==='SensorRestore'){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Successfull and navigated to SensorCommandComponent", 'Device Number : '+deviceNumber);
                navigation.navigate('SensorCommandComponent',{commandType:'Restore',navType:naviType});
            }
            
        } else {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_status, firebaseHelper.screen_sensor_connect_common, "Sensor connection Fail : "+retryCount+1, 'Device Number : '+deviceNumber);
            if (retryCount===0){
                set_retryCount(retryCount+1);
                set_popupRBtnTitle('OK');
                if(sensorType.current && sensorType.current.includes('HPN1')){
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_HPN1);
                } else {
                    set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE);
                }
                
            } else if (retryCount===1){
                set_retryCount(retryCount+1);
                set_popupRBtnTitle('OK');
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_2);
            } else if (retryCount===2){
                set_retryCount(0);
                set_popupRBtnTitle('EMAIL');
                set_popUpMessage(Constant.SENSOR_RETRY_MESSAGE_3);              
            } else {
                set_popUpMessage('Unable to Connect Please try again');
            }
            
            set_popUpTitle('Alert');
            set_isPopUp(true);  
            popIdRef.current = 1;       
            set_btnTitle('SEARCH AGAIN...');
        }
    };

    const nextButtonAction = async (value) => {
        set_btnTitle(undefined);
        getDefaultPet();
    }

    const navigateToPrevious = () => {  
        
        if(isLoadingRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_connect_common, "User clicked on back button to navigate to Select Sensor Action Page", '');
            SensorHandler.getInstance().dissconnectSensor();     
            navigation.navigate("SelectSensorActionComponent");
        }
             
    }

    const popOkBtnAction = (value,) => {
        if(popUpMessage === Constant.SENSOR_RETRY_MESSAGE_3){
            set_retryCount(0);
            mailToHPN();
        }
        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
    };

    const mailToHPN = () => {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_connection_mail, firebaseHelper.screen_sensor_connect_common, "User clicked on Mail to contact Support team", '');
        Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body='");
    };

    return (
        <View style={CommonStyles.mainComponentStyle}>

        <View style={[CommonStyles.headerView,{}]}>
            <HeaderComponent
                isBackBtnEnable={!isLoading}
                isSettingsEnable={false}
                isChatEnable={false}
                isTImerEnable={false}
                isTitleHeaderEnable={true}
                title={'Connect Device'}
                backBtnAction = {() => navigateToPrevious()}
            />
        </View>

        <View style={styles.mainViewStyle}>
            
            <View style={styles.topViewStyle}>
                <Text style={styles.headerStyle}>{'Searching for '}<Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{'Device : '}</Text>
                <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{deviceNumber}</Text>
                </Text>
            </View>

            <View style = {styles.videoViewStyle}>
                  {isLoading ? 
                  <ImageSequence
                  images={cSImages}
                  framesPerSecond={6}
                  style={styles.videoStyle}
                /> : null}
            </View>

        </View>

       {btnTitle ? <View style={CommonStyles.bottomViewComponentStyle}>
            <BottomComponent
                leftBtnTitle = {btnTitle}
                isLeftBtnEnable = {true}
                rigthBtnState = {false}                   
                isRightBtnEnable = {false}
                leftButtonAction = {async () => nextButtonAction()}

            ></BottomComponent>
        </View> : null}

        {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
            <AlertComponent
                header = {popUpTitle}
                message={popUpMessage}
                isRightBtnEnable = {true}
                rightBtnTilte = {popupRBtnTitle}
                popUpRightBtnAction = {() => popOkBtnAction()}
            />
        </View> : null}

    </View>
    );

  }
  
  export default ConnectSensorCommonComponent;

  const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    headerView : {
        backgroundColor:'white',
        width:wp('100%'),
        height:hp('12%'),
        justifyContent:'center',
    },

    topViewStyle : {
        width:wp('100%'),
        height:hp('8%'),
        justifyContent:'center',
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%'),       
    },

    videoViewStyle : {
        width:wp('100%'),
        height:hp('65%'),
        justifyContent:'center',
        alignItems:'center',
    },

    videoStyle : {
        width:wp('100%'),
        height:hp('27%'),       
    },

});