import React, {useState,useEffect} from 'react';
import {StyleSheet,Text, View,Image,ImageBackground,TouchableOpacity} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import Fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";

const InitialScreenUI = ({navigation, route, ...props }) => {

    const [loaderPercent, set_loaderPercent] = useState(0);

    useEffect(() => {
        set_loaderPercent(props.loaderPercent);
    }, [props.loaderPercent,props.internetStaus]);

    const calculateQuestionsPercentage = (item) =>{
        let _percentage = loaderPercent/100;
        return _percentage;
    };

    const callLoginAfterNet = () => {
        props.callLoginAfterNet();
    }

    return (

        <View style={styles.mainComponentStyle}>

            {props.internetStaus ? <ImageBackground source={require("./../../../assets/images/otherImages/png/splashScreenImg.png")} style={styles.splashImgStyle}>

                    <View style={styles.mainViewStyle}>
 
                    </View>

                <View style={{alignItems: "center",flex:1.1}}>

                        <View  style={{flex:2}}>
                            <Image source={require("./../../../assets/images/otherImages/svg/splashLogo.svg")} style={styles.headerImgStyle}/>
                        </View>

                        <View style={{flex:1}}>
                            <View style={styles.progressViewStyle}>               
                                <View style={{backgroundColor:'#6BC105',alignItems: "center",flex:calculateQuestionsPercentage(),borderRadius:10}}></View>
                            </View>
                            <Text style={styles.textStyle}>{Constant.SPLASH_LOADER_MSG}</Text>
                        </View>
                    
                </View>

                </ImageBackground> 
                : 
                <ImageBackground source={require("./../../../assets/images/internetScreens/splashImages.png")} style={styles.splashImgStyle}>

                    <View style = {{flex:1, justifyContent:'center', alignItems:'center',}}>

                        <Text style={styles.cFailedText}> Connection Failed</Text>
                        <Text style={styles.cLostText}> You are not connected to the Internet! Please check your connection and try again</Text>

                        <TouchableOpacity style={styles.btnStyle} onPress={() => { callLoginAfterNet() }}>
                            <Text style={styles.btnText}> Try Again</Text>
                        </TouchableOpacity>

                    </View>

                </ImageBackground>

                }

            </View>
        );
    };

export default InitialScreenUI;

const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white',
    },

    mainViewStyle :{
        flex:2,
    },

    textStyle : {
        ...CommonStyles.textStyleExtraBold,
        fontSize: Fonts.fontMedium,
        color:'#6BC100',
        marginLeft : wp('2%'),
        marginRight: wp('2%'),
        marginTop : hp('2%'),
        marginBottom : hp('2%'),
        textAlign:'center'
    },

    progressViewStyle : {
        flexDirection:'row',
        backgroundColor:'white',
        height:hp('1%'),
        width: wp("70%"),
        borderRadius:5,            
    },

    headerImgStyle : {
        height:hp('20%'),
        width: wp("70%"),
        resizeMode:'contain',
    },

    splashImgStyle : {
        flex:1
    },

    cFailedText: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: Fonts.fontLarge,
        color: '#242A37',
        textAlign: 'center',
        marginTop: hp('35%')     
    },
    
    cLostText: {
        ...CommonStyles.textStyleRegular,
        fontSize: Fonts.fontMedium,
        color : '#242A37',
        textAlign: 'center',
        alignItems : 'center',
        marginTop: hp('2%'),
    },

    btnText: {
        ...CommonStyles.textStyleBold,
        fontSize: Fonts.fontNormal,
        color : 'white',
        textAlign: 'center',
        alignItems : 'center',
      
    },
  
    btnStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: hp("6%"),
        width: wp("50%"),
        borderRadius: hp("1%"),
        backgroundColor:'black',
        marginTop: hp('5%')
    },

});