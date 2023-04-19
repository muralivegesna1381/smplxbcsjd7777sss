import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text} from 'react-native';
import BottomComponent from "../../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../../utils/commonComponents/headerComponent';
import DatePicker from 'react-native-date-picker'
import CommonStyles from '../../../../utils/commonStyles/commonStyles';

const  SelectDateUI = ({route, ...props }) => {

    const [selectedDate, set_selectedDate] = useState(new Date());

    useEffect(() => {
      set_selectedDate(props.selectedDate);
    }, [props.selectedDate]);

    const nextButtonAction = () => {
      props.submitAction(selectedDate);
    };

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
                    title={'Observations'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width: wp('80%'),height: hp('70%'),alignSelf:'center'}}>
            <Text style={[CommonStyles.headerTextStyle,{marginTop: hp("8%"),marginBottom: hp("10%")}]}>{'Please select the date'}</Text> 

            <View style={styles.datePickerMViewStyle}>
              <View style={styles.datePickerSubViewStyle}>
                <DatePicker 
                      date={selectedDate} 
                      onDateChange={(date) => set_selectedDate(date)} 
                      mode = {"date"} 
                      textColor = {'black'} 
                      maximumDate = {new Date()}
                      style={styles.datePickeStyle}
                  />
              </View>
                
            </View>
            </View>

            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle = {'BACK'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>   

         </View>
    );
  }
  
  export default SelectDateUI;

  const styles = StyleSheet.create({

    datePickerMViewStyle : {
      alignSelf:'center',
      borderRadius:5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 1,
    },

    datePickerSubViewStyle : {
      width: wp('80%'),
      height: hp('30%'),
      alignSelf:'center',
      backgroundColor:'#f9f9f9',
      alignItems:'center',
      justifyContent:'center',      
    },

    datePickeStyle : {
      backgroundColor:'white',
      width: wp('70%'),
      height: hp('25%'),
    },

  });