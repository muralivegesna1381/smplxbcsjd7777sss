import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ImageBackground,Image,FlatList,SafeAreaView,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import AlertComponent from './../../../utils/commonComponents/alertComponent';

let defaultPetImg = require( "../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");
let downArrowImg = require("../../../../assets/images/otherImages/svg/downArrowGrey.svg");
let upArrowImg = require("../../../../assets/images/otherImages/svg/upArrow.svg");

const  LeaderBoardUI = ({route, ...props }) => {

    const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
    const [leaderBoardArray, set_leaderBoardArray] = useState([]);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [campagainArray, set_campagainArray] = useState([]);
    const [campagainName, set_campagainName] = useState("");
    const [isPetInTop, set_isPetInTop] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);
    const [dropDownPostion, set_DropDownPostion] = useState({x: 0,y: 0,width: 0,height: 0});
    const [isListOpen, set_isListOpen] = useState(false);
    const [enableLoader, set_enableLoader] = useState (true);
    const [imgLoaderLeft, set_imgLoaderLeft] = useState(true);
    const [imgLoaderMiddle, set_imgLoaderMiddle] = useState(true);
    const [imgLoaderRight, set_imgLoaderRight] = useState(true);

    useEffect(() => {

          set_leaderBoardPetId(props.leaderBoardPetId);
          set_leaderBoardArray(props.leaderBoardArray);
          set_leaderBoardCurrent(props.leaderBoardCurrent);
          set_campagainArray(props.campagainArray);
          set_campagainName(props.campagainName);
          set_enableLoader(props.enableLoader);
          if(props.leaderBoardCurrent){
            if(props.leaderBoardArray && props.leaderBoardArray.length>0){

              for(let i=0 ; i < props.leaderBoardArray.length ; i++){
                if(i < 3 && props.leaderBoardArray[i].petId === props.leaderBoardCurrent.petId){
                    set_isPetInTop(true);
                    return;
                } else {
                  set_isPetInTop(false);
                }
              
              }
            }
          } 
    }, [props.leaderBoardPetId,props.leaderBoardArray, props.leaderBoardCurrent, props.campagainArray, props.campagainName,props.enableLoader]);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);
    }, [props.isPopUp,props.popUpMessage,props.popUpAlert,props.isLoading]);

    const campaignBtnAction = () => {
      props.campaignBtnAction();
    }

    const rewardPointsBtnAction = () => {
      props.rewardPointsBtnAction();
    };

    const campaignDropAction = () => {
      set_isListOpen(!isListOpen);
    }

    const popOkBtnAction = () => {
      props.popOkBtnAction();
    }

    const popCancelBtnAction = () => {
    }

    const getCampaign = (item) => {
      props.getCampaign(item);
      set_isListOpen(false);
    };
   
    const renderItem = ({ item, index }) => {
      return (
        <TouchableOpacity key={index} style={{ padding: 1}}onPress={() => {getCampaign(item)}}>

          <View style={campagainName === item.campaignName ? [styles.cellBackViewStyle,{backgroundColor:'#6BC100'}] : [styles.cellBackViewStyle]}>
              <Text style={[styles.dropDownTextStyle,{ textTransform: 'uppercase', color:campagainName === item.campaignName ? 'white' : 'black'}]}>{item.campaignName.length > 25 ? item.campaignName.slice(0,25) + '..' : item.campaignName}</Text>
          </View>

        </TouchableOpacity>
      );
  };

    return (
        <View style={[styles.mainComponentStyle]}>

          {!props.isLoading ? <View>

            <View style={styles.topComStyle}>
            
                <View onLayout={(event) => {const layout = event.nativeEvent.layout;
                    const postionDetails = {x: layout.x,y: layout.y,width: layout.width,height: layout.height,};
                        set_DropDownPostion(postionDetails);
                    }}  style={isListOpen ? [styles.dropViewStyle1] : [styles.dropViewStyle]}>
                    <TouchableOpacity style={[styles.dropViewStyle,{flexDirection:'row'}]} disabled={campagainArray && campagainArray.length > 1 ? false : true} onPress={() => {campaignDropAction()}}>
                      <Text style={[styles.campaignHeaderStyle,{ textTransform: 'uppercase',color:leaderBoardArray && leaderBoardArray.length > 0 ? 'black' : 'grey'}]}>{campagainName &&campagainName.length > 22 ? campagainName.slice(0,22) + '...' : campagainName}</Text>
                      {campagainArray && campagainArray.length > 1 ? <Image style={[styles.rightArrowStyle]} source={isListOpen ? upArrowImg : downArrowImg}></Image> : null}
                      
                    </TouchableOpacity>
                </View>

              <TouchableOpacity style={styles.viewBtnStyle} onPress={() => {campaignBtnAction()}}>
                <Image style={[styles.eyeIconStyle]} source={require("../../../../assets/images/otherImages/svg/rightArrowLightImg.svg")}></Image>  
              </TouchableOpacity>

          </View>

          {leaderBoardArray && leaderBoardArray.length > 0 ? <View style={styles.middleComStyle}>
            <View style={{flexDirection:'row',width:wp('90%'),minHeight:hp('18%'),alignItems:'center',justifyContent:'space-between'}}>

              {leaderBoardArray && leaderBoardArray.length > 1 ? <View style={{marginRight:wp('2%')}}>

                {leaderBoardArray[1].petPhotoUrl ? <ImageBackground source={{uri:leaderBoardArray[1].petPhotoUrl}} onLoadStart={() => set_imgLoaderLeft(true)} onLoadEnd={() => {
                          set_imgLoaderLeft(false)}} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#1ce7f2',borderWidth:3 }}>
                             {imgLoaderLeft ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                            <View style={styles.rankViewStyle}>
                                <Text style={styles.rankTextStyle}>{leaderBoardArray[1].rank}</Text>
                            </View>
                </ImageBackground> : 

                <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#1ce7f2',borderWidth:3 }}>
                  <View style={styles.rankViewStyle}>
                      <Text style={styles.rankTextStyle}>{leaderBoardArray[1].rank ? leaderBoardArray[1].rank : ''}</Text>
                  </View>
                </ImageBackground>}
                
                <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                  <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[1].petName.length > 12 ? leaderBoardArray[1].petName.slice(0,12)+'...' : leaderBoardArray[1].petName) : ''}</Text>
                  <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[1].points : ''}</Text>
                </View>
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

              {leaderBoardArray && leaderBoardArray.length > 0 ? <View style={{alignItems:'center',marginRight:wp('2%')}}>
                {leaderBoardArray[0].petPhotoUrl ? <ImageBackground catche={'only-if-cached'} source={{uri:leaderBoardArray[0].petPhotoUrl}} onLoadStart={() => set_imgLoaderMiddle(true)} onLoadEnd={() => {
                          set_imgLoaderMiddle(false)}} style={[styles.leaderBoardPetStyle,{width:wp('30%'),marginTop:wp('-5%'),}]} imageStyle={{ borderRadius: 60,borderColor:'#1ef29c',borderWidth:3 }}>
                            {imgLoaderMiddle ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                            <View style={styles.rankViewStyle}>
                                <Text style={styles.rankTextStyle}>{leaderBoardArray[0].rank}</Text>
                            </View>
                </ImageBackground> :

              <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle,{width:wp('25%'),marginTop:wp('-5%'),}]} imageStyle={{ borderRadius: 60,borderColor:'#1ef29c',borderWidth:3 }}>
                  <View style={styles.rankViewStyle}>
                      <Text style={styles.rankTextStyle}>{leaderBoardArray[0].rank ? leaderBoardArray[0].rank : ''}</Text>
                  </View>
              </ImageBackground>
                
                }
                <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                  <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[0].petName.length > 12 ? leaderBoardArray[0].petName.slice(0,12)+'...' : leaderBoardArray[0].petName) : ''}</Text>
                  <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[0].points : ''}</Text>
                 </View>
                
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

             {leaderBoardArray && leaderBoardArray.length > 2 ? <View style={{alignItems:'center'}}>
                {leaderBoardArray[2].petPhotoUrl ? <ImageBackground catche={'only-if-cached'} source={{uri : leaderBoardArray[2].petPhotoUrl}} onLoadStart={() => set_imgLoaderRight(true)} onLoadEnd={() => {
                          set_imgLoaderRight(false)}} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#feff06',borderWidth:3 }}>
                            {imgLoaderRight ? <View style={{alignItems:'center',justifyContent:'center',flex:1}}>{enableLoader ? <ActivityIndicator size="large" color="gray"/> : null}</View> : null}
                            <View style={styles.rankViewStyle}>
                                <Text style={styles.rankTextStyle}>{leaderBoardArray[2].rank}</Text>
                            </View>
                </ImageBackground> :
                
                  <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#feff06',borderWidth:3 }}>
                    <View style={styles.rankViewStyle}>
                        <Text style={styles.rankTextStyle}>{leaderBoardArray[2].rank ? leaderBoardArray[2].rank : ''}</Text>
                    </View>
                  </ImageBackground>
                }
                <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardArray && leaderBoardArray.length>0 ? (leaderBoardArray[2].petName.length > 12 ? leaderBoardArray[2].petName.slice(0,12)+'...' : leaderBoardArray[2].petName) : ''}</Text>
                <Text style={styles.petPointsStyle}>{leaderBoardArray && leaderBoardArray.length>0 ? leaderBoardArray[2].points : ''}</Text>
                </View>
              </View> : <View style={[styles.leaderBoardPetStyle]}></View>}

            </View>

          </View> : <View style={styles.middleComStyle}>
            
              <View style={{alignItems:'center',flexDirection:'row',flexDirection:'row',width:wp('90%'),minHeight:hp('18%'),alignItems:'center',justifyContent:'space-between'}}>

                <View style={{marginRight:wp('2%')}}>
                    <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#1ce7f2',borderWidth:3 }}>
                      <View style={styles.rankViewStyle}>
                          <Text style={[styles.rankTextStyle,{color:'grey'}]}>{'2'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
                    </View>
                </View>

                <View style={{marginRight:wp('2%')}}>
                    <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle,{width:wp('30%'),marginTop:wp('-5%'),}]} imageStyle={{ borderRadius: 60,borderColor:'#1ce7f2',borderWidth:3 }}>
                      <View style={styles.rankViewStyle}>
                          <Text style={[styles.rankTextStyle,{color:'grey'}]}>{'1'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'--'}</Text>
                    </View>
                </View>

                <View >
                    <ImageBackground source={defaultPetImg} style={[styles.leaderBoardPetStyle]} imageStyle={{ borderRadius: 60,borderColor:'#1ce7f2',borderWidth:3 }}>
                      <View style={styles.rankViewStyle}>
                          <Text style={[styles.rankTextStyle,{color:'grey'}]}>{'3'}</Text>
                      </View>
                    </ImageBackground>
                    
                    <View style={{marginTop:wp('2%'),alignItems:'center'}}>
                      <Text style={[styles.petNameStyle,{color:'grey'}]}>{'Please wait..'}</Text>
                      <Text style={[styles.petPointsStyle,{color:'grey'}]}>{'----'}</Text>
                    </View>
                </View>

              </View>
            </View>}

          <View style={styles.bottomView}>

            {!isPetInTop && leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? <TouchableOpacity style={styles.bottomComStyle} onPress={async () => {rewardPointsBtnAction();}}>

              <ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptGradientImg.png")}>
              <View style={{width:wp('65%'),flexDirection:'row',justifyContent:'space-between',}}>
                    <View style={{flexDirection:'row',alignItems:'center'}}>
                        <View >
                          {leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 && leaderBoardCurrent.petPhotoUrl && leaderBoardCurrent.petPhotoUrl!=="" ? 
                          <ImageBackground style={styles.rewardImgStyle} imageStyle={{borderRadius:60, borderColor:'black',borderWidth:2 }} source={{uri: leaderBoardCurrent.petPhotoUrl}}></ImageBackground>
                           : <ImageBackground style={styles.rewardImgStyle} imageStyle={{borderRadius:60, borderColor:'black',borderWidth:2 }} source={defaultPetImg}></ImageBackground>}

                        </View>
                        <View style={{marginLeft:wp('4%'),justifyContent:'center'}}>
                                <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.petName.length > 20 ? leaderBoardCurrent.petName.slice(0, 20) + "..." : leaderBoardCurrent.petName : ''}</Text>
                                <Text style={styles.rewardPointsStyle}>{leaderBoardCurrent && Object.keys(leaderBoardCurrent).length !== 0 ? leaderBoardCurrent.points : ''}</Text>
                        </View>
                    </View>
                    <View style={{alignContent:"center",justifyContent:'center'}}>
                        
                            <Image style={[styles.rewardImgArrowStyle]} source={require("../../../../assets/images/otherImages/svg/rightArrowBlack.svg")}></Image>
                      
                    </View>
                </View>
              </ImageBackground>

            </TouchableOpacity>

            :

            <TouchableOpacity style={styles.bottomComStyle} onPress={async () => {
              rewardPointsBtnAction();
          }}>

            <ImageBackground style={[styles.rewardBackImgStyle]} imageStyle={{borderTopLeftRadius:5,borderTopRightRadius:5}} source={require("../../../../assets/images/pointTracking/png/ptGradientImg.png")}>
                <View style={{width:wp('55%'),flexDirection:'row',justifyContent:'space-evenly',alignItems:'center'}}>
                  <Text style={[styles.petNameStyle,{textTransform: 'uppercase'}]}>{'Reward Points'}</Text>
                  <View style={{justifyContent:'flex-end'}}>
                      <Image style={[styles.rewardImgArrowStyle]} source={require("../../../../assets/images/otherImages/svg/rightArrowBlack.svg")}></Image>              
                  </View>
                </View>
            </ImageBackground>
              
          </TouchableOpacity>
            }


          </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'TRY AGAIN'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isListOpen ? <View style={[styles.filterListStyle,{ top: dropDownPostion.y + dropDownPostion.height },]}>

                  <SafeAreaView style={{flex: 1}}>

                      <FlatList
                          nestedScrollEnabled={true}
                          data={campagainArray}
                          renderItem={renderItem}
                          keyExtractor={(item, index) => "" + index}
                      />
                        
                  </SafeAreaView>
                
                </View> : null}

          </View> : <View style={[styles.mainComponentStyle,{alignItems:'center',justifyContent:'center'}]}>
                        <ActivityIndicator size="large" color="gray"/>
                </View>}

         </View>
    );
  }
  
  export default LeaderBoardUI;

  const styles = StyleSheet.create({

        mainComponentStyle : {
          flex:1,
          alignItems:'center' , 
        },

        topComStyle : {
          flex:1,
          flexDirection:'row',
          alignItems:'center',
          width:wp('90%'),
          justifyContent:'space-between',
          marginBottom:hp('1%'), 
        },

        campaignHeaderStyle : {
          fontSize: fonts.fontMedium,
          ...CommonStyles.textStyleSemiBold,
          color:'black',
          marginLeft:wp('3%'), 
          
        },

        filterListStyle: {
          position: "absolute",
          width: wp("70%"),
          height: hp("15%"),
          backgroundColor: "#C9D6DD",
          borderBottomEndRadius : 5,
          borderBottomLeftRadius : 5,
          alignSelf:'baseline',
      },

        dropViewStyle : {
          backgroundColor:'#C9D6DD',
          width:wp('70%'),
          height:wp('10%'),
          justifyContent:'space-between',
          alignItems:'center',
          borderRadius:5
        },

        dropViewStyle1 : {
          backgroundColor:'#C9D6DD',
          width:wp('70%'),
          height:wp('10%'),
          justifyContent:'space-between',
          alignItems:'center',
          borderTopLeftRadius : 5,
          borderTopRightRadius : 5,
        },

        viewBtnStyle : {
          width:wp('15%'),
          height:wp('10%'),
          borderWidth:1,
          borderRadius:5,
          marginRight:wp('1%'),
          borderColor:'#6BC100',
          backgroundColor:'#CCE8B0',
          justifyContent:'center',
          alignItems:'center',
          
        },

        middleComStyle : {
          width:wp('90%'),
          alignItems:'center',
          flex:3,
          justifyContent:'center',
        },

        bottomView : {
          width:wp('90%'),
          alignItems:'center',
          flex:0.8,
        },

        petNameStyle : {
          color:'black',
          fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleBold,
        },

        petPointsStyle : {
          color:'black',
          fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleExtraBold,
        },

        bottomComStyle : {
          width:wp('75%'),
          height:hp('7%'),
          justifyContent:'center',
          alignItems:'center',
          bottom:0,
          position:'absolute',
        },

        leaderBoardPetStyle : {
          resizeMode: 'contain',
            width:wp('25%'),
            aspectRatio:1,
           alignSelf:'center',           
        },

        leaderBoardPetStyleTop : {
          resizeMode: 'contain',
            width:wp('25%'),
            aspectRatio:1,
           alignSelf:'center',           
        },

        leaderBoardPetStyle1 : {
          resizeMode: 'contain',          
           width:wp('20%'),
           aspectRatio:1,
           alignSelf:'center',
           marginTop:wp('5%'),
           
        },

        rewardImgStyle : {
          resizeMode: 'contain',          
           width:wp('12%'),
           aspectRatio:1,
           alignSelf:'center',
          
        },

        rewardImgArrowStyle : {
          resizeMode:'contain',          
          width:wp('4%'),
          height:hp('3%'),
          
        },

        eyeIconStyle : {
          resizeMode:'contain',          
          width:wp('2%'),
          height:hp('2%'),
          tintColor:'green'
        },

        rightArrowStyle : {
          resizeMode:'contain',          
          width:wp('4%'),
          height:hp('3%'),
          tintColor:'black',
          marginLeft:wp('1%'), 
          marginRight:wp('2%'),
        },

        rewardBackImgStyle : {
          resizeMode:'cover',          
          width:wp('90%'),
          height:hp('7%'),
          justifyContent:'center',
          alignItems:'center'
        },

        rewardPointsStyle : {
          color:'black',
          fontSize: fonts.fontXLarge,
        ...CommonStyles.textStyleExtraBoldItalic,
        },

        rankViewStyle : {
          width:wp('8%'),
          aspectRatio:1,
          backgroundColor:'#D9D9D9',
          borderRadius:50,
          alignSelf:'flex-end',
          borderColor:'#707070',
          borderWidth:1,
          bottom:0,
          position:'absolute',
          justifyContent:'center',
          alignItems:'center'
        },

        rankTextStyle : {
          color:'black',
          fontSize: fonts.fontLarge,
          ...CommonStyles.textStyleExtraBoldItalic,
          marginTop:wp('-1%'),

        },

        dropDownTextStyle : {
          color:'black',
          fontSize: fonts.fontXSmall,
          ...CommonStyles.textStyleSemiBold,
          marginLeft:wp('2%'), 

        },

        cellBackViewStyle : {
          marginBottom:wp('1%'),
          marginTop:wp('1%'), 
          marginLeft:wp('2%'), 
          borderRadius:5,
          height: hp("4%"),
          width: wp("65%"),
          justifyContent:'center',
      },

  });