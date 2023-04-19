import React, { useState, useEffect } from 'react';
import {StyleSheet,Text,TouchableOpacity, View,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

const HeaderComponent = ({navigation, route,isChatEnable,isTImerEnable,isSettingsEnable,isBackBtnEnable,title,isTitleHeaderEnable,moduleName,headerColor,...props }) => {

    useEffect (() => {
    },[]);

    const chatBtnAction = () => {
        props.chatBtnAction();
    }

    const timerBtnAction = () => {
        props.timerBtnAction();
    }

    const settingsBtnAction = () => {
        props.settingsBtnAction();
    }

    const backBtnAction = () => {
        props.backBtnAction();
    }

    return (

        <View style={{flex:1,backgroundColor:headerColor}}>
            <View style={[styles.headerView]}>
                <View style={{flexDirection:'row', bottom:5, position:'absolute'}}>

                    {isSettingsEnable ? <View style={{justifyContent:'center',marginLeft:wp('2%')}}>
                        <TouchableOpacity onPress = {() => settingsBtnAction()}>
                            <Image source={require("../../../assets/images/sideMenuImages/svg/menuMainImg.svg")} style={{flex:1,marginLeft: wp("2%"),marginRight: wp("2%"),width:wp('6%'),height:wp('6%')}}/>
                        </TouchableOpacity>
                    </View> : null}

                    <View style={{justifyContent:'center'}}>
                        <TouchableOpacity onPress = {() => backBtnAction()} style={{flexDirection:'row',alignItems:'center',}} disabled = {isBackBtnEnable ? false : true}>
                            {isBackBtnEnable ? <Image source={require("../../../assets/images/otherImages/svg/backButtonImg.svg")} style={styles.backBtnEnableStyle}/> : null}
                            <Image source={require("../../../assets/images/otherImages/svg/headerPetIcon.svg")} style={{marginLeft: isBackBtnEnable ? wp("2%") : wp("3%"),marginRight: wp("2%"), width:wp('8%'),aspectRatio:1,resizeMode:'contain'}}/>

                        </TouchableOpacity>
                    </View>

                    {isTitleHeaderEnable ? <View style={[styles.headerSelectionView]}><Text style={[styles.titleStyle]}>{title}</Text></View> : null}

                    <View style={{flex:1.5,justifyContent:'center',alignItems:'center',}}>
                    
                    {<View style={{flexDirection:'row',}}>

                        {isTImerEnable ? <TouchableOpacity onPress = {() => timerBtnAction()}>
                            <Image source={require("../../../assets/images/chatImages/minimizeChat.svg")} style={{marginRight: wp("2%"),width:wp('6%'),height:wp('6%')}}/>
                        </TouchableOpacity> : null}

                        {isChatEnable ? <TouchableOpacity onPress = {() => chatBtnAction()}>
                            <Image source={require("../../../assets/images/chatImages/closeChat.svg")} style={{marginLeft: wp("3%"), marginRight: wp("3%"),width:wp('6%'),height:wp('6%')}}/>
                        </TouchableOpacity> : null}

                    </View>}
                    
                    </View>

                </View>
            </View>
            {moduleName === 'firstTimeUser' ? null : <View style={[styles.separatorViewStyle,{backgroundColor: '#dedede'}]}></View>}
        </View>

        
    );
};

export default HeaderComponent;

const styles = StyleSheet.create({

    headerView : {
        justifyContent:'center',
        flex:1,
    },

    headerSelectionView : {
        flex:6,
        minHeight:hp('4%'),
        flexDirection:'row',
        alignItems:'center',
    },

    backBtnDisableStyle : {
        marginLeft: wp("2%"),
        width:wp('8%'),
        height:wp('8%'),
        resizeMode:'contain'
    },

    backBtnEnableStyle : {
        marginLeft: wp("2%"),
        width:wp('6%'),
        height:wp('6%'),
        resizeMode:'contain',
        
    },

    titleStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
        textAlign:'center',
        marginLeft: wp("2%"),
        
    },

    separatorViewStyle : {
        height:hp('0.1%'),
        width:wp('100%'),
         bottom:0
    }

});