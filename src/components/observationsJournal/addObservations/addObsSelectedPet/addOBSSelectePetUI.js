import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TextInput,Keyboard,TouchableOpacity,Image,ImageBackground} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import fonts from '../../../../utils/commonStyles/fonts'
import SelectPetComponent from '../../../../utils/selectPetComponent/selectPetComponent';
import AlertComponent from './../../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../../utils/commonStyles/commonStyles';

const  AddOBSSelectPetUI = ({route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpAlert, set_popUpAlert] = useState(undefined);

    useEffect(() => {
        set_petsArray(props.petsArray);
    }, [props.petsArray, props.selectedIndex,props.fromScreen]);

    useEffect(() => {
        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpAlert(props.popUpAlert);

    }, [props.isPopUp,props.popUpMessage,props.popUpAlert]);

    const nextButtonAction = () => {
      props.submitAction();
    };

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
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
                    title={'Observations'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.petSelViewComponentStyle}>
                <SelectPetComponent 
                petsArray = {petsArray}
                selectedIndex = {props.selectedIndex}
                selectPetAction = {selectPetAction}
                />
                
            </View>

            <View style={styles.petImgStyle}>
                
                <Image source={require("./../../../../../assets/images/dogImages/dogImg3.svg")} style={styles.dogImgStyle}/>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {props.fromScreen === "quickVideo" ? true : false}
                    rigthBtnState = {props.nxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
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
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null} 

         </View>
    );
  }
  
  export default AddOBSSelectPetUI;

  const styles = StyleSheet.create({

    petSelViewComponentStyle : {
        height:hp('50%'),
        width:wp('100%'),
    },

    petImgStyle : {
        height:hp('20%'),
        width:wp('100%'),
        justifyContent:'center',
        alignItems:'center'
    },

    dogImgStyle : {
        width:wp('50%'),
        aspectRatio:1,
        resizeMode:'contain',
        overflow:'hidden'
    }

  });