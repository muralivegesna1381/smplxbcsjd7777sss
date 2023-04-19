import React, { useState, useEffect } from 'react';
import {View,Linking} from 'react-native';
import SupportUI from './supportUI';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const SupportComponent = ({navigation, route, ...props }) => {

    const [arraySupport, set_arraySupport] = useState([
        {'header' : 'Learning Center', 'subheader' : 'Find intelligent answers instantly', 'img' : require("./../../../../assets/images/otherImages/svg/learningCenterImg.svg")}, 
        {'header' : 'Email', 'subheader' : 'Get solutions beamed to you inbox', 'img' : require("./../../../../assets/images/otherImages/svg/emailImg.svg")},
        {'header' : 'Phone', 'subheader' : 'Talk to us!', 'img' : require("./../../../../assets/images/otherImages/svg/phoneSupportImg.svg")},
        {'header' : 'Privacy Policy', 'subheader' : 'Legal', 'img' : require("./../../../../assets/images/otherImages/svg/privacyIcon.svg")},
        {'header' : 'Terms of service', 'subheader' : 'Legal', 'img' : require("./../../../../assets/images/otherImages/svg/termsIcon.svg")},
        {'header' : 'App orientation', 'subheader' : 'appo', 'img' : require("./../../../../assets/images/otherImages/svg/app-or.svg")}

    ]);

    let trace_Support_Screen;

  useEffect(() => {
    supportSessionStart();
    firebaseHelper.reportScreen(firebaseHelper.screen_support);
    firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_support, "User in Support Screen", ''); 

     return () => {
       supportSessionStop();
     };
 
   }, []);

    /**
     * User will be navigated to previous page
     */
    const navigateToPrevious = () => {  
        navigation.navigate('DashBoardService');
    };


    const supportSessionStart = async () => {
        trace_Support_Screen = await perf().startTrace('t_Support_Screen');
      };
    
      const supportSessionStop = async () => {
        await trace_Support_Screen.stop();
      };

    /**
     * 
     * @param {*} item 
     * User will be navigated to selected features (Chat, Learning Center, Email, Phone)
     */
    const selectSupportAction = (item) => {

        firebaseHelper.logEvent(firebaseHelper.event_support_menu_trigger, firebaseHelper.screen_support, "User selected support action", 'Option : ' + item.header);
         if(item.header==='Learning Center'){
            navigation.navigate("LearningCenterComponent");
        } else if(item.header==='Email'){
            Linking.openURL("mailto:support@wearablesclinicaltrials.com?subject=Support Request&body=Description");
        } else if(item.header==='Phone'){

            Linking.openURL("tel:8664145861");

        } else if(item.header==='Privacy Policy'){
            Linking.openURL('https://www.colgatepalmolive.co.uk/legal-privacy-policy/privacy-policy');
        } else if(item.header==='Terms of service'){
            Linking.openURL('https://portal.wearablesclinicaltrials.com/assets/TandC/terms-of-service.html');
        }
        else if(item.header === 'App orientation'){
            navigation.navigate("AppOrientationComponent")
        }
        
    }

    return (
        <SupportUI 
            arraySupport = {arraySupport}
            selectSupportAction = {selectSupportAction}
            navigateToPrevious = {navigateToPrevious}
        />
    );

  }
  
  export default SupportComponent;