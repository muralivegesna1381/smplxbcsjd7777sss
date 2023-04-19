import React, { useState, useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import PDFView from 'react-native-view-pdf';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import CommonStyles from './../../utils/commonStyles/commonStyles';

const PDFViewerComponent = ({ route, ...props }) => {

    const navigation = useNavigation();
    const resourceType = 'url';

    const [pURL, set_pURL] = useState(undefined);
    const [title, set_title] = useState(undefined);
    const [fromScreen, set_fromScreen] = useState(undefined);

    useEffect(() => {

        firebaseHelper.reportScreen(firebaseHelper.screen_pdfViewer_screen);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_pdfViewer_screen, "User in PDF viewer Screen", '');
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        };

    }, []);

    useEffect(() => {

        if (route.params?.pdfUrl) {
            set_pURL(route.params?.pdfUrl);
        }

        if (route.params?.title) {
            set_title(route.params?.title);
        }

        if (route.params?.fromScreen) {
            set_fromScreen(route.params?.fromScreen);
        }

    }, [route.params?.pdfUrl,route.params?.title,route.params?.fromScreen]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const backBtnAction = () => {

        if(fromScreen === 'settings'){
            navigation.navigate('LearningCenterComponent');
        } else {
            navigation.navigate('DashBoardService');
        }
        
    };

    return (

        <View style={[CommonStyles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView, {}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={title ? title : ''}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                <PDFView
                    fadeInDuration={250.0}
                    style={{ width: wp('100%'), height: hp('100%') }}
                    resource={pURL}
                    resourceType={resourceType}
                />

            </View>

        </View>
    );
}

export default PDFViewerComponent;