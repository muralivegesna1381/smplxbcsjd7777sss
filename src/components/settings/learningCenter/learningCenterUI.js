import React, { useState, useEffect } from 'react';
import {View,StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import LearningSegmentControlUI from './learningSegmentControlUI';
import FAQsComponentUI from './faqsComponentUI'
import VideosComponentUI from './videosComponentUI';
import UserGuidesComponentUI from './userGuidesComponentUI'
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant"
import AlertComponent from './../../../utils/commonComponents/alertComponent';
import CommonStyles from './../../../utils/commonStyles/commonStyles';

const SegmentType = {
  Faqs : "FAQs",
  Videos : "Videos",
  UserGuides : "User Guides",
}

const  LearningCenterUI = ({route, ...props }) => {

  const [selectionSegmentType, set_selectionSegmentType] = useState(SegmentType.Faqs);

    const [faqsArray, set_faqsArray] = useState(undefined);
    const [videosArray, set_videosArray] = useState(undefined);
    const [userGuidesArray, set_userGuidesArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popupMsg, set_popupMsg] = useState(undefined);

    useEffect(() => {

        set_faqsArray(props.faqsArray);
        set_videosArray(props.videosArray);
        set_userGuidesArray(props.userGuidesArray);

        set_isLoading(props.isLoading);
        set_popupMsg(props.popupMsg);
        set_isPopUp(props.isPopUp);

    }, [props.faqsArray,props.videosArray,props.userGuidesArray,props.popupMsg,props.isPopUp,props.isLoading]);

    const backBtnAction = () => {
        props.navigateToPrevious();
      };

   const segmentClicked = (segmentType) => {
       set_selectionSegmentType(segmentType)
   };

   const popOkBtnAction = () => {
      props.popOkBtnAction();
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
                    title={'Learning Center'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <LearningSegmentControlUI  
                selectionSegmentType = {selectionSegmentType}
                SegmentType = {SegmentType}
                segmentClicked = {segmentClicked}
             />

           {selectionSegmentType == SegmentType.Faqs ? <FAQsComponentUI        
                faqsList = {faqsArray}   
              /> : null }

           {selectionSegmentType == SegmentType.Videos ?  <VideosComponentUI        
                videosList = {videosArray}   
              /> : null }

            {selectionSegmentType == SegmentType.UserGuides ?  <UserGuidesComponentUI        
                userGuidesList = {userGuidesArray}   
              /> : null }

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={popupMsg}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {"OK"}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={false} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default LearningCenterUI;