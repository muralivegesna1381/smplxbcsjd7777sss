import React, { useState, useEffect } from 'react';
import {View,StyleSheet} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';

const  PrivacyUi = ({route, ...props }) => {

    const backBtnAction = () => {
        props.navigateToPrevious();
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
                    title={'Privacy'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View >
                
                
            </View>  

         </View>
    );
  }
  
  export default PrivacyUi;