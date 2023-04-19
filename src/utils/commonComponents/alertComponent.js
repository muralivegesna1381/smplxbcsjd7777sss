import { tsLiteralType } from '@babel/types';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Keyboard } from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const AlertComponent = ({ navigation, route, header, message, isLeftBtnEnable, isRightBtnEnable, leftBtnTilte, rightBtnTilte, ...props }) => {

    useEffect(() => {
        Keyboard.dismiss();
    }, [header, message, isLeftBtnEnable, isRightBtnEnable, leftBtnTilte, rightBtnTilte]);

    const popUpLeftBtnAction = () => {
        props.popUpLeftBtnAction();
    }

    const popUpRightBtnAction = () => {
        props.popUpRightBtnAction(false);
    }

    return (

        <View style={styles.componentStyle}>

            <View style={styles.popUpViewStyle}>

                <View style={styles.headerViewStyle}>
                    <Text style={styles.headerTextColor}>{header}</Text>
                </View>

                <View style={styles.msgViewStyle}>
                    <Text style={styles.msgTextColor}>{message}</Text>

                </View>

                <View style={[styles.btnsViewStyle]}>
                    {isLeftBtnEnable ? <TouchableOpacity onPress={() => popUpLeftBtnAction()} style={isLeftBtnEnable && isRightBtnEnable ? [styles.btnLeftStyle] : [styles.singleBtnStyle]}>
                        <Text style={styles.leftBtnTextColor}>{leftBtnTilte}</Text>
                    </TouchableOpacity> : null}

                    {isRightBtnEnable ? <TouchableOpacity onPress={() => popUpRightBtnAction()} style={isLeftBtnEnable && isRightBtnEnable ? [styles.btnRightStyle] : [styles.singleBtnStyle]}>
                        <Text style={styles.rightBtnTextColor}>{rightBtnTilte}</Text>
                    </TouchableOpacity> : null}
                </View>

            </View>
        </View>


    );
};

export default AlertComponent;

const styles = StyleSheet.create({
    
    componentStyle: {
        width: wp('100%'),
        height: hp('100%'),
        justifyContent: "center",
        alignItems: "center",
    },

    popUpViewStyle: {
        width: wp('80%'),
        minHeight: hp('20%'),
        backgroundColor: 'white',
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5,
        justifyContent: 'center',
        alignItems: "center",

    },

    headerViewStyle: {
        width: wp('85%'),
        height: hp('6%'),
        justifyContent: 'center',
        marginTop: wp('5%'),

    },

    msgViewStyle: {
        width: wp('85%'),
        justifyContent: 'center',

    },

    btnRightStyle: {
        flex: 1,
        height: wp('10%'),
        backgroundColor: '#6ac100',
        justifyContent: 'center',
        alignItems: "center",
        borderRadius: 5,
        marginRight: wp('5%'),
        marginLeft: wp('2%')
    },

    btnLeftStyle: {
        flex: 1,
        height: wp('10%'),
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: "center",
        borderRadius: 5,
        marginRight: wp('2%'),
        marginLeft: wp('5%'),
        borderColor: 'blue',
        borderWidth: 0.5
    },

    singleBtnStyle: {
        width: wp('70%'),
        height: wp('10%'),
        backgroundColor: '#6ac100',
        justifyContent: 'center',
        alignItems: "center",
        borderRadius: 5,
    },

    btnsViewStyle: {
        width: wp('80%'),
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: wp('4%'),
        marginBottom: wp('5%'),
        alignItems: 'center',
    },

    rightBtnTextColor: {
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
        color: 'white',
    },

    leftBtnTextColor: {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'blue',
    },

    headerTextColor: {
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
        color: 'black',
        marginLeft: wp('6%'),

    },

    msgTextColor: {
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleLight,
        color: 'black',
        marginLeft: wp('6%'),
        marginRight: wp('6%'),

    },

});