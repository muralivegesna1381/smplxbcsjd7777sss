import React, {useState,useEffect} from 'react';
import {StyleSheet,Text, View,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import fonts from './../../../utils/commonStyles/fonts'
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import ImageSequence from 'react-native-image-sequence';

const WriteDetailsToSensorUI = ({navigation, route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [loaderMsg, set_loaderMsg] = useState('Please Wait..');
    const [isLoading, set_isLoading] = useState(false);
    const [defaultpet, set_defaultPet] = useState(undefined);
    const [setupSuccess, set_setupSuccess] = useState(undefined);
    const [sensorType,set_sensorType] = useState(undefined);
    const [hpn1ConfigWIFICount, set_hpn1ConfigWIFICount] = useState(0);
    const [isSensorAwaiting, set_isSensorAwaiting] = useState(false);
    const cSImages = [
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1013.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1019.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1025.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1031.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1037.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1043.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1049.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1055.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1061.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1067.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1073.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1079.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1085.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1091.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1097.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1103.png"),
        require("./../../../../assets/images/sequenceImgs/writeDataSensor/writeDataSensorAni_1108.png"),
      ];

    useEffect(() => {

        set_isPopUp(props.isPopUp);
        set_popUpMessage(props.popUpMessage);
        set_popUpTitle(props.popUpTitle);
        set_defaultPet(props.defaultpet);
        set_sensorType(props.sensorType);
        set_hpn1ConfigWIFICount(props.hpn1ConfigWIFICount);

    }, [props.isPopUp,props.popUpMessage,props.popUpTitle,props.defaultpet,props.sensorType,props.hpn1ConfigWIFICount]);

    useEffect(() => {

        set_isLoading(props.isLoading);
        set_loaderMsg(props.loaderMsg);
        set_setupSuccess(props.setupSuccess);
        set_isSensorAwaiting(props.isSensorAwaiting);

    }, [props.isLoading,props.loaderMsg,props.setupSuccess,props.isSensorAwaiting]);

    const nextButtonAction = (value) => {
        props.nextButtonAction(value);
    };

    const leftButtonAction = () => {
        props.leftButtonAction();
    }

    const backBtnAction = () => {
        props.backBtnAction();
    }

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    }

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={setupSuccess === "failed" ? true : false}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Device Setup'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                    <Text style={styles.headerStyle}>{'Network '}<Text style={[styles.headerStyle,{...CommonStyles.textStyleBold}]}>{'Setup'}</Text></Text>
                </View>

                <View style = {styles.videoViewStyle}>
                  {setupSuccess === "success" ? <View>
                  <Image source={(require("./../../../../assets/images/sensorImages/svg/sensorSuccessImg.svg") )} style={styles.sensorIngStyles}/>
                  </View> : 

                    <ImageSequence
                    images={cSImages}
                    framesPerSecond={8}
                    style={styles.videoStyle}
                    />}
                </View>

                {isSensorAwaiting ? 
                <View style = {{width:wp('95%'),height:hp('28%'),}}>
                    <Text style={[styles.dataTxtStyleBold]}>{'Almost there!'}</Text>
                    <Text style={[styles.dataTxtStyleBold]}>{'Please do not stop the configuration process or close the app.'}</Text>
                    <Text style={[styles.dataTxtStyleBold]}>{'Also, please shake the sensor periodically throughout the configuration process.'}</Text>
                </View> : 
                <Text style={setupSuccess === "success" ? [styles.txtStyleBold,{color:'#6BC100'}] : setupSuccess === "failed" ? [styles.txtStyleBold,{color:'red'}] : [styles.txtStyleBold]}>{loaderMsg}</Text>}

            </View>
           
            {setupSuccess === "success" || setupSuccess === "failed" ? <View style={styles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {setupSuccess === "failed" ? 'TRY AGAIN' : 'CONTINUE'}
                    isLeftBtnEnable = {sensorType === "HPN1Sensor" && hpn1ConfigWIFICount < 8 ? true : false}
                    leftBtnTitle = {'Configure another SSID?'}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction(setupSuccess === "failed" ? 'TRY AGAIN' : 'CONTINUE')}
                    leftButtonAction = {async () => leftButtonAction()}

                ></BottomComponent>
            </View> : null}

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popUpMessage}
                    isRightBtnEnable = {true}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}
        </View>
    );
};

export default WriteDetailsToSensorUI;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    txtStyleBold : {
        color: 'black',
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        marginTop:wp('3%'), 
        marginLeft:wp('3%'),
        marginRight:wp('3%'),  
        textAlign:'center'
    },

    dataTxtStyleBold : {
        color: 'black',
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        marginTop:wp('1%'), 
        marginLeft:wp('3%'),
        marginRight:wp('3%'),  
        textAlign:'center'
    },

    sensorIngStyles : {
        width:wp('35%'),
        height:hp('35%'),
        resizeMode:'contain',
        overflow:'hidden'
    },

    bottomViewComponentStyle : {
        height:hp('16%'),
        width:wp('100%'),
        backgroundColor:'white',
        position:"absolute",
        bottom:0,
        shadowColor:'grey',
        shadowRadius:100,
        shadowOpacity:0.4,
        elevation:15,
        shadowOffset:{width:5,height:5},
    },

    videoViewStyle : {
        height:hp('50%'),
        justifyContent:'center'
    },

    videoStyle : {
        width:wp('100%'),
        height:hp('40%'),
    },

    topViewStyle : {
        width:wp('80%'),
        height:hp('8%'),
        justifyContent:'center',
        alignSelf:'center'        
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%')
    }

});