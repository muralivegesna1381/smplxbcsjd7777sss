import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,BackHandler} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import ScrollPicker from 'react-native-wheel-scrollview-picker';
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as Constant from "./../../utils/constants/constant";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import moment from 'moment';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inEnterWeightScreen;
let trace_UpdateWeight_API_Complete;
let popId = 0;

const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  EnterWeightComponent = ({route, ...props }) => {

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [weightType, set_weightType] = useState('lbs');
    const [weight, set_weight] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [popupMessage, set_popupMessage] = useState(undefined);
    const [popupAlert, set_popupAlert] = useState(undefined)
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [kgArray, set_kgArray] = useState([]);
    const [lbsArray, set_lbsArray] = useState([]);
    const [btnValue, set_btnValue] = useState(0);
    const [actualValue, set_actualValue] = useState(0);
    const [actualDecimalValue, set_actualDecimalValue] = useState(0);
    const [defaultIndex, set_defaultIndex] = useState(undefined);
    const [isEditWeight, set_isEditWeight] = useState(false);
    const [petObj, set_petObj] = useState(undefined);
    const [weightitem, set_weightitem] = useState(undefined);
    const [showPicker, set_showPicker] = useState(false);
    
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {
        
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_pet_weight_enter);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pet_weight_enter, "User in Pet Weight Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    
    }, []);

    useEffect(() => {

        set_kgArray(range(0, 114));
        set_lbsArray(range(0, 256));

        if(route.params?.selectedPet){
            set_petObj(route.params?.selectedPet)
            set_petName(route.params?.selectedPet.petName);
        }

        if(route.params?.value){
            if(route.params?.value==='edit'){
                set_isEditWeight(true);
            } else {

                if(route.params?.petWeightUnit){

                    if(route.params?.petWeightUnit==='kgs'){
                        set_weightType('Kgs');
                        set_btnValue(1);
                    } else {
                        set_weightType('lbs');
                        set_btnValue(0);
                    }
                }
                set_isEditWeight(false);
            }
            
        } 

        if(route.params?.weightitem){
            set_weightitem(route.params?.weightitem);
            getWeight(route.params?.weightitem);
            
        } else {
          set_showPicker(true);
        }
        
    }, [route.params?.selectedPet,route.params?.value,route.params?.weightitem,route.params?.petWeightUnit]);

    const initialSessionStart = async () => {
        trace_inEnterWeightScreen = await perf().startTrace('t_inEnterWeightScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inEnterWeightScreen.stop();
    };

    const getWeight = (itemWeight) => {

      set_isBtnEnable(true);
      var array = itemWeight.weight.toString().split(/\.(?=[^\.]+$)/);
      if(array.length>1){
        set_actualValue(array[0]);
        set_actualDecimalValue(array[1]);
      } else {
        set_actualValue(array[0]);
        set_actualDecimalValue(0);
      }
      
      if(itemWeight.weightUnit==='Kgs'){
          set_weightType('Kgs');
          set_btnValue(1);
      } else {
          set_weightType('lbs');
          set_btnValue(0);
      }
      setTimeout(() => {  
          set_showPicker(true); 
      }, 300)
    }

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
      }

    const nextButtonAction = async () => {
        addUpdateWeight(isEditWeight,weightitem);
    };

    const addUpdateWeight = async (value,item) => {

        set_isLoading(true);
        isLoadingdRef.current = 1;
        let mtype = undefined;

        if(value){
            mtype = 'pets/updateWeight';
            trace_UpdateWeight_API_Complete = await perf().startTrace('t_UpdateWeight_API');
        } else {
            mtype = 'pets/addWeight';
            trace_UpdateWeight_API_Complete = await perf().startTrace('t_AddWeight_API');
        }
        firebaseHelper.logEvent(firebaseHelper.event_pet_weight_new_api, firebaseHelper.screen_pet_weight_enter, "Initiated Pet Weight Update API "+mtype+" "+wValue+weightType, 'Pet Id : '+petObj.petID);
        let actValue = actualValue ? actualValue : '';
        let deciValue = actualDecimalValue ? actualDecimalValue : '';

        let userId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        let wValue = actValue + '.' + deciValue;
        let weightJson = {
            "petWeightId": value ? item.petWeightId : 0,
            "petId": petObj.petID,
            "userId": parseInt(userId),
            "weight": parseFloat(wValue),
            "weightUnit": weightType,
            "addDate":  "" + moment(new Date()).format("YYYY-MM-DD")
        }

        fetch(EnvironmentJava.uri + mtype,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
            body: JSON.stringify(weightJson),

          }).then((response) => response.json()).then(async (data) => {

            stopFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }

            if(data.status.success){
                firebaseHelper.logEvent(firebaseHelper.event_pet_weight_new_api_success, firebaseHelper.screen_pet_weight_enter, "Pet Weight Update API Success", '');
                // backBtnAction();
                createPopup(true,Constant.ALERT_INFO,'Your Pet weight has been submitted successfully',1,1);
            } else {
              createPopup(true,Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,1,0);
            }
            
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_pet_weight_new_api_fail, firebaseHelper.screen_pet_weight_enter, "Pet Weight Update API Fail", 'error : '+error);
            stopFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            createPopup(true,Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,1,0);
          });

    };

    const stopFBTrace = async () => {
        await trace_UpdateWeight_API_Complete.stop();
    };

    const backBtnAction = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_pet_weight_enter, "User clicked on back button to navigate to PetWeightHistoryComponent", '');
            navigation.navigate('PetWeightHistoryComponent');  
        }
    };

    const setWeight = (aData,dData) => {

        if(aData){
            set_actualValue(aData);
        } else {
            set_actualValue(0);
        }

        if(dData){
            set_actualDecimalValue(dData);
        } else {
            set_actualDecimalValue(0);
        }

        if((aData && aData>0) || (dData && dData>0)){
            set_isBtnEnable(true);
            set_weight(aData+'.'+dData);
        } else {
            set_isBtnEnable(false);
        }

    };

    const popOkBtnAction = () => {

        if(popId === 1) {
            popIdRef.current = 0;
            backBtnAction();
        }

        createPopup(false,'','',0,0);
        
    };

    const createPopup = (isPop,title,msg,refId,id) => {
        set_isPopUp(isPop);
        set_popupAlert(title)
        set_popupMessage(msg);
        popId = id;
        popIdRef.current = refId;      
    };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Profile'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center',marginTop: hp('8%')}}>

              <Text style={CommonStyles.headerTextStyle}>{"What is " + petName+"'s" + " weight?"}</Text> 

                <View style={{width: wp('80%'),marginTop: hp('5%'),alignItems:'center'}}>
                    <View style={styles.tabViewStyle}>

                        <TouchableOpacity style={btnValue === 0 ? [styles.tabButtonStyle] : [styles.tabButtonDisabledStyle,{borderLeftWidth:1}]} onPress={() => {set_btnValue(0),set_defaultIndex(0),set_weightType('lbs')}}>
                            <Text style={btnValue === 0 ? [styles.btnTextStyle] : [styles.btnDisableTextStyle]}>{'Lbs'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={btnValue === 1 ? [styles.tabButtonStyle,] : [styles.tabButtonDisabledStyle,{borderRightWidth:1}]} onPress={() => {set_btnValue(1),set_defaultIndex(0),set_weightType('Kgs')}}>
                            <Text style={btnValue === 1 ? [styles.btnTextStyle] : [styles.btnDisableTextStyle]}>{'Kgs'}</Text>
                        </TouchableOpacity>

                    </View>

                    <View style={{flexDirection:'row',justifyContent:'space-between',width: wp('80%'),}}>

                        <View style={{width: wp('39%'),height: hp('22%')}}>
                            {showPicker ? <ScrollPicker
                                dataSource={btnValue === 1 ? kgArray : lbsArray}
                                selectedIndex={actualValue}
                                wrapperHeight={190}
                                // wrapperWidth={100}
                                wrapperColor='white'
                                wrapperBackground={'yellow'}
                                itemHeight={60}
                                highlightColor='green'
                                highlightBorderWidth={1}
                                // renderItem={(data, index) => {renderItemNumber(data,index)}}
                                onValueChange={(data, selectedIndex) => {
                                    setWeight(data,actualDecimalValue)
                                }}
                            /> : null}
                        </View>

                        <View style={{width: wp('39%'),height: hp('22%')}}>
                            {showPicker ? <ScrollPicker
                                dataSource={['0','1', '2', '3', '4', '5', '6', '7', '8', '9']}
                                selectedIndex={actualDecimalValue}
                                wrapperHeight={190}
                                wrapperColor='white'
                                itemHeight={60}
                                highlightColor='blue'
                                highlightBorderWidth={1}
                                onValueChange={(data, selectedIndex) => {
                                    setWeight(actualValue,data)
                                }}
                            /> : null}
                        </View>
                    </View>

                    <View>
                        <Text style={[styles.btnTextStyle,{color:'black'}]}>{actualValue + '.' + actualDecimalValue + ' ' + weightType}</Text>
                    </View>

                </View>

            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {isBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popupAlert}
                    message={popupMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}


            {isLoading ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null}  
            
         </View>
    );
  }
  
  export default EnterWeightComponent;

  const styles = StyleSheet.create({

    tabViewStyle : {
        height: hp("6%"),
        width: wp("80%"),
        flexDirection:'row',
        marginBottom: hp("2%"),
    },

    tabButtonStyle : {
        height: hp("5%"),
        width: wp("40%"),
        backgroundColor:'#CCE8B0',
        borderRadius:5,
        borderColor:'#6BC105',
        borderWidth:1,
        justifyContent:'center'
    },

    tabButtonDisabledStyle : {
        height: hp("5%"),
        width: wp("40%"),
        backgroundColor:'white',
        borderRadius:5,
        borderColor:'#EAEAEA',
        borderBottomWidth:1,
        borderTopWidth:1,
        justifyContent:'center'
    },

    btnTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: "#6BC105",
        textAlign:'center',
    },

    btnDisableTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: "black",
        textAlign:'center',
    }

  });