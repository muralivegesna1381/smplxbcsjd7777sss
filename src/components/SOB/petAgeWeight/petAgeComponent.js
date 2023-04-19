import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, BackHandler, TouchableOpacity, ImageBackground } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import moment from "moment";
import DatePicker from 'react-native-date-picker'
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inPetAgeScreen;

const PetAgeComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(true);
    const [sobJson, set_sobJson] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [selectedDate, set_selectedDate] = useState(new Date())
    const [date, set_Date] = useState(new Date());
    const [isUnknown, set_isUnknown] = useState(false);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petAge);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petAge, "User in SOB Pet Age selection Screen", '');
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

    useEffect(() => {

        if (route.params?.sobJson) {
            set_sobJson(route.params?.sobJson);
            set_petName(route.params?.sobJson.petName);
        }

    }, [route.params?.sobJson]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetAgeScreen = await perf().startTrace('t_inSOBPetAgeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetAgeScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
            set_petName(sJson.petName);
            if (sJson.petAge) {
                set_isBtnEnable(true);
                set_selectedDate(new Date(sJson.petAge));
                set_isUnknown(sJson.knownAge ? true : false);
            }
        }
    };

    const nextButtonAction = async () => {

        let sobJson1 = {
            breedId: sobJson ? sobJson.breedId : '',
            breedName: sobJson ? sobJson.breedName : '',
            deviceNo: sobJson ? sobJson.deviceNo : '',
            deviceType: sobJson ? sobJson.deviceType : '',
            gender: sobJson ? sobJson.gender : '',
            isNeutered: sobJson ? sobJson.isNeutered : '',
            petAge: moment(selectedDate).format("YYYY-MM-DD").toString(),
            knownAge: isUnknown,
            petName: sobJson ? sobJson.petName : '',
            weight: sobJson ? sobJson.weight : '',
            weightType: sobJson ? sobJson.weightType : '',
            speciesId: sobJson ? sobJson.speciesId : '',
            speciesName: sobJson ? sobJson.speciesName : '',
            eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
        }

        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petAge_submit_button, firebaseHelper.screen_SOB_petAge, "User selected the Age for the pet", 'Age : ' + moment(selectedDate).format("YYYY-MM-DD").toString());
        navigation.navigate('PetWeightComponent');

    };

    const backBtnAction = () => {
        navigation.navigate('PetBreedComponent');
    };

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
                    <Text style={CommonStyles.headerTextStyle}>{'When is ' + petName + "'s" + " Birthday?"}</Text>
                </View>

                <View style={{ flex: 1, justifyContent: 'center' }}>

                    <View style={styles.datePickerMViewStyle}>
                        <View style={styles.datePickerSubViewStyle}>
                            <DatePicker
                                date={selectedDate}
                                onDateChange={(date) => set_selectedDate(date)}
                                mode={"date"}
                                textColor={'black'}
                                maximumDate={new Date()}
                                style={styles.datePickeStyle}
                            />
                        </View>
                    </View>

                    <View>

                        <TouchableOpacity style={{ flexDirection: 'row', marginTop: wp('5%') }} onPress={() => set_isUnknown(!isUnknown)}>
                            <ImageBackground source={isUnknown ? require("../../../../assets/images/otherImages/svg/radioBtnGreen.svg") : require("../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")}
                                style={styles.unkImgStyle} resizeMode='contain'></ImageBackground>
                            <Text style={[CommonStyles.headerTextStyle, { marginLeft: wp('2%') }]}>{"Approximate"}</Text>
                        </TouchableOpacity>

                    </View>

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

export default PetAgeComponent;

const styles = StyleSheet.create({

    datePickerMViewStyle: {
        alignSelf: 'center',
        borderRadius: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 1,
    },

    datePickerSubViewStyle: {
        width: wp('80%'),
        height: hp('30%'),
        alignSelf: 'center',
        backgroundColor: '#f9f9f9',
        alignItems: 'center',
        justifyContent: 'center',
    },

    datePickeStyle: {
        backgroundColor: 'white',
        width: wp('70%'),
        height: hp('25%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
    },

    unkImgStyle: {
        width: wp("8%"),
        aspectRatio: 1,
    }

});