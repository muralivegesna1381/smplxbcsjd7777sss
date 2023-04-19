import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TextInput, Keyboard } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import { heightPercentageToDP as hp, widthPercentageToDP as wp, } from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import fonts from '../../utils/commonStyles/fonts'
import CommonStyles from '../../utils/commonStyles/commonStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import LoaderComponent from '../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant"
import AlertComponent from '../../utils/commonComponents/alertComponent';

const OTPUI = ({ route, ...props }) => {

  const navigation = useNavigation();
  const [isFromScreen, set_isFromScreen] = useState(undefined);
  const [input1, set_input1] = useState("");
  const [input2, set_input2] = useState("");
  const [input3, set_input3] = useState("");
  const [input4, set_input4] = useState("");
  const [input5, set_input5] = useState("");
  const [input6, set_input6] = useState("");
  const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);
  const [popUpMessage, set_popUpMessage] = useState(undefined);
  const [isPopUp, set_isPopUp] = useState(false);
  const [isLoading, set_isLoading] = useState(false);
  const [alertTitle, set_alertTitle] = useState('');

  let inputValue1 = undefined;
  let inputValue2 = undefined;
  let inputValue3 = undefined;
  let inputValue4 = undefined;
  let inputValue5 = undefined;
  let inputValue6 = undefined;

  useEffect(() => {

    if (props.isFromScreen) {
      set_isFromScreen(props.isFromScreen);
    }

    set_isPopUp(props.isPopUp);
    set_popUpMessage(props.popUpMessage);
    set_isLoading(props.isLoading);
    set_alertTitle(props.alertTitle);

  }, [props.isFromScreen, props.isPopUp, props.popUpMessage, props.isLoading, props.alertTitle]);

  useEffect(() => {
    if (input1.length > 0) inputValue2.focus();
  }, [input1]);

  useEffect(() => {
    if (input2.length > 0) inputValue3.focus();
  }, [input2]);

  useEffect(() => {
    if (input3.length > 0) inputValue4.focus();
  }, [input3]);

  useEffect(() => {
    if (input4.length > 0) {
      inputValue5.focus();
    }
  }, [input4]);
  useEffect(() => {
    if (input5.length > 0) {
      inputValue6.focus();
    }
  }, [input5]);
  useEffect(() => {
    if (input6.length > 0) {
      Keyboard.dismiss();
    }
  }, [input6]);

  useEffect(() => {

    if (input1.length && input2.length && input3.length && input4.length && input5.length && input6.length) {
      set_isNxtBtnEnable(true);
    } else {
      set_isNxtBtnEnable(false);
    }

  }, [input1, input2, input3, input4, input5, input6]);

  const nextButtonAction = () => {
    props.submitAction(input1 + input2 + input3 + input4 + input5 + input6);
  };

  const backBtnAction = () => {
    props.navigateToPrevious();
  }

  const deleteOtp = () => {
    inputValue1.focus();
    inputValue1.clear();
    inputValue2.clear();
    inputValue3.clear();
    inputValue4.clear();
    inputValue5.clear();
    inputValue6.clear();
  };

  /**
   * This method triggers when user clicks on Popup Button.
   */
  const popOkBtnAction = () => {
    props.popOkBtnAction(false);
  }

  return (
    <View style={[CommonStyles.mainComponentStyle]}>
      <View style={[CommonStyles.headerView, {}]}>
        <HeaderComponent
          isBackBtnEnable={true}
          isSettingsEnable={false}
          isChatEnable={false}
          isTImerEnable={false}
          isTitleHeaderEnable={true}
          title={'User Verification'}
          backBtnAction={() => backBtnAction()}
        />
      </View>
      <View style={styles.componentStyle}>

        <KeyboardAwareScrollView>

          <View style={styles.otpViewStyle}>
            <Text style={CommonStyles.headerTextStyle}>{'Verification'}</Text>
            <View style={{ marginTop: hp('2%') }}>
              <Text style={CommonStyles.subHeaderTextStyle}>{'Please enter the 6 digit verification code sent to your registered email ID'}</Text>
            </View>
            <View style={styles.otpBackViewStyle}>
              <TextInput style={styles.input} ref={(focusRef) => { inputValue1 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input1) => { await set_input1(input1); await inputValue2.focus(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

              <TextInput style={styles.input} ref={(focusRef) => { inputValue2 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input2) => { await set_input2(input2); await inputValue3.focus(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

              <TextInput style={styles.input} ref={(focusRef) => { inputValue3 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input3) => { await set_input3(input3); await inputValue4.focus(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

              <TextInput style={styles.input} ref={(focusRef) => { inputValue4 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input4) => { await set_input4(input4); await inputValue5.focus(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

              <TextInput style={styles.input} ref={(focusRef) => { inputValue5 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input5) => { await set_input5(input5); await inputValue6.focus(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

              <TextInput style={styles.input} ref={(focusRef) => { inputValue6 = focusRef }}
                underlineColorAndroid="transparent"
                textAlign={"center"}
                // placeholder={'*'}
                maxLength={1}
                keyboardType="numeric"
                secureTextEntry={true}
                onChangeText={async (input6) => { await set_input6(input6); await Keyboard.dismiss(); }}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === "Backspace") {
                    deleteOtp();
                  }
                }}
              />

            </View>
          </View>
        </KeyboardAwareScrollView>

      </View>
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
          rightBtnTilte={'OK'}
          popUpRightBtnAction={() => popOkBtnAction()}
        />
      </View> : null}

      {isLoading === true ? <LoaderComponent isLoader={true} loaderText={Constant.OTP_LOADER_MSG} isButtonEnable={false} /> : null}
    </View>
  );
}

export default OTPUI;

const styles = StyleSheet.create({

  componentStyle: {
    justifyContent: 'center',
    alignItems: 'center'
  },

  otpViewStyle: {
    marginTop: hp('10%'),
    width: wp('85%'),
    height: hp('70%'),
  },

  otpBackViewStyle: {
    minHeight: hp('8%'),
    width: wp('85%'),
    marginTop: hp('4%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center'
  },

  input: {
    height: wp("15%"),
    width: wp("10%"),
    borderColor: "#dedede",
    borderWidth: 0.5,
    borderRadius: 3,
    color: "black",
    ...CommonStyles.textStyleBold,
  },

});