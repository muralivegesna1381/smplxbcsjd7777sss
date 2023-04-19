import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList, ImageBackground,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

let defaultPetImg = require( "../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const  CampaignUi = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [leaderBoardArray, set_leaderBoardArray] = useState(undefined);
    const [leaderPetId, set_leaderPetId] = useState(undefined);
    const [leaderPetUrl, set_leaderPetUrl] = useState(undefined);
    const [imgLoader, set_imgLoader] = useState(true);

    useEffect(() => {

        set_leaderBoardArray(props.leaderBoardArray);
        set_leaderBoardCurrent(props.leaderBoardCurrent);
        if(props.leaderBoardCurrent){
          set_leaderPetId(props.leaderBoardCurrent.petId);
          set_leaderPetUrl(props.leaderBoardCurrent.petPhotoUrl);
        }
        
    }, [props.leaderBoardArray,props.leaderBoardCurrent]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const navigateToRewards = () => {
      props.navigateToRewards(leaderBoardCurrent.petId,leaderBoardCurrent,'campaign')
    };

    const renderItem = ({ item, index }) => {

        return (

          <TouchableOpacity key={index} style={ {alignItems:'center'}} disabled={true} onPress={() => {}}>

            <View style={styles.renderItemStyle}>
            
              <TouchableOpacity disabled={item.petId === leaderPetId ? false : true} onPress={() => item.petId === leaderPetId ? navigateToRewards() : null}>

                  <View style={item.petId === leaderPetId ? [styles.bgViewStyle,{backgroundColor:'#6BC105'}] : [styles.bgViewStyle]}>
                  <Text style={item.petId === leaderPetId ? [styles.rankTxtStyle,{color:'white'}] : [styles.rankTxtStyle]}>{item.rank}</Text>

                  <ImageBackground style={styles.bgViewImgStyle} source= {defaultPetImg}>
                      {item && item.petPhotoUrl && item.petPhotoUrl!=="" ? <ImageBackground>
                        <ImageBackground style={styles.bgViewImgStyle} source= {{uri: item.petPhotoUrl}} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)}>
                        {imgLoader ? <ActivityIndicator size='small' color="grey"/> : null}
                        </ImageBackground>
                        </ImageBackground>
                        : null}
                  </ImageBackground>

                      <Text style={item.petId === leaderPetId ? [styles.bgViewTextStyle,{color:'white'}] : [styles.bgViewTextStyle]}>{item.petName}</Text>
                      <Text style={item.petId === leaderPetId ? [styles.bgViewPointsTxtStyle,{color:'white'}] : [styles.bgViewPointsTxtStyle]}>{item.points}</Text>
                      {item.petId ===leaderPetId ? <Image style={styles.imgBtnStyle} source={require("./../../../../assets/images/pointTracking/svg/leaderBoardUpArrow.svg")}></Image> : null}        
                  </View>
                  
                </TouchableOpacity>

            </View>

          </TouchableOpacity>

        );

      };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Leaderboard'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View >

                <View style ={{flexDirection:'row',height:hp('8%'),width: wp('90%'),alignSelf:'center',alignItems:'center'}}>
                    <Text style={styles.titleStyle}>{leaderBoardArray ? leaderBoardArray[0].campaignName : ''}</Text>
                </View>

                <View style={{height:hp('80%'),width: wp('100%')}}>
                { leaderBoardArray ?
                  <FlatList
                    style={{marginBottom: wp('5%')}}
                    data={leaderBoardArray}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => "" + index}
                  />
                  : null} 
                </View>
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

         </View>
    );
  }
  
  export default CampaignUi;

  const styles = StyleSheet.create({

  titleStyle : {
    color:'black',
    fontSize:fonts.fontNormal,
    ...CommonStyles.textStyleBold,
  },

  bgViewStyle : {
    backgroundColor:'white',
    borderRadius:5,
    width:wp('90%'),
    height:hp('6%'),
    flexDirection:'row',
    alignItems:'center',
    borderColor:'#EAEAEA',
    borderWidth:1
  },
    
  bgViewImgStyle : {
    width:wp('8%'),
    aspectRatio:1,
    borderRadius:100,
    resizeMode: 'stretch',
    overflow:'hidden',
    // backgroundColor:'#6BC105',
  },
    
  bgViewTextStyle : {
    fontSize: fonts.fontMedium,
    ...CommonStyles.textStyleMedium,
    color:'black',
    flex:5,
    paddingLeft:15,
  },
    
  bgViewPointsTxtStyle : {
    color:'#6BC105', 
    fontSize: fonts.fontNormal,
    ...CommonStyles.textStyleBold,
    flex:1.5,
    textAlign:'center'
  },
    
  imgBtnStyle: {
    height: hp("3.5%"),
    width: hp("3.5%"),
    alignSelf: "center",
    resizeMode: "contain",
    marginRight:wp('1%'),
    marginLeft:wp('1%'),
    marginBottom:hp('1%'),
  },

  renderItemStyle : {       
    width:wp('90%'),
    alignItems:'center',
    marginTop:hp('1%'),
  },

  rankTxtStyle : {
    color:'black', 
    fontSize: fonts.fontLarge,
    ...CommonStyles.textStyleExtraBoldItalic,
    marginLeft:hp('2%'),
    flex:0.8,
    // marginRight:hp('2%'),
  },

});