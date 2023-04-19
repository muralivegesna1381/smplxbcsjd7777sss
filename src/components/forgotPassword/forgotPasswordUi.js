import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, } from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';

const ForgotPasswordUi = ({ route, ...props }) => {

    const [eMail, set_eMail] = useState(undefined);
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [alertTitle, set_alertTitle] = useState('');

    // setting values to local variables

    useEffect(() => {
        set_isLoading(props.isLoading);
        set_popUpMessage(props.userMessage);
        set_isPopUp(props.isPopUp);
        set_eMail(props.eMail);
        set_alertTitle(props.alertTitle);
        if (props.eMail) {
            set_isNxtBtnEnable(true);
        }
    }, [props.isLoading, props.userMessage, props.isPopUp, props.eMail, props.alertTitle]);

    /**
     *   When user clicks on Next Action this method passes email value to component class
     */
    const nextButtonAction = () => {
        props.submitAction(eMail);
    };

    /**
     *  When user clicks on Back button on Header this method triggers the component class
     */
    const backBtnAction = () => {
        props.navigateToPrevious();
    }

    /**
     * @param {*} email 
     * This will check the email formate.
     * When valid next button will enable
     * When valid saves the user entered email for backend validation
     */
    const validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (re.test(email.replace(/ /g, ''))) {
            set_isNxtBtnEnable(true);
        } else {
            set_isNxtBtnEnable(false);
        }
        set_eMail(email.replace(/ /g, ''));
    }

    /**
     * This method triggers when user clicks on Popup Button.
     */
    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Forgot Password'}
                    backBtnAction={() => backBtnAction()}
                />
            </View>

            <KeyboardAwareScrollView bounces={true} showsVerticalScrollIndicator={false} enableOnAndroid={true} scrollEnabled={true} scrollToOverflowEnabled={true} enableAutomaticScroll={true}>

                <View style={{ width: wp('100%'), height: hp('70%'), alignItems: 'center' }}>

                    <View style={{ width: wp('80%'), minHeight: hp('8%'), marginTop: hp('25%') }}>

                        <Text style={[CommonStyles.headerTextStyle]}>{'Forgot Password?'}</Text>

                        <View style={{ marginTop: hp('4%') }} >

                            <TextInputComponent
                                inputText={eMail}
                                labelText={'Email*'}
                                isEditable={true}
                                maxLengthVal={50}
                                autoCapitalize={'none'}
                                setValue={(textAnswer) => {
                                    validateEmail(textAnswer)
                                }}
                            />

                        </View>
                    </View>
                </View>

            </KeyboardAwareScrollView>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle={'NEXT'}
                    isLeftBtnEnable={false}
                    rigthBtnState={isNxtBtnEnable}
                    isRightBtnEnable={true}
                    rightButtonAction={async () => nextButtonAction()}
                />
            </View>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header={alertTitle}
                    message={popUpMessage}
                    isLeftBtnEnable={false}
                    isRightBtnEnable={true}
                    leftBtnTilte={'Cancel'}
                    rightBtnTilte={'OK'}
                    popUpRightBtnAction={() => popOkBtnAction()}
                    popUpLeftBtnAction={() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.LOADER_WAIT_MESSAGE} isButtonEnable={false} /> : null}

        </View>
    );
}

export default ForgotPasswordUi;

const styles = StyleSheet.create({

    mainComponentStyle: {
        flex: 1,
        backgroundColor: 'white'

    },

});