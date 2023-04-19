import React, { useState, useEffect } from 'react';
import {StyleSheet,View,} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';
import { TextInput } from 'react-native-paper';

const TextInputComponent = ({navigation, route,inputText,labelText,setValue,isEditable,maxLengthVal,keyboardType,autoCapitalize,widthValue,isSecure,isBackground,...props }) => {

    const [widthTextInput, set_widthTextInput] = useState(wp('80%'));
    const [isSecureText, set_isSecureText] = useState(undefined);
    const [isBackgroundColor, set_isBackgroundColor] = useState(false);
    const [autoCapitalizeValue, set_autoCapitalizeValue] = useState("none");
    useEffect (() => {
        if(widthValue){
            set_widthTextInput(widthValue)
        }
            
         set_isSecureText(isSecure);
         set_isBackgroundColor(isBackground);
         set_autoCapitalizeValue(autoCapitalize);

    },[widthValue,isSecure,isBackground,autoCapitalize]);
    
    return (

        <View style={[styles.mainComponentStyle]}>

            <View style={[styles.textInputContainerStyle,{width:widthTextInput}]} >

                <TextInput
                    label = {labelText}
                    value ={ inputText}
                    editable = {isEditable}
                    maxLength = {maxLengthVal}
                    keyboardType = {keyboardType}
                    autoCapitalize= {autoCapitalizeValue}
                    backgroundColor = {!isBackgroundColor ? 'transparent' : '#dedede'}
                    onChangeText={async (text) => {
                        setValue(text);
                    }}
                    // mode="outlined"
                    secureTextEntry = {isSecureText}
                    underlineColor={'transparent'}
                    style = {styles.textInputStyle}
                    activeUnderlineColor = {'#7F7F81'}
                    // selectionColor={'transparent'} 
                    theme={{
                        colors: {
                            label : 'grey',
                            background:'transparent',
                            // text: 'green',
                            primary: 'transparent',
                            // placeholder: 'green'
                        },
                       
                    }}
                />
                
            </View>
            
        </View>
    );
};

export default TextInputComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {

    },

    textInputStyle: {
        fontWeight: "normal",
        fontSize: fonts.fontMedium,
        flex: 1,
        height: hp('8%'),
        // marginLeft: wp('2%'),
        // color: "red",
        backgroundColor: 'transparent',

    },

    textInputContainerStyle: {
        flexDirection: 'row',
        width: wp('80%'),
        height: hp('8%'),
        borderRadius: wp('1%'),
        borderWidth: 1,
        // marginTop: hp('2%'),
        borderColor: '#dedede',
        backgroundColor:'white',
        alignItems: 'center',
        justifyContent: 'center',
    },

});