import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import Fonts from '../../utils/commonStyles/fonts';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

let downArrowImg = require('./../../../assets/images/otherImages/svg/downArrowGrey.svg');

const  RegisterAccountUi = ({route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [email, set_email] = useState('');
    const [phNumber, set_phNumber] = useState('');
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isDropdown, set_isDropdown] = useState(false);
    const [countryCode, set_countryCode] = useState('+1');

    /**
     * setting values to local variables
     */
    useEffect(() => {

        set_firstName(props.firstName);
        set_secondName(props.secondName);
        set_isLoading(props.isLoading);
        set_popUpMessage(props.popUpMessage);
        set_isPopUp(props.isPopUp);

    }, [props.firstName, props.secondName,props.isLoading,props.popUpMessage,props.isPopUp]);

    /**
     * When Pet parent submit the details, these details will be sent to Component class
     */
    const nextButtonAction = () => {

        let phoneTemp = phNumber.replace(/\D/g, "");
        let phoneTemp1 = phoneTemp.substring(0, 3);
        phoneTemp1 = "(" + phoneTemp1 + ")";
        let phoneTemp2 = phoneTemp.substring(3, 6);
        let phoneTemp3 = phoneTemp.substring(6, phoneTemp.length);
        phoneTemp3 = "-" + phoneTemp3;
        props.submitAction(email,countryCode + phoneTemp1 + phoneTemp2 + phoneTemp3,firstName,secondName);

    };

    // When user clicks on backbutton, navigates to previous screen
    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    /**
     * @param {*} email 
     * This will check the email formate.
     * When valid, next button will enable
     * Checks phone number length, should be 10.
     * When valid, saves the user entered email for backend validation
     */
     const validateEmail = (email) => {

        set_email(email.replace(/ /g, ''));
        var emailValid = /\S+@\S+\.\S+/;

        if(emailValid.test(email.replace(/ /g, '')) && phNumber.length > 9){
            set_isNxtBtnEnable(true);
        }else {
            set_isNxtBtnEnable(false);
        }

    }

    const validatePhone = (phNumber) => {

        set_phNumber(phNumber);
        var emailValid = /\S+@\S+\.\S+/;
        if(emailValid.test(email) && phNumber.length > 9){
            set_isNxtBtnEnable(true);
        }else {
            set_isNxtBtnEnable(false);
        }

    }

    const actionOnRow = (item) => {

        set_countryCode(item);
        set_isDropdown(!isDropdown);
        
    };

    /**
     * This method triggers when user clicks on Popup Button.
     */
     const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={CommonStyles.headerView}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Parent Profile'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{alignItems:'center',justifyContent:'center'}}>

                <View  style={{marginTop:hp('5%'),width:wp('80%')}} >
                
                    <Text style={CommonStyles.headerTextStyle}>{'Hi,'}</Text>
                    <Text style={CommonStyles.headerTextStyle}>{firstName + ' ' + secondName}</Text>

                    <Text style={[CommonStyles.subHeaderTextStyle,{marginTop:hp('2%')}]}>{'Please enter your best Email ID and Mobile Number which shall be used for login and communication.'}</Text>
                    
                        <View style={{marginTop:hp('4%')}} >

                            <TextInputComponent 
                                inputText = {email} 
                                labelText = {firstName + "'s " + "Email*"} 
                                isEditable = {true}
                                maxLengthVal = {50}
                                autoCapitalize = {'none'}
                                // widthValue = {wp('80%')}
                                setValue={(textAnswer) => {
                                    validateEmail(textAnswer)
                                }}
                            />

                        </View>  

                        <View style={{marginTop:hp('2%'),flexDirection:'row',width:wp('80%')}} >

                            <View>

                                <TouchableOpacity style={styles.cBtnStyle} onPress={() => {set_isDropdown(!isDropdown)}}>
                                <Text style={styles.cTextStyle}>{countryCode}</Text>
                                    <Image source={downArrowImg} style={styles.downArrowStyle} />
                                </TouchableOpacity>

                            </View>

                            <View style={{width: wp("60%")}}>
                                <TextInputComponent 
                                    inputText = {phNumber} 
                                    labelText = {firstName + "'s " + "Phone*"} 
                                    isEditable = {true}
                                    widthValue = {wp('60%')}
                                    maxLengthVal = {10}
                                    keyboardType = {'numeric'}
                                    autoCapitalize = {false}
                                    setValue={(textAnswer) => {
                                        validatePhone(textAnswer)
                                    }}
                                />
                            </View>

                        </View>  
                    </View>               

                </View>
            </KeyboardAwareScrollView>

            {!isDropdown ? <View style={CommonStyles.bottomViewComponentStyle}>

                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {isNxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />

            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isDropdown ? <View style={[styles.popSearchViewStyle]}>
                    <FlatList
                            style={styles.flatcontainer}
                            data={['+1', '+44']}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity onPress={() => actionOnRow(item)}>
                                <View style={styles.flatview}>
                                    <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                                </View>
                                </TouchableOpacity>
                            )}
                            enableEmptySections={true}
                            keyExtractor={(item,index) => index}
                        /> 
                        
                </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

        </View>
    );
  }
  
  export default RegisterAccountUi;

  const styles = StyleSheet.create({

    downArrowStyle : {
        width: wp('4%'),
        height: hp('4%'),
        resizeMode: 'contain',
        tintColor:'#707070',
        marginLeft:wp('2%'),
    },

    cBtnStyle : {
        backgroundColor:'#EAEAEA',
        height:hp('8%'),
        width:wp('20%'),
        borderRadius: wp('1%'),
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row', 
    },

    cTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontNormal,
        color:'#7F7F81',
    },

    flatcontainer: {
        flex: 1,
    },

    flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
        alignItems:'center' 
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
    },

    popSearchViewStyle : {
        height: hp("25%"),
        width: wp("95%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15, 
         
    },

  });