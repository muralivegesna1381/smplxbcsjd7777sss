import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, FlatList, ImageBackground } from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';

let failedImg = require('./../../../assets/images/otherImages/svg/failedXIcon.svg');

const ScoringImagePickerUI = ({ route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [imagePath, set_imagePath] = useState(undefined);
    const [isMediaSelection, set_isMediaSelection] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popupBtnTitle, set_popupBtnTitle] = useState(undefined);
    const [popupLftBtnEnable, set_popupLftBtnEnable] = useState(false);

    // setting the image path to UI
    useEffect(() => {
        set_imagePath(props.imagePath);
    }, [props.imagePath]);

    // Setting the values to local variables
    useEffect(() => {

        set_isLoading(props.isLoading);
        set_loaderMsg(props.loaderMsg);
        set_isMediaSelection(props.isMediaSelection);

    }, [props.isLoading, props.loaderMsg, props.isMediaSelection]);

    useEffect(() => {

        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);
        set_popupBtnTitle(props.popupBtnTitle);
        set_popupLftBtnEnable(props.popupLftBtnEnable);

    }, [props.isPopUp, props.popUpMessage, props.popUpAlert, props.popupBtnTitle, props.popupLftBtnEnable]);


    const nextButtonAction = () => {
        props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const removeImageAction = () => {
        props.removeImageAction();
    };

    const selectMediaAction = () => {
        props.selectMediaAction(!isMediaSelection);
    };

    const actionOnRow = (item) => {
        props.actionOnRow(item);
    }

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={props.title}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('80%'), height: hp('70%'), alignSelf: 'center' }}>

                <Text style={[CommonStyles.headerTextStyle, { marginTop: hp("8%"), marginBottom: hp("5%") }]}>{props.title === "Stool Scoring" ? 'Please upload your pet’s stool image' : 'Please upload the image of your pet'}</Text>
                <View style={styles.videoUIStyle}>

                    <View style={styles.mediaContainerStyle}>

                        {imagePath ? <ImageBackground source={{ uri: imagePath }} style={styles.media} imageStyle={{ borderRadius: 5 }}>

                            <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeImageAction()}>
                                <Image source={failedImg} style={styles.imageBtnStyle1} />
                            </TouchableOpacity>

                        </ImageBackground> : <ImageBackground source={require('./../../../assets/images/otherImages/svg/cameraImg.svg')} imageStyle={{ resizeMode: 'contain' }} style={styles.media}></ImageBackground>}

                    </View>

                    <TouchableOpacity style={styles.videoBtnStyle} onPress={() => selectMediaAction()}>
                        <Text style={styles.btnTextStyle}>{'UPLOAD IMAGE'}</Text>
                    </TouchableOpacity>

                </View>
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'SUBMIT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable={true}
                    rigthBtnState={imagePath ? true : false}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                    leftButtonAction={async () => backBtnAction()}
                />
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable={popupLftBtnEnable}
                    isRightBtnEnable={true}
                    leftBtnTilte={'NO'}
                    rightBtnTilte={popupBtnTitle}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popCancelBtnAction()}
                />
            </View> : null}

            {isMediaSelection ? <View style={[styles.popSearchViewStyle]}>
                <FlatList
                    // style={styles.flatcontainer}
                    data={['CAMERA', 'GALLERY', 'CANCEL']}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                            <View style={styles.flatview}>
                                <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item, index) => index}
                />

            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText={loaderMsg} isButtonEnable={false} /> : null}
        </View>
    );
}

export default ScoringImagePickerUI;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'
    },

    media: {
        width: wp('30%'),
        aspectRatio: 1,
    },

    videoUIStyle: {
        height: hp('30%'),
        width: wp('80%'),
        borderColor: '#D5D5D5',
        borderWidth: 2,
        borderRadius: 5,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center'
    },

    mediaContainerStyle: {
        height: hp('20%'),
        width: wp('80%'),
        borderColor: '#D5D5D5',
        flexDirection: "row",
        alignItems: 'center',
        justifyContent: 'center'
    },

    videoBtnStyle: {
        height: hp('5%'),
        width: wp('60%'),
        backgroundColor: '#DEEAD0',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },

    btnTextStyle: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color: '#778D5E',
    },

    flatview: {
        height: hp("8%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width: wp('90%'),
        alignItems: 'center',
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },

    popSearchViewStyle: {
        height: hp("30%"),
        width: wp("95%"),
        backgroundColor: '#DCDCDC',
        bottom: 0,
        position: 'absolute',
        alignSelf: 'center',
        borderTopRightRadius: 15,
        borderTopLeftRadius: 15,
    },

    imageBtnStyle: {
        width: wp('8%'),
        aspectRatio: 1,
        alignSelf: 'flex-end',
        marginRight: wp('-1%'),
        justifyContent: 'flex-end',
        alignItems: 'flex-end'
    },

    imageBtnStyle1: {
        width: wp('6%'),
        height: hp('6%'),
        resizeMode: 'contain'
    }

});