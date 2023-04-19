import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableWithoutFeedback, ImageBackground,ScrollView} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import { constants } from 'buffer';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  TimerActivityUI = ({route, ...props }) => {

    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [activityText, set_activityText] = useState(undefined);

    const nextButtonAction = () => {
      props.nextButtonAction(activityText);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    const selectActivityAction = (activityName,index) => {
        set_isNxtBtnEnable(true);
        set_selectedIndex(index);
        set_activityText(activityName);
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
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            
            <View style= {{height:hp('70%'), width:wp('90%'),alignSelf:'center'}}>
                <View style={{alignItems:'center',marginTop:hp('6%')}}>
                    <View style={{width:wp('80%'),minHeight:hp('6%')}}>
                        <Text style={CommonStyles.headerTextStyle}>{'Select Activity'}</Text>
                    </View>
                </View>

            <View style={{alignItems:'center',justifyContent:'space-between'}}>
                <ScrollView>
                    <View style={{flexDirection:'row'}}>

                    <TouchableWithoutFeedback  onPress={() => selectActivityAction('Running',0)}>
                        <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/timerImages/svg/running.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode = 'contain'
                                    >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Running'}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback  onPress={() => selectActivityAction('Walking',1)}>
                        <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/timerImages/svg/ta_walking.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode = 'contain'
                                    >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Walking'}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    </View>

                    <View style={{flexDirection:'row'}}>

                    <TouchableWithoutFeedback  onPress={() => selectActivityAction('Fetch',2)}>
                        <View style={selectedIndex === 2 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/timerImages/svg/ta_playing.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode = 'contain'
                                    >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Fetch'}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <TouchableWithoutFeedback  onPress={() => selectActivityAction('Rope Tug',3)}>
                        <View style={selectedIndex === 3 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                            <View style={styles.imgBckViewStyle}>
                                <ImageBackground
                                    source={require("./../../../../assets/images/timerImages/svg/ropeTug.svg")}
                                    style={styles.petImgStyle}
                                    resizeMode = 'contain'
                                    >
                                </ImageBackground>
                            </View>

                            <Text style={[styles.name]}>{'Rope Tug'}</Text>
                        </View>
                    </TouchableWithoutFeedback>

                    </View>

                </ScrollView>
 
            </View>


            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    isLeftBtnEnable = {true}
                    isRightBtnEnable = {true}
                    leftBtnTitle = {'BACK'}
                    rigthBtnState = {isNxtBtnEnable}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>            
         </View>
    );
  }
  
  export default TimerActivityUI;

  const styles = StyleSheet.create({

    activityBckView: {
        width:wp('35%'),
        height:hp('15%'),
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1,
        borderColor : '#96B2C9',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius:5,
        backgroundColor:'#F6FAFD'
    },

    unActivityBckView: {
        width:wp('35%'),
        height:hp('15%'),
        justifyContent:'center',
        alignItems:'center',
        borderWidth:1,
        borderColor : '#EAEAEA',
        marginBottom: hp("2%"),
        marginRight: hp("1%"),
        marginLeft: hp("1%"),
        borderRadius:5,
    },

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color:'black',
        marginTop: hp("1%"),
    },

    petImgStyle: {
        width: wp("8%"),
        aspectRatio :1,
    },

    imgBckViewStyle : {
        borderRadius : 5,
        borderColor : 'black',
        borderWidth : 1,
        width: hp("6%"),
        height: hp("6%"),
        alignItems:'center',
        justifyContent : 'center'
    },

  });