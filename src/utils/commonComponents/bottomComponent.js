import React, { useState, useEffect } from 'react';
import {SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity, View,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

// const BottomComponent = ({navigation, route,leftBtnTitle,rightBtnTitle, rightBtnbckColor,leftBtnbckColor,rightBtnBorderColor,leftBtnBorderColor,rightBtnTitleColor,leftBtnTitleColor,isLeftBtnEnable,rigthBtnState,...props }) => {

const BottomComponent = ({navigation, route,leftBtnTitle,rightBtnTitle,isLeftBtnEnable,isRightBtnEnable,rigthBtnState,...props }) => {

    useEffect (() => {
    },[]);

    const leftButtonAction = () => {
        props.leftButtonAction();
    }

    const rightButtonAction = () => {
        props.rightButtonAction();
    }

    return (

        <View style={[styles.mainComponentStyle]}>
            {isLeftBtnEnable ? <TouchableOpacity style={styles.leftButtonstyle} onPress={() => {leftButtonAction()}}>

                <Text style={[styles.leftBtnTextStyle]}>{leftBtnTitle}</Text>
            </TouchableOpacity> : null}

            {isRightBtnEnable ? <TouchableOpacity style={rigthBtnState ? [styles.rightButtonstyleEnable] : [styles.rightButtonstyleEnable,{opacity:0.4}]} disabled = {rigthBtnState ? false : true} onPress={() => {rightButtonAction()}}>
                {<Text style={[styles.rightBtnTextStyle]}>{rightBtnTitle}</Text>}
            </TouchableOpacity> : null}
            {/* {isRightBtnEnable ? <View style={rigthBtnState ? [styles.rightButtonstyleEnable] : [styles.rightButtonstyleEnable]} >
              <TouchableOpacity style={{height:hp('7%'),alignItems:'center',justifyContent:'center',backgroundColor:'red',opacity:0.4}} disabled = {rigthBtnState ? false : true} onPress={() => {rightButtonAction()}}>
                {<Text style={[styles.rightBtnTextStyle]}>{rightBtnTitle}</Text>}
            </TouchableOpacity>
            </View> : null} */}
            
        </View>
    );
};

export default BottomComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        width:wp('100%'),
        height:hp('100%'),
        backgroundColor:'white',
        position:"absolute",
        // shadowColor:'grey',
        // shadowRadius:100,
        // shadowOpacity:0.4,
        // elevation:15,
        // shadowOffset:{width:5,height:5},
        padding:20,
        justifyContent:'space-between',
        flexDirection:"row" 
    },

    // rightButtonstyle: {
    //     backgroundColor: "#cbe8b0",
    //     flex:1,
    //     height: hp("6%"),
    //     borderRadius: hp("0.5%"),
    //     justifyContent: "center",
    //     alignItems:'center',
    //     borderColor:'#6fc309',
    //     borderWidth:1.0,
    //     marginHorizontal:wp('2%'),
    //   },

      rightButtonstyleEnable: {
        backgroundColor: "#cbe8b0",
        flex:1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'#6fc309',
        borderWidth:1.0,
        marginHorizontal:wp('2%'),
      },

      rightButtonstyleDisable: {
        backgroundColor: "grey",
        flex:1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'black',
        borderWidth:1.0,
        marginHorizontal:wp('2%'),
      },
    
      leftButtonstyle : {
        backgroundColor: "#E7E7E9",
        flex:1,
        height: hp("7%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'black',
        borderWidth:1.0,
        marginHorizontal:wp('2%'),
      },

      rightBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleExtraBold,
      },

      // rightBtnTextStyleDisable: {
      //   color: 'white',
      //   fontSize: fonts.fontMedium,
      //   ...CommonStyles.textStyleExtraBold,
      // },

      leftBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleExtraBold,
    },

});