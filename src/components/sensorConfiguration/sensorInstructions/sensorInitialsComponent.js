import React, {useState,useEffect,useRef} from 'react';
import {Text, View,Platform,PermissionsAndroid,StyleSheet,BackHandler, ImageBackground} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import { BluetoothStatus } from "react-native-bluetooth-status";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import BleManager from "react-native-ble-manager";
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import ImageSequence from 'react-native-image-sequence';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let hpn1Img = require( "./../../../../assets/images/sensorImages/png/hpn1ConnectImg.png");

let trace_inSensorsInitialcreen;

const SensorInitialComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [defaultpet, set_defaultPet] = useState(undefined);
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [sensorType, set_sensorType] = useState(undefined);
    const [sensorImages, set_sensorImages] = useState([]);
    const [date, set_Date] = useState(new Date());
    
    const hSImages = [
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation000.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation010.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation020.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation030.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation040.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation050.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation060.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation070.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation080.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation090.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation100.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation110.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation120.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation130.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation140.png"),
      require("./../../../../assets/images/sequenceImgs/hpn1Connect/HPN1SensorAnimation148.png"),
              
    ];

    const sImages = [
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni00.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni05.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni10.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni15.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni20.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni25.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni30.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni35.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni40.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni45.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni50.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni55.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni60.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni65.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni70.png"),
      require("./../../../../assets/images/sequenceImgs/sensorInstImages/SensorBatteryAni74.png"),
              
    ];

    useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      checkBleState();

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Senosor_Initial);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Senosor_Initial, "User in Sensor initial Screen", '');  
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

        if(route.params?.defaultPetObj){
            set_defaultPet(route.params?.defaultPetObj);
            getSensorType(route.params?.defaultPetObj);
        }

        if(route.params?.isFromScreen){
          set_isFromScreen(route.params?.isFromScreen);
        }

    }, [route.params?.defaultPetObj,route.params?.isFromScreen]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inSensorsInitialcreen = await perf().startTrace('t_inSensorInitialsScreen');
    };

    const initialSessionStop = async () => {
        await trace_inSensorsInitialcreen.stop();
    };

    const getSensorType = async (defPet) => {
      let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      let sensorTy = undefined;
      if(sensorIndex){
        let devModel = defPet.devices[parseInt(sensorIndex)].deviceModel;
        set_sensorType(devModel);
        sensorTy = devModel;
      } else {
        let devModel = defPet.devices[0].deviceModel;
        set_sensorType(devModel);
        sensorTy = devModel;
      }
      firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_Senosor_Initial, "Getting Sensor Type", 'Device Type : '+sensorTy);
      if(sensorTy && sensorTy.includes('HPN1')){
        // set_sensorImages(hSImages);
      } else {
        set_sensorImages(sImages);
      }
    }

    const nextButtonAction = () => {
        navigation.navigate('SensorChargeConfirmationComponent',{defaultPetObj:defaultpet});
    };

    const backBtnAction = () => {

      if(isFromScreen==='multipleDevices'){
        navigation.navigate('MultipleDevicesComponent');
      } else {
        navigation.navigate('DashBoardService');
      }
       
    }

    const popOkBtnAction = () => {
        set_isPopUp(false);
        set_popUpMessage(undefined);       
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        set_popUpMessage(undefined);
    };

    const requestBLEPermissions = async () => {
     // console.log("Condition works 2")
      const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
      await PermissionsAndroid.requestMultiple([ PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT])
      console.log(res)
    }

    const checkBleState = () => {
    
    if (Platform.OS === "android") {

      if(Platform.Version>=31){
        //console.log("Condition works")
        requestBLEPermissions();

      }

        if (Platform.Version >= 29) {
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          ).then((result) => {
            if (result) {
            } else {
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
              ).then((result) => {
                if (result) {
                } else {
                }
              });
            }
          });
  
          RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
            interval: 10000,
            fastInterval: 5000,
          }).then((data) => {
          }).catch((err) => {
            });
        }
        else if(Platform.Version >= 23){
          PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
            if (result) {
            } else {
              PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
              ).then((result) => {
                
              });
            }
          });
  
          RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
            interval: 10000,
            fastInterval: 5000,
          })
            .then((data) => {})
            .catch((err) => {console.log("RNAndroidLocationEnabler error : ", err);
            });
        }
  
        BleManager.enableBluetooth().then(() => {
          }).catch((error) => {
          });
      } else if (Platform.OS === "ios") {
        getBluetoothState();
      }
    };

    const getBluetoothState = async () => {
        try {
          const isEnabled = await BluetoothStatus.state();
          if (isEnabled == false) {
           
          }
          
        } catch (error) {
          console.error("getBluetoothState rror : ", error);
        }
      }

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Device Setup'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                  {sensorType && sensorType.includes('HPN1') ? <Text style={[styles.txtStyle]}>{'Please ensure your HPN1 sensor is plugged into charging throughout the device setup.'} </Text> : <Text style={[styles.txtStyle]}>{'Please charge the sensor for at least'}<Text style={[styles.txtStyleBold]}>{' 30 mins '}</Text><Text style={[styles.txtStyle]}>{'before initiating device setup.'}</Text></Text>}
                </View>

                 <View style = {styles.videoViewStyle}>

                  {sensorType && sensorType.includes('HPN1') ? 

<ImageBackground source={hpn1Img} style={styles.sensoHpn1Styles}></ImageBackground>
                   : (sensorImages && sensorImages.length > 0 ? <ImageSequence
                            images={sensorImages}
                            framesPerSecond={6}
                            style={[styles.videoStyle1]} /> : null)}

                    

                 </View> 

            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}

                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {true}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'YES'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default SensorInitialComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        width:wp('100%'),
        height:hp('75%'),
    },

    topViewStyle : {
        width:wp('100%'),
        minHeight:hp('10%'),
        justifyContent:'center',
        alignSelf:'center',
    },

    videoViewStyle : {
      flex:1,
      justifyContent:'center',
    },

    txtStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleLight,
        marginLeft:wp('8%'),
        marginRight:wp('3%'), 
    },

    txtStyleBold : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    videoStyle : {
        width:wp('100%'),
        height:hp('45%'),
    },

    videoStyle1 : {
      width:wp('100%'),
      height:hp('33%'),
    },

    sensoHpn1Styles : {
      width:wp('80%'),
      aspectRatio:1,
      resizeMode:'contain',
      alignSelf:'center'
    }

});