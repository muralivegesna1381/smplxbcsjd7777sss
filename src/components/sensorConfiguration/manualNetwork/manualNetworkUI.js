import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,TouchableOpacity,Image} from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import TextInputComponent from './../../../utils/commonComponents/textInputComponent';

let hideImg = require('./../../../../assets/images/otherImages/png/hide-password.png');
let openImg = require('./../../../../assets/images/otherImages/png/show-password.png');

const  ManualNetworkUI = ({route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [ssidPswd, set_ssidPswd] = useState('');
    const [ssidName, set_ssidName] = useState('');
    const [isHidePassword, set_isHidePassword] = useState(true);

    useEffect(() => {

    }, [props.deviceType]);

    const nextButtonAction = () => {
      props.submitAction(ssidName,ssidPswd);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    const validateSSIDPSWD = (ssid,ssidPsd) => {

        set_ssidName(ssid);
        set_ssidPswd(ssidPsd);
        if(ssid.length>0 && ssidPsd.length>0){
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }

    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
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

            <KeyboardAwareScrollView>

                <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center'}}>

                <View style={styles.topViewStyle}>
                    <Text style={styles.headerStyle}>{'Network '}<Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{'Setup'}</Text>
                    </Text>
                </View>

                    <View style={{width:wp('80%'),minHeight:hp('8%'),marginTop:hp('8%')}}>

                        <Text style={[CommonStyles.headerTextStyle]}>{'Manually enter wireless network'}</Text>
                        
                            <View style={{marginTop:hp('4%')}} >

                                    <TextInputComponent 
                                        inputText = {ssidName} 
                                        labelText = {'Network Name'} 
                                        isEditable = {true}
                                        maxLengthVal={props.deviceType==='Sensor' ? 20 : 32}
                                        autoCapitalize = {'none'}
                                        setValue={(textAnswer) => {
                                            validateSSIDPSWD(textAnswer,ssidPswd)
                                        }}
                                    />

                            </View>  

                            <View style={[CommonStyles.textInputContainerStyle,{alignSelf: 'center', marginTop: hp('2%'),}]} >
                                  <TextInput style={CommonStyles.textInputStyle}
                                      underlineColorAndroid="transparent"
                                      placeholder="Password"
                                      placeholderTextColor="#7F7F81"
                                      autoCapitalize="none"
                                      maxLength={props.deviceType==='Sensor' ? 20 : 40}
                                      secureTextEntry={isHidePassword}
                                      value = {ssidPswd}
                                      onChangeText={(userPswd) => {validateSSIDPSWD(ssidName,userPswd)}}
                                  />
                                  <TouchableOpacity  onPress={() => {
                                      set_isHidePassword(!isHidePassword);
                                  }}>
                                  <Image source={isHidePassword ? hideImg : openImg } style={CommonStyles.hideOpenIconStyle} />

                                  </TouchableOpacity>
                          </View> 

                    </View>
                </View>

            </KeyboardAwareScrollView>
            
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {isNxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>  

         </View>
    );
  }
  
  export default ManualNetworkUI;

  const styles = StyleSheet.create({
    
        textInputStyle: {
            flex: 1,
            color: 'black',
            height:hp('7%'),
            paddingLeft:wp('5%'),
            fontSize:fonts.fontXSmall,
            ...CommonStyles.textStyleSemiBold,
        },

        topViewStyle : {
            width:wp('100%'),
            height:hp('8%'),
            justifyContent:'center',
        },

        headerStyle : {
            color: 'black',
            fontSize: fonts.fontNormal,
            ...CommonStyles.textStyleRegular,
            marginLeft:wp('8%'),           
        },

  });