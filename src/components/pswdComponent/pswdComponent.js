import React, { useState, useEffect,useRef } from 'react';
import { Platform, NativeModules, BackHandler } from 'react-native';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as Constant from "./../../utils/constants/constant";
import PswdUI from './pswdUI'
import * as DataStorageLocal from './../../utils/storage/dataStorageLocal';
import * as internetCheck from "./../../utils/internetCheck/internetCheck"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inPasswordConponentScreen;
let trace_Password_API_Complete;

const PswdComponent = ({ navigation, route, ...props }) => {

    const [psdRequest, { loading: psdLoading, error: psdError, data: psdData },] = useMutation(Queries.GET_USER_CREATE_PASSWORD);

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [otpValue, set_otpValue] = useState(undefined);
    const [eMailValue, set_eMailValue] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [popUpBtnTitle, set_popUpBtnTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);

    useEffect(() => {
        
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_pswd);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pswd, "User in Password Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
          initialSessionStop();
          BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };
    
    }, []);

    /**
     * set the values from navigation to local variables
     */
    useEffect(() => {
        set_isFromScreen(route.params.isFromScreen);
        set_otpValue(route.params.otpValue);
        set_eMailValue(route.params.eMailValue);
    }, [route.params.isFromScreen, route.params.otpValue, route.params.eMailValue]);

    /**
     * This useeffect returns the Password success / failure info from Login API
     * Success : returns value as true and Pet Parent will be navigated to Login Page
     * Failure : returns  value as false
     * When Failure alert, message will be shown to user
     */
    useEffect(() => {

        if (psdData) {

            set_isLoading(false);
            stopFBTrace();
            if (psdData.createPassword.success) {
                firebaseHelper.logEvent(firebaseHelper.event_password_api_success, firebaseHelper.screen_pswd, "Password api success" + isFromScreen, 'Email : ' + eMailValue);
                set_popUpMessage(isFromScreen === "forgotPassword" ? Constant.PASSWORD_CREATION_SUCCESS : Constant.REGISTRATION_SUCCESS);
                set_popUpTitle('Congratulations!');
                set_popUpBtnTitle('LOGIN');
                set_isPopUp(true);
                setTempUserId();
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Email : ' + eMailValue);
                set_popUpMessage(Constant.INVALID_PSWD);
                set_popUpBtnTitle('OK');
                set_isPopUp(true);
                set_popUpTitle('Alert');
            }
        }

        if (psdError) {
            firebaseHelper.logEvent(firebaseHelper.event_password_api_fail, firebaseHelper.screen_pswd, "Password api failed" + isFromScreen, 'Email : ' + eMailValue);
            stopFBTrace();
            set_isLoading(false);
            set_popUpBtnTitle('OK');
            set_popUpMessage(Constant.INVALID_PSWD);
            set_popUpTitle('Alert');
            set_isPopUp(true);

        }

    }, [psdData, psdError]);

    const initialSessionStart = async () => {
        trace_inPasswordConponentScreen = await perf().startTrace('t_inPasswordConponentScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inPasswordConponentScreen.stop();
    };

    const stopFBTrace = async () => {
        await trace_Password_API_Complete.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    /**
     * Based on isFromScreen, navigate back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {
        // navigation.navigate('OTPComponent');
    }

    /**
     * Based on isFromScreen, navigate to the screen to where it should be navigated and pass the isFromScreen value also
     */
    const submitAction = async (psdValue) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_password, firebaseHelper.screen_pswd, "User clicked on Submitting the password : " + isFromScreen, 'Internet Status : ' + internet);
        if (!internet) {
            set_popUpTitle(Constant.ALERT_NETWORK);
            set_popUpBtnTitle('OK');
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
        } else {

            if (Platform.OS === 'android') {
                //If the user is using an android device
                NativeModules.Device.getDeviceName(psdValue, (convertedVal) => {
                    serviceCall(convertedVal);
                });

            }
            else {
                //If the user is using an iOS device
                NativeModules.EncryptPassword.encryptPassword(psdValue, (value) => {
                    serviceCall(value);
                })
            }

        }

    }

    /**
     * @param {*} email
     * @param {*} otpValue
     * @param {*} psdValue
     */
    const serviceCall = async (psdValue) => {

        trace_Password_API_Complete = await perf().startTrace('t_SetPassword_API');
        set_isLoading(true);
        let json = {
            Email: eMailValue,
            VerificationCode: otpValue,
            Password: psdValue,
        };
        await psdRequest({ variables: { input: json } });

    };

    /**
     * by resetting the values, Pet parent will be navigated to Login Page
     */
    const popOkBtnAction = (value,) => {

        if (popUpMessage === Constant.PASSWORD_CREATION_SUCCESS || popUpMessage === Constant.REGISTRATION_SUCCESS) {

            navigation.navigate('LoginComponent');
        }
        set_isPopUp(value);
        set_popUpBtnTitle(undefined);
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);

    };

    const setTempUserId = async () => {
        await DataStorageLocal.saveDataToAsync(Constant.USER_EMAIL_LOGIN_TEMP, eMailValue);
    }

    return (
        <PswdUI
            isFromScreen={isFromScreen}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpTitle={popUpTitle}
            isLoading={isLoading}
            popUpBtnTitle={popUpBtnTitle}
            popOkBtnAction={popOkBtnAction}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default PswdComponent;