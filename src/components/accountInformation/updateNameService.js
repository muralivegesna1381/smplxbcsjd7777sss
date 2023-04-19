import React, { useState, useEffect, useRef } from 'react';
import { View, BackHandler } from 'react-native';
import UpdateNameUI from './updateNameUI';
import { useMutation } from "@apollo/react-hooks";
import * as Queries from "../../config/apollo/queries";
import * as internetCheck from "../../utils/internetCheck/internetCheck";
import * as DataStorageLocal from '../../utils/storage/dataStorageLocal';
import * as Constant from "../../utils/constants/constant";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inChangeName_Screen;
let trace_ChangeName_API_Complete;

const UpdateNameService = ({ navigation, route, ...props }) => {

    const [upDateUserDetails, { loading: upDateUserDetailsLoading, error: upDateUserDetailsError, data: upDateUserDetailsData, },] = useMutation(Queries.CHANGE_USER_INFO);

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

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_change_name);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_change_name, "User in Change Name Screen", '');
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    // setting the existing user details to local variables
    useEffect(() => {

        if (route.params?.firstName) {
            set_firstName(route.params?.firstName)
        }

        if (route.params?.secondName) {
            set_lastName(route.params?.secondName);
        }

        if (route.params?.phoneNo) {
            set_phNo(route.params?.phoneNo);
        }

    }, [route.params?.fullName, route.params?.phoneNo, route.params?.firstName, route.params?.secondName]);

    // Service call responce
    useEffect(() => {

        if (upDateUserDetailsData) {

            stopFBTrace();
            if(upDateUserDetailsData.changeUserInfo.success){
                firebaseHelper.logEvent(firebaseHelper.event_change_name_api_success, firebaseHelper.screen_change_name, "Userr Name Api success", '');
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_isNavigate(true);
                set_popUpMessage(Constant.CHANGE_NAME_SUCCESS);
                set_popAlert(Constant.ALERT_INFO);
                set_isPopUp(true);
                popIdRef.current = 1;
            } else {
                firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "Userr Name Api failed", '');
                set_isLoading(false);
                isLoadingdRef.current = 0;
                set_isNavigate(false);
                set_popUpMessage(Constant.NAME_ERROR_UPDATE);
                set_popAlert('Alert');
                set_isPopUp(true);
                popIdRef.current = 1;
            }
            
        }

        if (upDateUserDetailsError) {
            firebaseHelper.logEvent(firebaseHelper.event_change_name_api_fail, firebaseHelper.screen_change_name, "Userr Name Api failed", '');
            stopFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_isNavigate(false);
            set_popUpMessage(Constant.NAME_ERROR_UPDATE);
            set_popAlert('Alert');
            set_isPopUp(true);
            popIdRef.current = 1;
        }

    }, [upDateUserDetailsLoading, upDateUserDetailsError, upDateUserDetailsData]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inChangeName_Screen = await perf().startTrace('t_inChangeNameScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inChangeName_Screen.stop();
    };

    const stopFBTrace = async () => {
        await trace_ChangeName_API_Complete.stop();
    };

    // Navigate to previous screen
    const navigateToPrevious = () => {
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            navigation.navigate('AccountInfoService');
        } 
    };

    // Service call to update the User name
    const UpdateAction = async (frst, last) => {

        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_change_name, firebaseHelper.screen_change_name, "Internet Status : " + internet, 'New Name : ' + frst + last);
        if (!internet) {
            set_popUpMessage(Constant.ALERT_NETWORK);
            set_popAlert(Constant.ALERT_NETWORK);
            set_isPopUp(true);
            popIdRef.current = 1;
        } else {
            set_isLoading(true);
            isLoadingdRef.current = 1;
            let clientIdTemp = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
            let json = {
                ClientID: "" + clientIdTemp,
                FirstName: frst,
                LastName: lastName ? last : ' ',
                PhoneNumber: phnNo ? phnNo : '',
            };
            trace_ChangeName_API_Complete = await perf().startTrace('t_ChangeClientInfo_API');
            await upDateUserDetails({ variables: { input: json } });
        }

    };

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
        <UpdateNameUI
            firstName={firstName}
            lastName={lastName}
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

export default UpdateNameService;