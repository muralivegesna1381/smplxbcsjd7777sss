import React, {useState,useEffect} from 'react';
import {StyleSheet, View,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent1 from "../../utils/commonComponents/bottomComponent1";
import fonts from '../../utils/commonStyles/fonts'
import AlertComponent from '../../utils/commonComponents/alertComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import { useLazyQuery, useQuery } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as Constant from "./../../utils/constants/constant";

const WelcomeComponent = ({navigation, route, ...props }) => {

    const { loading, data:logoutData } = useQuery(Queries.LOG_OUT_APP_ERROR, { fetchPolicy: "cache-only" });
    const [isPopUp, set_isPopUp] = useState(false);

    useEffect(() => {

        if (logoutData&& logoutData.data.__typename === 'LogOutAppError' && logoutData.data.isLogOutError === 'logOutError') {
          set_isPopUp(true)
        }
    
      }, [logoutData]);

    const topButtonAction = () => {
        navigation.navigate('LoginComponent');
    }

    const bottomButtonAction = () => {
        navigation.navigate('PetParentProfileComponent',{isFrom:'welcomeScreen'});
    }

    const popOkBtnAction = () => {
        set_isPopUp(false);
    }

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={styles.mainViewStyle}>
                <View>
                    <Image source={require("./../../../assets/images/otherImages/svg/appHeader.svg")} style={styles.headerearables}/>
                </View>
            </View>
           
            <View style={styles.bottomViewComponentStyle}>
                <BottomComponent1
                    topBtnTitle = {'LOGIN'}
                    bottomBtnTitle  = {'NEW USER ?'}
                    topButtonAction = {async () => topButtonAction()}
                    bottomButtonAction = {async () => bottomButtonAction()}

                ></BottomComponent1>
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Sorry!'}
                    message={Constant.AUTO_LOGOUT_MSG}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}

        </View>
    );
};

export default WelcomeComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row',
    },

    bottomViewComponentStyle : {
        
        height:hp('25%'),
        width:wp('100%'),
        backgroundColor:'green',
        position:"absolute",
        bottom:0,
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontXXXXLarge,
        ...CommonStyles.textStyleBlack,       
    },

    subHeaderStyle : {
        color: 'grey',
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleRegular,       
    },

    headerearables : {
        marginBottom: wp("25%"),
         width:wp('70%'),
         height:wp('20%'),
         resizeMode:'contain'
    }

});