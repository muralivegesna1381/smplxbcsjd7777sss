import React, {useState,useEffect} from 'react';
import {StyleSheet,Text, View} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

const SensorFirmwareUI = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState();
    const [loaderText, set_loaderText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isEnoughBattery, set_isEnoughBattery] = useState(false);
    const [deviceNumber, set_deviceNumber] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [isUpdateRequired, set_isUpdateRequired] = useState(false);
    const [firmwareVersion, set_firmwareVersion] = useState(undefined);
    const [newFirmwareVersion, set_newFirmwareVersion] = useState(undefined);
    const [batteryLevel, set_batteryLevel] = useState(undefined);
    const [isTryAgain, set_isTryAgain] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpTitle(props.popUpTitle);
        set_popupRBtnTitle(props.popupRBtnTitle);
    }, [props.isPopUp,props.popUpMessage,props.popUpTitle,props.popupRBtnTitle]);

    useEffect(() => {
        set_deviceNumber(props.deviceNumber);
        set_petName(props.petName);
        set_isUpdateRequired(props.isUpdateRequired);
        set_firmwareVersion(props.firmwareVersion);
        set_newFirmwareVersion(props.newFirmwareVersion);
        set_isEnoughBattery(props.isEnoughBattery);
    }, [props.deviceNumber,props.petName,props.isUpdateRequired,props.firmwareVersion,props.newFirmwareVersion,props.isEnoughBattery]);

    useEffect(() => {
        set_isLoading(props.isLoading);
        set_loaderText(props.loaderText);
        set_batteryLevel(props.batteryLevel);
        set_isTryAgain(props.isTryAgain);       
    }, [props.isLoading,props.loaderText,props.batteryLevel,props.isTryAgain]);

    const nextButtonAction = (value) => {
        props.nextBtnAction(value);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Firmware'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>

                    <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Device Number : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{deviceNumber}</Text>

                    </View>

                    <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Pet Name : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{petName}</Text>

                    </View>

                    <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Current Firmware Version : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{firmwareVersion ? firmwareVersion : '--'}</Text>

                    </View>

                    <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Available Firmware Version : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{newFirmwareVersion ? newFirmwareVersion : '--'}</Text>

                    </View>

                    {isUpdateRequired ? <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Firmware Update Available : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{isUpdateRequired ? "Available" : "Firmware is up to date."}</Text>

                    </View> : null}

                    {batteryLevel ? <View style={[styles.cellBckView]}>
                    
                        <Text style={[styles.headerStyle,{flex:1.5,}]}>{'Battery Level : '}</Text>
                        <Text style={[styles.headerStyle,{...CommonStyles.textStyleBold,marginRight:wp('2%'),}]}>{batteryLevel  + "%" }</Text>

                    </View> : null}

                </View>

            </View>

           {isTryAgain || (isUpdateRequired && isEnoughBattery) ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {isTryAgain ? "Try Again" : "UPDATE"}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}                   
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction(isTryAgain ? "Try Again" : isUpdateRequired ? "UPDATE" : null)}

                ></BottomComponent>
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {props.isPopupLftBtnEnable}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {popupRBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {loaderText} isButtonEnable = {false} /> : null} 
        </View>
    );
};

export default SensorFirmwareUI;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    topViewStyle : {
        width:wp('100%'),
        height:hp('70%'),
        marginTop:hp('5%'),
        alignItems:'center',
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('2%'),
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
    },

    cellBckView: {
        width: wp('85%'),
        minHeight: hp('8%'),
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent:'center'
    },

});