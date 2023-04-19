import React, {useState,useEffect,useRef} from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity, View,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import SensorHandler from '../sensorHandler/sensorHandler';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as bleUUID from "./../../../utils/bleManager/blemanager";

const EraseSensorDataComponent = ({navigation, route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [loaderText, set_loaderText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [retryCount, set_retryCount] = useState(0);
    // const [eraseDataStatus, set_eraseDataStatus] = useState('failed');

    let eraseDataStatus = useRef();
    let maxRetryCount = 3;

    useEffect(() => {

    }, []);

    const connectSensor = () => {
        set_isLoading(false);
        set_loaderText('Please wait while we connect to sensor..');
        SensorHandler.getInstance().startScan('00760E4',handleSensorCallback);
    };

    const handleSensorCallback = ({ data, error }) => {

        set_isLoading(false);
        if(data && data.status===200){

            if(eraseDataStatus.current === 'success'){
                navigation.navigate('SensorWiFiListComponent');
            } else {
                eraseData();
            }
            
        } else {      
            
            if(retryCount < maxRetryCount){

                set_retryCount(retryCount + 1);
                set_popUpTitle('Alert');
                set_popUpMessage('Unable to Connect Please try again');
                set_isPopUp(true);         
                set_loaderText(undefined);

            }
          
        }
    };

    const eraseData = () => {
        const command = [3];
        writeData(command);
    }

    const writeData = (command) => {
        SensorHandler.getInstance().writeDataToSensor(bleUUID.COMM_SERVICE,bleUUID.COMMAND_CHAR,command,
          ({ data, error }) => {
            if (data) {
                // SensorHandler.getInstance().dissconnectSensor();
                set_isLoading(false);
                set_retryCount(0);
                // set_eraseDataStatus('success');
                eraseDataStatus.current = 'success';
                // connectSensor();
            } else if (error) {
                
                if(retryCount < maxRetryCount){
                    set_retryCount(retryCount + 1);
                }
              
            }
          }
        );
      };

    const nextButtonAction = () => {
        navigation.navigate('ConnectSensorComponent');
        connectSensor();
    };

    const backBtnAction = () => {
        navigation.navigate('SelectSensorActionComponent');
    }

    const popOkBtnAction = () => {
        set_isPopUp(false);
    }

    const popCancelBtnAction = () => {
        set_isPopUp(false);
    }

return (

        <View style={styles.mainComponentStyle}>

            <View style={[styles.headerView,{}]}>
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
                    <Text style={styles.headerStyle}>{'Initiating Configuration.. '}</Text>
                </View>
                <View style={{height:hp('60%'),alignItems:'center',justifyContent:'center'}}>
                    {/* <Image style={styles.sensorImgStyels} source={require("./../../../../assets/images/sensorImages/png/bleGreenImg.png")}/> */}
                    <Text style={styles.txtStyle}>{'Please wait while the sensor is being setup for first time configuration'}</Text>
                </View>
            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'ERASE DATA?'}
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
                    // isLeftBtnEnable = {true}
                    isRightBtnEnable = {true}
                    // leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {loaderText} isButtonEnable = {false} /> : null} 
        </View>
    );
};

export default EraseSensorDataComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white',
    },

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
        borderBottomWidth:0.5,
        borderColor:'#dedede'
        
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('5%'),
        marginRight:wp('5%'),
        
    },

    txtStyle : {
        color: 'black',
        fontSize: fonts.fontXLarge,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('5%'),
        marginRight:wp('5%'),
        
    },

    sensorImgStyels : {
        width: hp("10%"),
        aspectRatio:1,
        resizeMode: "contain",
        // overflow: "hidden",
      },


});