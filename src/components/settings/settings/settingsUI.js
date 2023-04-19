import React, { useState, useEffect } from 'react';
import {View,} from 'react-native';
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  SettingsUi = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
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
                    title={'Settings'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View >
                
                
            </View>  

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'LOGIN'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

         </View>
    );
  }
  
  export default SettingsUi;