import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,Keyboard,TouchableOpacity,Image,FlatList} from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from './../../utils/commonComponents/loaderComponent';

let downArrowImg = require('./../../../assets/images/otherImages/svg/downArrowGrey.svg');
let searchImg = require('./../../../assets/images/otherImages/svg/searchIcon.svg');
let xImg = require('./../../../assets/images/otherImages/png/xImg.png');

const  SendFeedbackUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [feedbackText , set_feedbackText] = useState(undefined);
    const [nxtBtnEnable, set_nxtBtnEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [feedBackScreensData, set_feedBackScreensData] = useState([]);
    const [isSearchView, set_isSearchView] = useState(false);
    const [screenName, set_screenName] = useState(undefined);
    const [searchText, set_searchText] = useState(undefined);
    const [filterFeedbackArray, set_filterFeedbackArray] = useState(undefined);

    // Setting the values
    useEffect(() => {
      set_isPopUp(props.isPopUp);
    }, [props.isFromScreen, props.isPopUp]);

    useEffect(() => {

      set_isLoading(props.isLoading);
      set_feedBackScreensData(props.feedBackScreensData);
      set_filterFeedbackArray(props.feedBackScreensData);
      set_feedbackText(props.feedbackText);
      set_screenName(props.screenName);
      
    }, [props.isLoading,props.feedBackScreensData,props.feedbackText,props.screenName]);

    // Next btn Action
    const nextButtonAction = () => {
      props.submitAction(feedbackText,screenName);
    };

    // Back btn action
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Popup Btn Action
    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const selectBehaviourDrop = () => {
      set_isSearchView(true);
      Keyboard.dismiss();
    };

    // Selecting the Screen name from dropdown
    const actionOnRow = (item) => {
      set_isSearchView(!isSearchView);
      set_screenName(item);
      set_searchText(undefined);
      if(feedbackText && feedbackText.length>0 && item){
        set_nxtBtnEnable(true);
      } else {
        set_nxtBtnEnable(false);
      }

      Keyboard.dismiss();
      set_filterFeedbackArray(feedBackScreensData);

    };

    // Setting the Feedback text
    const validateObsText = (val) => {
      set_feedbackText(val);
      if(val && val.length>0 && screenName){
        set_nxtBtnEnable(true);
      } else {
        set_nxtBtnEnable(false);
      }
    };

    // Cancel in search dropdown
    const onCancelSearch = async () => {
        set_searchText(undefined);
        searchFilterFunction("");
        set_filterFeedbackArray(feedBackScreensData);
        Keyboard.dismiss();
    };

    // Filter action in screen name drop down
    const searchFilterFunction = (text) => {
      set_searchText(text);
      const newData = feedBackScreensData.filter(function(item) {
        const itemData = item ? item.toUpperCase() : "".toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
    });
  
      set_filterFeedbackArray(newData);
    };

    const onCancel = () => {

        Keyboard.dismiss();
        set_searchText(undefined);
        set_isSearchView(false);
        set_filterFeedbackArray(feedBackScreensData);
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
                    title={'Send Feedback'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            

              <View style={{width: wp('80%'),height: hp('70%'),marginTop: hp("8%"),alignSelf:'center'}}>

              <KeyboardAwareScrollView  bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>

                <Text style={[CommonStyles.headerTextStyle,{marginBottom: hp("2%")}]}>{'Enter your feedback'}</Text>
                  
                  <View style={styles.SectionStyle}>

                        <TextInput
                          style={styles.textInputStyle}
                          maxLength={300}
                          multiline={true}
                          placeholder={'Tell us your Feedback (Max : 300 characters)'}
                          underlineColorAndroid="transparent"
                          placeholderTextColor="#808080"
                          value={feedbackText}
                          onChangeText={async (text) => {validateObsText(text)}}
                          />  
                  </View> 

                  <View style={{width: wp('80%'),marginTop: hp('2%'),alignItems:'center'}}>

                    <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),}} onPress={() => {selectBehaviourDrop();}}>

                      <View>
                          <View style={[styles.SectionStyle1,{}]}>

                             <View style={{flexDirection:'column',}}>
                                <Text style={styles.dropTextLightStyle}>{'Select Screen name'}</Text>
                                {screenName ? <Text style={[styles.dropTextStyle]}>{screenName}</Text> : null}
                             </View>
                              
                          </View>
                      </View>

                      <View style={{justifyContent:'center'}}>
                          <Image source={downArrowImg} style={styles.imageStyle} />
                      </View>
     
                    </TouchableOpacity>

                  </View>

               </KeyboardAwareScrollView>

              </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {nxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isSearchView ? <View style={styles.popSearchViewStyle}>

            <View style={{flexDirection:'row',alignItems:'center',width:wp('90%'),}}>
                <View style={styles.topView}>
                   <Image source={searchImg} style={styles.searchImageStyle} />

                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => searchFilterFunction(text)}
                        value={searchText}
                        underlineColorAndroid="transparent"
                        placeholder="Search here"
                        returnKeyLabel="Search"
                        returnKeyType="search"
                        onSubmitEditing={Keyboard.dismiss}
                    />

                    {searchText && searchText.length> 0 ? <TouchableOpacity onPress={onCancelSearch} style={styles.topButtonView} >
                            <Text style={[styles.name, { color: "black", }]} > {"CLEAR"}</Text>
                    </TouchableOpacity> : null}

              </View>

              <TouchableOpacity onPress={onCancel} style={[styles.topButtonView,{marginLeft:wp('2%')}]} >
                  <Image source={xImg} style={styles.xImageStyle} />
                </TouchableOpacity>

            </View>

              <FlatList
                style={styles.flatcontainer}
                data={filterFeedbackArray}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <TouchableOpacity onPress={() => actionOnRow(item)}>
                      <View style={styles.flatview}>
                        <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                      </View>
                  </TouchableOpacity>
                )}
                enableEmptySections={true}
                keyExtractor={(item) => item}
              />
                
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default SendFeedbackUI;

  const styles = StyleSheet.create({
    
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },
  
    textInputStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      flex: 1,
      marginLeft: "5%",
      color: "black",
    },

    SectionStyle: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#D8D8D8",
      width: wp("80%"),
      borderRadius: 5,
      alignSelf: "center",
      marginBottom: hp("1%"),
      height:hp('15%'),
    },

    SectionStyle1: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      minHeight: hp("8%"),
      width: wp("70%"),
      borderRadius: hp("0.5%"),
      alignSelf: "center",
    },

    imageStyle: {
      margin: "4%",
      height: 20,
      width: 20,
      resizeMode: "contain",
    },

    xImageStyle: {
      width: wp("8%"),
      height: wp("8%"),
      resizeMode: "contain",
    },

    dropTextStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      color:'black',
      width: wp("60%"),
      alignSelf:'flex-start',
      marginBottom: hp("1%"),
    },

    dropTextLightStyle : {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontMedium,
      color:'grey',
      width: wp("60%"),
      alignSelf:'flex-start',
      marginBottom: hp("1%"),
      marginTop: hp("1%"),      
    },

    popSearchViewStyle : {
      height: hp("80%"),
      width: wp("95%"),
      backgroundColor:'#DCDCDC',
      bottom:0,
      position:'absolute',
      alignSelf:'center',
      borderTopRightRadius:15,
      borderTopLeftRadius:15,
      alignItems: "center",

    },

    flatcontainer: {
      flex: 1,
    },

    flatview: {
      height: hp("8%"),
      marginBottom: hp("0.3%"),
      alignContent: "center",
      justifyContent: "center",
      borderBottomColor: "grey",
      borderBottomWidth: wp("0.1%"),
      width:wp('90%'),
    },

    name: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      textAlign: "center",
      color: "black",
    },

    topView: {
      height: hp("5%"),
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:'white',
      marginTop: hp("2%"),
      marginBottom: hp("2%"),
      width: wp("80%"),
      borderRadius:10,
      justifyContent:'space-between'   
    },

    searchImageStyle : {
      height: hp("2%"),
      width: wp("2%"),
      flex:0.2,
      resizeMode:'contain',
      marginLeft: hp("2%"),
    },

    topButtonView: {
      alignContent: "center",
      justifyContent: "center",
      height: hp("5%"),
      marginRight: hp("2%"),
    },

  });