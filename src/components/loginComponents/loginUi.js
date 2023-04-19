import React, { useState, useEffect } from 'react';
import {View,StyleSheet,TouchableOpacity,Text,TextInput,Image} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import Fonts from '../../utils/commonStyles/fonts';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'

let hideImg = require('./../../../assets/images/otherImages/png/hide-password.png');
let openImg = require('./../../../assets/images/otherImages/png/show-password.png');

const  LoginUI = ({route, ...props }) => {

    const [userEmail, set_userEmail] = useState(undefined);
    const [userPswd, set_userPswd] = useState(undefined);
    const [isHidePassword, set_isHidePassword] = useState(true);
    const [isEmailValid, set_isEmailValid] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const navigation = useNavigation();
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    // Setting the values from login COmponent to local variables
    useEffect(() => {

      set_isLoading(props.isLoading);
      set_popUpAlert(props.popUpAlert);
      set_popUpMessage(props.popUpMessage);
      set_isPopUp(props.isPopUp);

    }, [props.isLoading,props.isPopUp,props.popUpMessage,props.popUpAlert]);

    React.useEffect(() => {
      const focus = navigation.addListener("focus", () => {
        set_Date(new Date());
        getUserEmail();
      });

      return () => {
          focus();
        };
    }, [navigation]);

    // getting user email details
    const getUserEmail = async () => {
      let tempMail = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
      if(tempMail){
        set_userEmail(tempMail.replace(/ /g, ''));
      }     
      await DataStorageLocal.removeDataFromAsync(Constant.USER_EMAIL_LOGIN_TEMP);
    };

    const rightButtonAction = async () => {
      props.loginAction(userEmail,userPswd);
    };

    const leftButtonAction = async () => {
      set_userEmail(undefined);
      set_userPswd(undefined);
    };

    const backBtnAction = () => {
      props.backBtnAction();
    }

    const forgotPswdAction = () => {
      props.forgotPswdAction(userEmail);     
    }

    const registerAction = () => {
      props.registerAction();
    }

    // Email format validation
    const validateEmail = (email) => {

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(re.test(email.replace(/ /g, '')) && userPswd){
          set_isEmailValid(true);
      }else {
          set_isEmailValid(false);
      }
      set_userEmail(email.replace(/ /g, ''));

    }; 
    
    // Password validation
    const validatePassword = (value) => {

      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

      if(re.test(userEmail) && value.length>7){
        set_isEmailValid(true);
      }else {
          set_isEmailValid(false);
      }

      set_userPswd(value);
    };

    const popOkBtnAction = () => {
      props.popOkBtnAction(false);
  };

    return (
        <View style={[styles.mainComponentStyle]}>

          <View style={CommonStyles.headerView}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Login'}
                    headerColor = {'white'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{alignItems:'center',justifyContent:'center',height:hp('70%'),}}>

                <KeyboardAwareScrollView bounces={false} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>
                    
                    <View style={{justifyContent:'center',width:wp('80%'),height:hp('60%')}}>

                          <Text style={[CommonStyles.headerTextStyle]}>{'Login to your'}</Text>
                          <Text style={[CommonStyles.headerTextStyle]}>{'Wearables'} <Text style={[CommonStyles.headerTextStyle1]}>{'Account'}</Text> </Text>
                          
                          <View style={{alignItems:'center',justifyContent:'center',marginTop:hp('5%')}} >

                              <TextInputComponent 
                                  inputText = {userEmail} 
                                  labelText = {'Email'} 
                                  isEditable = {true}
                                  maxLengthVal = {50}
                                  autoCapitalize = {"none"}
                                  setValue={(textAnswer) => {
                                    validateEmail(textAnswer);
                                  }}
                              />

                            </View>

                          <View style={[CommonStyles.textInputContainerStyle,{alignSelf: 'center', marginTop: hp('2%'),}]} >

                                  <TextInput style={CommonStyles.textInputStyle}
                                      underlineColorAndroid="transparent"
                                      placeholder="Password"
                                      placeholderTextColor="#7F7F81"
                                      autoCapitalize="none"
                                      secureTextEntry={isHidePassword}
                                      value = {userPswd}
                                      onChangeText={(userPswd) => {validatePassword(userPswd)}}
                                  />

                                  <TouchableOpacity  onPress={() => {set_isHidePassword(!isHidePassword);}}>
                                    <Image source={isHidePassword ? hideImg : openImg } style={CommonStyles.hideOpenIconStyle} />
                                  </TouchableOpacity>

                          </View> 

                          <TouchableOpacity style={{height:hp('5%'),width:wp('40%'),marginTop:hp('1%'),justifyContent:'center'}}  onPress={() => {forgotPswdAction()}}>
                              <Text style={styles.forgotPaswdTextStyle}>Forgot Password?</Text>
                          </TouchableOpacity>  

                        </View>

                  </KeyboardAwareScrollView>
                  
                  <View style={{alignItems:'center',justifyContent:'center',height:hp('5%'),position:'absolute',bottom:0}}>
                        <TouchableOpacity style={{height:hp('5%'),justifyContent:'center'}}  onPress={() => {registerAction()}}>
                              <Text style={[styles.forgotPaswdTextStyle,{color:'black'}]}>Don't have an account?
                              <Text style={styles.registerTextStyle}> Register</Text></Text>
                        </TouchableOpacity>  
                  </View>
                
            </View> 

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'LOGIN'}
                    leftBtnTitle  = {'RESET'}
                    rigthBtnState = {isEmailValid ? true : false}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => rightButtonAction()}
                    leftButtonAction = {async () => leftButtonAction()}
                ></BottomComponent>
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default LoginUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'white',
    },

    forgotPaswdTextStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: Fonts.fontMedium,
      color:'#6BC100'
    },

    registerTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontMedium,
      color:'#6BC100'
    },
    
  });