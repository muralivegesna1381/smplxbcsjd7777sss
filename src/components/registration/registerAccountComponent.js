import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as Constant from "./../../utils/constants/constant";
import RegisterAccountUi from "./registerAccountUi"
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inRegisterAccountScreen;
let trace_RegisterAccount_API_Complete;
let trace_Email_Verification_API_Complete;

const RegisterAccountComponent = ({ navigation, route, ...props }) => {

    const [registerRequest, { loading: regLoading, error: regError, data: regData },] = useMutation(Queries.Manage_ClientInfo);
    const [fPsdRequest, { loading: fPsdLoading, error: fPsdError, data: fPsdData },] = useMutation(Queries.SEND_EMAIL_VERIFICATON_CODE);

    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [isLoading, set_isLoading] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [email, set_email] = useState('');
    const [phNumber, set_phNumber] = useState('');
    const [date, set_Date] = useState(new Date());

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    React.useEffect(() => {
        
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        const focus = navigation.addListener("focus", () => {
            set_Date(new Date());
            initialSessionStart();
            firebaseHelper.reportScreen(firebaseHelper.screen_register_account);
            firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_register_account, "User in Registering account Screen", '');
        });

        const unsubscribe = navigation.addListener('blur', () => {
            initialSessionStop();
        });

        return () => {
            initialSessionStop();
            unsubscribe();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
            focus();
        };
    }, []);

    /**
     * setting navigation values to local variables
     */
    useEffect(() => {
        if (route.params?.firstName) {
            set_firstName(route.params?.firstName);
        }

        if (route.params?.secondName) {
            set_secondName(route.params?.secondName);
        }

    }, [route.params?.firstName, route.params?.secondName]);

    /**
     * This useeffect returns the Registration process success / failure info from API
     * Success : Based on Client not equals to 0, Peet parent will be navigated to OTP screen
     * Failure : When client id is 0, error message will be shown 
     */
    useEffect(() => {

        if (regData) {

            stopFBTrace();
            if (regData.ManageClientInfo.result.ClientID !== 0) {
                firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_success, firebaseHelper.screen_register_account, "Registering the Account API success ", 'Email : ' + email);
                set_email(regData.ManageClientInfo.result.Email);
                getOTPAPI(regData.ManageClientInfo.result.Email);
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : Email already Exists');
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_popUpMessage(Constant.EMAIL_ALREADY_EXISTS);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
        }

        if (regError) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_account_api_fail, firebaseHelper.screen_register_account, "Registering the Account API Fail ", 'Error : ' + regError);
            stopFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isPopUp(true);
            popIdRef.current = 1;
            set_popUpMessage(Constant.EMAIL_ALREADY_EXISTS);
        }

    }, [regData, regError]);

    useEffect(() => {

        if (fPsdData) {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            stopEVFBTrace();
            if (fPsdData.SendEmailVerificationCode && fPsdData.SendEmailVerificationCode.result.Key) {
                firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_success, firebaseHelper.screen_register_account, "Requesting OTP API Success", 'Email : ' + email);
                navigation.navigate('OTPComponent', { isFromScreen: 'registration', eMailValue: email });

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_account, "Requesting OTP API Failed", 'Email : ' + email);
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
        }

        if (fPsdError) {
            firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api_fail, firebaseHelper.screen_register_account, "Requesting OTP API Failed", 'Error : ' + fPsdError);
            stopEVFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isPopUp(true);
            popIdRef.current = 1;
            set_userMessage(Constant.ALERT_FORGOT_PASSWORD_API_FAILURE);
        }

    }, [fPsdData, fPsdError]);

    const initialSessionStart = async () => {
        trace_inRegisterAccountScreen = await perf().startTrace('t_inRegisterAccountScreen');
    };

    const initialSessionStop = async () => {
        await trace_inRegisterAccountScreen.stop();
    };

    const stopFBTrace = async () => {
        await trace_RegisterAccount_API_Complete.stop();
    };

    const stopEVFBTrace = async () => {
        await trace_Email_Verification_API_Complete.stop();
    };

    const getOTPAPI = async (email) => {
        let json = {
            Email: email,
        };
        firebaseHelper.logEvent(firebaseHelper.event_registration_otp_api, firebaseHelper.screen_register_account, "Requesting OTP API initiated", 'Email : ' + email);
        trace_Email_Verification_API_Complete = await perf().startTrace('t_Email_Verification_API');
        await fPsdRequest({ variables: { input: json } });
    }

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    ///Navigates the pet parent to Profile screen
    const navigateToPrevious = () => {
        if (isLoadingdRef.current === 0 && popIdRef.current === 0) {
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_register_account, "User clicked on back button to navigate to PetParentProfileComponent ", '');
            navigation.navigate('PetParentProfileComponent');
        }
    }

    /**
     * 
     * @param {*} email 
     * @param {*} phNumber 
     * @param {*} firstName 
     * @param {*} secondName 
     * On validating the details, these details will be sent to backend Api to validate
     */
    const submitAction = async (email, phNumber, firstName, secondName) => {

        set_email(email);
        set_phNumber(phNumber);
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let json = {
            FirstName: firstName,
            LastName: secondName,
            Email: email,
            PhoneNumber: phNumber,
        };
        firebaseHelper.logEvent(firebaseHelper.event_registration_account_action, firebaseHelper.screen_register_account, "User clicked submit button to initiate the Account cration API ", 'Email : ' + email);
        trace_RegisterAccount_API_Complete = await perf().startTrace('t_RegisterAccount_API');
        await registerRequest({ variables: { input: json } });
    }

    // Popup Ok button action
    const popOkBtnAction = (value) => {
        set_isPopUp(value);
        popIdRef.current = 0;
    }

    return (
        <RegisterAccountUi
            firstName={firstName}
            secondName={secondName}
            isLoading={isLoading}
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
            popOkBtnAction={popOkBtnAction}
        />
    );

}

export default RegisterAccountComponent;