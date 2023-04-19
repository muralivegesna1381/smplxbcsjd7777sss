import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableWithoutFeedback, ImageBackground, FlatList,BackHandler } from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Constant from "./../../utils/constants/constant";
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import moment from 'moment';
import AlertComponent from '../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import { constants } from 'buffer';

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

let tickImg = require("./../../../assets/images/otherImages/svg/feedingTick.svg");
let notTickImg = require("./../../../assets/images/otherImages/svg/feedingTickEmpty.svg");

const EatingTimeComponentUI = ({ navigation, route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [eatingText, set_eatingText] = useState(undefined);
    const [eatingObj, set_eatingObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);
    const [timeArray, set_timeArray] = useState([]);
    const [selItem, set_selItem] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let isPop = useRef(undefined);
    
    let trace_inEating_Enthusiasm_Time_Selection_Screen;
    let trace_EatingEnthu_Get_Pet_Feeding_Time_API_Complete;
    let trace_EatingEnthu_Submit_Pet_Feeding_Time_API_Complete;

    // Setting the firebase screen name
    useEffect(() => {

        getPetFeedingTime();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            eatingEnthusiasmTimeSelectionScreenSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_eating_enthusiasm_time);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_eating_enthusiasm_time, "User in Eating Enthusiasm Time selection Screen", '');
          });
  
          const unsubscribe = navigation.addListener('blur', () => {
            eatingEnthusiasmTimeSelectionScreenSessionStop();
          });

         return () => {
            focus();
            unsubscribe();
            eatingEnthusiasmTimeSelectionScreenSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    }, []);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const eatingEnthusiasmTimeSelectionScreenSessionStart = async () => {
        trace_inEating_Enthusiasm_Time_Selection_Screen = await perf().startTrace('t_inEating_Enthusiasm_Time_Selection_Screen');
    };
    
    const eatingEnthusiasmTimeSelectionScreenSessionStop = async () => {
        await trace_inEating_Enthusiasm_Time_Selection_Screen.stop();
    };

    const stopFBTraceGetPetFeedingTime = async () => {
        await trace_EatingEnthu_Get_Pet_Feeding_Time_API_Complete.stop();
    };

    const stopFBTraceSubmitPetFeedingTime = async () => {
        await trace_EatingEnthu_Submit_Pet_Feeding_Time_API_Complete.stop();
    };

    // Fetches the Eating time records from backend.
    const getPetFeedingTime = async () => {

        trace_EatingEnthu_Get_Pet_Feeding_Time_API_Complete = await perf().startTrace('t_Eating_Enthusiasm_Get_Pet_Feeding_Time_API');
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        if (token) {
            firebaseHelper.logEvent(firebaseHelper.event_get_pet_feeding_time_api, firebaseHelper.screen_eating_enthusiasm_time, "Get Pet Feeding Time Api", '');
            set_isLoading(true);
            isLoadingdRef.current = 1;
            fetch(EnvironmentJava.uri + "pets/getPetFeedingTime/",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "ClientToken" : token
                    },
                }
            ).then((response) => response.json()).then(async (data) => {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                    AuthoriseCheck.authoriseCheck();
                    navigation.navigate('WelcomeComponent');
                }
                if (data.status.success) {
                    stopFBTraceGetPetFeedingTime();
                    firebaseHelper.logEvent(firebaseHelper.event_get_pet_feeding_time_api_success, firebaseHelper.screen_eating_enthusiasm_time, "Get Pet Feeding Time Api success", '');
                    set_timeArray(data.response.petFeedingTimes);
                    getEatingData();
                } else {
                    stopFBTraceGetPetFeedingTime();
                    set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
                    set_popupMsg(Constant.SERVICE_FAIL_MSG);
                    set_isPopUp(true);
                    popIdRef.current = 1;
                    isPop.current = true;
                }
            }).catch((error) => {
                set_isLoading(false);
                isLoadingdRef.current = 0;
                stopFBTraceGetPetFeedingTime();
                set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
                set_popupMsg(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
                isPop.current = true;
                firebaseHelper.logEvent(firebaseHelper.event_get_pet_feeding_time_api_failure, firebaseHelper.screen_eating_enthusiasm_time, "Get Pet Feeding Time Api failed", ''+error);
            });
        } 
    };

    // Setting the Eating type value
    const getEatingData = async () => {

        let eatObj =  await DataStorageLocal.getDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
        eatObj = JSON.parse(eatObj);
        if(eatObj){
            set_eatingObj(eatObj);
            set_selectedIndex(parseInt(eatObj.eTime.feedingTimeId-1));
            set_selItem(eatObj.eTime);
            if(eatObj.eTime.feedingTimeId){
                set_isNxtBtnEnable(true);
            }
        }
    };

    // API to submit Eating enthusiastic record to backend
    const submitPetFeedingTime = async () => {

        trace_EatingEnthu_Submit_Pet_Feeding_Time_API_Complete = await perf().startTrace('t_Eating_Enthusiasm_Submit_Pet_Feeding_Time_API');
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);

        let client = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        if (client) {

            let finalJson = {
                "feedingEnthusiasmScaleId": null,
                "petId": petObj.petID,
                "enthusiasmScaleId": eatingObj.sliderValue.enthusiasmScaleId,
                "feedingTimeId": selItem.feedingTimeId,
                "feedingDate": moment(new Date(eatingObj.eDate)).format('YYYY-MM-DD'),
                "petParentId": parseInt(client)
            }
            firebaseHelper.logEvent(firebaseHelper.event_submit_pet_feeding_time_api, firebaseHelper.screen_eating_enthusiasm_time, "Submit Pet Feeding Time Api", ''+finalJson);
            set_isLoading(true);
            isLoadingdRef.current = 1;
            fetch(EnvironmentJava.uri + "pets/addPetFeedingTime",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                        "ClientToken" : token
                    },
                    body: JSON.stringify(finalJson)
                }

            ).then((response) => response.json()).then(async (data) => {

                set_isLoading(false);
                isLoadingdRef.current = 0;
                if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                    AuthoriseCheck.authoriseCheck();
                    navigation.navigate('WelcomeComponent');
                }
                
                if (data.status.success) {
                    stopFBTraceSubmitPetFeedingTime();
                    firebaseHelper.logEvent(firebaseHelper.event_submit_pet_feeding_time_api_success, firebaseHelper.screen_eating_enthusiasm_time, "Submit Pet Feeding Time Api success", '');
                    await DataStorageLocal.removeDataFromAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ);
                    set_popupAlert(Constant.ALERT_INFO);
                    set_popupMsg('Your pet’s Eating Enthusiasm Scale has been submitted successfully');
                    set_isPopUp(true);
                    popIdRef.current = 1;
                    isPop.current = true;
                } else {
                    set_isPopUp(true);
                    popIdRef.current = 1;
                    isPop.current = true;
                    stopFBTraceSubmitPetFeedingTime();
                    set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
                    set_popupMsg(Constant.SERVICE_FAIL_MSG);
                }
            }).catch((error) => {
                firebaseHelper.logEvent(firebaseHelper.event_submit_pet_feeding_time_api_failure, firebaseHelper.screen_eating_enthusiasm_time, "Submit Pet Feeding Time Api failed", ''+error);
                stopFBTraceSubmitPetFeedingTime();
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_isPopUp(true);
                popIdRef.current = 1;
                isPop.current = true;
                set_popupAlert(Constant.ALERT_DEFAULT_TITLE);
                set_popupMsg(Constant.SERVICE_FAIL_MSG);
            });

        }

    };

    // Submit Record to backend action
    const nextButtonAction = () => {
        submitPetFeedingTime();
    };

    // Navigates to previous screen
    const backBtnAction = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate("SelectDateEnthusiasmComponent");
        } 
        
    }

    // Selection action
    const selectEatingAction = async (item, activityName, index) => {

        set_isNxtBtnEnable(true);
        set_selectedIndex(index);
        set_eatingText(activityName);
        set_selItem(item);

        let eatTempObj = {};
        eatTempObj = {
            sliderValue : eatingObj.sliderValue, 
            eDate : eatingObj.eDate, 
            eTime : item, 
        }
        await DataStorageLocal.saveDataToAsync(Constant.EATINGENTUSIASTIC_DATA_OBJ,JSON.stringify(eatTempObj));

    };

    // Popup action
    const popOkBtnAction = () => {

        if (popupMsg === 'Your pet’s Eating Enthusiasm Scale has been submitted successfully') {
            navigation.navigate('DashBoardService');
        }

        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_isPopUp(false);
        popIdRef.current = 0;
        isPop.current = false;
        set_popupAlert(undefined);
        set_popupMsg(undefined);

    };

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Eating Enthusiasm'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ height: hp('70%'), width: wp('90%'), alignSelf: 'center' }}>

                <View style={{ marginTop: hp('5%'), minHeight: hp('5%'), marginBottom: hp('5%') }}>
                    <Text style={[styles.headerTextStyle]}>{'Select the eating time for scale selection'}</Text>
                </View>

                <View style={{ width: wp('90%'), minHeight: hp('45%'), alignItems: 'center' }}>

                    <FlatList
                        style={styles.flatcontainer}
                        data={timeArray}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (

                            <TouchableWithoutFeedback onPress={() => selectEatingAction(item, item.feedingTime, index)}>

                                <View style={{ justifyContent: 'space-between', alignContent: 'center' }}>
                                    <View style={selectedIndex === index ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                        <View style={styles.imgBckViewStyle}>
                                            <ImageBackground source={selectedIndex === index ? tickImg : notTickImg} style={styles.petImgStyle}
                                                resizeMode='contain'></ImageBackground>
                                        </View>

                                        <Text style={[styles.name]}>{item.feedingTime}</Text>

                                    </View>
                                </View>
                            </TouchableWithoutFeedback>

                        )}
                        keyExtractor={(item) => item}
                        numColumns={2}
                    />

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'SUBMIT'}
                    isLeftBtnEnable={true}
                    isRightBtnEnable={true}
                    leftBtnTitle={'BACK'}
                    rigthBtnState={isNxtBtnEnable}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={popupAlert}
                    message={popupMsg}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={"OK"}
                    popUpRightBtnAction={() => popOkBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default EatingTimeComponentUI;

const styles = StyleSheet.create({
    
    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    activityBckView: {
        width: wp('38%'),
        height: hp('15%'),
        alignItems: 'center',
        marginBottom: hp("1%"),
        margin: hp("0.5%"),
        borderWidth: 1,
        borderColor: '#96B2C9',
        borderRadius: 5,
        backgroundColor: "#F6FAFD",
        justifyContent: 'center',
    },

    unActivityBckView: {
        width: wp('38%'),
        height: hp('15%'),
        alignItems: 'center',
        marginBottom: hp("1%"),
        margin: hp("0.5%"),
        borderWidth: 1,
        borderColor: '#EAEAEA',
        borderRadius: 5,
        justifyContent: 'center',
    },

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color: 'black',
        marginTop: hp("1%"),
    },

    petImgStyle: {
        width: wp("8%"),
        aspectRatio: 1,
        resizeMode:'contain'
    },

    imgBckViewStyle: {
        borderRadius: 5,
        borderColor: 'black',
        borderWidth: 1,
        width: hp("6%"),
        height: hp("6%"),
        alignItems: 'center',
        justifyContent: 'center'
    },

    flatcontainer: {
        width: wp('80%'),
        marginTop: hp("2%"),
        flex: 1,
    },

    headerTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: "black",
    },

});