import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,ImageBackground,BackHandler} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import DeviceInfo from 'react-native-device-info';
import * as Constant from "./../../utils/constants/constant";
import BottomComponent from "./../../utils/commonComponents/bottomComponent";

let failedImg = require('./../../../assets/images/otherImages/svg/failedXIcon.svg');
let tickImg = require('./../../../assets/images/otherImages/png/tick.png');

const  MultipleDevicesUI = ({route, ...props }) => {

    const [petObj, set_petObj] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(false);
    const [petName, set_petName] = useState('');
    const [isRecords, set_isRecords] = useState(true);
    const [isDeceased, set_isDeceased] = useState(undefined);

    // Android Physical back button action
    useEffect(() => {      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    },[]);

    // Setting the Devices to the UI
    useEffect(() => {

      if(props.petObj){

        set_petObj(props.petObj);
        set_petName(props.petObj.petName);

        if(props.petObj && props.petObj.devices.length>0){

          set_isRecords(true);
          
        } else {
          set_isRecords(false);
        }

        if(props.petObj && parseInt(props.petObj.petStatus) === 3){

          set_isDeceased(true);
          
        } else {
          set_isDeceased(false);
        }

      }

    }, [props.petObj]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const handleBackButtonClick = () => {
      backBtnAction();
      return true;
    };

    // Caliculates the batter percentage for each Device
    const calculateBatteryPercentage = (item) => {
        let batteryLevel = item ? item.replace("%", "") : item;
        let _batteryflex = batteryLevel / 100;
        return _batteryflex;
    };

    // Saves the Device type and navigates to Configuration process
    const itemAction = async (item,index) => {
      props.itemAction(item,index);
    };

    const addButtonAction = () => {
      props.addButtonAction();
    };

    const renderItem = ({item, index }) => {

        return (

            <TouchableOpacity key={index} style={{ padding: 1}} onPress={() => {itemAction(item,index)}}>

               {item.deviceNumber ? <View style={{alignItems:'center'}}>

                <View style={styles.dataViewStyle}>

                        {<View style={{flexDirection:'row',width:wp('80%'),}}>

                             {petObj && petObj.photoUrl && petObj.photoUrl!=='' ? <ImageBackground  onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(true)} source={{ uri: petObj.photoUrl }}
                              style={styles.imgStyle}>

                                {imgLoader === true && item.photoUrl ? (
                                    <View style={CommonStyles.spinnerStyle}>
                                    <ActivityIndicator size="large" color="#37B57C"/>
                                    </View>
                                ) : null}
                              </ImageBackground> : <ImageBackground source={require("./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={styles.imgStyle}></ImageBackground>}

                              <View style={{flex: item.battery ? 3 : 3.5, justifyContent: "center", textAlign: "center",}}>
                                  {!item.deviceNumber ? (<Text style={[styles.deviceName,{ color: "black" },]}>{"N/A"}</Text>) : 
                                  (<View style={{flexDirection:'column', }}>
                                      <Text style={[styles.deviceName,{ color: "black" },]}>{item.deviceNumber}</Text>
                                    </View>                                   
                                  )}

                                  {item.isFirmwareVersionUpdateRequired || !item.isDeviceSetupDone ? (
                                    <View style={{flexDirection: "row",alignItems: "center",}}>
                                      {!item.isDeviceSetupDone ? (
                                        <Image source={failedImg} style={ styles.setupUpdateImgStyles} />
                                      ) : item.isFirmwareVersionUpdateRequired ? (
                                        <Image source={tickImg} style={styles.setupUpdateImgStyles}/>
                                      ) : null}

                                      {!item.isDeviceSetupDone ? (
                                          <Text style={[styles.deviceName,{color: "red",},]}>{"Setup pending"}</Text>
                                        ) : item.isFirmwareVersionUpdateRequired ? (
                                          <Text style={[styles.deviceName,{color: "#37B57C", marginRight: hp("1%"),}]}>{"Update Available "}</Text>
                                        ) : null}
                                    </View>
                                  ) : null}
                              </View>

                              <View style={{alignSelf:'center',marginRight: hp("1%")}}>
                                {item.isDeviceSetupDone && item.battery ? <View style={{flex: 0.5,width: DeviceInfo.isTablet()? wp("18%"): wp("25%"),backgroundColor: "#F5F7FB",alignItems: "center",
                                      justifyContent: "center", borderRadius: 10,flexDirection: "row",}}>

                                        <ImageBackground style={{flexDirection: "row",flex: 1,marginLeft: hp("1%"),height:20,}} resizeMode="stretch" source={require("../../../assets/images/otherImages/png/batterybg.png")}>
                                            <View style={{backgroundColor: "gray",borderRadius: 2,flex: calculateBatteryPercentage(item.battery),margin: DeviceInfo.isTablet() ? 5 : 3,marginRight: 8,}}/>
                                        </ImageBackground>

                                    <Text style={[styles.batteryName,{marginRight:wp('1%'),marginLeft:wp('1%')}]}>{item.battery ? Math.round(Number(item.battery))  + '%'  : ''}</Text>
                                    
                                  </View> : null}
                              </View>

                            <View style={{flex:0.3,justifyContent:'center',alignItems:'center'}}>
                                <Image style={styles.moreImgStyels} source={require("./../../../assets/images/otherImages/svg/rightArrowLightImg.svg")}/>
                            </View>

                        </View>}

                </View>

               </View> : null}

            </TouchableOpacity>
        );

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
                    title={petName}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{flex:1,marginBottom:hp('1%'),marginTop:hp('3%'),alignSelf:'center'}}>

                {isRecords ? <FlatList
                    data={petObj ? petObj.devices : undefined}
                    showsVerticalScrollIndicator={false}
                    renderItem={ renderItem }
                    keyExtractor={(item, index) => `${index}`}
                /> : (isDeceased ? <View style={{width:wp('90%'),height:hp('65%'), alignSelf:'center',justifyContent:'center'}}>
                    
                        <View style={[styles.buttonstyle]}>
                            <Text style={[styles.btnTextStyle,{color:'black',textAlign:'center'}]}>{'Some App features are restricted for this pet. \nPlease reach out to the customer support for more details.'}</Text>
                        </View>

                    </View> : <View style={{width:wp('90%'),height:hp('65%'), alignSelf:'center',justifyContent:'center'}}>

                <Image source={require("../../../assets/images/dogImages/dogImg5.svg")} style={styles.missingDogImgStyle}/>
                    
                <View style={[styles.buttonstyle]}>
                    <Text style={[styles.btnTextStyle]}>{'DEVICE MISSING'}</Text>
                </View>

                <View style={styles.missingBackViewStyle}>
                    <Text style={styles.missingTextStyle}>{Constant.DEVICE_MISSING_DASHBOARD}</Text>
                </View>

            </View>)}
                
            </View>  

            {!isRecords && !isDeceased ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'ADD A DEVICE?'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => addButtonAction()}
                />
            </View> : null}

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {Constant.ALERT_NETWORK}
                    message={Constant.NETWORK_STATUS}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {"OK"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

         </View>
    );
  }
  
  export default MultipleDevicesUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'
    },

    dataViewStyle : {
        minHeight:hp('8%'),
        width:wp('90%'),
        marginTop: hp("2%"),
        borderRadius:5,
        borderColor:'#EAEAEA',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    },

    imgStyle: {
        height: hp("5%"),
      width: hp("5%"),
      alignSelf: "center",
      resizeMode: "stretch",
      borderRadius: 5,
      overflow: "hidden",
      marginRight: hp("1%"),
    },

    deviceName: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "justify",
        margin:wp("0.5%"),
    },

    setupUpdateImgStyles: {
        height: hp("2%"),
        width: hp("2%"),
        alignSelf: "center",
        marginRight: hp("1%"),
    },

    moreImgStyels : {
        height: hp("1.5%"),
        width: hp("1.5%"),
        resizeMode: "contain",
        overflow: "hidden",
    },

    missingDogImgStyle : {
      width:wp('25%'),
      aspectRatio:1,
      resizeMode:'contain',
      alignSelf:'center',
      marginTop:hp('3%'),
    },

    buttonstyle : {
      justifyContent: "center",
      alignItems:'center',
      marginTop:hp('2%'),
    },

    btnTextStyle: {
        color: '#DE1111',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    missingTextStyle : {
      textAlign:'center',
      fontSize: fonts.fontLarge,
      ...CommonStyles.textStyleLight,
    },

    missingBackViewStyle : {
      width:wp('80%'), 
      justifyContent:'center', 
      alignItems:'center', 
      alignSelf:'center',
      marginTop:hp('2%'),
    },

  });