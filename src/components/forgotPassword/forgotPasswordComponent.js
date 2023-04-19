import React, { useState, useEffect,useRef } from 'react';
import { View, BackHandler } from 'react-native';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import ForgotPasswordUi from "./forgotPasswordUi";
import * as Constant from "./../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import perf from '@react-native-firebase/perf';

let trace_inForgotPasswordcreen;
let trace_Forgot_Password_API_Complete;

const ForgotPasswordComponent = ({ navigation, route, ...props }) => {

    const [fPsdRequest, { loading: fPsdLoading, error: fPsdError, data: fPsdData },] = useMutation(Queries.SEND_EMAIL_VERIFICATON_CODE);
    const [isLoading, set_isLoading] = useState(false);
    const [userMessage, set_userMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [alertTitle, set_alertTitle] = useState('');
    const [eMail, set_eMail] = useState(undefined);
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_forgrotPassword);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_forgrotPassword, "User in Forgot Password Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            FPSessionStart();
        });

        const unsubscribe = navigation.addListener('blur', () => {
            FPSessionStop();
        });

        return () => {
            FPSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
            unsubscribe();
        };
        
    }, []);
    
    // Setting the user email
    useEffect(() => {

        if (route.params?.userEmail) {
            set_eMail(route.params?.userEmail);
        }

    }, [route.params?.userEmail]);

    /**
     * This useeffect returns the forgot Password success / failure info from API
     * Success : returns key value as true
     * Failure : returns Key value as false
     * When Failure alert message will be shown to user
     */
    useEffect(() => {

        if (fPsdData) {
            fpSessionStop();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if (fPsdData.SendEmailVerificationCode && fPsdData.SendEmailVerificationCode.result.Key) {
                firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_success, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api seccess", 'Email : ' + eMail);
                set_userMessage('');
                navigation.navigate('OTPComponent', { isFromScreen: 'forgotPassword', eMailValue: eMail });

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_fail, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api Failed - wrong emailid", 'Email : ' + eMail);
                set_userMessage(Constant.ALERT_FORGOT_PASSWORD_API_FAILURE);
                set_alertTitle(Constant.ALERT_DEFAULT_TITLE);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
        }

        if (fPsdError) {
            firebaseHelper.logEvent(firebaseHelper.event_forgot_password_api_fail, firebaseHelper.screen_forgrotPassword, "Forgot passwoed Api Failed", 'Email : ' + eMail);
            fpSessionStop();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_alertTitle(Constant.ALERT_DEFAULT_TITLE);
            set_userMessage(Constant.ALERT_FORGOT_PASSWORD_API_FAILURE);
            set_isPopUp(true);
            popIdRef.current = 1;
        }

    }, [fPsdData, fPsdError]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const FPSessionStart = async () => {
        trace_inForgotPasswordcreen = await perf().startTrace('t_inForgotPasswordScreen');
    };

    const FPSessionStop = async () => {
        await trace_inForgotPasswordcreen.stop();
    };

    const fpSessionStop = async () => {
        await trace_Forgot_Password_API_Complete.stop();
    };

    // navigate back to the screen from where this screen is called
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_forgrotPassword, "User clicked on back button to navigate to LoginComponent", '');
            navigation.navigate('LoginComponent');
        } 
        
    };

    // submit email and initiates the API call
    const submitAction = (email) => {
        set_eMail(email);
        serviceCall(email);
    }

    /**
     * Service call
     * @param {*} email
     */
    const serviceCall = async (email) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_forgot_password, firebaseHelper.screen_forgrotPassword, "Internet Status : " + internet, 'Email : ' + email);
        if (internet) {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            let json = {
                Email: email,
            };
            trace_Forgot_Password_API_Complete = await perf().startTrace('t_Forgot_Password_API');
            await fPsdRequest({ variables: { input: json } });

        } else {
            set_alertTitle(Constant.ALERT_NETWORK);
            set_userMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;
        }

    }

    // By setting false, Popup will dissappear from the screen
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_alertTitle(undefined);
        set_userMessage(undefined);
    }

    return (
        <ForgotPasswordUi
            isLoading={isLoading}
            userMessage={userMessage}
            isPopUp={isPopUp}
            alertTitle={alertTitle}
            eMail={eMail}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default ForgotPasswordComponent;