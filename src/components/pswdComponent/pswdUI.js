import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,TouchableOpacity,Image} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";

let hidePswdImg = require('./../../../assets/images/otherImages/png/hide-password.png');
let showPsdImg = require('./../../../assets/images/otherImages/png/show-password.png');
let failedImg = require('./../../../assets/images/otherImages/svg/failedXIcon.svg');
let tickImg = require('./../../../assets/images/otherImages/png/tick.png');


const  PswdUI = ({route, ...props }) => {

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [pswdValue, set_pswdValue] = useState(undefined);
    const [confirmPswdValue, set_confirmPswdValue] = useState(undefined);
    const [isHidePassword, set_isHidePassword] = useState(true);
    const [isConfirmHidePassword, set_isConfirmHidePassword] = useState(true);
    const [isPopUp, set_isPopUp] = useState(false);
    const [regNumVal, set_regNumVal] = useState(false);
    const [regULVal, set_regULVal] = useState(false);
    const [regSPCVal, set_regSPCVal] = useState(false);
    const [psdLengthVal, set_psdLengthVal] = useState(false);
    const [psdSame, set_psdSame] = useState(false);
    const [enableConfirmPsd, set_enableConfirmPsd] = useState(false);
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);


    useEffect(() => {

      set_isFromScreen(props.isFromScreen);
      set_isPopUp(props.isPopUp);
      set_isLoading(props.isLoading);
      set_popUpTitle(props.popUpTitle);
      set_popUpMessage(props.popUpMessage);

    }, [props.isFromScreen, props.isPopUp, props.popUpMessage, props.popUpTitle, props.isLoading,props.popUpBtnTitle]);

    const nextButtonAction = () => {
      props.submitAction(pswdValue);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    const validatePassword = (psdValue) => {
        set_pswdValue(psdValue);
        let pLength = psdValue.length > 7 ? true : false;

        let regNum = /^(?=.*[0-9])(?=.{1,})/;
        let regULCase = /^(?=.*[a-z])(?=.*[A-Z])(?=.{1,})/;
        let regSP = /^(?=.*[!@#\$%\^&\*])(?=.{1,})/;;

        if(regNum.test(psdValue)){
            set_regNumVal(true);
        }else {
            set_regNumVal(false);
        }

        if(regULCase.test(psdValue)){
            set_regULVal(true);
        }else {
            set_regULVal(false);
        }

        if(regSP.test(psdValue)){
            set_regSPCVal(true);
        }else {
            set_regSPCVal(false);
        }

        if(pLength){
            set_psdLengthVal(true);
        }else {
            set_psdLengthVal(false);
        }

        if(pLength && regNum.test(psdValue) && regULCase.test(psdValue) && regSP.test(psdValue)){
            set_enableConfirmPsd(true);
            
        }else {
            set_enableConfirmPsd(false);
            set_confirmPswdValue(undefined);
        }

        if(confirmPswdValue === psdValue){
            set_isNxtBtnEnable(true);
            set_psdSame(true);
        } else {
            set_isNxtBtnEnable(false);
            set_psdSame(false);
        }

    }

    const confirmPswdValueMethod = (psdValue) => {
        set_confirmPswdValue(psdValue);
        if(pswdValue === psdValue){
            set_isNxtBtnEnable(true);
            set_psdSame(true);
        } else {
            set_isNxtBtnEnable(false);
            set_psdSame(false);
        }
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Create Password'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View >
                <KeyboardAwareScrollView>
                    <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center'}}>
                    <View style={{width:wp('90%'),marginTop:hp('10%'),alignItems:'center',}}>
                    <Text style={[CommonStyles.headerTextStyle,{width:wp('85%')}]}>{'Please Create your'}</Text>
                    <Text style={[CommonStyles.headerTextStyle,{width:wp('85%')}]}>{'Account Password'}</Text>
                    <View style={{marginTop:hp('1%')}}>
                    <View style={[styles.textInputContainerStyle]} >
                            <TextInput style={styles.textInputStyle}
                                underlineColorAndroid="transparent"
                                placeholder="Password*"
                                placeholderTextColor="#7F7F81"
                                autoCapitalize="none"
                                value = {pswdValue}
                                secureTextEntry = {isHidePassword}
                                onChangeText={(pswdValue) => {validatePassword(pswdValue)}}
                            />
                            <TouchableOpacity  onPress={() => {set_isHidePassword(!isHidePassword);}}>
                                <Image source={isHidePassword ? hidePswdImg : showPsdImg } style={styles.hideOpenIconStyle} />
                            </TouchableOpacity>
                    </View>
                    {enableConfirmPsd ? <View style={[styles.textInputContainerStyle]} >
                            <TextInput style={styles.textInputStyle}
                                underlineColorAndroid="transparent"
                                placeholder="Confirm Password*"
                                placeholderTextColor="#7F7F81"
                                autoCapitalize="none"
                                editable = {enableConfirmPsd}
                                secureTextEntry = {isConfirmHidePassword}
                                value = {confirmPswdValue}
                                onChangeText={(confirmPswdValue) => {confirmPswdValueMethod(confirmPswdValue)}}
                            />

                            <TouchableOpacity  onPress={() => {
                                set_isConfirmHidePassword(!isConfirmHidePassword);
                                }}>
                                <Image source={isConfirmHidePassword ? hidePswdImg : showPsdImg } style={styles.hideOpenIconStyle} />

                            </TouchableOpacity>
                    </View> : null}
                    </View>
                    <View style={{marginTop:hp('2%')}}>
                        <View style={{flexDirection:'row',alignItems:'center',width:wp('85%')}}>
                            <Image source={!psdLengthVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                            <Text style={styles.validateTextStyle}>{'At least 8 characters in length'}</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',width:wp('85%')}}>
                            <Image source={!regULVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                            <Text style={styles.validateTextStyle}>{'At least one upper and lower case letters (A-Z) (a-z)'}</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',width:wp('85%')}}>
                            <Image source={!regNumVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                            <Text style={styles.validateTextStyle}>{'At least one number (i.e 0-9)'}</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',width:wp('85%')}}>
                            <Image source={!regSPCVal ? failedImg : tickImg } style={styles.validateIconStyle} />
                            <Text style={styles.validateTextStyle}>{'At least one special character (!,@,#,$,%,^,&,*)'}</Text>
                        </View>
                        <View style={{flexDirection:'row',alignItems:'center',width:wp('85%')}}>
                            <Image source={!psdSame ? failedImg : tickImg } style={styles.validateIconStyle} />
                            <Text style={styles.validateTextStyle}>{'Password & Confirm Password should be the same'}</Text>
                        </View>
                    </View>
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
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {props.popUpBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {isFromScreen === "forgotPassword" ? Constant.DEFAULT_UPDATE_LOADER_MSG : Constant.CREATE_PSD_LOADER_MSG} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default PswdUI;

  const styles = StyleSheet.create({
  
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
        width: wp('85%'),
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
        color: '#898989', 
        ...CommonStyles.textStyleRegular        
      },

  });