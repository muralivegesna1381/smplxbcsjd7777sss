import React, {useState,useEffect} from 'react';
import {StyleSheet,Text,TouchableOpacity, View,Image,BackHandler,FlatList} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorSensorActionscreen;

const SelectSensorActionComponent = ({navigation, route, ...props }) => {

    const [actionArray, set_actionArray] = useState([
        {'actionName' :'Add Wi-Fi Network', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorConfiguregreen.svg")},
        {'actionName' :'Force Sync', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/sensorForceSyncgreen.svg")},
        {'actionName' :'Firmware', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/firmware.svg")},
        {'actionName' :'Erase Data', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/sensorEraseIconGreen.svg")},
        {'actionName' :'Restore Factory Settings', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorRestoreFactoryNetworkgreen.svg")},]);
    const [sensorStatus, set_sensorStatus] = useState(undefined);
    const [defaultPet, set_defaultPet] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    
    useEffect(() => {    

      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_sensor_select_screen);  
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_select_screen, "User in Select Sensor Action Screen", ''); 
      });

      const unsubscribe = navigation.addListener('blur', () => {
          initialSessionStop();
      });

      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
          focus();
          unsubscribe();
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
  
    },[]);

    useEffect(() => {

        if(route.params?.setupStatus){
            prpareSettings(route.params?.setupStatus);
        }

        if(route.params?.defaultPet){
            set_defaultPet(route.params?.defaultPet);
        }

    }, [route.params?.setupStatus, route.params?.defaultPet]);
  
    const initialSessionStart = async () => {
      trace_inSensorSensorActionscreen = await perf().startTrace('t_inSelectSensorActionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inSensorSensorActionscreen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
          return true;
    };

    const backBtnAction = () => {
        navigation.navigate('SensorChargeConfirmationComponent');
    };

    const prpareSettings = async (status) => {

      let sensorType1 = await DataStorageLocal.getDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
      set_sensorStatus(status);
      if (status === 'success') {

        if(sensorType1 && sensorType1.includes('HPN1')){

          set_actionArray([{'actionName' :'Add Wi-Fi Network', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorConfiguregreen.svg")},
        {'actionName' :'Wi-Fi List', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/sensorForceSyncgreen.svg")},])

        } else {

          set_actionArray([{'actionName' :'Change Wi-Fi Network', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorConfiguregreen.svg")},
          {'actionName' :'Force Sync', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/sensorForceSyncgreen.svg")},
          {'actionName' :'Firmware', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/firmware.svg")},
          {'actionName' :'Erase Data', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/sensorEraseIconGreen.svg")},
          {'actionName' :'Restore Factory Settings', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorRestoreFactoryNetworkgreen.svg")},])

        }
      }else {

        if(sensorType1 && sensorType1.includes('HPN1')){
          set_actionArray([{'actionName' :'Add Wi-Fi Network', 'iconImg' :require("./../../../../assets/images/sensorImages/svg/SensorConfiguregreen.svg")},])
        } 

      }

    };

    const selectAction = async (item) => {

      firebaseHelper.logEvent(firebaseHelper.event_sensor_action_Type, firebaseHelper.screen_sensor_select_screen, "User Selected Sensor Action Type", 'Action Type : '+item);
      if(item === 'Change Wi-Fi Network' || item === 'Add Wi-Fi Network'){
          navigation.navigate('FindSensorComponent');
      } else if(item === 'Wi-Fi List'){
          navigation.navigate('ConnectSensorCommonComponent',{commandType:'ConfigWIFI',navType:'HPN1Config'});
      } else if(item === 'Force Sync'){
          navigation.navigate('ConnectSensorCommonComponent',{commandType:'Force Sync',navType:'ForceSync'});
      } else if(item === 'Firmware'){
        
          let sensorIndex = await DataStorageLocal.getDataFromAsync(Constant.SENOSR_INDEX_VALUE);
          let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
          defaultObj = JSON.parse(defaultObj);
      
          if(defaultObj.devices[parseInt(sensorIndex)].isFirmwareVersionUpdateRequired){
            navigation.navigate('ConnectSensorCommonComponent',{commandType:'Firmware',navType:'SensorFirmware'});
          } else {
            set_popUpMessage(Constant.FIRMWARE_UPTO_DATE);
            set_isPopUp('Alert');
          }

      } else if(item === 'Erase Data'){
          navigation.navigate('ConnectSensorCommonComponent',{commandType:'Erase Data',navType:'SensorErase'});
      } else if(item === 'Restore Factory Settings'){
          navigation.navigate('ConnectSensorCommonComponent',{commandType:'Restore',navType:'SensorRestore'});
      }
        
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        set_popUpMessage(undefined);       
    };

    const renderActions = ({item, index}) => {

      return (

        <TouchableOpacity disabled={sensorStatus === "pending" ? (item.actionName === "Force Sync" || item.actionName === "Firmware" ? true : false) : false} onPress={() => selectAction(item.actionName)}>
            
            <View style={styles.actionsCellViewStyle}>

              <View style={{flex:0.2}}>
                <Image style={sensorStatus === "pending" ? (item.actionName === "Force Sync" || item.actionName === "Firmware" ? [styles.sensorsStyles,{tintColor:'white'}] : [styles.sensorsStyles]) : styles.sensorsStyles} source={item.iconImg}/>
              </View>

              <View style={{flex:1}}>
                <Text style={sensorStatus === "pending" ? (item.actionName === "Force Sync" || item.actionName === "Firmware" ? [styles.instTxtStyleGrey] : [styles.instTxtStyle]): [styles.instTxtStyle]}>{item.actionName}</Text>
              </View>

              <View style={{flex:0.3}}>
                <Image style={sensorStatus === "pending" ? (item.actionName === "Force Sync" || item.actionName === "Firmware" ? [styles.moreImgStyels,{tintColor:'#dedede'}] : [styles.moreImgStyels]) : styles.moreImgStyels} source={require("./../../../../assets/images/otherImages/svg/rightArrowLightImg.svg")}/>
              </View>

            </View>

         </TouchableOpacity>

      )
    };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView]}>
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
                    <Text style={styles.headerStyle}>{'Select an action below:'}</Text>
                </View>

                <View style={styles.instViewStyle}>

                    <FlatList
                      data={actionArray}
                      showsVerticalScrollIndicator={false}
                      renderItem={renderActions}
                      keyExtractor={(item, index) => `${index}`}
                    />

                </View>

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

export default SelectSensorActionComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    actionsCellViewStyle : {
        width:wp('80%'),
        height:hp('10%'),
        alignItems:'center',
        alignSelf:'center',
        borderBottomColor:'#DEDEDE',
        borderBottomWidth:1,
        flexDirection:'row',
        justifyContent:'space-between'
    },

    topViewStyle : {
        width:wp('100%'),
        minHeight:hp('8%'),
        justifyContent:'center',  
    },

    instViewStyle : {
        height:hp('100%'),
        width:wp('100%'),
        marginTop:wp('5%'),
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%'),
        marginRight:wp('3%'),       
    },

    instTxtStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleMedium,       
    },

    instTxtStyleGrey : {
        color: 'grey',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleMedium,
        
    },

    moreImgStyels : {
        height: hp("2%"),
        width: hp("2%"),
        resizeMode: "contain",
        alignSelf:'flex-end'
    },

    sensorsStyles : {
        height: hp("4%"),
        width: hp("4%"),
        resizeMode: "contain",
        overflow: "hidden",
        alignSelf: 'flex-start'
    },

});