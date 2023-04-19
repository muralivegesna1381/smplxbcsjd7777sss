import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,FlatList,TouchableOpacity,Image} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import AlertComponent from '../../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../../utils/commonComponents/loaderComponent';
// import { Dropdown } from 'react-native-material-dropdown-v2-fixed';

let downArrowImg = require('./../../../../../assets/images/otherImages/svg/downArrowGrey.svg');

const  SelectBehavioursUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [behavioursData, set_behavioursData] = useState(undefined);
    const [behaviourValue,set_behaviourValue]=useState('Select a behaviour');
    const [dropDownPostion, setBehviorDropDownPostion] = useState({x: 0,y: 0,width: 0,height: 0});
    const [isObListOpen, setObListOpen] = useState(false);
    const [obserItem, set_obserItem] = useState("");
    const [obserBehaviour, set_obserBehaviour] = useState(undefined);

    useEffect(() => {
      set_isLoading(props.isLoading);
      set_behavioursData(props.behavioursData);
      
    }, [props.isLoading,props.behavioursData]);

    const nextButtonAction = () => {
      props.submitAction(obserItem);
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    function selectBehaviourDrop() {
      setObListOpen(!isObListOpen);
    };

    const renderItem = ({ item, index }) => {
      return (
        <TouchableOpacity key={index} style={{ padding: 1 }}
          onPress={() => {
            set_obserBehaviour(item.behaviorName);
            set_obserItem(item);
            setObListOpen(!isObListOpen);
          }}
        >
          <View style={{ padding: 10, backgroundColor: "#FFFFFF" }}>
            <Text>{item.behaviorName}</Text>
          </View>
        </TouchableOpacity>
      );
    };

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[styles.headerView,{}]}>
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

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center',marginTop: hp('8%')}}>
              <Text style={CommonStyles.headerTextStyleLight}>{'What have you observed in your pet today ?'}</Text> 
               <View style={{width: wp('80%'),marginTop: hp('5%'),alignItems:'center'}}>

                    <TouchableOpacity style={{flexDirection:'row',borderWidth: 0.5,borderColor: "#D8D8D8",borderRadius: hp("0.5%"),width: wp("80%"),}} onPress={() => {selectBehaviourDrop();}}>

                      <View>
                      <View>
                          {obserBehaviour ? <Text style = {{marginLeft: hp("2%"),marginTop: hp("2%")}}>{'Select Behaviour'}</Text> : null}
                          <View
                            onLayout={(event) => {const layout = event.nativeEvent.layout;
                              const postionDetails = {x: layout.x,y: layout.y,width: layout.width,height: layout.height,};
                              setBehviorDropDownPostion(postionDetails);
                            }} style={[styles.SectionStyle]}>
                              
                              <TextInput
                                style={styles.textInputStyle1}
                                placeholder="Select a behaviour"
                                underlineColorAndroid="transparent"
                                placeholderTextColor="#808080"
                                editable={false}
                                value={obserBehaviour}
                              />
                              
                          </View>
                          </View>
                      </View>

                      <View style={{justifyContent:'center'}}>
                          <Image source={downArrowImg} style={styles.imageStyle} />
                      </View>
     
                    </TouchableOpacity>

                  {isObListOpen && (<FlatList style={[styles.behaviourListStyle,{ top: dropDownPostion.y + dropDownPostion.height },]}
                  data={behavioursData}
                  renderItem={renderItem}
                  keyExtractor={(item, index) => "" + index}
                />
                )}

               </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {obserBehaviour ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'LOGIN'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {props.loaderMsg} isButtonEnable = {false} /> : null} 
            
         </View>
    );
  }
  
  export default SelectBehavioursUI;

  const styles = StyleSheet.create({
  mainComponentStyle : {
    flex:1,
    backgroundColor:'white'
        
  },

  headerView : {
    backgroundColor:'white',
    width:wp('100%'),
    height:hp('12%'),
    justifyContent:'center',
  },
  
    textInputStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontNormal,
      flex: 1,
      marginLeft: "5%",
      color: "#7F7F81",
    },

    headerTextStyleLight : {
      ...CommonStyles.textStyleLight,
      fontSize: fonts.fontLarge,
      color:'black',
      width: wp("60%"),
      alignSelf:'flex-start',
      marginBottom: hp("3%"),
      marginTop: hp('10%')

    },

    dropdown: {
      width: '100%',
    },

     dropdownPicker : {
      width: '80%',
      marginLeft: hp("4%"),
      
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

    textInputStyle1: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontMedium1,
      flex: 1,
      marginLeft: hp("2%"),
      color: "black",
      
    },

    imageStyle: {
      margin: "4%",
      height: 20,
      width: 20,
      resizeMode: "contain",
    },

    behaviourListStyle: {
      position: "absolute",
      width: wp("80%"),
      height: wp("70%"),
      backgroundColor: "gray",
      alignSelf: "center",
    },

    arroyImgViewStyle : {
      justifyContent:'center',
      alignItems:'center',
      backgroundColor: "gray",

    }

  });