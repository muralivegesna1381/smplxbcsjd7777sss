import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ImageBackground } from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inSensorTypeScreen;

const SensorTypeComponent = ({ navigation, route, ...props }) => {

    const [sensorType, set_sensorType] = useState(undefined);
    const [isActionSelected, set_isActionSelected] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [deviceActionType, set_deviceActionType] = useState(undefined);
    const [sobJson, set_sobJson] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [petName, set_petName] = useState('');
    const [isFromType, set_isFromType] = useState(undefined);

    useEffect(() => {

        if (route.params?.value) {
            set_isFromType(route.params?.value);
        }

    }, [route.params?.value,]);

    React.useEffect(() => {

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_SOB_sensorType);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_SOB_sensorType, "User in SOB Sensor type selection Screen", '');
            getSOBDetails();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
        };

    }, []);

    const initialSessionStart = async () => {
        trace_inSensorTypeScreen = await perf().startTrace('t_inSOBSensorTypeSelectionScreen');
    };

    const initialSessionStop = async () => {
        await trace_inSensorTypeScreen.stop();
    };

    const getSOBDetails = async () => {

        let sJson = await DataStorageLocal.getDataFromAsync(Constant.ONBOARDING_OBJ);
        sJson = JSON.parse(sJson);
        if (sJson) {
            set_sobJson(sJson);
            set_petName(sJson.petName)
            if (sJson.deviceType) {

                set_isActionSelected(true);
                set_deviceActionType(sJson.deviceType);
                set_sensorType(sJson.deviceType);
                set_selectedIndex(sJson.deviceType === 'CMAS' ? 1 : (sJson.deviceType === 'HPN1' ? 2 : 0));

            }
        }
    };

    const nextButtonAction = async () => {

        if (isFromType === 'AddDevice' || isFromType === 'Devices') {
            await DataStorageLocal.removeDataFromAsync(Constant.ONBOARDING_OBJ);
            navigation.navigate('DeviceValidationComponent', { value: isFromType, sensorType: sensorType });
        } else {

            let sobJson1 = {
                breedId: sobJson ? sobJson.breedId : '',
                breedName: sobJson ? sobJson.breedName : '',
                deviceNo: sobJson ? sobJson.deviceNo : '',
                deviceType: sensorType,
                gender: sobJson ? sobJson.gender : '',
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
            await DataStorageLocal.saveDataToAsync(Constant.ONBOARDING_OBJ, JSON.stringify(sobJson1));
            firebaseHelper.logEvent(firebaseHelper.event_SOB_sensorType_submit, firebaseHelper.screen_SOB_sensorType, "User selected the Sensor Type", 'Device Type : ' + sensorType);
            navigation.navigate('DeviceValidationComponent');
        }


    };

    const backBtnAction = () => {

        if (isFromType === 'AddDevice') {
            navigation.navigate('DashBoardService');
        } else if (isFromType === 'Devices') {
            navigation.navigate('MultipleDevicesComponent');
        } else {
            navigation.navigate('PetFeedingPreferencesComponentUI');
        }

    };

    const selectSensorAction = (sType, index) => {
        set_selectedIndex(index);
        set_isActionSelected(true);
        set_sensorType(sType);

    }

    return (
        <View style={[styles.mainComponentStyle]}>
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

            <View style={{ alignSelf: 'center', justifyContent: 'space-between' }}>

                <View style={{ width: wp('80%'), marginTop: hp('8%') }}>
                    <Text style={CommonStyles.headerTextStyle}>{'Please select the sensor type ' + petName + " will be wearing:"}</Text>
                </View>

                <View style={{ flexDirection: 'row', marginTop: hp('3%') }}>

                    <TouchableOpacity onPress={() => selectSensorAction('AGL2', 0)}>
                        <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/sensorImages/svg/sensorTypeLogo.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'AGL 2'}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => selectSensorAction('CMAS', 1)}>
                        <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/sensorImages/svg/sensorTypeLogo.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'CMAS'}</Text>
                        </View>
                    </TouchableOpacity>

                </View>

                <View style={{ width: wp('35%'), }}>
                    <TouchableOpacity onPress={() => selectSensorAction('HPN1', 2)}>
                        <View style={selectedIndex === 2 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/sensorImages/svg/sensorIcon.svg")}
                                    style={[styles.petImgStyle, { width: wp("15%"), }]}
                                    resizeMode='contain'
                                >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'HPN1'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={isActionSelected}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

        </View>
    );
}

export default SensorTypeComponent;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'

    },

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
        width: wp("10%"),
        aspectRatio: 1,
        resizeMode: 'contain'
    },

    imgBckViewStyle: {
        borderRadius: 5,
        borderColor: '#5C6D80',
        borderWidth: 1,
        width: hp("6%"),
        height: hp("6%"),
        alignItems: 'center',
        justifyContent: 'center'

    },

});