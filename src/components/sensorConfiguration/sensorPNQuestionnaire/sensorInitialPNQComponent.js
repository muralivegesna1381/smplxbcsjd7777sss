import React, {useState,useEffect,useRef} from 'react';
import {StyleSheet,Text, View,Image,BackHandler} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import BottomComponent from "./../../../utils/commonComponents/bottomComponent";
import fonts from './../../../utils/commonStyles/fonts'
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../../utils/commonComponents/headerComponent';
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as Constant from "./../../../utils/constants/constant"
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

let trace_inSensorsPnqcreen;
const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const SensorInitialPNQComponent = ({navigation, route, ...props }) => {

    const [petName, set_petName] = useState(undefined);
    const [date, set_Date] = useState(new Date());
    const [isLoading, set_isLoading] = useState(false);

    let isLoadingdRef = useRef(0);
    let checkinQuestObj = useRef(undefined);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        getPet();

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_sensor_pn_noti_initial);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_sensor_pn_noti_initial, "User in Pushnotification permission initial Screen", '');  
          });
    
          const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
          });

        return () => {
            focus();
            unsubscribe();
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    const initialSessionStart = async () => {
        trace_inSensorsPnqcreen = await perf().startTrace('t_inSensorPNQInitialScreen');
    };
  
    const initialSessionStop = async () => {
        await trace_inSensorsPnqcreen.stop();
    };

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const getPet = async () => {
        let defaultObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT,);
        defaultObj = JSON.parse(defaultObj);
        set_petName(defaultObj.petName);
    };

    const getCheckinQuestionnaires = async (sobPets) => {

        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
        petObj = JSON.parse(petObj);
  
        set_isLoading(true);
        isLoadingdRef.current = 1;
        fetch(EnvironmentJava.uri + "getFeedbackQuestionnaireByPetId/" + petObj.petID,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
  
          set_isLoading(false);
          isLoadingdRef.current = 0;
          if (data && data.status.success) {
            if(data.response.questionnaireList[0].questions && data.response.questionnaireList[0].questions.length > 0){
                firebaseHelper.logEvent(firebaseHelper.event_sensor_pnq_intst_next_btn_action, firebaseHelper.screen_sensor_pn_noti_initial, "User clicked on Next button to navigate to Push Notification page", '');
                navigation.navigate('SensorPNQComponent');
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_sensor_pnq_intst_next_btn_action, firebaseHelper.screen_sensor_pn_noti_initial, "User clicked on Next button to navigate to Dashboard and No Questionnaires found", '');
                navigation.navigate('DashBoardService',{loginPets:sobPets});
            }
  
          } else if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
          } else {
            firebaseHelper.logEvent(firebaseHelper.event_sensor_pnq_intst_next_btn_action, firebaseHelper.screen_sensor_pn_noti_initial, "User clicked on Next button to navigate to Dashboard and Questionnaire service failed", '');
            navigation.navigate('DashBoardService',{loginPets:sobPets});
          }
    
        }).catch((error) => {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            firebaseHelper.logEvent(firebaseHelper.event_sensor_pnq_intst_next_btn_action, firebaseHelper.screen_sensor_pn_noti_initial, "User clicked on Next button to navigate to Dashboard and Questionnaire service failed", '');
            navigation.navigate('DashBoardService',{loginPets:sobPets});
        });
    
      };

    const nextButtonAction = async () => {

        let sobPets = await DataStorageLocal.getDataFromAsync(Constant.SAVE_SOB_PETS);      
        if(sobPets){
            sobPets = JSON.parse(sobPets);
            await DataStorageLocal.removeDataFromAsync(Constant.SAVE_SOB_PETS); 
        }
        getCheckinQuestionnaires(sobPets);
    };

    const backBtnAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_sensor_pn_noti_initial, "User clicked on back button to navigate to Dashboard", '');
        navigation.navigate('DashBoardService');
    };

return (

        <View style={CommonStyles.mainComponentStyle}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Notifications'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.mainViewStyle}>

                <View style={styles.topViewStyle}>
                    <Text style={styles.headerStyle}>{'Allow Push Notifications'}</Text>
                    <Text style={styles.subHeaderStyle}>{'Know about '}<Text style={styles.subHeaderStyle}>{petName}
                    <Text style={styles.subHeaderStyle}>{"'s"}</Text><Text style={styles.subHeaderStyle}>{" health and activity with simple alerts"}</Text>
                    </Text></Text>
                </View>

                <View style={styles.instViewStyle}>
                    <Image style={styles.sensorImgStyels} source={require("./../../../../assets/images/sensorImages/png/sensorPNQImg.png")}/>
                </View>

            </View>
           
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'YES'}
                    leftBtnTitle = {'NO'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}

                ></BottomComponent>
            </View>

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

        </View>
    );
};

export default SensorInitialPNQComponent;

const styles = StyleSheet.create({

    mainViewStyle :{
        flex:1,
        alignItems:'center',
    },

    topViewStyle : {
        width:wp('100%'),
        minHeight:hp('15%'),
        justifyContent:'center',  
    },

    instViewStyle : {
        height:hp('65%'),
        width:wp('100%'),
        justifyContent:'center',
        alignItems:'center',
    },

    headerStyle : {
        color: 'black',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleRegular,
        marginLeft:wp('8%'),
        marginRight:wp('3%'),       
    },

    subHeaderStyle : {
        color: 'black',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleLight,
        marginLeft:wp('8%'),
        marginRight:wp('3%'),
        marginTop:wp('1%'),  
    },

    sensorImgStyels : {
        width: hp("55%"),
        height:hp('55%'),
        resizeMode: "contain",
    },

});