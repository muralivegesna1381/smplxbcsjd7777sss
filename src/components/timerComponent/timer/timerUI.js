import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';

const  TimerUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopLeftBtnEnable, set_isPopLeftBtnEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_isPopLeftBtnEnable(props.isPopLeftBtnEnable);
        set_isLoading(props.isLoading);
    }, [props.isPopUp,props.popUpMessage,props.isPopLeftBtnEnable,props.isLoading]);

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const goBtnAction = () => {
        
        props.goBtnAction();

    }

    const stopBtnAction = () => {
        props.stopBtnAction();

    }

    const pauseBtnAction = (btnStateValue) => {
        props.pauseBtnAction(!props.isTimerPaused);

    }

    const timerLogsBtnAction = () => {
        props.timerLogsBtnAction();

    }

    const minmizeBtnAction = () => {
        props.minmizeBtnAction();

    }

    const popOkBtnAction = () => {
        props.popOkBtnAction(popUpMessage);
    }

    const popCancelBtnAction = () => {
        props.popCancelBtnAction('No');
    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Timer'}
                    moduleName = {''}
                    // headerColor = {'#2c2c2c'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={styles.backViewStyle}>
                
                <View style={styles.timerStyle}>
                    <View style={styles.timerTextViewStyle}>

                        <Text style={styles.timerTextStyle}>{props.hours}</Text>
                        <Text style={styles.timerTextStyle}>{' : '}</Text>
                        <Text style={styles.timerTextStyle}>{props.minutes}</Text>
                        <Text style={styles.timerTextStyle}>{' : '}</Text>
                        <Text style={styles.timerTextStyle}>{props.seconds}</Text>

                    </View>

                    <View style={{width:wp('100%'),height:hp('14%')}}>

                        <Image source={require("../../../../assets/images/timerImages/svg/timeranimation.svg")} style={styles.timerSpreadStyle}/>

                    </View>
                </View>

                <View style={styles.timerBottomStyle}>
                    {!props.isTimerStarted && !props.isTimerPaused ? <View style={{flexDirection:'row'}}>

                        <View style={[styles.goBtnViewStyle,{marginRight:hp('1%')}]}>
                            <TouchableOpacity style={[styles.goBtnViewStyle,{backgroundColor:'#18cfac'}]} onPress={() => {timerLogsBtnAction()}}>
                                <Text style={[styles.btnTextStyle,{color:"white"}]}>{'TIMER'}</Text>
                                <Text style={[styles.btnTextStyle,{color:"white"}]}>{'LOGS'}</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={[styles.goBtnViewStyle,{marginLeft:hp('1%')}]}>

                            <TouchableOpacity style={styles.goBtnViewStyle} onPress={() => {goBtnAction()}}>
                                <Text style={[styles.timerTextStyle,{color:"white"}]}>{'GO'}</Text>
                            </TouchableOpacity>

                        </View> 

                    </View>
                    : 
                    <View>

                        <View style={styles.btnsSuperViewStyle}>
                            <View style={[styles.btnsBckStyle]}>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#c91010'}]} onPress={() => {stopBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'STOP'}</Text>
                                </TouchableOpacity>
                                
                            </View>

                            <View style={styles.btnsBckStyle}>
                                <TouchableOpacity style={[styles.btnsBckStyle]} onPress={() => {pauseBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{!props.isTimerPaused ? 'PAUSE' : 'RESUME'}</Text>
                                </TouchableOpacity>
                                
                            </View>
                        
                        </View>

                        <View style={styles.btnsSuperViewStyle}>
                            <View style={styles.btnsBckStyle}>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#4a585f'}]} onPress={() => {minmizeBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'MINIMIZE'}</Text>
                                </TouchableOpacity>
                                
                            </View>

                            <View style={styles.btnsBckStyle}>
                                <TouchableOpacity style={[styles.btnsBckStyle,{backgroundColor:'#18cfac'}]} onPress={() => {timerLogsBtnAction()}}>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'TIMER'}</Text>
                                    <Text style={[styles.btnTextStyle,{color:"white"}]}>{'LOGS'}</Text>
                                </TouchableOpacity>
                                
                            </View>
                        
                        </View>

                    </View>}

                </View>
                
            </View> 

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {isPopLeftBtnEnable}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'YES'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null} 
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default TimerUI;

  const styles = StyleSheet.create({
    
    mainComponentStyle : {
        flex:1,  
    },

    backViewStyle : {
        flex:1,
        alignItems:'center',
    },

    timerStyle : {
        width : wp('70%'),
        height : hp('30%'),
        justifyContent:'center',
        alignItems:'center',
    },

    timerBottomStyle : {
        width : wp('70%'),
        height : hp('50%'),
        justifyContent:'center',
        alignItems:'center',
        position:'absolute',
        bottom:0,
    },

    timerTextViewStyle : {
        flexDirection:'row',
        justifyContent:'center'
    },

    timerTextStyle : {
        fontSize: fonts.fontXXXXXLarge,
        ...CommonStyles.textStyleExtraBold,
        color: '#0d00c1', 
        marginBottom:wp('1%'),
        textAlign:'center'
    },

    goBtnViewStyle:{
        width : wp('30%'),
        aspectRatio:1,
        backgroundColor:'#6ac100',
        borderRadius:wp('15%'),
        justifyContent:'center',
        alignItems:'center',
    },

    btnsSuperViewStyle : {
        flexDirection:'row',
        width : wp('70%'),
        justifyContent:'center',

    },

    btnsBckStyle : {
        width : wp('25%'),
        aspectRatio:1,
        backgroundColor:'#6ac100',
        borderRadius:wp('15%'),
        justifyContent:'center',
        alignItems:'center',
        margin:wp('5%'),
    },

    btnTextStyle : {
        fontSize: fonts.fontLarge,
        ...CommonStyles.textStyleExtraBold,
        color: '#6ac100', 
        textAlign:'center'
    },

    timerSpreadStyle : {
        width:wp('100%'),
        marginTop:wp('12%'),
        resizeMode:'contain'
    }

  });