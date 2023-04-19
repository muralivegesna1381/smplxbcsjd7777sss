import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,ImageBackground,FlatList,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import moment from "moment";
import * as Constant from "./../../../utils/constants/constant"

import deniedImg from "./../../../../assets/images/pointTracking/svg/ptDeniedImg.svg";
import approvedImg from "./../../../../assets/images/pointTracking/svg/ptTickGreeen.svg";
import pendingImg from "./../../../../assets/images/pointTracking/svg/ptPendingImg.svg";
let defaultPetImg = require( "../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const  RewardPointsUi = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [awardedArray, set_awardedArray] = useState([]);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [totalRewardPoints, set_totalRewardPoints] = useState(undefined);
    const [totalRedeemablePoints, set_totalRedeemablePoints] = useState(undefined);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [selectedBtn, set_selectedBtn] = useState("Awarded");
    const [imgLoader, set_imgLoader] = useState(true);
    const [redeemedArray, set_redeemedArray] = useState([]);
    const [isLoading, set_isLoading] = useState(false);
    const [petImg, set_petImg] = useState(undefined);

    useEffect(() => {
        set_popUpMessage(props.popUpMessage);
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);
    }, [props.isPopUp,props.popUpMessage,props.isLoading]);

    useEffect(() => {
        set_awardedArray(props.awardedArray);
        set_totalRewardPoints(props.totalRewardPoints);
        set_totalRedeemablePoints(props.totalRedeemablePoints);
        set_leaderBoardCurrent(props.leaderBoardCurrent);
        set_petImg(props.petImg);
    }, [props.awardedArray,props.totalRewardPoints,props.totalRedeemablePoints,props.leaderBoardCurrent,props.petImg]);

    useEffect(() => {
        set_redeemedArray(props.redeemedArray);
    }, [props.redeemedArray]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    const getRewardsRedeemedDetails = () => {
        props.getRewardsRedeemedDetails();
    }

    const renderRedeemedItem = ({ item, index }) => {

        return (
          <TouchableOpacity key={index} style={{backgroundColor:'#EFEFEF', width: wp("90%"), alignSelf:'center', borderBottomWidth:0.5, borderBottomColor:'grey'}} onPress={() => { }}>
            <View style={{flexDirection: "row", width:wp('100%'), backgroundColor: "white", justifyContent:'center'}}>
                <View style={{ flexDirection: "row",alignItems:'center',width:wp('90%'), height: hp("8%"),justifyContent:'center'  }}>
                <ImageBackground style={[styles.redeemImgStyle]} source={require("./../../../../assets/images/pointTracking/svg/ptPointsBckImgGreen.svg")}>
                  <Text style={styles.rankText}>{item.pointsRedeemed ? '-'+item.pointsRedeemed : 'N/A'}</Text>
                </ImageBackground>
                  <Text style={[styles.actiNameStyle,{flex:1.5,marginLeft:wp('5%')}]}>{moment(item.createdDate).format("MM-DD-YYYY")}</Text>
                  <View style={{flexDirection:'row',flex:1}}>
                  <Image source={approvedImg} style={[styles.statusImgStyle]}/>
                    <Text style={styles.actiNameStyle}>{'Redeemed'}</Text>
                  </View>
                  
                </View>
            </View>
          </TouchableOpacity>
        );
      }

    const renderItem = ({ item, index }) => {

      return (
          
          <TouchableOpacity key={index} style={{ backgroundColor:'#EFEFEF', width: wp("90%"), alignSelf:'center', borderBottomWidth:0.5, borderBottomColor:'grey'}}onPress={() => {}}>

            <View style={{backgroundColor: "#FFFFFF",flexDirection: "row", minHeight: hp("8%")}}>

              <View style={{flex: 0.3 ,alignItems: "center",justifyContent:'center',marginRight: wp("2%"), }}>
                {item.status === 'Approved' ? <ImageBackground style={styles.rankImgStyle} source={require("./../../../../assets/images/pointTracking/svg/ptPointsBckImgGreen.svg")}>
                  <Text style={styles.rankText}>{item.points ? "+"+item.points : 'N/A'}</Text>
                </ImageBackground> : 
                <ImageBackground style={styles.rankImgStyle} source={require("./../../../../assets/images/pointTracking/svg/ptPointsBckImgGrey.svg")}>
                  <Text style={styles.rankText}>{item.points ? item.points : 'N/A'}</Text>
                </ImageBackground>}
              </View>

              <View style={{ flex: 1 ,justifyContent:'center'}}>
                {item.behaviourName ? <Text style={styles.behNameStyle}>{item.behaviourName}</Text> : null}
                <Text style={styles.actiNameStyle}>{item.activityName}</Text>
              </View>

              <View style={{ flex: 1, alignItems:'flex-end',justifyContent:'center' }}>

                <Text>{moment(item.createdDate).format("MM-DD-YYYY")}</Text>
                <View style={{ flexDirection: "row", alignItems:'center' }}>
                  <Image source={ item.status === "Approved" ? approvedImg : item.status === "Pending" ? pendingImg : deniedImg} style={[styles.statusImgStyle]}/>
                  <Text style={styles.actiNameStyle}>{item.status}</Text>
                </View>

              </View>

            </View>
          </TouchableOpacity>

        );
      };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Reward Points'}
                    isBackBtnEnable={true}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={styles.topContainer}>

                <ImageBackground style={styles.rewardImgStyle} source={require("./../../../../assets/images/pointTracking/svg/rewardsHeaderBackImg.svg")}>
                
                    {/* {leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 && leaderBoardCurrent.petPhotoUrl && leaderBoardCurrent.petPhotoUrl!=="" ? <ImageBackground style={styles.imgStyle} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)}
                      source={{ uri: leaderBoardCurrent.petPhotoUrl }}></ImageBackground> 
                        : <ImageBackground style={styles.imgStyle} source={defaultPetImg}></ImageBackground>} */}

                    {petImg!=='' ? <ImageBackground style={styles.imgStyle} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => set_imgLoader(false)}
                      source={{ uri: petImg }}>
                        {imgLoader ? <ActivityIndicator size='large' color="grey"/> : null}
                      </ImageBackground> 
                        : <ImageBackground style={styles.imgStyle} source={defaultPetImg}></ImageBackground>}

                </ImageBackground>

            </View>

            <View style={styles.middleContainer}>

                <View style={{alignItems:'center',justifyContent:'center',marginTop:wp('3%')}}>
                    <Text style={styles.petNameStyle}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.petName : ''}</Text>
                    <Text style={styles.noOfPointsStyle}>{selectedBtn === "Awarded" ? "Total Reward Points" : "Total Redeemable Points"}</Text>
                    {selectedBtn === "Awarded" ? <Text style={[styles.petPointstyle]}>{totalRewardPoints}</Text>
                    : 
                    <Text style={[styles.petPointstyle]}>{totalRedeemablePoints}</Text>
                    }
                </View>

                <View style={{alignItems: "center",flexDirection: "row",justifyContent: "center",marginTop:wp('5%'),}}>
                    <TouchableOpacity style={selectedBtn === "Awarded" ? [styles.btnView, { backgroundColor: "#000000" }] : [styles.btnView]}
                    onPress={async () => { set_selectedBtn("Awarded")}}
                    >
                    <Text style={selectedBtn === "Awarded" ? [styles.btnTextStyle, { color: "#6BC105" }] : [styles.btnTextStyle1]}>{"Awarded"}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={selectedBtn === "Redeemed" ? [styles.btnView, { backgroundColor: "#000000" }] : [styles.btnView]}
                    onPress={async () => { getRewardsRedeemedDetails(); set_selectedBtn("Redeemed");}}>
                    <Text style={selectedBtn === "Redeemed" ? [styles.btnTextStyle, { color: "#6BC105" }] : [styles.btnTextStyle1]}>{"Redeemed"}</Text>
                    </TouchableOpacity>

                 </View>
            
            </View>

            <View style={styles.bottomContainer}>

                {selectedBtn === "Awarded" ? (awardedArray.length>0 ? 
                
                <View style = {{marginBottom: wp("5%")}}>
                  <FlatList
                    data={awardedArray}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => "" + index}
                  /> 
                </View>
                  
                    : 
                    (isLoading === false ?<View style={{justifyContent:'center', alignItems:'center',marginTop: hp("1%"),}}>
                    <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                    <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                    <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                  </View> : null) ) : null}

                {selectedBtn === "Redeemed" ? 
                (redeemedArray.length>0 ? 

                  <View style = {{marginBottom: wp("5%")}}>
                    <FlatList
                      data={redeemedArray}
                      renderItem={renderRedeemedItem}
                      keyExtractor={(item, index) => "" + index}
                    /> 
                  </View>
                
                : (isLoading === false ?<View style={{justifyContent:'center', alignItems:'center',marginTop: hp("1%"),}}>
                <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
              </View> : null) ) : null}

            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default RewardPointsUi;

  const styles = StyleSheet.create({

      topContainer: {
        flex:1,
      },

      middleContainer: {
        flex:1,
        marginTop: hp("5%"),
      },

      bottomContainer: {
        flex:2,
      },

      rewardImgStyle: {
        height: hp("30%"),
        width: wp("90%"),
        alignSelf: "center",
        resizeMode: "contain",
        borderRadius: 100,
        overflow:'hidden',
        shadowColor:'#6BC105',
        shadowRadius:5,
        shadowOpacity:0.6,
        alignItems:'center',
        justifyContent:'center' 
      },

      imgStyle: {
        width: wp("35%"),
        aspectRatio:1,
        resizeMode: "contain",
        overflow: "hidden",
        borderRadius: 100,
        justifyContent:'center'
      },
        
      petNameStyle: {
        ...CommonStyles.textStyleBold,
        textAlign: "left",
        color: "black",
        fontSize: fonts.fontLarge,
      },
        
      noOfPointsStyle: {
        ...CommonStyles.textStyleRegular,
        color: "black",
        fontSize: fonts.fontNormal,
      },
        
      btnView: {
        width: wp("30%"),
        minHeight: hp("4%"),
        borderRadius: 5,
        justifyContent: "center",
        alignItems: "center",
      },
        
      btnTextStyle: {
        ...CommonStyles.textStyleSemiBold,
        textAlign: "left",
        color: "black",
        fontSize: fonts.fontMedium1,
      },
          
      btnTextStyle1: {
        ...CommonStyles.textStyleRegular,
        textAlign: "left",
        color: "black",
        fontSize: fonts.fontMedium,
      },
          
      rankImgStyle: {
        height: hp("5%"),
        width: wp("10%"),
        resizeMode: "contain",
        alignItems: 'center',
        justifyContent: "center",
      },

      redeemImgStyle: {
        height: hp("5%"),
        width: wp("10%"),
        resizeMode: "contain",
        alignItems: 'center',
        justifyContent: "center",
        marginRight: wp("2%"),    
      },
        
      statusImgStyle: {
        height: hp("3%"),
        width: wp("3%"),
        alignSelf: "center",
        resizeMode: "contain",
        marginRight: hp("1%"),
      },
        
      rankText: {
        ...CommonStyles.textStyleExtraBoldItalic,
        fontSize: fonts.fontMedium1,
        color:'white'
      },

      petPointstyle : {
        ...CommonStyles.textStyleExtraBold,
        color: "#6BC105",
        fontSize: fonts.fontXXLarge,
      },

      behNameStyle : {
        ...CommonStyles.textStyleBold,
        color: "black",
        fontSize: fonts.fontMedium,   
      },

      actiNameStyle : {       
        ...CommonStyles.textStyleRegular,
        color: "black",
        fontSize: fonts.fontMedium,            
      },

  });