import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ImageBackground, TouchableOpacity, BackHandler, FlatList } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inPetTypeScreen;
let dog = require("./../../../../assets/images/otherImages/svg/sobDogIcon.svg");
let cat = require("./../../../../assets/images/otherImages/svg/catPet.svg");

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const PetTypeComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [petType, set_petType] = useState(undefined);
    const [sobJson, set_sobJson] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);
    const [speciesId, set_speciesId] = useState(false);
    const [speciesArray, set_speciesArray] = useState([]);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petType);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petType, "User in SOB Pet Specie type selection Screen", '');
            getSpecies();
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

    const initialSessionStart = async () => {
        trace_inPetTypeScreen = await perf().startTrace('t_inSOBPetTypeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetTypeScreen.stop();
    };

    const getSOBDetails = async () => {
        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
            set_petName(sJson.petName);
            if (sJson.speciesId) {
                set_isBtnEnable(true);
                set_selectedIndex(sJson.speciesId === 1 ? 0 : 1);
                set_speciesId(sJson.speciesId);
                set_petType(sJson.speciesName);
            }
        }
    };

    const getSpecies = async () => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN)
        set_isLoading(true);
        fetch(EnvironmentJava.uri + "pets/getPetSpecies",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                    "ClientToken": token
                },
            }
        ).then((response) => response.json()).then(async (data) => {
            set_isLoading(false);
            if (data && data.errors && data.errors.length && data.errors[0].code === 'WEARABLES_TKN_003') {
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }
            if (data.status.success) {
                set_speciesArray(data.response.species);
                getSOBDetails();
            } else {
            }


        }).catch((error) => {
            set_isLoading(false);
        });
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const nextButtonAction = async () => {

        let sobJson1 = {
            breedId: sobJson ? sobJson.breedId : '',
            breedName: sobJson ? sobJson.breedName : '',
            deviceNo: sobJson ? sobJson.deviceNo : '',
            deviceType: sobJson ? sobJson.deviceType : '',
            gender: sobJson ? sobJson.gender : '',
            isNeutered: sobJson ? sobJson.isNeutered : '',
            petAge: sobJson ? sobJson.petAge : '',
            knownAge: sobJson ? sobJson.knownAge : '',
            petName: sobJson ? sobJson.petName : '',
            weight: sobJson ? sobJson.weight : '',
            weightType: sobJson ? sobJson.weightType : '',
            speciesId: speciesId,
            speciesName: petType,
            eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
        }
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petType_submit, firebaseHelper.screen_SOB_petType, "User Selected Type of the pet : " + petType, 'Species Id : ' + speciesId);
        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
        navigation.navigate('PetGenderComponent');
    };

    const backBtnAction = () => {
        navigation.navigate('PetNameComponent');
    };

    const selectGenderAction = (index, item) => {
        set_isBtnEnable(true);
        set_selectedIndex(index);
        set_petType(item.speciesName);
        set_speciesId(item.speciesId);

    };

    const renderItem = ({ item, index }) => {
        return (

            <TouchableOpacity onPress={() => selectGenderAction(index, item)}>
                <View style={selectedIndex === index ? [styles.activityBckView] : [styles.unActivityBckView]}>

                    <View style={styles.imgBckViewStyle}>
                        <ImageBackground
                            source={item.speciesName === 'Canine' ? dog : cat}
                            style={styles.petImgStyle}
                            resizeMode='contain'
                        >
                        </ImageBackground>
                    </View>

                    <Text style={[styles.name]}>{item.speciesName === 'Canine' ? 'Dog' : "Cat"}</Text>
                </View>
            </TouchableOpacity>
        );
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
                    <Text style={CommonStyles.headerTextStyle}>{'What kind of pet is '}</Text>
                   {petName && petName !== ""  ? <Text style={CommonStyles.headerTextStyle}>{petName + '?'}</Text> : null}

                </View>

                <View style={{ marginTop: hp('5%') }}>
                    <FlatList
                        data={speciesArray}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => "" + index}
                        numColumns={2}
                    />
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
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={'Please wait..'} isButtonEnable={false} /> : null}
        </View>
    );
}

export default PetTypeComponent;

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