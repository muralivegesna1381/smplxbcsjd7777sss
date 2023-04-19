import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text} from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import moment from 'moment';

const  PetReviewUI = ({route, ...props }) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [sobJson, set_sobJson] = useState(undefined);
    const [email, set_email] = useState(undefined);
    const [name, set_name] = useState(undefined);
    const [phNo, set_phNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popLeftTitle, set_popLeftTitle] = useState(false);
    const [popRightTitle, set_popRightTitle] = useState(false);
    const [isSOBSubmitted, set_isSOBSubmitted] = useState(false);

    useEffect(() => {
        set_email(props.email);
        set_name(props.name);
        set_phNo(props.phNo);
    }, [props.email, props.name, props.phNo]);

    useEffect(() => {
        set_sobJson(props.sobJson);
        set_isLoading(props.isLoading);
        set_isSOBSubmitted(props.isSOBSubmitted);
    }, [props.sobJson,props.isLoading,props.isSOBSubmitted]);

    useEffect(() => {
        set_popUpTitle(props.popUpTitle);
        set_popUpMessage(props.popUpMessage);
        set_popLeftTitle(props.popLeftTitle);
        set_popRightTitle(props.popRightTitle);
        set_isPopUp(props.isPopUp);
    }, [props.isPopUp,props.popUpMessage,props.popUpTitle,props.popRightTitle,props.popLeftTitle]);

    const nextButtonAction = () => {
        props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={!isSOBSubmitted}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Review Information'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

                <View style={{width: wp('90%'),height: hp('68%'),alignSelf:'center'}}>
                <KeyboardAwareScrollView>
                    <View style={styles.backSOBDataViewStyle}>

                        <View style={{justifyContent:'center'}}>

                            <Text style={styles.subHeaderTextStyles}>{'Device Info'}</Text>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Device Number'}</Text>
                                    {/* <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.deviceNo : ''}</Text> */}
                                    {sobJson && sobJson.deviceNo && sobJson.deviceNo.length < 10 ? <Text style={[styles.selectedDataTextStyles]}>{sobJson.deviceNo}</Text> 
                                    : (sobJson && sobJson.deviceNo ? <View>
                                        <Text style={[styles.selectedDataTextStyles]}>{sobJson.deviceNo.substring(0,9)}</Text>
                                        <Text style={[styles.selectedDataTextStyles]}>{sobJson.deviceNo.substring(9,sobJson.deviceNo.length)}</Text>
                                    </View> : null)}
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Sensor Type'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.deviceType : ''}</Text>
                                </View>
                                
                            </View>

                        </View>

                        <View style={{justifyContent:'center'}}>

                            <Text style={styles.subHeaderTextStyles}>{'Pet Info'}</Text>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet Name'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.petName : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.speciesId === 2 ? 'Cat' : 'Dog' : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Breed'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.breedName : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet Age'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? "" + moment(sobJson.petAge).format("MM-DD-YYYY") : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Weight'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.weight + ' ' + sobJson.weightType : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Gender'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.gender : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{sobJson && sobJson.gender==='Male' ? 'Neutered' : 'Spayed'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{sobJson ? sobJson.isNeutered : ''}</Text>
                                </View>
                                
                            </View>

                        </View>

                        <View style={{justifyContent:'center'}}>

                            <Text style={styles.subHeaderTextStyles}>{'Your Info'}</Text>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Name'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{name}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Email'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{email}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Phone'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{phNo}</Text>
                                </View>
                                
                            </View>

                        </View>

                    </View>
                    </KeyboardAwareScrollView>
                </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {!isSOBSubmitted}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {popLeftTitle === 'LATER' ? true : false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {popLeftTitle}
                    rightBtnTilte = {popRightTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default PetReviewUI;

  const styles = StyleSheet.create({

    backSOBDataViewStyle : {
        alignItems:'center'
    },

    subHeaderTextStyles : {
        ...CommonStyles.textStyleLight,
        fontSize: fonts.fontXLarge,
        color:'black',
        marginTop: hp("5%"),
    },

    dataViewStyle : {
        minHeight:hp('6%'),
        width:wp('90%'),
        marginTop: hp("2%"),
        borderRadius:5,
        borderColor:'#EAEAEA',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    },

    labelTextStyles : {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        alignSelf:'center'
    },

    selectedDataTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        // marginTop: hp("1%"),
        // marginBottom: hp("1%"),
        textAlign:'right'
    },

  });