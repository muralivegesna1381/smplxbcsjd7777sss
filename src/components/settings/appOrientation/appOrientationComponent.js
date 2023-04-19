import React, { useState, useEffect,useRef } from 'react';
import {Text, TouchableOpacity, View,StyleSheet,ImageBackground,Image,SafeAreaView,} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp,} from "react-native-responsive-screen";
import Modal from "react-native-modal";
import Highlighter from "react-native-highlight-words";
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import fonts from './../../../utils/commonStyles/fonts';
import * as ApolloClient from "../../../config/apollo/apolloConfig";
import * as Queries from "../../../config/apollo/queries";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const AppOrientationComponent = ({navigation, route, ...props }) => {

    let imgArray = [
        require("../../../../assets/images/apporientation/1.png"),
        require("../../../../assets/images/apporientation/2.png"),
        require("../../../../assets/images/apporientation/3.png"),
        require("../../../../assets/images/apporientation/4.png"),
        require("../../../../assets/images/apporientation/5.png"),
        require("../../../../assets/images/apporientation/6.png"),
        require("../../../../assets/images/apporientation/7.png"),
        require("../../../../assets/images/apporientation/8.png"),
        require("../../../../assets/images/apporientation/9.png"),
        require("../../../../assets/images/apporientation/10.png"),
        require("../../../../assets/images/apporientation/11.png"),
        require("../../../../assets/images/apporientation/12.png"),
        require("../../../../assets/images/apporientation/13.png"),
        require("../../../../assets/images/apporientation/14.png"),
      ];
      const pageNo = useRef(0);
      const [modalVisibility, setModalVisibility] = useState(true);
      const [buttonVisisbility, setButtonVisibility] = useState(false);
      const [image, setImage] = useState(imgArray[0]);
      const [modalStyle, setModalStyle] = useState(styles.modalStyleCenter);
      const [modalPosition, setModalPoistion] = useState(styles.centerView);
      const [headerStyle, setheaderStyle] = useState(styles.textStyleHeaderSmall);
      const [loginPets, set_loginPets] = useState(undefined);  
      const [isFromScreen, set_isFromScreen] = useState(undefined);  
      const [nxtBtnText, set_nxtBtnText] = useState('NEXT');  
      let trace_inAppOrientation_Screen;

      useEffect(() => {

        if(route.params?.loginPets){
          set_loginPets(route.params?.loginPets);
        }

        if(route.params?.isFromScreen){
          set_isFromScreen(route.params?.isFromScreen);
        }
        
      }, [route.params?.loginPets,route.params?.isFromScreen]);

      useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_app_orientation);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_app_orientation, "User in App Orientation Screen", ''); 
        pageNo.current = 0;
        appOrientationSessionStart();
     
         return () => {
           appOrientationSessionStop();
         };
     
       }, []);
    
      /**
       * Based on the count that is updated this function will change the style of the modal box
       * like its position, text header style and button styles
       */
      function updateStyles() {

        set_nxtBtnText("NEXT");
        switch (pageNo.current) {
          case 0:
            setModalPoistion(styles.centerView);
            setModalStyle(styles.modalStyleCenter);
            setheaderStyle(styles.textStyleHeaderSmall);
            setModalVisibility(true);
            setImage(imgArray[0]);
            setButtonVisibility(false);
            firebaseHelper.logEvent(firebaseHelper.event_app_orientation_start_trigger, firebaseHelper.screen_app_orientation, "User started app orientation", '');
            return;
            case 1:
            setModalVisibility(false);
            setButtonVisibility(true);
            setImage(imgArray[pageNo.current]);
            break;
            case 2:
            setImage(imgArray[pageNo.current]);
            break;
            case 3:
            setImage(imgArray[pageNo.current]);
            break;
            case 4:
            setImage(imgArray[pageNo.current]);
            break;
            case 5:
            setImage(imgArray[pageNo.current]);
            break;
            case 6:
            setImage(imgArray[pageNo.current]);
            break;
            case 7:
            setImage(imgArray[pageNo.current]);
            break;
            case 8:
            setImage(imgArray[pageNo.current]);
            break;
            case 9:
            setImage(imgArray[pageNo.current]);
            break;
            case 10:
            setImage(imgArray[pageNo.current]);
            break;
            case 11:
            setImage(imgArray[pageNo.current]);
            break;
            case 12:
              set_nxtBtnText("FINISH");
            setImage(imgArray[pageNo.current]);
            break;
            case 13:
            setImage(imgArray[pageNo.current]);
            setModalVisibility(true);
            setButtonVisibility(false);
            firebaseHelper.logEvent(firebaseHelper.event_app_orientation_finish, firebaseHelper.screen_app_orientation, "User finished app orientation", '');
            setModalPoistion(styles.centerSmallerView);
            setheaderStyle(styles.textBigStyleGreenHeader);
            break;
          
        
        }
      }

    //Method to end the app orientation and navigate back to Support page or list of pets page based on where the User came from
  const exitFromAppOrientation = () => {

    setModalVisibility(false);
    if(isFromScreen==='LoginPage'){
      updateDashboardData(loginPets);
    } else {
      navigation.navigate('SupportComponent');
    }
    
  };

  const updateDashboardData = (petsArray) => {
    ApolloClient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
    navigation.navigate("DashBoardService", { loginPets: petsArray });
  };

  const appOrientationSessionStart = async () => {
    trace_inAppOrientation_Screen = await perf().startTrace('t_App_Orientation_Screen');
  };

  const appOrientationSessionStop = async () => {
    await trace_inAppOrientation_Screen.stop();
  };

    // const navigateToPrevious = () => {  
    //     navigation.navigate('DashBoardService');
    // }

    return (
        <SafeAreaView style={styles.containerMain}>
        <ImageBackground source={image} style={styles.imageViewStyle} resizeMode="stretch">
          <Modal
            style={modalStyle}
            backdropOpacity={0.1}
            isVisible={modalVisibility}
            statusBarTranslucent={true}
          >
            <View style={modalPosition}>
              <View style={{ flexDirection: "row", justifyContent: "space-between",}}>
                
                {pageNo.current == 0 ? ( <Text style={headerStyle}>  Welcome to </Text>) :  <Text style={headerStyle}>  THANK YOU! </Text>}

                <TouchableOpacity onPress={() => { exitFromAppOrientation();}}>
                  <Image source={require("../../../../assets/images/otherImages/png/close.png")} style={styles.closeButtonStyle}/>
                </TouchableOpacity>
              </View>
  
              {pageNo.current == 0 ? ( <Text style={styles.textStyleGreenHeader} > WEARABLES CLINICAL TRIALS APP</Text> ) : null}
  
              {pageNo.current ==13 ? (
                <Text style={styles.textStyle}>
                  <Highlighter
                    highlightStyle={{
                      fontWeight: "bold",
                    }}
                    searchWords={["Support > App Orientation"]}
                    textToHighlight={"You can access the app orientation again by going to Support > App Orientation"}
                  />
                </Text>
              ) : (
                  <View>

                <Text style={styles.textStyle} >Click on the below button to start the introductory orientation of the app</Text>
             
             <View style={styles.centerbuttonContainerViewStyle}>
                  <View style={styles.gradiantButtonBigStyle}>
                    <TouchableOpacity onPress={() => { pageNo.current = pageNo.current + 1; updateStyles(); }}>
                      <ImageBackground style={styles.gradientViewStyleGreen}>
                        <Text style={styles.buttonTextStyle} >BEGIN INTRO</Text>
                      </ImageBackground>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
                
                 )}
            
            </View>
          </Modal>

          {buttonVisisbility ? (
              <View style={styles.buttonContainerViewStyle}>
              <View style={styles.gradiantButtonStyle}>
                <TouchableOpacity
                  onPress={() => {
                    if (pageNo.current > 0) {
                      pageNo.current = pageNo.current - 1;
                      updateStyles();
                    }
                    else if(pageNo.current ==0){
                        updateStyles();
                    }
                  }}
                >
                  <ImageBackground
                    style={styles.gradientViewStyleBlack}
                  >
                    <Text
                      style={styles.buttonTextStyle}
                    >{'BACK'}</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View style={styles.gradiantButtonStyle}>
                <TouchableOpacity
                  onPress={() => {
                    if (pageNo.current < 14) {
                      pageNo.current = pageNo.current + 1;
                      updateStyles();
                    } else {
                      setButtonVisibility(false);
                      updateStyles();
                    }
                  }}
                >
                  <ImageBackground
                    style={styles.gradientViewStyleGreen}
                  >
                    <Text
                      style={styles.buttonTextStyle}
                    >{nxtBtnText}</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>
                
              ) : null}

        </ImageBackground>

      </SafeAreaView>

    );

  }
  
  export default AppOrientationComponent;

  const styles = StyleSheet.create({

    containerMain: {
      flex: 1,
    },
  
    centerView: {
      width: "100%",
      height: hp("27%"),
      backgroundColor: "white",
      position: "absolute",
      borderRadius: 10,
    },
  
    centerSmallerView: {
      width: "100%",
      minHeight: hp("20%"),
      backgroundColor: "white",
      position: "absolute",
      borderRadius: 10,
    },
  
    modalStyle: {
      justifyContent: "flex-end",
      margin: 0,
    },

    textStyleHeaderSmall: {
      ...CommonStyles.textStyleRegular,
      color: "#000",
      textAlign: "left",
      marginLeft: hp("2%"),
      marginTop: hp("3%"),
      fontSize: fonts.fontNormal,
      marginRight: hp("2%"),
    },

    textStyleGreenHeader: {
      ...CommonStyles.textStyleBold,
      color: "#6BC105",
      textAlign: "left",
      fontSize: fonts.fontNormal,
      marginLeft: hp("2%"),
      marginRight: hp("2%"),
    },
  
    textBigStyleGreenHeader: {
      ...CommonStyles.textStyleBold,
      color: "#6BC105",
      fontSize: fonts.fontXXLarge,
      marginTop: hp("2%"),
      textAlign:'center',
      marginRight: hp("2%"),
    },

    textStyle: {
      ...CommonStyles.textStyleBlack,
      color: "#000",
      fontSize: fonts.fontMedium,
      textAlign: "justify",
      textAlign: "left",
      marginTop: hp("1%"),    
      marginLeft: hp("2%"),
      marginRight: hp("2%"),
    },
  
    buttonContainerViewStyle: {
      marginTop: hp("80%"),
      marginLeft: wp("15%"),
      marginRight: wp("15%"),
      flexDirection: "row",
      justifyContent: "space-between",
      height: hp("8%"),
      alignItems: "center",
    },
  
    centerbuttonContainerViewStyle: {
      flexDirection: "row",
      height: hp("8%"),
      alignItems: "center",
      justifyContent: "center",
    },

    gradiantButtonStyle: {
      width: wp("30%"),
      height: hp("5%"),
      borderRadius: hp("1%"),
      overflow: "hidden",
    },

    gradiantButtonBigStyle: {
      width: wp("75%"),
      height: hp("5%"),
      borderRadius: hp("1%"),
      overflow: "hidden",
      backgroundColor:"#6BC105"
    },

    gradientViewStyleGreen: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      backgroundColor:"#6BC105"
    },

    gradientViewStyleBlack: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        backgroundColor:"#000000"
    },
  
    closeButtonStyle: {
      marginRight: hp("-1.2%"),
      marginTop: hp("-2.2%"),
      alignContent: "flex-end",
      width:50,
      height:75
    },

    imageViewStyle: {
      width: wp("100%"),
      height: hp("100%"),
      justifyContent: "center",
    },

    buttonTextStyle: {
      ...CommonStyles.textStyleBold,
      textAlign: "center",
      color: "#FFFFFF",
      fontSize: fonts.fontMedium,
    },
    
  });
  