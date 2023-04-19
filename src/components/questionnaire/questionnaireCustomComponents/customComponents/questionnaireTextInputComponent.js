import React,{useEffect} from 'react';
import {View,TextInput,StyleSheet} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';

const questionnaireTextInputComponent = ({textAnswer,setValue,maxLength,isMultiLineText,placeholder,status_QID}) => {

    /**
     * Textinput UI
     * Based on Multiline, this component will be Text Area / TextInput
     */
    return(
        <View>
            <View style={[styles.SectionStyle,{minHeight: isMultiLineText ? hp("5%") : hp("5%"),}]}>
            <TextInput
                style={styles.textInputStyle}
                maxLength={ maxLength}
                multiline={isMultiLineText}
                placeholder={placeholder}
                underlineColorAndroid="transparent"
                placeholderTextColor="#808080"
                value={textAnswer}
                onChangeText={async (text) => {
                    //setValue(_questionId,text);
                    setValue(text,undefined);
                }}
                editable={status_QID==="Submitted" ? false : true}
                />        
            </View>
        </View>

    )
}
export default questionnaireTextInputComponent;

const styles = StyleSheet.create({

    textInputStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontMedium1,
        width: wp("75%"),
        minHeight: hp("3%"),
        marginLeft: "5%",
        color: "black",
        
        
    },

    SectionStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        borderWidth: 0.5,
        borderColor: "#D8D8D8",
        width: wp("80%"),
        borderRadius: hp("1%"),
        alignSelf: "center",
        marginBottom: hp("1%"),
      },

});