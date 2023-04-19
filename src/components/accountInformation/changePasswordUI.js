import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,NativeModules,Platform,TouchableOpacity,Image} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"

let hidePswdImg = require('../../../assets/images/otherImages/png/hide-password.png');
let showPsdImg = require('../../../assets/images/otherImages/png/show-password.png');
let failedImg = require('../../../assets/images/otherImages/svg/failedXIcon.svg');
let tickImg = require('../../../assets/images/otherImages/png/tick.png');

const  ChangePasswordUI = ({route, ...props }) => {

    const [pswdValue, set_pswdValue] = useState(undefined);
    const [confirmPswdValue, set_confirmPswdValue] = useState(undefined);
    const [isHidePassword, set_isHidePassword] = useState(true);
    const [isConfirmHidePassword, set_isConfirmHidePassword] = useState(true);
    const [isPopUp, set_isPopUp] = useState(false);
    const [regNumVal, set_regNumVal] = useState(false);
    const [regULVal, set_regULVal] = useState(false);
    const [regSPCVal, set_regSPCVal] = useState(false);
    const [psdLengthVal, set_psdLengthVal] = useState(false);
    const [enableConfirmPsd, set_enableConfirmPsd] = useState(false);
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [currentPsdEncrypt, set_currentPsdEncrypt] = useState(undefined);
    const [newPsdEncrypt, set_newPsdEncrypt] = useState(undefined);
    const [isMatchPsd, set_isMatchPsd] = useState(false);

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);


    useEffect(() => {

      set_isPopUp(props.isPopUp);
      set_isLoading(props.isLoading);
      set_popUpTitle(props.popUpTitle);
      set_popUpMessage(props.popUpMessage);

    }, [props.isPopUp, props.popUpMessage, props.popUpTitle, props.isLoading]);

    // Initiates the service call to update the new password
    const nextButtonAction = () => {
      props.submitAction(currentPsdEncrypt,newPsdEncrypt);
    };

    // back button action
    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    // Validates the password format
    const validatePassword = (psdValue,confirmPsd) => {

            set_pswdValue(psdValue);
            set_confirmPswdValue(confirmPsd);

            if(psdValue.length>7){
                set_enableConfirmPsd(true);
                if(Platform.OS === 'android') {
                    NativeModules.Device.getDeviceName(psdValue ,(convertedVal) => {
                        set_currentPsdEncrypt(convertedVal);
                    });
                }
                else {
                    NativeModules.EncryptPassword.encryptPassword( psdValue, (value) => {
                    set_currentPsdEncrypt(value);
                    });
                }

            } else {
                set_enableConfirmPsd(false);
            }

            if(confirmPsd) {
                let pLength = confirmPsd.length > 7 ? true : false;

            let regNum = /^(?=.*[0-9])(?=.{1,})/;
            let regULCase = /^(?=.*[a-z])(?=.*[A-Z])(?=.{1,})/;
            let regSP = /^(?=.*[!@#\$%\^&\*])(?=.{1,})/;;

            if(regNum.test(confirmPsd)){
                set_regNumVal(true);
            }else {
                set_regNumVal(false);
            }

            if(regULCase.test(confirmPsd)){
                set_regULVal(true);
            }else {
                set_regULVal(false);
            }

            if(regSP.test(confirmPsd)){
                set_regSPCVal(true);
            }else {
                set_regSPCVal(false);
            }

            if(pLength){
                set_psdLengthVal(true);
            }else {
                set_psdLengthVal(false);
            }

            if(pLength && regNum.test(confirmPsd) && regULCase.test(confirmPsd) && regSP.test(confirmPsd)){

                if(confirmPsd===psdValue){
                    set_isMatchPsd(false);
                    set_isNxtBtnEnable(false);
                }else {
                    set_isNxtBtnEnable(true);
                    set_isMatchPsd(true);
                    if(Platform.OS === 'android') {
                        NativeModules.Device.getDeviceName(confirmPsd ,(convertedVal) => {
                            set_newPsdEncrypt(convertedVal);
                        });
                    }
                    else {
                        NativeModules.EncryptPassword.encryptPassword( confirmPsd, (value) => {
                            set_newPsdEncrypt(value);
                        
                        })
                    }

                }               
                
            }else {
                set_isMatchPsd(false);            
                set_isNxtBtnEnable(false);
            }
        }
    };

    // popup ok button action
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Change Password'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View >
                <KeyboardAwareScrollView bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>

                    <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center',marginTop:hp('15%')}}>
                        <View style={{width:wp('80%'),minHeight:hp('8%')}}>

                            <View style={[styles.textInputContainerStyle]} >

                                <TextInput style={styles.textInputStyle}
                                    underlineColorAndroid="transparent"
                                    placeholder="Current Password*"
                                    placeholderTextColor="#7F7F81"
                                    autoCapitalize="none"
                                    value = {pswdValue}
                                    secureTextEntry = {isHidePassword}
                                    onChangeText={(pswdValue) => {validatePassword(pswdValue,confirmPswdValue)}}
                                    />

                                    <TouchableOpacity  onPress={() => {set_isHidePassword(!isHidePassword);}}>
                                        <Image source={isHidePassword ? hidePswdImg : showPsdImg } style={styles.hideOpenIconStyle} />
                                    </TouchableOpacity>

                            </View>

                            {enableConfirmPsd ? <View style={[styles.textInputContainerStyle]} >
                                    <TextInput style={styles.textInputStyle}
                                        underlineColorAndroid="transparent"
                                        placeholder="Enter New Password*"
                                        placeholderTextColor="#7F7F81"
                                        autoCapitalize="none"
                                        editable = {enableConfirmPsd}
                                        secureTextEntry = {isConfirmHidePassword}
                                        value = {confirmPswdValue}
                                        onChangeText={(confirmPswdValue) => {validatePassword(pswdValue,confirmPswdValue)}}
                                    />

                                    <TouchableOpacity  onPress={() => {set_isConfirmHidePassword(!isConfirmHidePassword);}}>
                                        <Image source={isConfirmHidePassword ? hidePswdImg : showPsdImg } style={styles.hideOpenIconStyle} />
                                    </TouchableOpacity>

                            </View> : null}

                            {enableConfirmPsd ? <View style={{marginTop:hp('2%')}}>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image source={!psdLengthVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                                    <Text style={styles.validateTextStyle}>{'At least 8 characters in length'}</Text>
                                </View>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image source={!regULVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                                    <Text style={styles.validateTextStyle}>{'At least one upper & one lower case letters (A-Z) (a-z)'}</Text>
                                </View>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image source={!regNumVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                                    <Text style={styles.validateTextStyle}>{'At least one number (i.e 0-9)'}</Text>
                                </View>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image source={!regSPCVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                                    <Text style={styles.validateTextStyle}>{'At least one special character (!,@,#,$,%,^,&,*)'}</Text>
                                </View>

                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Image source={!isMatchPsd ? failedImg : tickImg } style={styles.validateIconStyle} />
                                    <Text style={styles.validateTextStyle}>{'New password should not match with the current password'}</Text>
                                </View>

                            </View> : null}
                        </View>

                    </View>

                </KeyboardAwareScrollView>
                
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {isNxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'CANCEL'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.DEFAULT_UPDATE_LOADER_MSG} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default ChangePasswordUI;

  const styles = StyleSheet.create({
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'
            
    },
  
    textInputStyle: {
        flex: 1,
        color: '#4A4A4A',
        height:hp('7%'),
        paddingLeft:wp('5%'),
        fontSize:fonts.fontMedium,
        ...CommonStyles.textStyleRegular

    },

    textInputContainerStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('7%'),
        borderRadius: hp('0.5%'),
        borderWidth: 1,
        marginTop: hp('2%'),
        borderColor: '#dedede',
        backgroundColor:'white',
        marginRight: 'auto',
        alignItems: 'center',
        justifyContent: 'center',
    },

      hideOpenIconStyle : {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain',
        marginRight:wp('5%'),
        tintColor:'black'
    },

    validateIconStyle : {
        width: wp('3%'),
        height: hp('3%'),
        resizeMode: 'contain',
        marginLeft:hp('1%'),
        marginRight:wp('1%'),
    },

    validateTextStyle : {
        fontSize: fonts.fontXSmall,
        fontWeight:'normal',
        color: '#898989', 
        ...CommonStyles.textStyleRegular
        
      },

  });