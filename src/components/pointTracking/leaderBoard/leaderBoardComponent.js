import React, { useState, useEffect } from 'react';
import LeaderBoardUI from "./leaderBoardUI";

const  LeaderBoardComponent = ({navigation, route, ...props }) => {

  const [leaderBoardCurrent, set_leaderBoardCurrent] = useState(undefined);

      useEffect(() => {
        
        set_leaderBoardCurrent(props.leaderBoardCurrent);
      }, [props.leaderBoardCurrent,props.isPTLoading]);

      const campaignBtnAction = () => {
        props.campaignBtnAction();
      }

      const rewardPointsBtnAction = () => {
        props.rewardPointsBtnAction();
      };

      const popOkBtnAction = () => {
        props.popOkBtnAction();
      };

      const getCampaign = (item) => {
        props.getCampaign(item);

      }

    return (
        <LeaderBoardUI
          leaderBoardArray = {props.leaderBoardArray}
          leaderBoardPetId = {props.leaderBoardPetId}
          leaderBoardCurrent = {leaderBoardCurrent}
          campagainName = {props.campagainName}
          campagainArray = {props.campagainArray}
          popUpMessage = {props.popUpMessage}
          popUpAlert = {props.popUpAlert}
          isPopUp = {props.isPopUp}
          isLoading = {props.isLoading}
          isPTLoading = {props.isPTLoading}
          enableLoader = {props.enableLoader}
          campaignBtnAction = {campaignBtnAction}
          rewardPointsBtnAction = {rewardPointsBtnAction}
          popOkBtnAction = {popOkBtnAction}
          getCampaign = {getCampaign}
        />
    );

  }
  
  export default LeaderBoardComponent;