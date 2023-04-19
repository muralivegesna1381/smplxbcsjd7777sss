import React, { useState, useEffect, useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,Image, ScrollView,FlatList,ActivityIndicator} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";
import moment from 'moment';
import ImageView from "react-native-image-viewing";

let defaultPetImg = require( "./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const  PetEditUI = ({route, ...props }) => {

    const navigation = useNavigation();
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isEdit, set_isEdit] = useState(false);
    const [imagePathNew, set_imagePathNew] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(true);
    const [isImageView, set_isImageView] = useState(false);
    const [images, set_images] = useState([]);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);
        set_isEdit(props.isEdit);
    }, [props.isPopUp,props.isLoading,props.isEdit]);

    useEffect(() => {
        set_imagePathNew(props.imagePathNew);
    }, [props.imagePathNew]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const editButtonAction = () => {
        props.editButtonAction(!isEdit);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const actionOnRow = (item) => {

        props.actionOnRow(!isEdit,item);
 
    };

    const viewImage = () => {

        let img = { uri: imagePathNew};
        set_images([img]);
        set_isImageView(true);
        
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
                    title={'Pet Information'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={styles.middleViewStyle}>

                    {imagePathNew && imagePathNew!=='' ? <ImageBackground style = {styles.imageStyles} source={{ uri: imagePathNew}}
                    onLoadStart={() => set_imgLoader(true)}
                    onLoadEnd={() => set_imgLoader(false)}>
                        {imgLoader === true ? (<View style={CommonStyles.spinnerStyle}>
                        <ActivityIndicator size="large" color="#37B57C" />
                      </View>) : <TouchableOpacity onPress={() => viewImage()}>
                                <View style={styles.viewImgview}>
                                    <Text style={[styles.name]}>{'VIEW'}</Text>
                                </View>
                            </TouchableOpacity>}
                    </ImageBackground> 
                    : 
                    <Image style = {styles.imageStyles} source={defaultPetImg}></Image>}
                
                    <ScrollView>

                        <View style={{alignItems:'center',marginBottom: hp('18%')}}>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet Name'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj ? props.petObj.petName : null}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.speciesId ? (parseInt(props.petObj.speciesId) === 1 ? 'Dog' : 'Cat') : '--'}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Birthday'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj ? (props.petObj.birthday ? moment(new Date(props.petObj.birthday)).format("MM-DD-YYYY") : '--') : null}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Gender'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj ? props.petObj.gender : null}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Pet Breed'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj ? props.petObj.petBreed : null}</Text>
                                </View>
                                
                            </View>

                             <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Weight'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.weight ? props.petObj.weight + (props.petObj.weightUnit ? ' ' + props.petObj.weightUnit : '' ) : '--'}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Last seen'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.devices.length > 0 && props.petObj.devices[0].lastSeen ? props.petObj.devices[0].lastSeen : '--'}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{props.petObj && props.petObj.gender==='Male' ? 'Neutered' : 'Spayed'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.devices.length > 0  ? (props.petObj.isNeutered ? 'Yes' : 'No' ): '--'}</Text>
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Sensor No'}</Text>
                                    {/* <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.devices.length > 0  ? props.petObj.devices[0].deviceNumber : '--'}</Text> */}
                                    {props.petObj && props.petObj.devices && props.petObj.devices.length > 0 && props.petObj.devices[0].deviceNumber.length < 10 ? <Text style={[styles.selectedDataTextStyles]}>{props.petObj.devices[0].deviceNumber}</Text> 
                                : (props.petObj && props.petObj.devices && props.petObj.devices[0].deviceNumber ? <View>
                                    <Text style={[styles.selectedDataTextStyles]}>{props.petObj.devices[0].deviceNumber.substring(0,9)}</Text>
                                    <Text style={[styles.selectedDataTextStyles]}>{props.petObj.devices[0].deviceNumber.substring(9,props.petObj.devices[0].deviceNumber.length)}</Text>
                                </View> : null)}
                                </View>
                                
                            </View>

                            <View style={styles.dataViewStyle}>

                                <View style={{flexDirection:'row',justifyContent:'space-between',width:wp('80%'),}}>
                                    <Text style={styles.labelTextStyles}>{'Device Type'}</Text>
                                    <Text style={styles.selectedDataTextStyles}>{props.petObj && props.petObj.devices.length > 0  ? props.petObj.devices[0].deviceModel : '--'}</Text>
                                </View>
                                
                            </View>

                        </View>

                    </ScrollView>
            </View>  

            {<View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'UPDATE IMAGE'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => editButtonAction()}
                />
            </View>}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {Constant.ALERT_DEFAULT_TITLE}
                    message={Constant.SERVICE_FAIL_MSG}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isEdit ? <View style={[styles.popSearchViewStyle]}>
                    <FlatList
                        data={['Camera','Gallery','CANCEL']}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item, index }) => (
                            <TouchableOpacity onPress={() => actionOnRow(item)}>
                                <View style={styles.flatview}>
                                    <Text numberOfLines={2} style={[styles.name]}>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        enableEmptySections={true}
                        keyExtractor={(item,index) => index}
                    /> 
                        
            </View> : null}

            {isImageView ? <ImageView style = {styles.videoViewStyle}
                images={images}
                imageIndex={0}
                visible={isImageView}
                onRequestClose={() => set_isImageView(false)}
            /> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default PetEditUI;

  const styles = StyleSheet.create({

    middleViewStyle : {
        flex:1,
    }, 

    imageStyles : {
        width: wp('100%'),
        height: hp('30%'),
        resizeMode: 'cover',
        justifyContent:'flex-end',
    },

    dataViewStyle : {
        minHeight:hp('6%'),
        width:wp('90%'),
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
        // marginTop: hp("1%"),
        // marginBottom: hp("1%"),
        textAlign:'right'
    },

    flatview: {
        height: hp("8%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
        alignItems:'center',
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
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
    },

    viewImgview: {
        height: hp("3.5%"),
        width: wp("25%"),
        justifyContent: "center",
        backgroundColor: "#cbe8b0",
        alignItems:'center',
        alignSelf:'flex-end',
        borderRadius:5,
        marginRight:wp("1%"),
    },

  });