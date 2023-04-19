import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import ImageSequence from 'react-native-image-sequence';

let rightArrowImg = require('./../../../../assets/images/otherImages/svg/rightArrowLightImg.svg');
let downArrowImg = require('./../../../../assets/images/otherImages/svg/downArrowGrey.svg');
let wifiImg = require('./../../../../assets/images/sensorImages/svg/wifiGreenImg.svg');
let wifiImgPlus = require('./../../../../assets/images/sensorImages/png/plusWifi.png');
let hideImg = require('./../../../../assets/images/otherImages/png/hide-password.png');
let openImg = require('./../../../../assets/images/otherImages/png/show-password.png');

const SensorWiFiListUI = ({ navigation, route, ...props }) => {

    const [wifiList, set_wifiList] = useState([]);
    const [wifiPsd, set_wifiPsd] = useState(undefined);
    const [expandedIndex, set_expandedIndex] = useState(-1);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderText, set_loaderText] = useState(undefined);
    const [btnName, set_btnName] = useState(undefined);
    const [isBckBtnEnable, set_isBckBtnEnable] = useState(true);
    const [isHidePassword, set_isHidePassword] = useState(true);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [fetchedList, set_fetchedList] = useState(0);
    const [totalList, set_totalList] = useState(0);
    const [sensorType, set_sensorType] = useState(undefined);
    const images = [
        require("./../../../../assets/images/aniImgs/wifi.svg"),
        require("./../../../../assets/images/aniImgs/wifi1.svg"),
        require("./../../../../assets/images/aniImgs/wifi2.svg"),        
      ];

    var indexArray = useRef([]);

    useEffect(() => {
        let tempWifiList = [];
        tempWifiList = props.wifiList;
        if(props.sensorType){
            set_sensorType(props.sensorType);
        }
        set_wifiList(tempWifiList);
        set_defaultPetObj(props.defaultPetObj,props.sensorType);

    }, [props.wifiList, props.defaultPetObj]);

    useEffect(() => {

        set_isLoading(props.isLoading);
        set_loaderText(props.loaderText);
        set_btnName(props.btnName);

    }, [props.isLoading, props.loaderText, props.btnName]);

    useEffect(() => {

        set_fetchedList(parseInt(props.fetchedList));
        set_totalList(parseInt(props.totalList));

    }, [props.fetchedList, props.totalList]);

    useEffect(() => {
    }, [props.isPopUp, props.popUpMessage, props.popUpTitle, props.popuLeftBtnEnable, props.leftpopupBtnTitle, props.rightpopupBtnTitle]);

    const nextButtonAction = () => {

        if (btnName.includes('REFRESH NETWORK')) {

            set_wifiPsd(undefined);
            indexArray.current = []

        }
        props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

    const popCancelBtnAction = () => {
        props.popupCancelBtnAction();
    }

    const selectWifiAction = (item, index) => {
        props.writeDetailsToSensor();
    };

    const setWiFiSSIDPswd = (value, ssid) => {
        set_wifiPsd(value);
        updateSensorWIFIPSD(value, ssid);
    };

    const updateSensorWIFIPSD = (value, ssid) => {
        props.updateSensorWIFIPSD(value, ssid);
    };

    const navigateToManualNetwork = () => {
        props.navigateToManualNetwork();
    };

    const _renderItems = () => {

        if (wifiList) {

            return wifiList.map((item, index) => {

                return (
                    <>
                        <TouchableOpacity style={indexArray.current.includes(index) ? [styles.collapseHeaderExpStyle] : [styles.collapseHeaderStyle]} key={index} onPress={() => {
                            expandedIndex === index ? set_expandedIndex(-1) : set_expandedIndex(index);
                            expandedIndex === index ? null : set_wifiPsd(undefined);
                            expandedIndex === index ? null : set_isHidePassword(true);

                            if (item.wifiName !== "Add Network Manually") {
                                indexArray.current = [index];

                            } else {
                                navigateToManualNetwork();
                            }

                        }}>
                            <View style={{ justifyContent: 'center', alignItems: 'center' }}>

                            </View>
                            <View style={{ width: wp('100%'), flexDirection: "row", alignItems: 'center' }}>
                                {item && item.wifiName !== '' ? <Image source={item.wifiName === "Add Network Manually" ? wifiImgPlus : wifiImg} style={styles.imageStyle} /> : 
                                <ImageSequence
                                    images={images}
                                    framesPerSecond={2}
                                    style={{width: 30, height: 25,marginRight: hp("2%"),marginLeft: hp("2%"),marginBottom: hp("0.5%")}}
                                />}
                                {item && item.wifiName !== '' ? <Text style={[styles.wifiNameStyle]}>{item.wifiName}</Text> : <Text style={[styles.wifiNameStyle]}>{item.status}</Text>}
                                <Image source={indexArray.current.includes(index) ? downArrowImg : rightArrowImg} style={styles.nextImageStyle} />
                            </View>
                        </TouchableOpacity>

                        {indexArray.current.includes(index) ?

                            <View style={{ alignItems: 'center' }}>
                                <View style={indexArray.current.includes(index) ? [styles.collapsedBodyExpStyle] : [styles.collapsedBodyStyle]}>

                                    <View>
                                        <View style={[CommonStyles.textInputContainerStyle, { alignSelf: 'center', marginTop: hp('0%'), }]} >
                                            <TextInput style={CommonStyles.textInputStyle}
                                                underlineColorAndroid="transparent"
                                                placeholder="Password"
                                                placeholderTextColor="#7F7F81"
                                                autoCapitalize="none"
                                                maxLength={sensorType==='Sensor' ? 20 : 40}
                                                secureTextEntry={isHidePassword}
                                                // value = {getSSIDValues(item)}
                                                value={expandedIndex === index ? wifiPsd : null}
                                                onChangeText={(wifiPsd) => { setWiFiSSIDPswd(wifiPsd, item.wifiName) }}
                                            />

                                            <TouchableOpacity onPress={() => {
                                                set_isHidePassword(!isHidePassword);
                                            }}>
                                                <Image source={isHidePassword ? hideImg : openImg} style={CommonStyles.hideOpenIconStyle} />

                                            </TouchableOpacity>
                                        </View>

                                        {indexArray.current.includes(index) ? <TouchableOpacity disabled={item.wifiName && item.wifiName.length > 0 && wifiPsd && wifiPsd.length > 0 ? false : true} style={item.wifiName && item.wifiName.length > 0 && wifiPsd && wifiPsd.length > 0 ? [styles.submitBtnStyle] : [styles.submitBtnStyle, { opacity: 0.4 }]} onPress={() => selectWifiAction(item.wifiName, index)}>
                                            <Text style={styles.btnNameStyle}>{'SUBMIT'}</Text>
                                        </TouchableOpacity> : null}
                                    </View>


                                </View>
                            </View> : null}

                    </>
                )
            });
        }
    };

    return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={isBckBtnEnable}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Device Setup'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ marginTop: hp('3%'), height: hp('68%') }}>
                <KeyboardAwareScrollView>
                    {_renderItems()}
                </KeyboardAwareScrollView>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                { btnName && btnName!=='' ? <BottomComponent
                    leftBtnTitle={''}
                    rightBtnTitle={btnName}
                    isLeftBtnEnable={false}
                    rigthBtnState={true}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}

                ></BottomComponent> : <View style={{flex:1,justifyContent: 'center',alignItems: 'center'}}><Text style={styles.headerStyle}>{'Please wait..'}</Text></View>}
            </View>

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable={props.popuLeftBtnEnable}
                    isRightBtnEnable={true}
                    leftBtnTilte={props.leftpopupBtnTitle}
                    rightBtnTilte={props.rightpopupBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent showLoderBox={totalList > 0 ? 'hide' : 'show'} isLoader={true} heightLoader={'80%'} loaderText={loaderText} isButtonEnable={false} /> : null}
        </View>
    );
};

export default SensorWiFiListUI;

const styles = StyleSheet.create({

    headerStyle: {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
    },

    wifiNameStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        color: '#7F7F81',
        flex: 1.2,
    },

    submitBtnStyle: {
        height: hp('7%'),
        width: wp('80%'),
        backgroundColor: '#6BC100',
        borderRadius: 5,
        marginBottom: hp('3%'),
        marginTop: hp('2%'),
        justifyContent: 'center',
        alignItems: 'center'
    },

    btnNameStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: 'white',
    },

    collapsedBodyStyle: {
        backgroundColor: 'white',
        width: wp('90%'),
        marginBottom: hp('1%'),
        marginTop: hp('-1%'),
        minHeight: hp('8%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#EAEAEA',
        borderRadius: 5,
        borderWidth: 1,
    },

    collapseHeaderStyle: {
        marginBottom: hp('1%'),
        minHeight: hp('8%'),
        width: wp('90%'),
        backgroundColor: 'white',
        flexDirection: 'row',
        borderColor: '#EAEAEA',
        borderRadius: 5,
        borderWidth: 1,
        alignSelf: 'center',
    },

    collapseHeaderExpStyle: {
        marginBottom: hp('1%'),
        minHeight: hp('8%'),
        width: wp('90%'),
        backgroundColor: 'white',
        flexDirection: 'row',
        borderColor: '#EAEAEA',
        borderRadius: 5,
        borderWidth: 1,
        alignSelf: 'center',
        borderBottomColor: 'transparent',
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0
    },

    collapsedBodyExpStyle: {
        backgroundColor: 'white',
        width: wp('90%'),
        marginBottom: hp('1%'),
        marginTop: hp('-1%'),
        minHeight: hp('8%'),
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: '#EAEAEA',
        borderRadius: 5,
        borderWidth: 1,
        borderTopColor: 'transparent',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0
    },

    imageStyle: {
        height: 30,
        width: 30,
        resizeMode: "contain",
        marginRight: hp("2%"),
        marginLeft: hp("2%"),
        overflow: 'hidden'
    },

    nextImageStyle: {
        height: 10,
        width: 10,
        resizeMode: "contain",
        marginRight: hp("2%"),
        marginLeft: hp("2%"),
        flex: 0.6
    },

});