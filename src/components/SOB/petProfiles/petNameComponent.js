import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Image, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import TextInputComponent from './../../../utils/commonComponents/textInputComponent';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inPetNameScreen;

const PetNameComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [petFirstName, set_petFirstName] = useState(undefined);
    const [petLastName, set_petLastName] = useState(undefined);
    const [deviceNo, set_deviceNo] = useState(undefined);
    const [deviceType, set_deviceType] = useState(undefined);
    const [sobJson, set_sobJson] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petName);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petName, "User in SOB Pet Name selection Screen", '');
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
        if (route.params?.deviceNumber) {
            set_deviceNo(route.params?.deviceNumber);
        }

        if (route.params?.deviceType) {
            set_deviceType(route.params?.deviceType);
        }

    }, [route.params?.deviceNumber, route.params?.deviceType]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetNameScreen = await perf().startTrace('t_inSOBPetNameScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetNameScreen.stop();
    };

    const getSOBDetails = async () => {
        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
        }
    };

    const nextButtonAction = async () => {

        let last = petLastName ? ' ' + petLastName : '';

        let sobJson1 = {
            breedId: sobJson ? sobJson.breedId : '',
            breedName: sobJson ? sobJson.breedName : '',
            deviceNo: sobJson ? sobJson.deviceNo : '',
            deviceType: sobJson ? sobJson.deviceType : '',
            gender: sobJson ? sobJson.gender : '',
            isNeutered: sobJson ? sobJson.isNeutered : '',
            petAge: sobJson ? sobJson.petAge : '',
            knownAge: sobJson ? sobJson.knownAge : '',
            petName: petFirstName + last,
            weight: sobJson ? sobJson.weight : '',
            weightType: sobJson ? sobJson.weightType : '',
            speciesId: sobJson ? sobJson.speciesId : '',
            speciesName: sobJson ? sobJson.speciesName : '',
            eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
        }
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petName_submit_btn, firebaseHelper.screen_SOB_petName, "User entered the Pet name", 'PetName : ' + petFirstName + last);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
        navigation.navigate('PetTypeComponent');
    };

    const backBtnAction = async () => {
        await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
        navigation.navigate('DashBoardService');
    };

    const validatePetName = (pFName, pLName) => {
        set_petFirstName(pFName);
        set_petLastName(pLName);
        if (pFName && pFName.length > 0) {
            set_isBtnEnable(true);
        } else {
            set_isBtnEnable(false);
        }

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

            <View style={{ width: wp('100%'), height: hp('70%'), justifyContent: 'center', alignItems: 'center' }}>
                <KeyboardAwareScrollView bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>
                    <View style={{ height: hp('60%'), marginTop: hp('8%'), }}>

                        <View style={{ width: wp('80%'), height: hp('40%') }}>
                            <Text style={CommonStyles.headerTextStyle}>{'Lets get to know'}</Text>
                            <Text style={CommonStyles.headerTextStyle}>{' your pet'}</Text>

                            <View style={{ marginTop: hp('4%') }} >

                                <TextInputComponent
                                    inputText={petFirstName}
                                    labelText={'Pet First Name*'}
                                    isEditable={true}
                                    maxLengthVal={20}
                                    autoCapitalize={'none'}
                                    setValue={(textAnswer) => {
                                        validatePetName(textAnswer, petLastName)
                                    }}
                                />

                            </View>

                            <View style={{ marginTop: hp('2%') }} >

                                <TextInputComponent
                                    inputText={petLastName}
                                    labelText={'Pet Last Name'}
                                    isEditable={true}
                                    maxLengthVal={20}
                                    autoCapitalize={'none'}
                                    setValue={(textAnswer) => {
                                        validatePetName(petFirstName, textAnswer)
                                    }}
                                />

                            </View>

                        </View>

                        <View style={{ height: hp('20%'), width: wp('80%'), alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }}>
                            <Image style={styles.dogImgStyels} source={require("./../../../../assets/images/dogImages/dogImg7.svg")} />
                            <Image style={styles.catStyels} source={require("./../../../../assets/images/dogImages/cat.svg")} />
                        </View>

                    </View>

                </KeyboardAwareScrollView>
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

export default PetNameComponent;

const styles = StyleSheet.create({

    dogImgStyels: {
        width: hp("15%"),
        height: hp('20%'),
        resizeMode: "contain",
        overflow: "hidden",
    },

    catStyels: {
        width: hp("20%"),
        height: hp('20%'),
        resizeMode: "contain",
        overflow: "hidden",
        marginTop: hp('5%'),
    }

});