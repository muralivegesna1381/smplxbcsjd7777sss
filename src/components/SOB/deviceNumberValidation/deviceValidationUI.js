import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,Image} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import TextInputComponent from '../../../utils/commonComponents/textInputComponent';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant";

let sensorImg = require('./../../../../assets/images/sensorImages/png/sensorImgShow.png');
let sensorImgHPN1 = require('./../../../../assets/images/otherImages/png/hpn1Sensor.png');

const  DeviceValidationUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [deviceNo, set_deviceNo] = useState(undefined);
    const [isDeviceValidated, set_isDeviceValidated] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);
    const [deviceType, set_deviceType] = useState(undefined);

    let isBackSpace = useRef(false);

    useEffect(() => {
      set_isPopUp(props.isPopUp);
      set_popUpMessage(props.popUpMessage);
      set_popUpTitle(props.popUpTitle);
      set_deviceNo(props.deviceNo);
      set_isDeviceValidated(props.isDeviceValidated);
      set_deviceType(props.deviceType);
    }, [props.isFromScreen,props.popUpTitle,props.isPopUp,props.popUpMessage,props.isDeviceValidated,props.deviceNo,props.deviceType]);

    useEffect(() => {
        set_isLoading(props.isLoading)
      }, [props.isLoading]);

    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const popOkBtnAction = (value) => {
        props.popOkBtnAction(value);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const validateDeviceNo = (dNo) => {
        dNo = dNo.replace(/[`~!@#$%^&*()_ |+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');//(/[^\w\s]/gi, '');

        if (deviceType.includes('HPN1')) {
            
            let input = dNo;
            const first = input.substring(0, 4);
            const middle = input.substring(4, 7);
            const last = input.substring(7, 19);
        
            if (input.length > 7) {
                input = `${first}-${middle}-${last}`
            }
            else if (input.length > 4) {
                input = `${first}-${middle}`
            }
            else if (input.length >= 0) {
                input = input
            }
        
            set_deviceNo(input.toUpperCase());
            props.validateDeviceNo(input);
        } else {
            set_deviceNo(dNo.toUpperCase());
            props.validateDeviceNo(dNo);
        }
   

    };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Profile'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

                <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center',marginTop: hp('8%'),marginBottom: hp('8%')}}>
                <KeyboardAwareScrollView>
                    <Text style={CommonStyles.headerTextStyle}>{deviceType && deviceType.includes('HPN1') ? 'Please enter your HPN1 device number' : 'Please enter the device number available on the back of the sensor'}</Text>

                    <View style={{width: wp('80%'),alignItems:'center',marginTop: hp('3%')}}>
                        <TextInputComponent 
                            inputText = {deviceNo} 
                            labelText = {"Device Number*"} 
                            isEditable = {true}
                            maxLengthVal = {deviceType && deviceType.includes('HPN1') ? 19 : 7}
                            autoCapitalize = {'none'}
                            setValue={(textAnswer) => {validateDeviceNo(textAnswer)}}
                        />
                    </View>

                    <View style={{width: wp('80%'),alignItems:'center',marginTop: hp('5%'),justifyContent:'center'}}>
                        <Image source={deviceType && deviceType.includes('HPN1') ? sensorImgHPN1 : sensorImg} style={deviceType && deviceType.includes('HPN1') ? styles.imageStyleHPN1 : styles.imageStyle} />
                    </View>
                    </KeyboardAwareScrollView>
                </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {isDeviceValidated}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {props.popupLeftBtnEnable}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'LATER'}
                    rightBtnTilte = {props.popupLeftBtnEnable ? 'CONFIGURE' : 'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction(props.popupLeftBtnEnable ? 'CONFIGURE' : '')}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.DEVICE_VALIDATION_LOADER_MSG} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default DeviceValidationUI;

  const styles = StyleSheet.create({

    imageStyle: {
        width: wp('80%'),
        height: hp('30%'),
        resizeMode: "contain",
    },

    imageStyleHPN1: {
        width: wp('75%'),
        height: hp('35%'),
        resizeMode: "stretch",
        alignItems:'center'
    },

  });