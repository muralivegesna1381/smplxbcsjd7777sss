import React, {useState,useEffect,useRef} from 'react';
import {Text, View,StyleSheet,Image,BackHandler,Platform,PermissionsAndroid} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import { BluetoothStatus } from "react-native-bluetooth-status";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import BleManager from "react-native-ble-manager";
import Highlighter from "react-native-highlight-words";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import { useBluetoothStatus } from 'react-native-bluetooth-status';
import perf from '@react-native-firebase/perf';

let trace_inSensorsChargecreen;

const SensorChargeConfirmationComponent = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [defaultpet, set_defaultPet] = useState(undefined);
    const [sensorType, set_sensorType] = useState(undefined)
    const [btStatus, isPending, setBluetooth] = useBluetoothStatus();
    const [date, set_Date] = useState(new Date());
    
    let popIdRef = useRef(0);

    useEffect(() => {

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_Sensor_charge_confirm);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_Sensor_charge_confirm, "User in Sensor Charge Confirmation Screen", ''); 
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

    }, [route.params?.defaultPetObj]);

    const getSensorType = async (defPet) => {
      let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
      let devModel = undefined;
      if(sensorIndex){
        devModel = defPet.devices[parseInt(sensorIndex)].deviceModel;
        set_sensorType(devModel)
      } else {
        devModel = defPet.devices[0].deviceModel;
        set_sensorType(devModel)
      }
      firebaseHelper.logEvent(firebaseHelper.event_Sensor_type, firebaseHelper.screen_Sensor_charge_confirm, "Getting Sensor Type", 'Device Type : '+devModel);
    }
  
    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inSensorsChargecreen = await perf().startTrace('t_inSensorChargeConfirmScreen');
    };

    const initialSessionStop = async () => {
      await trace_inSensorsChargecreen.stop();
    };

    const nextButtonAction = async () => {

      if (Platform.OS === "android") {
        checkBleState();
      } else {
        getBluetoothState1();
      }

    };

    const backBtnAction = () => {

      if(popIdRef.current === 0){
        navigation.navigate('SensorInitialComponent');
      }
        
    }

    const checkBleState = () => {
    
        let status = undefined;

        if (Platform.OS === "android") {
            if (Platform.Version >= 29) {
              PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                if (result) {
                } else {
                  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then((result) => {
                    if (result) {
                    } else {
                    }
                  });
                }
              });
      
              RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000,}).then((data) => {
                  // onBleSuccess(true);
                }).catch((err) => {
                });
            }
            else if(Platform.Version >= 23){
              PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                if (result) {
                } else {
                  PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION).then((result) => {
                    if (result) {
                      status = true;
                    } else {
                        status = false;
                    }
                  });
                }
              });
      
              RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000,fastInterval: 5000,}).then((data) => {
                  // onBleSuccess(true);
                  return status;
                }).catch((err) => {console.log("RNAndroidLocationEnabler error : ", err);});
            }
      
            BleManager.enableBluetooth().then(() => {
                onBleSuccess(true);
              }).catch((error) => {
                // backBtnAction();
              });

          } else if (Platform.OS === "ios") {
            status = getBluetoothState1();
            return status;
          }
          
    };
    
    const getBluetoothState1 = async () => {
      
      const isEnabled = await BluetoothStatus.state();
      if(isEnabled){
            let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
            firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Enabled');
            firebaseHelper.logEvent(firebaseHelper.event_sensor_setupStatus, firebaseHelper.screen_Sensor_charge_confirm, "Checking Setup Status ", 'setup Status : '+defaultpet.devices[parseInt(sensorIndex)].isDeviceSetupDone);
            if(defaultpet.devices[parseInt(sensorIndex)].isDeviceSetupDone){
              navigation.navigate('SelectSensorActionComponent',{setupStatus:'success'});
            } else {
              navigation.navigate('SelectSensorActionComponent',{setupStatus:'pending'});
            }
      } else {
        firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Disabled');
        let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
        searchWords={["Phone Settings > Wearables App > Enable Bluetooth permission"]}
        textToHighlight={
          "Please turn on your Bluetooth in order to continue.\nPlease make sure you have granted the required Bluetooth permissions. If not please go to Phone Settings > Wearables App > Enable Bluetooth permission."
        }
      />
        set_popUpMessage(high);
        set_isPopUp(true);
        popIdRef.current = 1;
      }
      
    };

    const onBleSuccess = async (value) => {

        if(value){

            let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
            firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Enabled');
            firebaseHelper.logEvent(firebaseHelper.event_sensor_setupStatus, firebaseHelper.screen_Sensor_charge_confirm, "Checking Setup Status ", 'setup Status : '+defaultpet.devices[parseInt(sensorIndex)].isDeviceSetupDone);
            if(defaultpet.devices[parseInt(sensorIndex)].isDeviceSetupDone){
              navigation.navigate('SelectSensorActionComponent',{setupStatus:'success'});
            } else {
                navigation.navigate('SelectSensorActionComponent',{setupStatus:'pending'});
            }

        } else {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_ble_status, firebaseHelper.screen_Sensor_charge_confirm, "Checking Bluetooth Status", 'Ble Status : Disabled');
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
            searchWords={["Phone Settings > Wearables App > Enable Bluetooth permission"]}
            textToHighlight={
              "Please turn on your Bluetooth in order to continue.\nPlease make sure you have granted the required Bluetooth permissions. If not please go to Phone Settings > Wearables App > Enable Bluetooth permission."
            }/>
            set_popUpMessage(high);
            set_isPopUp(true);
            popIdRef.current = 1;
        }
        
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage(undefined);       
    };

    const popCancelBtnAction = () => {
        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('Is your sensor charged and pulled out of charging?');
    };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Device Setup Instructions'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                  <Text style={[styles.txtStyle]}>{'Please take a note of the below instructions before proceeding:'}</Text>
                </View>

                <View style={styles.instViewStyle}>

                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        {sensorType && sensorType.includes('HPN1') ? <Image source={require("./../../../../assets/images/sensorImages/png/hpn1ChargeIcon.png")} style={styles.iconStyles}/> : <Image source={require("./../../../../assets/images/otherImages/svg/configsensorMenu.svg")} style={styles.iconStyles}/>}
                        {sensorType && sensorType.includes('HPN1') ? <Text style={[styles.instTxtStyle]}>{'The sensor should be'}<Text style={[styles.instTxtStyleBold]}>{' plugged into charging'}</Text> </Text> 
                        : <Text style={[styles.instTxtStyle]}>{'The sensor should be unplugged from charger'} </Text>} 
                    </View>

                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require("./../../../../assets/images/sensorImages/svg/sensorInstBleIcon.svg")} style={styles.iconStyles}/>
                        <Text style={[styles.instTxtStyle]}>{'The phone’s '}
                        <Text style={[styles.instTxtStyleBold]}>{'Bluetooth'}
                        <Text style={[styles.instTxtStyle]}>{' should be switched on throughout the sensor configuration'}</Text> 
                        </Text> 
                        </Text>   
                    </View>

                    {sensorType && sensorType.includes('HPN1') ? null : <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require("./../../../../assets/images/sensorImages/svg/sensorInstBatteryIcon.svg")} style={styles.iconStyles}/>
                        <Text style={[styles.instTxtStyle]}>{'The sensor should be sufficiently charged (no blinking red light)'} </Text>   
                    </View>}

                    {sensorType && sensorType.includes('HPN1') ? null : <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require("./../../../../assets/images/sensorImages/svg/sensorInstWifiIcon.svg")} style={styles.iconStyles}/>
                        <Text style={[styles.instTxtStyle]}>{'The sensor should be awake while they are being configured. Please shake the sensors while the app is writing the Wi-Fi details to the sensors'} </Text>   
                    </View>}

                    {sensorType && sensorType.includes('HPN1') ? <View style={{flexDirection:'row',alignItems:'center'}}>
                        <Image source={require("./../../../../assets/images/sensorImages/svg/sensorInstWifiIcon.svg")} style={styles.iconStyles}/>
                        <Text style={[styles.instTxtStyle]}>{'The sensor should be within'}<Text style={[styles.instTxtStyleBold]}>{' close proximity '} </Text><Text style={[styles.instTxtStyle]}>{'(< 1-meter range) of the mobile device'} </Text></Text>   
                    </View> : null}

                </View>

            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'YES'}
                    leftBtnTitle = {'NO'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}

                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default SensorChargeConfirmationComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        width:wp('100%'),
        height:hp('75%'),
    },

    topViewStyle : {
        width:wp('80%'),
        minHeight:hp('10%'),
        justifyContent:'center',
        alignSelf:'center',       
    },

    txtStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleLight,
        marginRight:wp('3%'), 
    },

    instViewStyle : {
        height:hp('100%'),
        width:wp('80%'),
        marginTop:wp('5%'),
        alignItems:'center',
        alignSelf:'center',
    },

    instTxtStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('3%'),
        flex:6,
    },

    instTxtStyleBold : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
    },

    iconStyles : {
        width:wp('10%'),
        height:hp('10%'),
        resizeMode:'contain',
        flex:1,
    },

});