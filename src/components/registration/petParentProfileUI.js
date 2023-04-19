import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text} from 'react-native';
import BottomComponent from "../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../utils/commonComponents/headerComponent';
import CommonStyles from '../../utils/commonStyles/commonStyles';
import TextInputComponent from '../../utils/commonComponents/textInputComponent';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

const  PetParentProfileUi = ({route, ...props }) => {

    const [firstName, set_firstName] = useState('');
    const [secondName, set_secondName] = useState('');
    const [isNxtBtnEnable, set_isNxtBtnEnable] = useState(false);

    const nextButtonAction = () => {
      props.submitAction(firstName, secondName);
    };

    const backBtnAction = () => {
      props.navigateToPrevious();
    }

    const validateFirstName = (first) => {

        set_firstName(first);
        if(first.length > 0 && secondName.length > 0){
            set_isNxtBtnEnable(true);
        }else {
            set_isNxtBtnEnable(false);
        }

    }

    const validateSecondName = (second) => {

        set_secondName(second);
        if(firstName.length > 0 && second.length > 0){
            set_isNxtBtnEnable(true);
        }else {
            set_isNxtBtnEnable(false);
        }

    }

    return (
        <View style={[CommonStyles.mainComponentStyle]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Parent Profile'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            
            <KeyboardAwareScrollView>
            <View style={{width:wp('100%'),height:hp('70%'),alignItems:'center'}}>

                    <View style={{width:wp('80%'),marginTop:hp('8%')}}>
                            <Text style={CommonStyles.headerTextStyle}>{'Let’s get to'}</Text>
                            <Text style={CommonStyles.headerTextStyle}>{'know you'}</Text>
                    
                            <View style={{marginTop:hp('4%')}} >

                                <TextInputComponent 
                                    inputText = {firstName} 
                                    labelText = {'First Name*'} 
                                    isEditable = {true}
                                    maxLengthVal = {20}
                                    autoCapitalize = {'none'}
                                    setValue={(textAnswer) => {
                                        validateFirstName(textAnswer)
                                    }}
                                 />

                            </View>  

                            <View style={{marginTop:hp('2%')}} >

                                <TextInputComponent 
                                    inputText = {secondName} 
                                    labelText = {'Last Name*'} 
                                    isEditable = {firstName.length > 0 ? true : false}
                                    maxLengthVal = {20}
                                    autoCapitalize = {'none'}
                                    setValue={(textAnswer) => {
                                         validateSecondName(textAnswer)
                                    }}
                                />

                            </View>  

                    </View>
               
            </View>           
            </KeyboardAwareScrollView>
            <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'NEXT'}
                    leftBtnTitle={'BACK'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {isNxtBtnEnable}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => nextButtonAction()}
                    leftButtonAction = {async () => backBtnAction()}
                />
            </View>            
         </View>
    );
  }
  
  export default PetParentProfileUi;