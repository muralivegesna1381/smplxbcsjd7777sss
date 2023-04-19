import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,FlatList,Image} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Constant from "../../../utils/constants/constant";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../../utils/commonComponents/alertComponent';

const  BeaconsListUI = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [availableBeaconsArray, set_availableBeaconsArray] = useState(undefined);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [isBeaconsFound, set_isBeaconsFound] = useState(true);
    const [eMsg, set_eMsg] = useState(undefined);
    const [loaderMsg2, set_loaderMsg2] = useState(undefined);

    useEffect(() => {

        set_availableBeaconsArray(props.availableBeaconsArray);
        set_isLoading(props.isLoading);
        set_popupMessage(props.popupMessage);
        set_isPopUp(props.isPopUp);
        set_loaderMsg(props.loaderMsg);
        set_isBeaconsFound(props.isBeaconsFound);
        set_eMsg(props.eMsg);
        set_loaderMsg2(props.loaderMsg2);

    }, [props.availableBeaconsArray,props.isLoading,props.isPopUp,props.popupMessage,props.loaderMsg,props.isBeaconsFound,props.eMsg,props.loaderMsg2]);

    const nextButtonAction = async () => {
        props.nextButtonAction();
    };

    const backBtnAction = () => {
        props.backBtnAction(); 
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const actionOnRow = (item,index) => {
        props.actionOnRow(item,index);
    }

    const renderBeacons = ({ item, index }) => {
        return (

            <View style={styles.beaconsView}>

                <TouchableOpacity onPress={() => actionOnRow(item,index)}>
                    <View style={styles.meterialViewStyle}>
                        <ImageBackground source={require("../../../../assets/images/beaconsImages/svg/beaconMenu.svg")} style={styles.backdrop} imageStyle={{borderRadius:5}}>
                        </ImageBackground>
                        <Text style={styles.name}>{item.fId}</Text>
                        <Text style={[styles.name,{ marginBottom: hp("2%"),}]}>{item.bName}</Text>
                    </View>
                </TouchableOpacity>

            </View>
            
        );
    };

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
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

            <View style={{width: wp('90%'),height: hp('80%'),alignSelf:'center',marginTop: hp('3%')}}>

                {isBeaconsFound ? <View style={{marginTop:hp('2%'),width:wp('90%')}}>
                    <Text style={[styles.headerTextStyle]}>{'Listed below are the nearby beacons. Please select a beacon to configure it.'}</Text>
                </View> : (!isLoading ? <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("5%"),}}>
                        <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                        <Text style={[CommonStyles.noRecordsTextStyle]}>{Constant.NO_RECORDS_LOGS}</Text>
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{eMsg}</Text>
                    </View> : null)}

                <FlatList
                    style={styles.flatcontainer}
                    data={availableBeaconsArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderBeacons}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.fId}
                    numColumns={2}
                />

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

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popupMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'CANCEL'}
                    rightBtnTilte = {"OK"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {loaderMsg} loaderText2 = {loaderMsg2} isButtonEnable = {false} /> : null} 
            
         </View>
    );
  }
  
  export default BeaconsListUI;

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

    name: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        textAlign: "left",
        color: "black",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("1%"),
       
    },

    meterialViewStyle : {
        width:wp('43%'),
        minHeight:hp('18%'),
        borderRadius:5,
        backgroundColor:'white',
        borderWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        alignItems:'center'
    },

    flatcontainer: {
        width: wp("90%"),
        marginTop: hp("2%"),
        flex:1,
    },

    beaconsView: {
        flex:1,
        justifyContent:'space-between',
        alignItems:'center',
    },

    backdrop: {
        height: hp("8%"),
        aspectRatio:1,
        justifyContent:'center',
        resizeMode: "stretch",
        marginTop: hp("1.5%"),
    },

  });