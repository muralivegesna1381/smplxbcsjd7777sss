import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,TouchableOpacity,Image, ImageBackground,FlatList} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import moment from 'moment';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant";
import ImageView from "react-native-image-viewing";

const  ViewObservationsUi = ({route, ...props }) => {

    const navigation = useNavigation();
    const [obsObject, set_obsObject] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(true);
    const [behvText, set_behvText] = useState(undefined);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);
    const [thumbnailImage, set_thumbnailImage] = useState(undefined);
    const [mediaArray, set_mediaArray] = useState([]);

    useEffect(() => {

        set_obsObject(props.obsObject);

        if(props.mediaArray) {
            set_mediaArray(props.mediaArray);
        }
        
        if(props.behavioursData){
            getBehaviourName(props.behavioursData,props.obsObject.behaviorId);
        }

    }, [props.obsObject,props.behavioursData,props.mediaArray]);

    useEffect(() => {

    }, [props.isPopUp,props.popUpMessage,props.popUpAlert,props.popUplftBtnEnable,props.popUplftBtnTitle,props.popupRgtBtnTitle]);

    const getBehaviourName = async (bData,bType) => {
        let bText = await findArrayElement(bData,bType);
        if(bText){
            set_behvText(bText.behaviorName);
        } else {
            set_behvText('--');
        }
        
    };

    function findArrayElement(array, behaviorType) {
        return array.find((element) => {
          return element.behaviorId === behaviorType;
        })
    };

    const deleteButtonAction = (item) => {
      props.deleteButtonAction(item);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const viewAction = (item) => {

        if(item.type==='image'){
            if(item.filePath!==''){
                let img = {uri : item.filePath};
                set_images([img]);
                set_isImageView(true);
            }
            
        } else {
            if(item.videoUrl!==''){
                props.viewAction(item);
            }
            
        }

    };

    const leftButtonAction = () => {
        props.leftButtonAction();
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
                    title={'View Observation'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

                <View style={styles.middleViewStyle}>

                    <View style={[styles.dataViewStyle,{height:hp('12%'),}]}>

                        <View style={styles.viewStyle}>
                            <TextInput
                                style={styles.textInputStyle}
                                multiline={true}
                                underlineColorAndroid="transparent"
                                value={obsObject ? obsObject.obsText : '--'}
                                editable={false}
                            />  
                        </View>

                    </View>

                    <View style={styles.dataViewStyle}>

                        <View style={styles.viewStyle}>
                            <Text style={styles.labelTextStyles}>{'Selected Date'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{obsObject ? (obsObject.observationDateTime ? moment(obsObject.observationDateTime).format("MM-DD-YYYY") : '') : '--'}</Text>
                        </View>

                    </View>

                    <View style={styles.dataViewStyle}>

                        <View style={styles.viewStyle}>
                            <Text style={styles.labelTextStyles}>{'Modified Date'}</Text>
                            <Text style={styles.selectedDataTextStyles}>{obsObject ? (obsObject.modifiedDate ? moment(obsObject.modifiedDate).format("MM-DD-YYYY") : '') : '--'}</Text>
                        </View>

                    </View>
                    
                    <View style={[styles.dataViewStyle,{ minHeight:hp('11%'),flexDirection:'row'}]}>

                        <View style={[styles.viewStyle,{}]}>
                            <Text style={styles.labelTextStyles}>{'Behavior'}</Text>

                            <Text style={[styles.selectedDataTextStyles,{flex:3}]}>{behvText}</Text>
                        </View>

                    </View>

                    {mediaArray && mediaArray.length>0 ? <View style= {styles.videoUIStyle}>

                        <View style={{height: hp('25%')}}>

                            <FlatList
                                    style={styles.flatcontainer}
                                    data={mediaArray}
                                    showsVerticalScrollIndicator={false}
                                    nestedScrollEnabled
                                    renderItem={({ item, index }) => (
                                        <TouchableOpacity onPress={() => viewAction(item)}>
                                            <View style={styles.flatview}>
                                                <Text style={[styles.name]}>{item.type==='image' ? item.fileName : item.videoName}</Text>

                                                {item.type==='image' ? <ImageBackground source={{uri : item.filePath}} style={styles.media} imageStyle={{borderRadius:5}}>
                                                </ImageBackground> : 
                                                (item.videoUrl && item.videoUrl!=='' ? (item.videoThumbnailUrl && item.videoThumbnailUrl!=='' ? <ImageBackground source={{uri : item.videoThumbnailUrl}} style={styles.media} imageStyle={{borderRadius:5}}>
                                                    {item.type==='video' ? <Image source={require("./../../../../assets/images/otherImages/svg/observationVideoLogo.svg")} style={[styles.videoLogoStyle]}/> : null}

                                                </ImageBackground> : <ImageBackground source={require("./../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg")} style={styles.media} imageStyle={{borderRadius:5}}>
                                                    {item.type==='video' ? <Image source={require("./../../../../assets/images/otherImages/svg/observationVideoLogo.svg")} style={[styles.videoLogoStyle]}/> : null}

                                                </ImageBackground>): null)}

                                            </View>
                                        </TouchableOpacity>
                                    )}
                                    enableEmptySections={true}
                                    keyExtractor={(item,index) => index}
                                />
                    </View>

                    </View> : null}
                
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'DELETE'}
                    leftBtnTitle = {'EDIT'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => deleteButtonAction()}
                    leftButtonAction = {async () => leftButtonAction()}
                />
            </View>  

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {props.popUplftBtnEnable}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {props.popUplftBtnTitle}
                    rightBtnTilte = {props.popupRgtBtnTitle }
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isImageView ? <ImageView style = {styles.videoViewStyle}
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}
                 
            {props.isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default ViewObservationsUi;

  const styles = StyleSheet.create({

    middleViewStyle : {
        flex:1,
        alignItems:'center',
    }, 
  
    dataViewStyle : {
        height:hp('6%'),
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
        // numberOfLines:10,
        marginTop: hp("1%"),
        marginBottom: hp("1%"),
        textAlign:'right'
    },

    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontNormal,
        flex: 1,
        width:wp('60%'),
        color: "black",
    },

    viewStyle : {
        flexDirection:'row',
        justifyContent:'space-between',
        width:wp('70%'),
        alignContent:'center'
    },

    videoUIStyle : {
        minHeight:hp('10%'),
        width:wp('80%'),
        borderColor:'#D5D5D5',
        borderWidth : 2,
        borderRadius:5,
        borderStyle: 'dashed',
        alignItems:'center',
        justifyContent:'center',
        marginTop: hp("2%"),
    },

    flatcontainer: {
        width: wp("80%"),
    },
  
    flatview: {
        minHeight: hp("8%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('70%'),
        alignItems:'center',
        flexDirection:'row',
        justifyContent:'space-between'       
    },

    media: {
        width:wp('10%'),
        aspectRatio:1,
        resizeMode:'contain',
        alignItems:'center',
        justifyContent:'center'
    },

    videoLogoStyle : {
        width: wp("4%"),
        height: hp("3%"),
        resizeMode: "contain",
        overflow: "hidden",
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
        width:wp('50%'),
    },

  });