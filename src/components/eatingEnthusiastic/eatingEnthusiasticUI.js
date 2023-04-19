import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,Image,TouchableOpacity,ScrollView,FlatList} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';

const EatingEnthusiasticUI = ({route, ...props }) => {

    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [eatingEntArray, set_eatingEntArray] = useState([]);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [specieId, set_specieId] = useState("1");
    const [dogImgArray, set_dogImgArray] = useState(
        [require("./../../../assets/images/scoreImages/dogOne.svg"),
        require("./../../../assets/images/scoreImages/dogTwo.svg"),
        require("./../../../assets/images/scoreImages/dogThree.svg"),
        require("./../../../assets/images/scoreImages/dogFour.svg"),
        require("./../../../assets/images/scoreImages/dogFive.svg"),
        require("./../../../assets/images/scoreImages/dogSix.svg"),
        require("./../../../assets/images/scoreImages/dogSeven.svg")]
    );

    const [catImgArray, set_catImgArray] = useState(
        [require("./../../../assets/images/scoreImages/catOne.svg"),
        require("./../../../assets/images/scoreImages/catTwo.svg"),
        require("./../../../assets/images/scoreImages/catThree.svg"),
        require("./../../../assets/images/scoreImages/catFour.svg"),
        require("./../../../assets/images/scoreImages/catFive.svg"),
        require("./../../../assets/images/scoreImages/catSix.svg"),
        require("./../../../assets/images/scoreImages/catSeven.svg")]
    );

    // Setting the values from props to local variables
    useEffect(() => {
        set_isLoading(props.isLoading);
        set_popUpMessage(props.popupMsg);
        set_isPopUp(props.isPopUp);
        set_eatingEntArray(props.eatingEntArray);
        set_specieId(props.specieId);
    }, [props.isLoading,props.eatingEntArray,props.isPopUp,props.popupMsg,props.specieId]);

    // Next btn action
    const nextButtonAction = () => {
      props.submitAction(selectedIndex);
    };

    // Back btn Action
    const backBtnAction = () => {
      props.navigateToPrevious();
    };

    // Popup btn Action
    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    // Selects the index value 
    const selectAction = (value, index) => {
        set_selectedIndex(index);
    };

    const _renderObservations = (item,index) => {

        return (
           <>
            <TouchableOpacity style={styles.tableContentViewStyle} onPress={() => { selectAction('MOST ENTHUSED', index)}}>
                <Image style={styles.btnSelectStyle} source={selectedIndex === index ? require("./../../../assets/images/scoreImages/eRadioSelected.svg") : require("./../../../assets/images/scoreImages/eRadioUnSel.svg")}></Image>
                <Image style= {[styles.dogStyle]} source={specieId === "1" ? dogImgArray[index] : catImgArray[index]}></Image>
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
                    title={'Eating Enthusiasm'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center',justifyContent:'center'}}>

                <View style={{marginTop:hp('2%'),width:wp('80%'),}}>
                    <Text style={[styles.headerTextStyle]}>{specieId === "1" ? 'Thinking about the last meal you fed your dog, how would you rank your dog’s enjoyment of or enthusiasm for eating their food.' : 'Thinking about the last meal you fed your cat, how would you rank your cat’s enjoyment of or enthusiasm for eating their food.'}</Text>
                </View>

                <FlatList
                  style={styles.flatcontainer}
                  data={eatingEntArray}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item,index}) => (_renderObservations(item,index))}
                  keyExtractor={(item,index) => "" + index}
                />

            </View>
            
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {selectedIndex >= 0 ? true : false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                />
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {"OK"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default EatingEnthusiasticUI;

  const styles = StyleSheet.create({

    flatcontainer: {
        width: "100%",
    },

    headerTextStyle : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },

    tableContentViewStyle : {
        width:wp('90%'),
        height:hp('12%'),
        borderBottomColor:'#E7F0FC',
        borderBottomWidth:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        alignSelf:'center',
    },

    dogStyle : {
        width:wp('30%'),
        aspectRatio:1.5,
        resizeMode:'contain',
    },

    btnSelectStyle: {
        width: wp('5%'),
        height: hp('3%'),
        resizeMode: 'contain',
        flex:0.2
    },

  });
