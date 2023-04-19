import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";

let wifiImg = require('./../../../../assets/images/sensorImages/svg/wifiGreenImg.svg');
let editImg = require('./../../../../assets/images/sensorImages/svg/sensorEditIcon.svg');
let deleteImg = require('./../../../../assets/images/sensorImages/svg/sensorDeleteIcon.svg');

const WifiListHPN1UI = ({ route, ...props }) => {

    const [congiguredWIFIArray, set_congiguredWIFIArray] = useState(undefined);
    const [addBtnEnable, set_addBtnEnable] = useState(undefined);
    const [isLeftBtnEnable,set_isLeftBtnEnable] = useState(undefined);

    useEffect(() => {
        set_congiguredWIFIArray(props.congiguredWIFIArray);
        set_addBtnEnable(props.addBtnEnable);
        set_isLeftBtnEnable(props.isLeftBtnEnable)
    }, [props.congiguredWIFIArray,props.addBtnEnable,props.isLeftBtnEnable]);

    useEffect(() => {
    }, [props.loaderText,props.isLoading,props.btnTitle]);

    useEffect(() => {

    }, [props.isPopUp,props.popupMsg,props.popupAlert,props.popupLeftBtnEnable,props.popupRightBtnTitle,props.popupLeftBtnTitle]);

    const nextButtonAction = () => {
        props.nextButtonAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const editDeleteAction = (value,item ) => {
        props.editDeleteAction(value, item);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const rightBtnActions = () => {
        props.rightBtnActions();
    }

    const renderItem = ({ item, index }) => {
        return (
            <View>

                <View style={[styles.cellBckView]}>

                    <Image source={wifiImg} style={[styles.imageStyle,{flex:0.3,}]}/>
                     <Text style={[styles.headerTextStyle,{flex:1.5,}]}>{item.ssidName}</Text>

                   {congiguredWIFIArray && congiguredWIFIArray.length > 1 ? <TouchableOpacity style ={{flex:0.4,alignItems:'center'}} onPress={() => editDeleteAction('deleteWifi',item)}>
                        <Image source={deleteImg} style={[styles.imageStyle1]}/>
                    </TouchableOpacity> : null}

                    </View>

            </View>
        );
    };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Configured Wi-Fi list'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ height: addBtnEnable ? hp('85%') : hp('90%'), width: wp('90%'), alignSelf: 'center' , }}>

                <View style={{ alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ marginTop: hp('3%'),marginBottom: addBtnEnable ? hp('10%') : hp('1%') }}>
                       <FlatList
                            data={congiguredWIFIArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        /> 
                    </View>
                </View>

            </View>

            {props.btnTitle || addBtnEnable ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    leftBtnTitle = {props.btnTitle}
                    isLeftBtnEnable = {isLeftBtnEnable}
                    rigthBtnState = {true}                   
                    isRightBtnEnable = {addBtnEnable}
                    rightBtnTitle= {'Add another SSID?'}
                    leftButtonAction = {async () => nextButtonAction()}
                    rightButtonAction = {async () => rightBtnActions()}

                ></BottomComponent>
            </View> : null}

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={props.popupAlert}
                    message={props.popupMsg}
                    isLeftBtnEnable={props.popupLeftBtnEnable}
                    isRightBtnEnable={true}
                    leftBtnTilte={props.popupLeftBtnTitle}
                    rightBtnTilte={props.popupRightBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={false} loaderText={props.loaderText} isButtonEnable={false} /> : null}

        </View>
    );
}

export default WifiListHPN1UI;

const styles = StyleSheet.create({

    headerTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color: 'black',
        marginLeft: hp("2%"),
    },

    cellBckView: {
        width: wp('85%'),
        height: hp('10%'),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        flexDirection: 'row'
    },

    imageStyle: {
        height: 30,
        width: 30,
        resizeMode: "contain",
        marginLeft: hp("2%"),
        overflow:'hidden'
    },

    imageStyle1: {
        width: wp("6%"),
        aspectRatio:1,
        resizeMode: "contain",
        overflow:'hidden'
    },

});