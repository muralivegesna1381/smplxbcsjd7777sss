import React, { useState, useEffect } from 'react';
import {View,StyleSheet,TouchableOpacity,Image,Text,FlatList} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import * as Constant from "../../utils/constants/constant";
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import Fonts from './../../utils/commonStyles/fonts';

let downArrowImg = require('./../../../assets/images/otherImages/svg/downArrowGrey.svg');

const  UpdatePhoneUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [phnNo, set_phNo] = useState(undefined);
    const [isDropdown, set_isDropdown] = useState(false);
    const [countryCode, set_countryCode] = useState('+1');

    // Setting the Existing valuse from component class
    useEffect(() => {

        if(props.phnNo){
            let ph = (props.phnNo).replace(/[&\/\\#,+()$~%.'":*?<>{}-]/g, '');
            if(ph && ph.length>10){

                if(ph.length>11){

                    set_phNo(ph.substring(2, 12));
                    set_countryCode('+44');

                } else {
                    set_phNo(ph.substring(1, 11));
                    set_countryCode('+1');
                }               

            } else {
                set_phNo(ph);
            }            
        }
        
    }, [props.phnNo]);

    // Updates the Popup alert values
    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popAlert(props.popAlert);
    }, [props.popUpMessage,props.isPopUp,props.popAlert,props.isLoading]);

    // Navigation to previous screen
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Initiates the service call to update the User Phone number and country code
    const rightButtonAction = async () => {
        props.UpdateAction(phnNo,countryCode);
    };

      // Popup btn actions
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // setting the Phonenumber
    const setPhoneNumber = (value) => {
        set_phNo(value);
    };

    // setting country code
    const actionOnRow = (item) => {

        set_countryCode(item);
        set_isDropdown(!isDropdown);
        
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
                    title={'Update Phone'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{alignItems:'center',justifyContent:'center',height:hp('70%'),width:wp('80%'),flexDirection:'row',alignSelf:'center'}} >

                    <View>

                        <TouchableOpacity style={styles.cBtnStyle} onPress={() => {set_isDropdown(!isDropdown)}}>
                            <Text style={styles.cTextStyle}>{countryCode}</Text>
                             <Image source={downArrowImg} style={styles.downArrowStyle} />
                        </TouchableOpacity>

                    </View>

                    <View>
                        <TextInputComponent 
                            inputText = {phnNo} 
                            labelText = {'Phone*'} 
                            isEditable = {true}
                            widthValue = {wp('60%')}
                            keyboardType = "numeric"
                            maxLengthVal = {10}
                            setValue={(textAnswer) => {
                                setPhoneNumber(textAnswer);
                            }}
                        />
                    </View>

                </View>  

            </KeyboardAwareScrollView> 

            {!isDropdown ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle  = {''}
                    rigthBtnState = {phnNo && phnNo.length>9 ? true : false}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => rightButtonAction()}

                ></BottomComponent>
            </View> : null } 

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popAlert}
                    message={props.popUpMessage}
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
                    keyExtractor={(item,index) => index}/> 
                        
                </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default UpdatePhoneUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

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
        borderTopLeftRadius:15
    },

  });