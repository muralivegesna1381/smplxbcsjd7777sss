import React, { useState, useEffect } from 'react';
import { useNavigation } from "@react-navigation/native";
import LeaderBoardComponent from "./leaderBoardComponent";
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "../../../config/apollo/queries";
import * as internetCheck from "./../../../utils/internetCheck/internetCheck";
import * as Constant from "./../../../utils/constants/constant";
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_Leaderboard_API_Complete;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const  LeaderBoardService = ({route, ...props }) => {

  const navigation = useNavigation();
  const [leaderBoardArray, set_leaderBoardArray] = useState(undefined);
  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);
  const [campagainName, set_campagainName] = useState("");
  const [isLoading, set_isloading] = useState(false);
  const [isPopUp, set_isPopUp] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [popUpAlert, set_popUpAlert] = useState(undefined);
  const [enableLoader, set_enableLoader] = useState (false);

    useEffect(() => {
      set_leaderBoardArray(props.leaderBoardArray);
      set_leaderBoardCurrent(props.leaderBoardCurrent);
      set_campagainName(props.campagainName);
      set_enableLoader(props.enableLoader)
    }, [props.leaderBoardArray,props.leaderBoardCurrent,props.campagainName,props.enableLoader]);

    const campaignBtnAction = async () => {
      
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_campaign_Action_trigger, firebaseHelper.screen_leaderBoard, "User Clicked btn to navigate CampaignService", 'Internet Status : ',internet);
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopUp(true);
  
        } else {
          updateTimer('leaderBoard');
          navigation.navigate("CampaignService", {leaderBoardArray:leaderBoardArray, leaderBoardCurrent: leaderBoardCurrent});
        }
      
    };

    const rewardPointsBtnAction = async () => {

      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_reward_points_Action_trigger, firebaseHelper.screen_leaderBoard, "User Clicked btn to navigate Reward Points Page", 'Internet Status : ',internet);
        if(!internet){

          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopUp(true);
  
        } else {

          updateTimer('leaderBoard');
          navigation.navigate('RewardPointsService',{petId : props.leaderBoardPetId, leaderBoardCurrent:leaderBoardCurrent});

        }
      
    };

    const getLeaderBoardDetails = async (campId) => {

      trace_Leaderboard_API_Complete = await perf().startTrace('t_GetLeaderBoardByCampaign_API');
      let defaultPet = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      defaultPet = JSON.parse(defaultPet);
      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

      fetch(EnvironmentJava.uri + "getLeaderBoardByCampaignId/" + campId + "/" + defaultPet.petID,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken" : token
          },
        }
      ).then((response) => response.json()).then(async (data) => {
          set_isloading(false);
          stopFBTrace();
          if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
          }

          if (data && data.status.success && data.response.leaderBoards.length > 0) {
            firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_success, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Success", '');
            set_leaderBoardArray(data.response.leaderBoards);
            set_leaderBoardCurrent(data.response.currentPet);

          } else {
  
          }
        }).catch((error) => {
          firebaseHelper.logEvent(firebaseHelper.event_leaderBoard_api_fail, firebaseHelper.screen_leaderBoard, "Pet GetLeaderBoardByCampaign API Failed", 'error : '+error);
          stopFBTrace();
          set_isloading(false);
        });
    };

    const stopFBTrace = async () => {
      await trace_Leaderboard_API_Complete.stop();
    };

    const updateTimer = (value) => {
      Apolloclient.client.writeQuery({
         query: Queries.TIMER_WIDGET_QUERY,
              data: {
                data: { 
                  screenName:value,stopTimerInterval:'Continue',__typename: 'TimerWidgetQuery'}
                },
      })
    };

    const popOkBtnAction = () => {
      set_popUpAlert(undefined);
      set_popUpMessage(undefined);
      set_isPopUp(false);
    };

    const getCampaign = async (item) => {

      let internet = await internetCheck.internetCheck();
        if(!internet){
          set_popUpAlert(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopUp(true);
  
        } else {
          set_isloading(true);
          set_enableLoader(true);
          set_campagainName(item.campaignName);
          getLeaderBoardDetails(item.campaignId);
        }
    }

    return (
        <LeaderBoardComponent
            leaderBoardArray = {leaderBoardArray}
            leaderBoardPetId = {props.leaderBoardPetId}
            leaderBoardCurrent = {leaderBoardCurrent}
            campagainName = {campagainName}
            campagainArray = {props.campagainArray}
            popUpMessage = {popUpMessage}
            popUpAlert = {popUpAlert}
            isPopUp = {isPopUp}
            isLoading = {isLoading}
            enableLoader = {enableLoader}
            campaignBtnAction = {campaignBtnAction}
            rewardPointsBtnAction = {rewardPointsBtnAction}
            popOkBtnAction = {popOkBtnAction}
            getCampaign = {getCampaign}
        />
    );

  }
  
  export default LeaderBoardService;