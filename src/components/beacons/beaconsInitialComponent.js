import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,BackHandler,ImageBackground,ScrollView,PermissionsAndroid,Platform} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import CommonStyles from '../../utils/commonStyles/commonStyles';
import { BluetoothStatus } from "react-native-bluetooth-status";
import Highlighter from "react-native-highlight-words";
import AlertComponent from './../../utils/commonComponents/alertComponent';
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import BleManager from "react-native-ble-manager";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inBeaconsInitialscreen;

const  BeaconsInitialComponent = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          initialSessionStart();
          firebaseHelper.reportScreen(firebaseHelper.screen_beacons_instructions);
          firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_beacons_instructions, "User in Beacons Instructions Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
        });

        return () => {
          initialSessionStop();
          focus();
          unsubscribe();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const initialSessionStart = async () => {
      trace_inBeaconsInitialscreen = await perf().startTrace('t_inBeaconsInitialScreen');
    };

    const initialSessionStop = async () => {
        await trace_inBeaconsInitialscreen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const nextButtonAction = async () => {
        checkBleState();
    };

    const backBtnAction = () => {

      if(popIdRef.current === 0){
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_beacons_instructions, "User clicked on back button to navigate to DashBoardService", '');
        navigation.navigate('DashBoardService');  
      }
        
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        set_popupMessage(undefined);
        popIdRef.current = 0;
    };

    const checkBleState = () => {
    
        let status = undefined;

        if (Platform.OS === "android") {
            if (Platform.Version >= 29) {
              PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
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
                  // onBleSuccess(true);
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
                    if (result) {
                      status = true;
                    } else {
                        status = false;
                    }
                  });
                }
              });
      
              RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({
                interval: 10000,
                fastInterval: 5000,
              })
                .then((data) => {
                  // onBleSuccess(true);
                  return status;
                })
                .catch((err) => {console.log("RNAndroidLocationEnabler error : ", err);
                });
            }
      
            BleManager.enableBluetooth().then(() => {
                onBleSuccess(true);
              }).catch((error) => {
                // backBtnAction();
              });

          } else if (Platform.OS === "ios") {
            status = getBluetoothState();
            return status;
          }
 
    };
    
    const getBluetoothState = async () => {

          const isEnabled = await BluetoothStatus.state();
          firebaseHelper.logEvent(firebaseHelper.event_beacons_ble_status, firebaseHelper.screen_beacons_instructions, "Checking Ble Status of the Mobile on Next button Action", 'Ble Enabled? : '+isEnabled);
          if(isEnabled){
            onBleSuccess(true);
          } else {
            onBleSuccess(false);
          }

    };

    const onBleSuccess = async (value) => {

        if(value){

          // SensorHandler.getInstance().removeBleListners();
          // BeaconsHandler.getInstanceforBeacons();
            navigation.navigate('ConnectBeaconsComponent');  

        } else {

            // set_popUpMessage(Constant.BLE_ENABLE_MSG);
            let high = <Highlighter highlightStyle={{ 
              fontWeight: "bold",
            }}
            searchWords={["Phone Settings > Wearables App > Enable Bluetooth permission"]}
            textToHighlight={
              "Please turn on your Bluetooth in order to continue.\nPlease make sure you have granted the required Bluetooth permissions. If not please go to Phone Settings > Wearables App > Enable Bluetooth permission."
            }
          />
            set_popupMessage(high);
            set_isPopUp(true);
            popIdRef.current = 1;
        }
        
    };

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Beacons'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <ScrollView>

                <View style={{width: wp('80%'),height: hp('65%'),alignSelf:'center',marginTop: hp('3%'),marginBottom: hp('13%')}}>

                <View style={{marginTop:hp('2%'),width:wp('80%'),flex:0.6}}>
                    <Text style={[styles.headerTextStyle]}>{"Let's find all the beacons that are nearby"}</Text>
                </View>

                <View style={{marginTop:hp('1%'),width:wp('80%'),flex:1.5}}>
                    <ImageBackground source={require('./../../../assets/images/sensorImages/svg/beaconsHome.svg')} style={styles.imgStyle}></ImageBackground>
                </View>
                
                <View style={{width:wp('80%'),flex:1.5}}>
                    <Text style={[styles.textStyle]}>{'Please turn on the Bluetooth of your device and keep the beacons in close proximity, preferably 1-3 feet range.'}</Text>
                    <Text style={[styles.textStyle,{...CommonStyles.textStyleBold}]}>{'To enable Configuration mode of your beacon, press and hold on the beacon until it flashes green.'}</Text>
                </View>

            </View>

            </ScrollView>
            
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'CONFIGURE  BEACONS'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popupMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}
            
         </View>
    );
  }
  
  export default BeaconsInitialComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'          
    },

    headerTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontLarge,
        textAlign: "left",
        color: "black",
    },

    textStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
        marginTop: hp("2%"),
    },

    imgStyle : {
        height: hp("25%"),
        width: wp("80%"),
        resizeMode : 'contain'
    }

  });