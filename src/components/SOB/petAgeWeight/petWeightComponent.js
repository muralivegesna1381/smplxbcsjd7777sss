import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inPetWeightScreen;

const PetWeightComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [sobJson, set_sobJson] = useState(undefined);
    const [weightType, set_weightType] = useState('lbs');
    const [weight, set_weight] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [kgArray, set_kgArray] = useState([]);
    const [lbsArray, set_lbsArray] = useState([]);
    const [btnValue, set_btnValue] = useState(0);
    const [actualValue, set_actualValue] = useState(0);
    const [actualDecimalValue, set_actualDecimalValue] = useState(0);
    const [defaultIndex, set_defaultIndex] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [showPicker, set_showPicker] = useState(false);

    React.useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart(); 
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_petWeight);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_petWeight, "User in SOB Pet Weight selection Screen", '');    
            getSOBDetails();     
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            initialSessionStop();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if (route.params?.sobJson) {
            set_sobJson(route.params?.sobJson);
            set_petName(route.params?.sobJson.petName);
        }
        set_kgArray(range(0, 114));
        set_lbsArray(range(0, 256));

    }, [route.params?.sobJson]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inPetWeightScreen = await perf().startTrace('t_inSOBPetWeightSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inPetWeightScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
            set_petName(sJson.petName);
            if (sJson.weight && sJson.weightType) {
                var array = sJson.weight.split(/\.(?=[^\.]+$)/);
                set_isBtnEnable(true);
                set_actualValue(array[0]);
                set_actualDecimalValue(array[1]);
                if (sJson.weightType === 'lbs') {
                    set_weightType('lbs');
                    set_btnValue(0);
                } else {
                    set_weightType('Kgs');
                    set_btnValue(1);
                }
                setTimeout(() => {
                    set_showPicker(true);
                }, 300)
            } else {
                set_showPicker(true);
            }
        }
    };

    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
    }

    const nextButtonAction = async () => {

        let actValue = actualValue ? actualValue : 0;
        let deciValue = actualDecimalValue ? actualDecimalValue : 0;

        let sobJson1 = {
            breedId: sobJson ? sobJson.breedId : '',
            breedName: sobJson ? sobJson.breedName : '',
            deviceNo: sobJson ? sobJson.deviceNo : '',
            deviceType: sobJson ? sobJson.deviceType : '',
            gender: sobJson ? sobJson.gender : '',
            isNeutered: sobJson ? sobJson.isNeutered : '',
            petAge: sobJson ? sobJson.petAge : '',
            petName: sobJson ? sobJson.petName : '',
            knownAge: sobJson ? sobJson.knownAge : '',
            weight: actValue + '.' + deciValue,
            weightType: weightType,
            speciesId: sobJson ? sobJson.speciesId : '',
            speciesName: sobJson ? sobJson.speciesName : '',
            eatTimeArray: sobJson ? sobJson.eatTimeArray : [],
        }

        await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
        firebaseHelper.logEvent(firebaseHelper.event_SOB_petWeight_submit_button, firebaseHelper.screen_SOB_petWeight, "User selected the Weight", 'Weight : ' + actValue + '.' + deciValue + ' ' + weightType);

        navigation.navigate('PetFeedingPreferencesComponentUI');
    };

    const backBtnAction = () => {
        navigation.navigate('PetAgeComponent');
    };

    const setWeight = (aData, dData) => {
        if (aData) {
            set_actualValue(aData);
        } else {
            set_actualValue(0);
        }

        if (dData) {
            set_actualDecimalValue(dData);
        } else {
            set_actualDecimalValue(0);
        }

        if ((aData && aData > 0) || (dData && dData > 0)) {
            set_isBtnEnable(true);
            set_weight(aData + '.' + dData);
        } else {
            set_isBtnEnable(false);
        }


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

            <View style={{ width: wp('80%'), height: hp('70%'), alignSelf: 'center', marginTop: hp('8%') }}>

                <Text style={CommonStyles.headerTextStyle}>{"What is " + petName + "'s" + " weight?"}</Text>

                <View style={{ width: wp('80%'), marginTop: hp('5%'), alignItems: 'center' }}>
                    <View style={styles.tabViewStyle}>

                        <TouchableOpacity style={btnValue === 0 ? [styles.tabButtonStyle] : [styles.tabButtonDisabledStyle, { borderLeftWidth: 1 }]} onPress={() => { set_btnValue(0), set_defaultIndex(0), set_weightType('lbs') }}>
                            <Text style={btnValue === 0 ? [styles.btnTextStyle] : [styles.btnDisableTextStyle]}>{'Lbs'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={btnValue === 1 ? [styles.tabButtonStyle,] : [styles.tabButtonDisabledStyle, { borderRightWidth: 1 }]} onPress={() => { set_btnValue(1), set_defaultIndex(0), set_weightType('Kgs') }}>
                            <Text style={btnValue === 1 ? [styles.btnTextStyle] : [styles.btnDisableTextStyle]}>{'Kg'}</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: wp('80%'), }}>

                        <View style={{ width: wp('39%'), height: hp('22%') }}>
                            {showPicker ? <ScrollPicker
                                dataSource={btnValue === 1 ? kgArray : lbsArray}
                                selectedIndex={actualValue}
                                wrapperHeight={190}
                                // wrapperWidth={100}
                                wrapperColor='white'
                                wrapperBackground={'yellow'}
                                itemHeight={60}
                                highlightColor='green'
                                highlightBorderWidth={1}
                                // renderItem={(data, index) => {renderItemNumber(data,index)}}
                                onValueChange={(data, selectedIndex) => {
                                    setWeight(data, actualDecimalValue)
                                }}
                            /> : null}
                        </View>

                        <View style={{ width: wp('39%'), height: hp('22%') }}>
                            {showPicker ? <ScrollPicker
                                dataSource={['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']}
                                selectedIndex={actualDecimalValue}
                                wrapperHeight={190}
                                // wrapperWidth={100}
                                wrapperColor='white'
                                itemHeight={60}
                                highlightColor='blue'
                                highlightBorderWidth={1}
                                // renderItem={(data, index) => {renderItemNumber(data,index)}}
                                onValueChange={(data, selectedIndex) => {
                                    setWeight(actualValue, data)
                                }}
                            /> : null}
                        </View>
                    </View>

                    <View>
                        <Text style={[styles.btnTextStyle, { color: 'black' }]}>{actualValue + '.' + actualDecimalValue + ' ' + weightType}</Text>
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

export default PetWeightComponent;

const styles = StyleSheet.create({

    tabViewStyle: {
        height: hp("6%"),
        width: wp("80%"),
        flexDirection: 'row',
        marginBottom: hp("2%"),
    },

    tabButtonStyle: {
        height: hp("5%"),
        width: wp("40%"),
        backgroundColor: '#CCE8B0',
        borderRadius: 5,
        borderColor: '#6BC105',
        borderWidth: 1,
        justifyContent: 'center'
    },

    tabButtonDisabledStyle: {
        height: hp("5%"),
        width: wp("40%"),
        backgroundColor: 'white',
        borderRadius: 5,
        borderColor: '#EAEAEA',
        borderBottomWidth: 1,
        borderTopWidth: 1,
        justifyContent: 'center'
    },

    btnTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: "#6BC105",
        textAlign: 'center',
    },

    btnDisableTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: "black",
        textAlign: 'center',
    }

});