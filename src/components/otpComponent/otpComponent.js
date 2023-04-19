import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as Constant from "./../../utils/constants/constant";
import OTPUI from './otpUI'
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import perf from '@react-native-firebase/perf';

let trace_inOTPScreen;

const OTPComponent = ({ navigation, route, ...props }) => {

    const [otpRequest, { loading: otpLoading, error: otpError, data: otpData },] = useMutation(Queries.GET_USER_VERIFICATION_ACCOUNT);

    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [eMailValue, set_eMailValue] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [otpValue, set_otpValue] = useState(false);
    const [alertTitle, set_alertTitle] = useState('');
    const [date, set_Date] = useState(new Date());
    
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick); 

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_otp);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_otp, "User in OTP Screen", '');
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

    /**
   * isFromScreen : registration, forgotPassword, changePassword
   */

    useEffect(() => {

        if (route.params?.eMailValue) {
            set_eMailValue(route.params?.eMailValue)
        }

        if (route.params?.isFromScreen) {
            set_isFromScreen(route.params?.isFromScreen);
        }

    }, [route.params?.isFromScreen, route.params?.eMailValue]);

    /**
     * This useeffect returns the OTP success / failure info from Login API
     * Success : returns email,token,clientid will be saved and can be used across the app
     * when error a proper message will be shown to user
     */
    useEffect(() => {

        if (otpData) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if (otpData.verificationCode.result.Key) {
                firebaseHelper.logEvent(firebaseHelper.event_otp_api_success, firebaseHelper.screen_otp, "OTP Api success", 'Email : ' + eMailValue);
                set_popUpMessage('');
                navigation.navigate('PswdComponent', { isFromScreen: isFromScreen, otpValue: otpValue, eMailValue: eMailValue });

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed - Wrong OTP Value", 'Email : ' + eMailValue);
                set_popUpMessage(Constant.OTP_VERIFICATION_CODE_FAILURE);
                set_alertTitle(Constant.ALERT_DEFAULT_TITLE);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
        }

        if (otpError) {
            firebaseHelper.logEvent(firebaseHelper.event_OTP_api_fail, firebaseHelper.screen_otp, "OTP Api Failed - Wrong OTP Value", 'Email : ' + eMailValue);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.OTP_VERIFICATION_CODE_FAILURE);
            set_alertTitle(Constant.ALERT_DEFAULT_TITLE);
            set_isPopUp(true);
            popIdRef.current = 1;
        }

    }, [otpData, otpError]);

    const initialSessionStart = async () => {
        trace_inOTPScreen = await perf().startTrace('t_inOTPScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inOTPScreen.stop();
    };

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    /**
     * Based on isFromScreen, navigates back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){

            if (isFromScreen === 'registration') {
                navigation.navigate('RegisterAccountComponent');
            } else if (isFromScreen === 'forgotPassword') {
                navigation.navigate('ForgotPasswordComponent');
            } else if (isFromScreen === 'ChangePassword') {
    
            }
        } 
        
    }

    /**
     * OTP entered by the pet parent will be validated usin API
     * Along with OTP code, email also sent to API
     * @param {*} otpValue1 
     */
    const submitAction = async (otpValue1) => {

        set_otpValue(otpValue1);
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_OTP, firebaseHelper.screen_otp, "User clicked on Submit OTP action : " + isFromScreen, 'Internet Status : ' + internet);
        if (internet) {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            let json = {
                Email: eMailValue,
                VerificationCode: otpValue1,
            };
            await otpRequest({ variables: { input: json } });

        } else {
            set_alertTitle(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;
        }

    }

    /**
     * This method triggers when user clicks on Popup Button.
     */
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_alertTitle(undefined);
        set_popUpMessage(undefined);
    }

    return (
        <OTPUI
            isFromScreen={isFromScreen}
            isPopUp={isPopUp}
            isLoading={isLoading}
            popUpMessage={popUpMessage}
            alertTitle={alertTitle}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default OTPComponent;