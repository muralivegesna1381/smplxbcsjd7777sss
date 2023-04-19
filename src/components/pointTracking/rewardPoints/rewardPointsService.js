import React, { useState, useEffect,useRef } from 'react';
import {View,BackHandler} from 'react-native';
import RewardPointsUi from './rewardPointsUI';
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as Constant from "./../../../utils/constants/constant"
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inRewardPointsScreen;
const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const RewardPointsService = ({navigation, route, ...props }) => {

    const [leaderBoardPetId, set_leaderBoardPetId] = useState(undefined);
    const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
    const [awardedArray, set_awardedArray] = useState([]);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [totalRewardPoints, set_totalRewardPoints] = useState(undefined);
    const [totalRedeemablePoints, set_totalRedeemablePoints] = useState(undefined);
    const [redeemedArray, set_redeemedArray] = useState([]);
    const [isFromScreen, set_isFromScreen] = useState(undefined);
    const [petImg, set_petImg] = useState(undefined);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

      initialSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_rewards); 
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_rewards, "User in PT Rewards Screen", '');  
      
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        initialSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    }, []);

    useEffect(() => {

      if(route.params?.petId){
            set_leaderBoardPetId(route.params?.petId);
            getRewardsDetails(route.params?.petId);
            getTotalListofPoints(route.params?.petId);
        }

        if(route.params?.leaderBoardCurrent){
            set_leaderBoardCurrent(route.params?.leaderBoardCurrent);
        }

        if(route.params?.screen){
          set_isFromScreen(route.params?.screen);
      }

      getPetImage();

    }, [route.params?.petId,route.params?.leaderBoardCurrent,route.params?.screen]);

    const handleBackButtonClick = () => {
        navigateToPrevious();
        return true;
    };

    const initialSessionStart = async () => {
      trace_inRewardPointsScreen = await perf().startTrace('t_inRewardPointsScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inRewardPointsScreen.stop();
    };

    const getPetImage = async () => {

      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      if(defaultPet && defaultPet.photoUrl!==''){
        set_petImg(defaultPet.photoUrl);
      }
      
    };

    const navigateToPrevious = () => {
      
      if(isLoadingdRef.current === 0 && popIdRef.current === 0){
        if(isFromScreen){
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_rewards, "User clicked on back button to navigate to CampaignService", '');
          navigation.navigate('CampaignService');
        } else {
          firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_rewards, "User clicked on back button to navigate to DashBoardService", '');
          navigation.navigate('DashBoardService');
        }
      }

    };

    const getRewardsDetails = async (id) => {

      firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api, firebaseHelper.screen_rewards, "Initiated Api to Fetch Reward Details", 'Pet Id : '+id);
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch(EnvironmentJava.uri + "getPetCampaignPointsList/" + id,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }
            if (data.status.success && data.response.petCampaignList.length > 0) {
              firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API success", 'Campaign List length : '+data.response.petCampaignList.length);
              set_awardedArray(data.response.petCampaignList);
              set_isLoading(false);
              isLoadingdRef.current = 0;
            } 
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_getRewardsDetails_api_success, firebaseHelper.screen_rewards, "Reward Details API fail", 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;
          });
      };

      const getTotalListofPoints = async (id) => {
        firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api, firebaseHelper.screen_rewards, "Initiated Total Points API", 'Pet Id : '+id);
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch(EnvironmentJava.uri + "getPetCampaignPoints/" + id,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }

            if (data.status.success && data.response.petCampaign) {
              set_totalRewardPoints(data.response.petCampaign.totalEarnedPoints);
              set_totalRedeemablePoints(data.response.petCampaign.redeemablePoints);
              firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_success, firebaseHelper.screen_rewards, "Total Points API success - Total Points Earned "+data.response.petCampaign.totalEarnedPoints, 'Total Points Redeemed : '+data.response.petCampaign.redeemablePoints);
            } else {
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_isPopUp(true);
                popIdRef.current = 1;
            }
          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_getTotalListofPoints_api_fail, firebaseHelper.screen_rewards, "Total Points API Fail - Total Points Earned ", 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;
          });
      };

      const getRewardsRedeemedDetailsService = async (id) => {
        firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api, firebaseHelper.screen_rewards, "Initiated Get RewardsRedeemed Details API", 'Pet Id : '+leaderBoardPetId);
        set_isLoading(true);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch(EnvironmentJava.uri + "getPetRedemptionHistory/" + leaderBoardPetId,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "ClientToken" : token
            },
          }
        ).then((response) => response.json()).then(async (data) => {

            set_isLoading(false);
            isLoadingdRef.current = 0;
            if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
              AuthoriseCheck.authoriseCheck();
              navigation.navigate('WelcomeComponent');
            }

            if (data.status.success && data.response && data.response.redemptionHistoryList.length > 0) {
              firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_success, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Success ", 'RedemptionHistoryList : '+data.response.redemptionHistoryList.length);
              set_redeemedArray(data.response.redemptionHistoryList);
            } else {
              set_redeemedArray([]);    
            }

          }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_getRewardsRedeemedDetailsService_api_fail, firebaseHelper.screen_rewards, "Get RewardsRedeemed Details API Fail ", 'error : '+error);
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_isPopUp(true);
            popIdRef.current = 1;            
          });
      };

      const popOkBtnAction = () => {
        set_popUpMessage(undefined);
        set_isPopUp(false);
        popIdRef.current = 0;
    }

    const getRewardsRedeemedDetails = () => {
        firebaseHelper.logEvent(firebaseHelper.event_getTotal_points_button_trigger, firebaseHelper.screen_rewards, "Getting Total-Reward Points", 'Leaderboard Pet Id : '+leaderBoardPetId);
        getTotalListofPoints(leaderBoardPetId);
        getRewardsRedeemedDetailsService();
    }

    return (
        <RewardPointsUi 
            leaderBoardPetId = {leaderBoardPetId}
            leaderBoardCurrent = {leaderBoardCurrent}
            awardedArray = {awardedArray}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            totalRewardPoints = {totalRewardPoints}
            totalRedeemablePoints = {totalRedeemablePoints}
            redeemedArray = {redeemedArray}
            petImg = {petImg}
            navigateToPrevious = {navigateToPrevious}
            popOkBtnAction = {popOkBtnAction}
            getRewardsRedeemedDetails = {getRewardsRedeemedDetails}
        />
    );

  }
  
  export default RewardPointsService;