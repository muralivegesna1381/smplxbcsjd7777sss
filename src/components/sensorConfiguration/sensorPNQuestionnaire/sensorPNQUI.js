import React, {useState,useEffect} from 'react';
import {StyleSheet,Text,TouchableOpacity, View,Image,ImageBackground,TextInput,FlatList} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import moment from "moment";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

let downArrowImg = require('./../../../../assets/images/otherImages/svg/downArrowGrey.svg');

const SensorPNQUI = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [weeklyArray, set_weeklyArray] = useState(['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']);
    const [weekValue,set_weekValue]=useState(undefined);
    const [dropDownPostion, set_DropDownPostion] = useState({x: 0,y: 0,width: 0,height: 0});
    const [isListOpen, set_isListOpen] = useState(false);
    const [actionValue, set_actionValue] = useState(undefined);
    const [dateValue, set_dateValue] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);

    useEffect(() => {

        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);
        set_loaderMsg(props.loaderMsg);
        set_isLoading(props.isLoading);

    }, [props.popUpMessage,props.popUpAlert,props.isPopUp,props.loaderMsg,props.isLoading]);

    const nextButtonAction = () => {
        props.nextButtonAction(actionValue,weekValue,dateValue);
    };

    const backBtnAction = () => {
        props.backBtnAction();
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction();        
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const selectAction = (actionType,index) => {
        set_actionValue(actionType);
        set_isListOpen(false);
        if(actionType==="Weekly"){
            if(!weekValue){
                set_isBtnEnable(false);
            } else {
                set_isBtnEnable(true);
            }
            set_dateValue(undefined);
        } else {
            set_isBtnEnable(true);
            set_weekValue(undefined);
            set_dateValue(moment(new Date()).format('MM-DD-YYYY').toString());
        }
        set_selectedIndex(index);
    };

    function selectWeekDropValue() {
        set_isListOpen(!isListOpen);
    };
  
      const renderItem = ({ item, index }) => {
        return (
          <TouchableOpacity key={index} style={{ padding: 1 }}
            onPress={() => {
              set_weekValue(item);
              set_isListOpen(!isListOpen);
              set_isBtnEnable(true);
            }}
          >
            <View style={{ padding: 10, backgroundColor: "#FFFFFF" }}>
              <Text style={{color: 'black',}}>{item}</Text>
            </View>
          </TouchableOpacity>
        );
      };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Notifications'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center'}}>

                    <View style={{width:wp('80%'),marginTop:hp('5%')}}>
                        <Text style={CommonStyles.headerTextStyleLight}>{"When would you like to recieve notification's"}</Text>

                    </View>

                    <View style={{flexDirection:'row',marginTop:hp('5%')}}>

                            <TouchableOpacity  onPress={() => selectAction('Weekly',0)}>
                                
                                <View style={selectedIndex === 0 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                    <ImageBackground
                                            source={selectedIndex === 0 ? require("./../../../../assets/images/otherImages/svg/radioBtnSelectedImg.svg") : require("./../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")}
                                            style={styles.petImgStyle}
                                            resizeMode = 'contain'
                                            >
                                        </ImageBackground>

                                    <Text style={[styles.name]}>{'Weekly'}</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity  onPress={() => selectAction('Bi-Weekly',1)}>

                                <View style={selectedIndex === 1 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                        <ImageBackground
                                            source={selectedIndex === 1 ? require("./../../../../assets/images/otherImages/svg/radioBtnSelectedImg.svg") : require("./../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")}
                                            style={styles.petImgStyle}
                                            resizeMode = 'contain'
                                            >
                                        </ImageBackground>

                                    <Text style={[styles.name]}>{'Bi-Weekly'}</Text>
                                </View>

                            </TouchableOpacity>

                            <TouchableOpacity  onPress={() => selectAction('Monthly',2)}>

                                <View style={selectedIndex === 2 ? [styles.activityBckView] : [styles.unActivityBckView]}>

                                    <ImageBackground
                                            source={selectedIndex === 2 ? require("./../../../../assets/images/otherImages/svg/radioBtnSelectedImg.svg") : require("./../../../../assets/images/otherImages/svg/radioBtnUnSelectedImg.svg")}
                                            style={styles.petImgStyle}
                                            resizeMode = 'contain'
                                            >
                                        </ImageBackground>

                                    <Text style={[styles.name]}>{'Monthly'}</Text>
                                </View>

                            </TouchableOpacity>

                    </View>

                    {actionValue === "Weekly" ?<View style={{width: wp('80%'),marginTop: hp('5%'),alignItems:'center'}}>

                    <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),}} onPress={() => {selectWeekDropValue();}}>

                      <View>
                      <View>
                          {weekValue ? <Text style={[styles.weeksTxtStyle1,{marginLeft: hp("2%"),marginTop: hp("2%")}]}>{'Select the Day'}</Text> : null}
                          <View
                            onLayout={(event) => {const layout = event.nativeEvent.layout;
                              const postionDetails = {x: layout.x,y: layout.y,width: layout.width,height: layout.height,};
                              set_DropDownPostion(postionDetails);
                            }} style={weekValue ? [styles.SectionStyle,{height: hp("5%"),}] : [styles.SectionStyle]}>

                              <Text style={weekValue ? [styles.weeksTxtStyle] : [styles.weeksTxtStyle1,{flex:1}]}>{weekValue ? weekValue : "Select the Day"}</Text>
                              
                          </View>
                          </View>
                      </View>

                      <View style={{justifyContent:'center'}}>
                          <Image source={downArrowImg} style={styles.imageStyle} />
                      </View>
     
                    </TouchableOpacity>

                  {isListOpen && (<FlatList style={[styles.weeksListStyle,{ top: dropDownPostion.y + dropDownPostion.height },]}
                  data={weeklyArray}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => "" + index}
                />
                )}

               </View> : <View  style={{width:wp('80%'),marginTop:hp('5%'),alignItems:"center"}}>
                        {actionValue === "Bi-Weekly" || actionValue === "Monthly" ? 
                        <Text style={styles.instTxtStyle1}>{actionValue === "Bi-Weekly" ? 'You will receive bi-weekly sensor battery notifications starting ' : 'You will receive monthly sensor battery notifications starting '}
                        </Text> : null}
                        <Text style={styles.instTxtStyle}>{dateValue}</Text>
                        
                   </View>}

            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'CONTINUE'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {isBtnEnable ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}

                ></BottomComponent>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpAlert}
                    message={popUpMessage}
                    isLeftBtnEnable = {true}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {'YES'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {loaderMsg} isButtonEnable = {false} /> : null} 

        </View>
    );
};

export default SensorPNQUI;

const styles = StyleSheet.create({

        instTxtStyle : {
            color: 'black',
            fontSize: fonts.fontXLarge,
            ...CommonStyles.textStyleMedium,
        },

        instTxtStyle1 : {
            color: 'black',
            fontSize: fonts.fontNormal,
            ...CommonStyles.textStyleRegular,
        },

        activityBckView: {
            width:wp('28%'),
            height:hp('12%'),
            justifyContent:'center',
            alignItems:'center',
            borderWidth:1,
            borderColor : '#96B2C9',
            marginBottom: hp("2%"),
            marginRight: hp("0.5%"),
            marginLeft: hp("0.5%"),
            borderRadius:5,
            backgroundColor:'#F6FAFD'
        },

        unActivityBckView: {
            width:wp('28%'),
            height:hp('12%'),
            justifyContent:'center',
            alignItems:'center',
            borderWidth:1,
            borderColor : '#EAEAEA',
            marginBottom: hp("2%"),
            marginRight: hp("0.5%"),
            marginLeft: hp("0.5%"),
            borderRadius:5,
            backgroundColor:'white'
        },

        name: {
            ...CommonStyles.textStyleBold,
            fontSize: fonts.fontMedium,
            textAlign: "center",
            color:'black',
            marginTop: hp("1%"),
        },

        petImgStyle: {
            width: wp("8%"),
            aspectRatio :1,
        },

        SectionStyle: {
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            height: hp("8%"),
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

      weeksListStyle: {
        position: "absolute",
        width: wp("80%"),
        height: wp("40%"),
        backgroundColor: "gray",
        alignSelf: "center",
      },

      weeksTxtStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        flex: 1,
        marginLeft: hp("2%"),
        color: "black",
    },

    weeksTxtStyle1 : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium,
        marginLeft: hp("2%"),
        color: "#7F7F81",
    }

});