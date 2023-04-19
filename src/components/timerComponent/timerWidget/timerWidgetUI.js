import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import AlertComponent from '../../../utils/commonComponents/alertComponent';

const  TimerWidgetUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [activityText, set_activityText] = useState(undefined);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_petName(props.petName);
        set_activityText(props.activityText);
    }, [props.isPopUp,props.popUpMessage,props.petName,props.activityText]);
    
    useEffect(() => {
    }, [props.isTimerPaused,props.isTimerVisible]);

    useEffect(() => {

    }, [props.isPopUp,props.popUpMessage,props.isPopLftBtn,props.popRightBtnTitle,props.poplftBtnTitle,props.popAlert]);


    const stopBtnAction = () => {
        props.stopBtnAction();

    }

    const pauseBtnAction = (value) => {
        props.pauseBtnAction(!value);

    }

    const timerLogsBtnAction = () => {
        props.timerLogsBtnAction();

    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    return (
        <>
            {props.isTimerVisible ? 
            <View style={{
                position: 'absolute',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#2E2E2E',//'#242A37',
                width: wp('100%'),
                height: hp('12%'),
                bottom: hp('45%'),
                top:hp('24%'),}}>

                <View>

                    <View style={{height: hp('3%'),alignItems: 'center',flexDirection:'row'}}>
                        <Text style={styles.petTextStyle}>{petName}</Text>
                        <Text style={styles.petTextStyle}>{' : '}</Text>
                        <Text style={styles.petTextStyle}>{activityText}</Text>
                    </View>

                    <View style={{width:wp('90%'),flexDirection:'row',}}>

                        <View style={styles.timerTextViewStyle}>

                            <Text style={styles.timerTextStyle}>{props.hours}</Text>
                            <Text style={styles.timerTextStyle}>{' : '}</Text>
                            <Text style={styles.timerTextStyle}>{props.minutes}</Text>
                            <Text style={styles.timerTextStyle}>{' : '}</Text>
                            <Text style={styles.timerTextStyle}>{props.seconds}</Text>

                        </View>

                        <View style={{flexDirection:'row',flex:1}}>
                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#c91010'}]} onPress={() => {stopBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'STOP'}</Text>
                                </TouchableOpacity>                               
                            </View>

                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle]} onPress={() => {pauseBtnAction(props.isTimerPaused)}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{!props.isTimerPaused ? 'PAUSE' : 'RESUME'}</Text>
                                </TouchableOpacity>
                            </View>

                            <View>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#18cfac'}]} onPress={() => {timerLogsBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'TIMER LOGS'}</Text>
                                </TouchableOpacity>                              
                            </View>

                        </View>

                        </View>
                        
                    </View>
                

         </View> :<View></View>}

         {props.isPopUp ? <View style={CommonStyles.customPopUpGlobalStyle}>
            <AlertComponent
                header = {props.popAlert}
                message={props.popUpMessage}
                isLeftBtnEnable = {props.isPopLftBtn}
                isRightBtnEnable = {true}
                leftBtnTilte = {props.poplftBtnTitle}
                rightBtnTilte = {props.popRightBtnTitle}
                popUpRightBtnAction = {() => popOkBtnAction()}
                popUpLeftBtnAction = {() => popCancelBtnAction()}
            />
        </View> : null}
        </>
    );
  }
  
  export default TimerWidgetUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2E2E2E',
        width: wp('100%'),
        height: hp('10%'),
        bottom: hp('45%'),
        top:hp('24%'),
    },

    timerTextViewStyle : {
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'center',
        flex:1,
        marginRight:wp('2%')
    },

    timerTextStyle : {
        fontSize: fonts.fontXXXXLarge,
        ...CommonStyles.textStyleBold,
        color: '#6ac100', 
    },

    petTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'white', 
    },

    btnsBckStyle : {
        width : wp('13%'),
        aspectRatio:1,
        backgroundColor:'#6ac100',
        borderRadius:wp('15%'),
        justifyContent:'center',
        alignItems:'center',
        margin:wp('1%'),
    },

    btnTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleExtraBold,
        color: '#6ac100', 
        textAlign:'center'
    },

  });