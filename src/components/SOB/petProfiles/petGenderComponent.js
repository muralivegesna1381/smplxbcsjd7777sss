import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inPetGenderScreen;

const PetGenderComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [gender, set_gender] = useState(undefined);
    const [sobJson, set_sobJson] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petGender);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petGender, "User in SOB Pet Gender selection Screen", '');
            getSOBDetails();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetGenderScreen = await perf().startTrace('t_inSOBPetGenderSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetGenderScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
            set_petName(sJson.petName);
            if (sJson.gender) {
                set_isBtnEnable(true);
                set_selectedIndex(sJson.gender === 'Male' ? 0 : 1);
                set_gender(sJson.gender);
            }
        }
    };

    const nextButtonAction = async () => {

        let sobJson1 = {
            breedId: sobJson ? sobJson.breedId : '',
            breedName: sobJson ? sobJson.breedName : '',
            deviceNo: sobJson ? sobJson.deviceNo : '',
            deviceType: sobJson ? sobJson.deviceType : '',
            gender: gender,
            isNeutered: sobJson ? sobJson.isNeutered : '',
            petAge: sobJson ? sobJson.petAge : '',
            petName: sobJson ? sobJson.petName : '',
            knownAge: sobJson ? sobJson.knownAge : '',
            weight: sobJson ? sobJson.weight : '',
            weightType: sobJson ? sobJson.weightType : '',
            speciesId: sobJson ? sobJson.speciesId : '',
            speciesName: sobJson ? sobJson.speciesName : '',
            eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
        }
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petGender_submit_btn, firebaseHelper.screen_SOB_petGender, "User selected Pet gender", 'Gender : ' + gender);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
        navigation.navigate('PetNeuteredComponent');
    };

    const backBtnAction = () => {
        navigation.navigate('PetTypeComponent');
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const selectGenderAction = (gendetType, index) => {

        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_gender(gendetType);

    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Profile'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{petName + ' is a'}</Text>

                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('8%') }}>

                    <TouchableOpacity onPress={() => selectGenderAction('Male', 0)}>
                        <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/otherImages/svg/malePet.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Male'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectGenderAction('Female', 1)}>
                        <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/otherImages/svg/femalePet.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Female'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isBtnEnable}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
}

export default PetGenderComponent;

const styles = StyleSheet.create({

    activityBckView: {
        width: wp('35%'),
        height: hp('15%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#96B2C9',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        backgroundColor: '#F6FAFD'
    },

    unActivityBckView: {
        width: wp('35%'),
        height: hp('15%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        backgroundColor: 'white'
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

});