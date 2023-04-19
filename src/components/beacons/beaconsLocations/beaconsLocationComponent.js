import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,BackHandler,ImageBackground,FlatList} from 'react-native';
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let bedroomImg = require("../../../../assets/images/beaconsImages/png/bedroomBeacon.png");
let bathroomImg = require("../../../../assets/images/beaconsImages/png/bathroomBeacon.png");
let hallImg = require("../../../../assets/images/beaconsImages/png/hallBeacon.png");
let kitchenImg = require("../../../../assets/images/beaconsImages/png/ktichenBeacon.png");
let gardenImg = require("../../../../assets/images/beaconsImages/png/gardenBeacon.png");

let livingImg = require("../../../../assets/images/beaconsImages/png/living.png");
let officeImg = require("../../../../assets/images/beaconsImages/png/office.png");
let porchImg = require("../../../../assets/images/beaconsImages/png/porch.png");
let basementImg = require("../../../../assets/images/beaconsImages/png/basement.png");
let dinningImg = require("../../../../assets/images/beaconsImages/png/dining.png");

let trace_inBeaconsLocationscreen;

const  BeaconsLocationComponent = ({navigation,route, ...props }) => {

    const [locationsArray, set_locationsArray] = useState(
        [{"lName" : 'Basement', "lImg" : basementImg},
        {"lName" : 'Bathroom', "lImg" : bathroomImg},
        {"lName" : 'Bed room', "lImg" : bedroomImg},
        {"lName" : 'Dining room', "lImg" : dinningImg},
        {"lName" : 'Garden', "lImg" : gardenImg},
        {"lName" : 'Hall', "lImg" : hallImg},
        {"lName" : 'Kitchen', "lImg" : kitchenImg},
        {"lName" : 'Living room', "lImg" : livingImg},
        {"lName" : 'Office', "lImg" : officeImg},
        {"lName" : 'Porch', "lImg" : porchImg}
    ]);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [beaconItem, set_beaconItem] = useState(undefined);
    const [lName, set_lName] = useState(undefined);
    const [beaconsCount, set_beaconsCount] = useState(0);
    const [date, set_Date] = useState(new Date());

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_beacons_locations);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_beacons_locations, "User in Beacons location Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            focus();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

      }, []);

    useEffect(() => {
        if(route.params?.beaconItem){
            set_beaconItem(route.params?.beaconItem);
        }

        if(route.params?.beaconsCount){
            set_beaconsCount(route.params?.beaconsCount);
        }

    }, [route.params?.beaconItem,route.params?.beaconsCount]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inBeaconsLocationscreen = await perf().startTrace('t_inBeaconsLocationScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inBeaconsLocationscreen.stop();
    };

    const nextButtonAction = async () => {
        firebaseHelper.logEvent(firebaseHelper.event_beacons_locations_next_action, firebaseHelper.screen_beacons_locations, "User selected the location for the beacon", 'Location Name : '+lName);
        navigation.navigate('BeaconsRangeComponent',{beaconItem:beaconItem,locationName:lName, beaconsCount : beaconsCount});  
    };

    const backBtnAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_beacons_locations, "User clicked on back button to navigate to BeaconsListComponent", '');
        navigation.navigate('BeaconsListComponent');  
    };

    const popOkBtnAction = () => {
        set_isPopUp(false);
        set_popupMessage(undefined);
    };

    const actionOnRow = (item,index) => {
        set_lName(item.lName);
        set_selectedIndex(index);

    }

    const renderLocations = ({ item, index }) => {
        return (

            <View style={[styles.beaconsView]}>

                <TouchableOpacity onPress={() => actionOnRow(item,index)}>
                    <View style={selectedIndex === index ? [styles.selectedViewStyle] : [styles.unSelectedViewStyle]}>
                        <ImageBackground source={item.lImg} style={styles.backdrop} imageStyle={{borderRadius:5}}>
                        </ImageBackground>
                        
                        <Text style={selectedIndex === index ? [styles.nameSelected,{}] : [styles.name,{}]}>{item.lName}</Text>
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

                <View style={{width: wp('90%'),height: hp('65%'),alignSelf:'center',marginTop: hp('3%'),marginBottom: hp('13%')}}>

                <View style={{marginTop:hp('2%'),width:wp('90%')}}>
                    <Text style={[styles.headerTextStyle]}>{'Please choose the location where you would like to mount the selected beacon.'}</Text>
                </View>

                <FlatList
                    style={styles.flatcontainer}
                    data={locationsArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderLocations}
                    enableEmptySections={true}
                    keyExtractor={(item) => item}
                    numColumns={2}
                />

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {selectedIndex >= 0 ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>  
            
         </View>
    );
  }
  
  export default BeaconsLocationComponent;

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
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("0.5%"),
        marginBottom: hp("1%"),
       
    },

    nameSelected: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "#6BC100",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("0.5%"),
        marginBottom: hp("1%"),      
    },

    unSelectedViewStyle : {
        width:wp('40%'),
        minHeight:hp('20%'),
        borderRadius:5,
        backgroundColor:'white',
        margin:  hp('1%'),
        alignSelf:'flex-start',
        borderWidth:1,
        borderColor:'#EAEAEA',
        justifyContent:'center',
        alignItems:'center'
    },

    selectedViewStyle : {
        width:wp('40%'),
        minHeight:hp('20%'),
        borderRadius:5,
        backgroundColor:'white',
        margin:  hp('1%'),
        alignSelf:'flex-start',
        borderWidth:1,
        borderColor:'#6BC100',
        justifyContent:'center',
        alignItems:'center'
    },

    flatcontainer: {
        width: wp("90%"),
        marginTop: hp("2%"),       
    },

    backdrop: {
        height: hp("15%"),
        aspectRatio:1,
        justifyContent:'center',
        resizeMode: "stretch",
        marginTop: hp("1.5%"),
    },

    beaconsView: {
        flex:1,
        justifyContent:'space-between',
        alignItems:'center',
    },

  });