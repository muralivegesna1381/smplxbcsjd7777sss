import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,FlatList,Image} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import AlertComponent from './../../../utils/commonComponents/alertComponent';

let downArrowImg = require('./../../../../assets/images/otherImages/svg/downArrowGrey.svg');

let bedroomImg = require("../../../../assets/images/beaconsImages/png/bedroomBeacon.png");
let bathroomImg = require("../../../../assets/images/beaconsImages/png/bathroomBeacon.png");
let hallImg = require("../../../../assets/images/beaconsImages/png/hallBeacon.png");
let kitchenImg = require("../../../../assets/images/beaconsImages/png/ktichenBeacon.png");
let gardenImg = require("../../../../assets/images/beaconsImages/png/gardenBeacon.png");
let livingImg = require("../../../../assets/images/beaconsImages/png/living.png");
let dinningImg = require("../../../../assets/images/beaconsImages/png/dining.png");
let basementImg = require("../../../../assets/images/beaconsImages/png/basement.png");
let officeImg = require("../../../../assets/images/beaconsImages/png/office.png");
let porchImg = require("../../../../assets/images/beaconsImages/png/porch.png");

let defaultImg = require("../../../../assets/images/beaconsImages/png/gardenBeacon.png");

const  BeaconsRangeUI = ({navigation,route, ...props }) => {

    const [popupMessage, set_popupMessage] = useState(undefined);
    const [rangeTxt, set_rangeTxt] = useState(undefined);
    const [isSearchView, set_isSearchView] = useState(false);
    const [rangesArray, set_rangesArray] = useState([
        {'id': '0', 'txValue':'Low (Recommended)'},
        {'id': '5', 'txValue':'Medium'},
        {'id': '7', 'txValue':'High'},
    ]);
    const [lName1, set_lName] = useState(undefined);
    const [locName, set_locName] = useState(undefined);

    useEffect(() => {
        set_popupMessage(props.popupMessage);
    }, [props.popupMessage,props.isLoading,props.isPopUp,props.popAlert,props.loaderMessage,props.isPopUpLftBtn]);
    useEffect(() => {
        set_lName(props.lName);
        set_locName(props.lName);
        set_rangeTxt(props.rangeTxt);
        set_rangesArray(props.rangesArray);
    }, [props.lName,props.rangeTxt,props.rangesArray]);

    const nextButtonAction = async () => {
        props.nextButtonAction();
    };

    const backBtnAction = () => {
        props.backBtnAction(); 
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction()
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction()
    };

    const actionOnSearch = (item) => {
        set_isSearchView(false);
        set_rangeTxt(item.txValue);
        props.actionOnSearch(item);
    };

    const selectRange = () => {
        set_isSearchView(!isSearchView);
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

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center',marginTop: hp('3%')}}>

                <View style={{marginTop:hp('2%'),width:wp('80%'),flex:0.5}}>
                    <Text style={[styles.headerTextStyle]}>{'Please select the transmission range for your beacon.'}</Text>
                </View>

                <View style={{justifyContent:'center',alignItems:'center',flex:2, borderRadius:5,borderWidth:1,borderColor:'#6BC100'}}>
                    <ImageBackground source={
                        lName1 === 'Hall' ? hallImg : lName1 === 'Kitchen' ? kitchenImg : lName1 === 'Bed room' ? bedroomImg 
                        : lName1 === 'Garden' ? gardenImg : lName1 === "Basement" ? basementImg : lName1 === "Bathroom" ? bathroomImg :
                        lName1 === "Dining room" ? dinningImg : lName1 === "Living room" ? livingImg : lName1 === "Office" ? officeImg : 
                        lName1 === "Porch" ? porchImg : defaultImg} style={styles.backdrop} imageStyle={{borderRadius:5}}></ImageBackground>
                        <Text style={styles.lTextStyle}>{lName1}</Text>
                </View>

                 <View style={{width: wp('80%'),marginTop: hp('5%'),alignItems:'center',flex:1}}>
                
                    <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),}} onPress={() => {selectRange()}}>

                      <View>
                          
                          <View style={[styles.SectionStyle]}>
                            <Text style={styles.placeTextStyle}>{"Select Range*"}</Text>
                            {rangeTxt ? <Text style={styles.rangeTextStyle}>{rangeTxt}</Text> : null}
                              
                          </View>
                      </View>

                      <View style={{justifyContent:'center'}}>
                          <Image source={downArrowImg} style={styles.imageStyle} />
                      </View>
     
                    </TouchableOpacity>
               </View>

            </View>

            {!isSearchView ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View> : null}

            {isSearchView ? <View style={styles.popSearchViewStyle}>

            <FlatList
                    style={styles.flatcontainer}
                    data={rangesArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnSearch(item)}>
                        <View style={styles.flatview}>
                            <Text numberOfLines={2} style={[styles.name]}>{item.txValue}</Text>
                        </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.txValue}
                />
                
            </View> : null}

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popAlert}
                    message={popupMessage}
                    isLeftBtnEnable = {props.isPopUpLftBtn}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMessage} isButtonEnable = {false} /> : null} 
            
         </View>
    );
  }
  
  export default BeaconsRangeUI;

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

    flatcontainer: {
        width: wp("90%"),
        marginTop: hp("2%"),
        flex:1,     
    },

    backdrop: {
        height: hp("25%"),
        aspectRatio:1,
        justifyContent:'center',
        resizeMode: "contain",
    },

    SectionStyle: {
        justifyContent: "center",
        minHeight: hp("8%"),
        width: wp("70%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    placeTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "#7F7F81",
        marginTop: hp("1%"),
    },

    lTextStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontXLarge,
        color: "#6BC100",
        marginTop: hp("1%"),
    },

    rangeTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        marginLeft: hp("2%"),
        color: "black",
        marginBottom: hp("1%"),
        marginTop: hp("1%"),
    },

    imageStyle: {
        margin: "4%",
        height: 20,
        width: 20,
        resizeMode: "contain",
    },

    popSearchViewStyle : {
        height: hp("30%"),
        width: wp("95%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15,
        alignItems: "center",
    },

    flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignContent: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
        alignItems: "center",
    },

  });