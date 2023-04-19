import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,ImageBackground,ActivityIndicator,FlatList} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import PetsSelectionCarousel from "../../../utils/petsSelectionCarousel/petsSelectionCarousel";
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import moment from "moment";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";

const  ObservationsListUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [petsArray, set_petsArray] = useState(undefined);
    const [observationsArray, set_observationsArray] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(true);
    const [isLoading, set_isLoading] = useState(false);
    const [activeSlide, set_activeSlide] = useState(0);
    const [obsMessage, set_obsMessage] = useState(undefined);

    // setting the values to local variables
    useEffect(() => {

      set_isPopUp(props.isPopUp);
      set_petsArray(props.petsArray);
      set_defaultPetObj(props.defaultPetObj,props.defaultPetObj);
      set_popUpMessage(props.popUpMessage);

      if(props.defaultPetObj && props.petsArray){
        getActiveSlide(props.petsArray,props.defaultPetObj);
      }

    }, [props.isPopUp,props.popUpMessage,props.petsArray, props.defaultPetObj]);

    useEffect(() => {

      set_observationsArray(props.observationsArray);
      if(props.observationsArray && props.observationsArray.length<1){
        set_obsMessage(Constant.NO_RECORDS_LOGS);
      }
      set_isLoading(props.isLoading);

    }, [props.observationsArray,props.isLoading]);

    // Passing the default pet obj and index to Pet carasoul
    const getActiveSlide = async (petArray,defaultPetObjj) => {

      set_obsMessage(undefined);
        let index = 0;
        for(var i = 0; i < petArray.length; i++) {
            if (petArray[i].petID == defaultPetObjj.petID) {
              index = i;
                break;
            }
        }
        set_activeSlide(index);
    };

    // Next btn action 
    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const observationsPetSelection = async (pObject) => {
        await DataStorageLocal.saveDataToAsync(Constant.OBS_SELECTED_PET, JSON.stringify(pObject));
        props.observationsPetSelection(pObject);
    };

    const selectObservationAction = (item) => {
      props.selectObservationAction(item);
    };

  const _renderObservations = (item) => {

            return (
               <>
               <TouchableOpacity onPress={() => selectObservationAction(item)}>

                  <View style={styles.obsCellViewStyle}>

                    <View style={{flex:1,justifyContent:'center'}}>

                         {item.photos && item.photos.length>0 && item.photos[0].filePath!=="" ? <ImageBackground source={{ uri: item.photos[0].filePath}} style={styles.petImgStyle} onLoadStart={() => set_imgLoader(true)}
                              onLoadEnd={() => set_imgLoader(false)}>
                              {imgLoader === true ? (<View style={CommonStyles.spinnerStyle}>
                                  <ActivityIndicator size="large" color="#37B57C" />
                                </View>) : null}
                              {item.videos && item.videos.length ? <Image source={require("./../../../../assets/images/otherImages/svg/observationVideoLogo.svg")} style={[styles.videoLogoStyle]}/> : null}
                        </ImageBackground> : 

                        (item.videos && item.videos.length && item.videos[0].videoThumbnailUrl!=='' ? <ImageBackground source={{uri: item.videos[0].videoThumbnailUrl}} style={styles.petImgStyle}>
                              {item.videos && item.videos.length ? <Image source={require("./../../../../assets/images/otherImages/svg/observationVideoLogo.svg")} style={[styles.videoLogoStyle]}/> : null}
                        </ImageBackground> : <Image source={require("./../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={[styles.petImgStyle]}/>)}
                    </View>

                    <View style={{flex:3,justifyContent:'center'}}>
                        <Text style={styles.obsTextStyle}>{item.obsText.length > 50 ? item.obsText.substring(0, 50) + "..." : item.obsText}</Text>
                    </View>

                    <View style={{flex:2,justifyContent:'center'}}>
                    {item.modifiedDate ? <Text  style={styles.obsTextStyle}>{moment(String(item.modifiedDate).substring(0, 10)).format("MM-DD-YYYY")}</Text> : <Text  style={styles.obsTextStyle}>{moment(String(item.observationDateTime).substring(0, 10)).format("MM-DD-YYYY")}</Text>}
                    </View>

                    <View style={{flex:0.3,justifyContent:'center',alignItems:'center'}}>
                      <Image style={styles.moreImgStyels} source={require("./../../../../assets/images/otherImages/svg/rightArrowLightImg.svg")}/>
                    </View>

                  </View>

               </TouchableOpacity>
               
               </>
             )

   };
   
    return (

        <View style={[CommonStyles.mainComponentStyle]}>

          <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Observations'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={[CommonStyles.petsSelViewHeaderStyle]}>
                {defaultPetObj ? <PetsSelectionCarousel
                    petsArray={petsArray}
                    isSwipeEnable = {true}
                    defaultPet = {defaultPetObj}
                    activeSlides = {activeSlide}
                    setValue={(pObject) => {
                      observationsPetSelection(pObject);
                    }}
                /> : null}

            </View>

            <View style={{height:hp('58%'),}}>

              {observationsArray && observationsArray.length > 0 ? <View style={{height:hp('5%'),width:wp('100%'),flexDirection:'row',justifyContent:'center',alignSelf:'center',alignItems:'center'}}>

                <Text style={[styles.hTextextStyle,{flex:1.2,textAlign:'center'}]}>{''}</Text>
                <Text style={[styles.hTextextStyle,{flex:3,}]}>{'Observation'}</Text>
                <Text style={[styles.hTextextStyle,{flex:2.5,}]}>{'Modified Date'}</Text>

              </View> : null}

              {observationsArray && observationsArray.length > 0 ? <FlatList
                  style={styles.flatcontainer}
                  data={observationsArray}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (_renderObservations(item))}
                  keyExtractor={(item) => "" + item.observationId}
              /> : 
              (isLoading === false ? <View style={{justifyContent:'center',alignItems:'center',height:hp('58%')}}>
                  <Image style= {[styles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                  <Text style={CommonStyles.noRecordsTextStyle}>{obsMessage}</Text>
                  <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                </View>:null)}

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEW OBSERVATION'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {petsArray && petsArray.length > 0 ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default ObservationsListUI;

  const styles = StyleSheet.create({

    obsCellViewStyle : {
      width:wp('90%'),
      height:hp('8%'),
      alignSelf:'center',
      marginBottom:hp('1%'),
      borderBottomColor:'#DEDEDE',
      borderBottomWidth:1,
      flexDirection:'row'
    },

    petImgStyle : {
      height: hp("5%"),
      aspectRatio:1,
      alignSelf: "center",
      resizeMode: "contain",
      borderRadius: 5,
      overflow: "hidden",
      justifyContent:'flex-end',
      alignItems:'flex-end'
    },

    moreImgStyels : {
      height: hp("2%"),
      width: wp("2%"),
      resizeMode: "contain",
      overflow: "hidden",
    },

    flatcontainer: {
      width: "100%",
    },

    obsTextStyle : {
      fontSize: fonts.fontMedium,
      ...CommonStyles.textStyleRegular,
      color: 'black', 
    },

    videoLogoStyle : {
      width: wp("3%"),
      height: hp("2%"),
      resizeMode: "contain",
      overflow: "hidden",
      marginRight: wp("0.5%"),
    },

    hTextextStyle : {
      fontSize: fonts.fontMedium,
      ...CommonStyles.textStyleSemiBold,
      color: 'black', 
      textAlign:'left'
    },

  });