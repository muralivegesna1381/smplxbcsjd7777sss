import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as Constant from "./../../utils/constants/constant";
import ChangePasswordUI from './changePasswordUI';
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inChangePswd_Screen;
let trace_ChangePswd_API_Complete;

const ChangePasswordComponent = ({ navigation, route, ...props }) => {

    const [psdRequest, { loading: psdLoading, error: psdError, data: psdData },] = useMutation(Queries.CHANGE_USER_PASSWORD);

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isNavigate, set_isNavigate] = useState(undefined);
    const [userPs, set_userPs] = useState(undefined);
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_change_password);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_password, "User in Change Password Screen", '');
        initialSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    // updates the Status of the changing password
    useEffect(() => {

        if (psdData) {

            set_isLoading(false);
            isLoadingdRef.current = 0;
            stopFBTrace();
            if (psdData.changeUserpswd.result && psdData.changeUserpswd.result.Key) {
                firebaseHelper.logEvent(firebaseHelper.event_change_password_api_success, firebaseHelper.screen_change_password, "Change Password Api Success : ", 'Other_Info : ');
                set_isNavigate(true);
                set_popUpMessage(Constant.CHANGE_PSWD_SUCCESS);
                set_popUpTitle('Success');
                set_isPopUp(true);
                popIdRef.current = 1;
                savePs(userPs);

            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_password_api_fail, firebaseHelper.screen_change_password, "Change Password Api Failed : ", 'Other_Info : Invalid Password');
                set_isNavigate(false);
                set_popUpMessage('Invalid current password');
                set_isPopUp(true);
                popIdRef.current = 1;
                set_popUpTitle('Alert');
            }
        }

        if (psdError) {
            firebaseHelper.logEvent(firebaseHelper.event_change_password_api_fail, firebaseHelper.screen_change_Password, "Change Password Api Failed : ", 'Other_Info : Invalid Password');
            stopFBTrace();
            set_isNavigate(false);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isPopUp(true);
            popIdRef.current = 1;
            set_popUpMessage(Constant.INVALID_PSWD);
        }

    }, [psdData, psdError]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inChangePswd_Screen = await perf().startTrace('t_inChangePasswordScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inChangePswd_Screen.stop();
    };

    const stopFBTrace = async () => {
        await trace_ChangePswd_API_Complete.stop();
    };

    /**
     * navigate back to the screen from where this screen is called
     */
    const navigateToPrevious = () => {

        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
        
    };

    // Saves the user new password for auto login
    const savePs = async (ps) => {
        await DataStorageLocal.saveDataToAsync(Constant.USER_PSD_LOGIN, "" + ps);
    };

    // Service call to save the changed password
    const submitAction = async (currentPsdEncrypt, newPsdEncrypt) => {

        set_userPs(newPsdEncrypt);
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_change_password, firebaseHelper.screen_change_password, "User clicked on Submit Change Password button : ", 'Internet Status : ' + internet);
        if (!internet) {
            set_popUpTitle(Constant.ALERT_NETWORK);
            set_popUpMessage(Constant.NETWORK_STATUS);
            set_isPopUp(true);
            popIdRef.current = 1;

        } else {

            set_isLoading(true);
            isLoadingdRef.current = 1;
            let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
            let json = {
                ClientID: "" + clientIdTemp,
                Password: currentPsdEncrypt,
                NewPassword: newPsdEncrypt,
            };
            trace_ChangePswd_API_Complete = await perf().startTrace('t_ChangePassword_API');
            await psdRequest({ variables: { input: json } });
        }

    };

    // Popup Ok button action
    const popOkBtnAction = (value,) => {
        set_isPopUp(value);
        popIdRef.current = 0;
        set_popUpTitle(undefined);
        set_popUpMessage(undefined);
        if (isNavigate) {
            navigateToPrevious();
        }
    };

    return (
        <ChangePasswordUI
            isPopUp={isPopUp}
            popUpMessage={popUpMessage}
            popUpTitle={popUpTitle}
            isLoading={isLoading}
            popOkBtnAction={popOkBtnAction}
            submitAction={submitAction}
            navigateToPrevious={navigateToPrevious}
        />
    );

}

export default ChangePasswordComponent;