import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import Fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "../../utils/constants/constant";

const  AccountInfoUi = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [email, set_email] = useState(undefined);
    const [fullName, set_fullName] = useState(undefined);
    const [phoneNo, set_phoneNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);

    //Updating user details in UI
    useEffect(() => {
        set_phoneNo(props.phoneNo);
        set_email(props.email);
        set_fullName(props.fullName);
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);
    }, [props.email,props.fullName,props.phoneNo,props.isPopUp,props.isLoading]);

    useEffect(() => {
    }, [props.versionNumber,props.buildVersion,props.enviName]);

    // Backbutton Action
    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    // Logs out of the app
    const rightButtonAction = async () => {
        props.logOutAction();
      };

      // Popup ok button action
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    // based on the field, it navigates to edit the information of the pet parent
    const btnAction = (value) => {
        props.btnAction(value);
    };

     // Popup cancel button action
    const popCancelBtnAction = (value) => {
        props.popCancelBtnAction();
    }

    return (
        <View style={[styles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Account'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={{alignItems:'center',width:wp('100%'),height:hp('70%'),}}>
                
                <View style={{marginTop:hp('4%')}}>

                    <TouchableOpacity onPress={() => btnAction("Name")}>

                        <View style={{flexDirection:'row'}}>
                            <View style={styles.backViewStyle}>
                                <Text style={styles.headerTextStyle}>{'Name'}</Text>
                                <Text style={styles.subHeaderTextStyle}>{fullName}</Text>
                            </View>
                            <View style={{justifyContent:'center'}}>
                                <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{width:wp('5%'),height:hp('5%'),resizeMode:'contain'}}/>
                            </View>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity  onPress={() => btnAction("Email")}>
                    
                        <View style={styles.backViewStyle}>
                            <Text style={styles.headerTextStyle}>{'Email'}</Text>
                            <Text style={styles.subHeaderTextStyle}>{email}</Text>
                        </View>

                    </TouchableOpacity>

                    <TouchableOpacity  onPress={() => btnAction("Phone Number")}>
                        <View style={{flexDirection:'row'}}>
                            <View style={styles.backViewStyle}>
                                <Text style={styles.headerTextStyle}>{'Mobile'}</Text>
                                <Text style={styles.subHeaderTextStyle}>{phoneNo}</Text>
                            </View>
                            <View style={{justifyContent:'center'}}>
                                <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{width:wp('5%'),height:hp('5%'),resizeMode:'contain'}}/>
                            </View>
                        </View>
                        
                    </TouchableOpacity>

                    <TouchableOpacity  onPress={() => btnAction("Password")}>

                        <View style={{flexDirection:'row'}}>
                            <View style={styles.backViewStyle}>
                                <Text style={styles.headerTextStyle}>{'Password'}</Text>
                                <Text style={styles.subHeaderTextStyle}>{'------'}</Text>
                            </View>
                            <View style={{justifyContent:'center'}}>
                                <Image source={require("./../../../assets/images/otherImages/svg/editImg.svg")} style={{width:wp('5%'),height:hp('5%'),resizeMode:'contain'}}/>
                            </View>
                        </View>
                        
                    </TouchableOpacity>

                    </View>
                    
                                        
                    <View>

                </View>
                <View style={{position:'absolute',bottom:0}}>
                        <Text style={styles.subHeaderTextStyle}>{props.versionNumber}</Text>
                        <Text style={styles.subHeaderTextStyle}>{props.buildVersion}<Text style={styles.subHeaderTextStyle}>{props.enviName === 'tst' ? " (Testing)" : ""}</Text></Text>      
                </View>
            </View>  

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'LOG OUT'}
                    leftBtnTitle  = {''}
                    rigthBtnState = {true}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => rightButtonAction()}

                ></BottomComponent>
            </View>   

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popAlert}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {props.isPopUpLeft ? true : false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'CANCEL'}
                    rightBtnTilte = {props.popBtnName}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default AccountInfoUi;

  const styles = StyleSheet.create({
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'          
    },

    backViewStyle : {
        height:hp('8%'),
        width:wp('80%'),
        marginBottom:wp('5%'),
        justifyContent:'center'
    },

    headerTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontXSmall,
        color:'#7F7F81',
    },

    subHeaderTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: Fonts.fontMedium,
        color:'black',
        marginTop:wp('2%'),
    },

  });