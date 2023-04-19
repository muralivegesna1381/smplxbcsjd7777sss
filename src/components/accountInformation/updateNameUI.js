import React, { useState, useEffect } from 'react';
import {View,StyleSheet,} from 'react-native';
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

const  UpdateNameUI = ({route, ...props }) => {

    const [firstName, set_firstName] = useState(undefined);
    const [lastName, set_lastName] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popAlert, set_popAlert] = useState(undefined);
    const [btnEnable, set_btnEnable] = useState(undefined);

    // Setting the Existing valuse from component class
    useEffect(() => {
        set_firstName(props.firstName);
        set_lastName(props.lastName);
        if(props.firstName && props.firstName.length>0){
            set_btnEnable(true);
        } else {
            set_btnEnable(false);
        }
        
    }, [props.firstName,props.lastName]);

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

    // Initiates the service call to update the User name
    const rightButtonAction = async () => {
        props.UpdateAction(firstName,lastName);
    };

    // Popup btn actions
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // Enabling the submit button and setting first name
    const setfirstName = (value) => {

        set_firstName(value);
        if(value && value.length > 0){
            set_btnEnable(true);
        } else {
            set_btnEnable(false);
        }
    };

    // setting the last name
    const setLastName = (value) => {
        set_lastName(value);
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
                    title={'Update Name'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView>

                <View style={{alignItems:'center',justifyContent:'center',height:hp('70%')}} >

                    <View style={{marginBottom:hp('2%'),}}>
                        <TextInputComponent 
                            inputText = {firstName} 
                            labelText = {'First Name*'} 
                            isEditable = {true}
                            maxLengthVal = {20}
                            autoCapitalize = {'none'}
                            setValue={(textAnswer) => {
                                setfirstName(textAnswer);
                            }}
                        />
                    </View>

                    <View>
                        <TextInputComponent 
                            inputText = {lastName ? lastName : '--'} 
                            labelText = {'Last Name'} 
                            isEditable = {false}
                            isBackground = {true}
                            maxLengthVal = {20}
                            setValue={(textAnswer) => {
                                setLastName(textAnswer);
                            }}
                        />
                    </View>

                </View>  

            </KeyboardAwareScrollView>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle  = {''}
                    rigthBtnState = {btnEnable}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => rightButtonAction()}

                ></BottomComponent>
            </View>   

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

                {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default UpdateNameUI;

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
        fontSize:fonts.fontMedium
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

  });