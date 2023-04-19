import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,Image} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

const  ConnectBeaconsUI = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isBeaconsFound, set_isBeaconsFound] = useState(true);

    useEffect(() => {
        set_isLoading(props.isLoading);
        set_popupMessage(props.popUpMessage);
        set_isPopUp(props.isPopUp);
        set_isBeaconsFound(props.isBeaconsFound);
    }, [props.isLoading,props.isPopUp,props.popUpMessage,props.isBeaconsFound]);

    const nextButtonAction = async () => {
        props.nextButtonAction();
    };

    const backBtnAction = () => {
        props.backBtnAction(); 
    };

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Beacons'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center',marginTop: hp('3%')}}>

               {isBeaconsFound ?  <View style={{marginTop:hp('2%'),width:wp('80%'),flex:0.6}}>
                    <Text style={[styles.headerTextStyle]}>{'Finding all beacons that are nearby'}</Text>
                </View> : (!isLoading ? <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
                        <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                        <Text style={[CommonStyles.noRecordsTextStyle]}>{Constant.NO_RECORDS_LOGS}</Text>
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{'No beacons were found around! Please ensure the beacons and mobile device are in close proximity.'}</Text>
                    </View> : null)}

            </View>

            {!isBeaconsFound ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'TRY AGAIN'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View> : null }

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
            
         </View>
    );
  }
  
  export default ConnectBeaconsUI;

  const styles = StyleSheet.create({
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'
            
    },

    headerTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontLarge,
        textAlign: "left",
        color: "black",
    },

  });