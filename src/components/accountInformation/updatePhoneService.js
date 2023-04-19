import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdatePhoneUI from './updatePhoneUI';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inAccountPhone_Screen;
let trace_ChangePhone_API_Complete;

const UpdatePhoneService = ({ navigation, route, ...props }) => {

    const [upDatePhnDetails, { loading: upDatePhnDetailsLoading, error: upDatePhnDetailsError, data: upDatePhnDetailsData, },] = useMutation(Queries.CHANGE_USER_INFO);

    const [firstName, set_firstName] = useState(undefined);
    const [lastName, set_lastName] = useState(undefined);
    const [phnNo, set_phNo] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popAlert, set_popAlert] = useState(undefined);
    const [isNavigate, set_isNavigate] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    // Android Physical button actions
    useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_change_phone);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_phone, "User in Change Phone Number Screen", '');
        initialSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    // setting the existing user details to local variables
    useEffect(() => {

        if (route.params?.fullName) {
            let splitWords = route.params?.fullName.split(" ");
            set_firstName(splitWords[0]);
            if (splitWords.length > 0) {
                set_lastName(splitWords[1]);
            }
        }

        if (route.params?.phoneNo) {
            set_phNo(route.params?.phoneNo);
        }

    }, [route.params?.fullName, route.params?.phoneNo, route.params?.firstName, route.params?.secondName]);

    // Service call responce
    useEffect(() => {

        if (upDatePhnDetailsData) {

            stopFBTrace();
            if(upDatePhnDetailsData.changeUserInfo.success){
                firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_success, firebaseHelper.screen_change_phone, "Chanhe Phone Api success ", '');
                set_isLoading(false);
                set_isNavigate(true);
                set_popUpMessage(Constant.CHANGE_PHONE_SUCCESS);
                set_popAlert(Constant.ALERT_INFO);
                set_isPopUp(true);
                popIdRef.current = 1;
                isLoadingdRef.current = 0;
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api success ", '');
                set_isLoading(false);
                set_isNavigate(false);
                set_popUpMessage(Constant.PHONE_ERROR_UPDATE);
                set_popAlert('Alert');
                set_isPopUp(true);
                popIdRef.current = 1;
                isLoadingdRef.current = 0;
            }
                
  
        }

        if (upDatePhnDetailsError) {
            firebaseHelper.logEvent(firebaseHelper.event_change_phone_api_fail, firebaseHelper.screen_change_phone, "Chanhe Phone Api success ", '');
            stopFBTrace();
            set_isLoading(false);
            set_isNavigate(false);
            set_popUpMessage(Constant.PHONE_ERROR_UPDATE);
            set_popAlert('Alert');
            set_isPopUp(true);
            popIdRef.current = 1;
            isLoadingdRef.current = 0;
        }

    }, [upDatePhnDetailsLoading, upDatePhnDetailsError, upDatePhnDetailsData]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inAccountPhone_Screen = await perf().startTrace('t_inChangePhoneScreen');
      };
    
      const initialSessionStop = async () => {
        await trace_inAccountPhone_Screen.stop();
      };
    
      const stopFBTrace = async () => {
        await trace_ChangePhone_API_Complete.stop();
      };

    // Navigate to previous screen
    const navigateToPrevious = () => {
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
    };

    // Service call to update the User Phone number
    const UpdateAction = async (phn, cCode) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_change_phone, firebaseHelper.screen_change_phone, "Internet Status : " + internet, 'New Phone : ' + phn);
        if (!internet) {
            set_popUpMessage(Constant.ALERT_NETWORK);
            set_popAlert(Constant.ALERT_NETWORK);
            set_isPopUp(true);
            popIdRef.current = 1;
        } else {
            set_isLoading(true);
            isLoadingdRef.current = 1;
            let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
            let phoneTemp = phn.replace(/\D/g, "");
            let phoneTemp1 = phoneTemp.substring(0, 3);
            phoneTemp1 = "(" + phoneTemp1 + ")";
            let phoneTemp2 = phoneTemp.substring(3, 6);
            let phoneTemp3 = phoneTemp.substring(6, phoneTemp.length);
            phoneTemp3 = "-" + phoneTemp3;
            let json = {
                ClientID: parseInt(clientIdTemp),
                FirstName: firstName ? firstName : ' ',
                LastName: lastName ? lastName : ' ',
                PhoneNumber: phn ? cCode + phoneTemp1 + phoneTemp2 + phoneTemp3 : '',
            };
            trace_ChangePhone_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');
            await upDatePhnDetails({ variables: { input: json } });
        }
    }

    // Popup Ok button Action
    const popOkBtnAction = () => {

        set_isPopUp(false);
        popIdRef.current = 0;
        set_popUpMessage('');
        set_popAlert('');
        if (isNavigate) {
            navigateToPrevious();
        }

    }

    return (
        <UpdatePhoneUI
            phnNo={phnNo}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popAlert={popAlert}
            navigateToPrevious={navigateToPrevious}
            UpdateAction={UpdateAction}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default UpdatePhoneService;