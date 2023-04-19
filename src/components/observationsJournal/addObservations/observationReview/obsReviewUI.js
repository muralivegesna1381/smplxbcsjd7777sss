import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,TouchableOpacity,Image,ImageBackground,FlatList} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../../utils/commonComponents/loaderComponent';
import moment from 'moment';
import AlertComponent from './../../../../utils/commonComponents/alertComponent';
import {KeyboardAwareScrollView}  from 'react-native-keyboard-aware-scrollview'

let failedImg = require('./../../../../../assets/images/otherImages/svg/failedXIcon.svg');

const  ObsReviewUI = ({route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [loadingMsg, set_loadingMsg] = useState(undefined);
    const [selectedPet, set_selectedPet] = useState(undefined);
    const [obsText , set_obsText] = useState(undefined);
    const [obsImg , set_obsImg] = useState(undefined);
    const [obsVid , set_obsVid] = useState(undefined);
    const [selectedBehaviour, set_selectedBehaviour] = useState(undefined);
    const [selectedDate, set_selectedDate] = useState(new Date());
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [popUplftBtnEnable, set_popUplftBtnEnable] = useState(false);
    const [popUplftBtnTitle, set_popUplftBtnTitle] = useState('');
    const [popupRgtBtnTitle,set_popupRgtBtnTitle] = useState(undefined);
    const [thumbnailImage, set_thumbnailImage] = useState(undefined);
    const [mediaArray, set_mediaArray] = useState([]);
    const [imgName, set_imgName] = useState(undefined);
    const [videoName, set_videoName] = useState(undefined);

    useEffect(() => {

        set_isLoading(props.isLoading);
        set_loadingMsg(props.loadingMsg);
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);
        set_popUplftBtnEnable(props.popUplftBtnEnable);
        set_popUplftBtnTitle(props.popUplftBtnTitle);
        set_popupRgtBtnTitle(props.popupRgtBtnTitle)

    }, [props.isLoading,props.loadingMsg,props.isPopUp,props.popUpMessage,props.popUpAlert,props.popUplftBtnEnable,props.popUplftBtnTitle,props.popupRgtBtnTitle]);

    useEffect(() => {

        set_mediaArray(props.mediaArray);

    }, [props.mediaArray]);

    useEffect(() => {
        set_selectedPet(props.selectedPet);
        set_obsText(props.obsText);
        set_obsImg(props.imagePath);
        set_obsVid(props.videoPath);
        set_thumbnailImage(props.thumbnailImage);

        set_selectedBehaviour(props.selectedBehaviour);
        if(props.selectedDate){
            set_selectedDate(moment(new Date(props.selectedDate)).format("MM-DD-YYYY"));   
        }
        
    }, [props.selectedPet,props.obsText,props.selectedBehaviour,props.selectedDate,props.imagePath,props.thumbnailImage,props.videoPath]);

    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const removeMedia = (item,index) => {
        props.removeMedia(item,index);
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
                    title={'Review Observation'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center'}}>

                    <View style={styles.backObsDataViewStyle}>

                        <View style={{justifyContent:'center'}}>

                            <Text style={CommonStyles.headerTextStyle}>{'Your Observation'}</Text>

                            <View style={styles.dataViewStyle}>

                                <View style={styles.viewStyle}>
                                    <TextInput
                                        style={styles.textInputStyle}
                                        multiline={true}
                                        underlineColorAndroid="transparent"
                                        value={obsText}
                                        editable={false}
                                        />  
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={styles.viewStyle}>
                                    <Text style={styles.labelTextStyles}>{'Pet Name'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{selectedPet ? selectedPet.petName : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={styles.viewStyle}>
                                    <Text style={styles.labelTextStyles}>{'Behavior'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{selectedBehaviour ? selectedBehaviour.behaviorName : ''}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={styles.viewStyle}>
                                    <Text style={styles.labelTextStyles}>{'Date'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{''+selectedDate}</Text>
                                </View>
                                
                            </View>

                            {mediaArray && mediaArray.length>0 ? <View style={styles.mediaUIStyle}>

                                <FlatList
                                        style={styles.flatcontainer}
                                        data={mediaArray}
                                        showsVerticalScrollIndicator={true}
                                        renderItem={({ item, index }) => (
                                            <TouchableOpacity disabled={false} onPress={() => {}}>
                                                <View style={styles.flatview}>
                                                    <Text numberOfLines={2} style={[styles.name]}>{item.fileName ? item.fileName : item.fileType}</Text>
                                                    {mediaArray[index].fileType === 'video' ? <ImageBackground source={{uri : mediaArray[index].localThumbImg }} style={styles.media} imageStyle={{borderRadius:5}}>

                                                    <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item,index)}>
                                                        <Image source={failedImg} style={styles.imageBtnStyle1}/>
                                                    </TouchableOpacity>

                                            </ImageBackground> : (mediaArray[index].filePath && mediaArray[index].filePath!=='' ?<ImageBackground source={{uri : mediaArray[index].filePath }} style={styles.media} imageStyle={{borderRadius:5}}>

                                                    <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item,index)}>
                                                        <Image source={failedImg} style={styles.imageBtnStyle1}/>
                                                    </TouchableOpacity>

                                            </ImageBackground> : <ImageBackground source={{uri : mediaArray[index].fbFilePath }} style={styles.media} imageStyle={{borderRadius:5}}>

                                            <TouchableOpacity style={styles.imageBtnStyle} onPress={() => removeMedia(item,index)}>
                                                <Image source={failedImg} style={styles.imageBtnStyle1}/>
                                            </TouchableOpacity>

                                            </ImageBackground>)
                                            }
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                        enableEmptySections={true}
                                        keyExtractor={(item,index) => index}
                                    />
                                </View> : null}

                    </View>

                </View>
                
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {popUplftBtnEnable}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {popUplftBtnTitle}
                    rightBtnTilte = {popupRgtBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent loaderText = {loadingMsg} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default ObsReviewUI;

  const styles = StyleSheet.create({
  
    textInputStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      flex: 1,
      marginTop:hp('2%'),
      marginBottom:hp('2%'),
      color: "black",
    },

    backObsDataViewStyle : {
        alignItems:'center',
        marginTop: hp("3%"),
    },

    dataViewStyle : {
        minHeight:hp('6%'),
        width:wp('80%'),
        marginTop: hp("2%"),
        borderRadius:5,
        borderColor:'#EAEAEA',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    },

    labelTextStyles : {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        alignSelf:'center'
    },

    selectedDataTextStyles : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        marginTop: hp("1%"),
        marginBottom: hp("1%"),
        textAlign:'right'
    },

    viewStyle : {
        flexDirection:'row',
        justifyContent:'space-between',
        width:wp('70%')
    },

    media: {       
        width:wp('10%'),
        aspectRatio:1,
        resizeMode:'contain',
        marginRight:hp('1%'),
    },

    imageBtnStyle : {
        width:wp('8%'),
        aspectRatio:1,
        borderRadius:100,
        alignSelf:'flex-end',
        marginRight:wp('-1%'),
        justifyContent:'flex-end',
        alignItems:'flex-end'
    },

    imageBtnStyle1 : {
        width:wp('6%'),
        height:hp('6%'),
        resizeMode:'contain'
    },

    flatcontainer: {
        width: wp("80%"), 
    },
  
    flatview: {
        height: hp("8%"),
        alignSelf: "center",
        justifyContent: "space-between",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('75%'),
        alignItems:'center',
        flexDirection:'row',
        
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
        width:wp('60%'),
        marginLeft:hp('1%'),
    },

    mediaUIStyle : {
        height:hp('25%'),
        width:wp('80%'),
        borderColor:'#D5D5D5',
        borderWidth : 2,
        borderRadius:5,
        borderStyle: 'dashed',
        alignItems:'center',
        justifyContent:'center',
        marginTop:hp('2%'),
    },

  });