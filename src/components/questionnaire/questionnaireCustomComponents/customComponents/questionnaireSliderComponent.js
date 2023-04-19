import React,{useEffect, useState} from 'react';
import {View,StyleSheet,Text} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';
import Slider from "react-native-slider";

    const questionnaireSliderComponent = ({minValue,maxValue,value,breakValue,status_QID,desc,setValue}) => {

        const [valueSlider, set_valueSlider] = useState(undefined);
        const [stepValue, set_stepValue] = useState(1);

      useEffect(() => { 
        if(breakValue){
          set_stepValue(breakValue);
        }
      },[breakValue]);

      useEffect(() => { 
        setValue(valueSlider);
      },[valueSlider]);

      useEffect(() => { 
        if(value){
          set_valueSlider(parseInt(value));
        }else{
          set_valueSlider(parseInt(minValue));
        }
        
      },[]);
    /**
     * Textinput UI
     * Based on Multiline, this component will be Text Area / TextInput
     */
    return(
        <View style={styles.container}>
          <View style={{width: wp('80%'), height: hp('4%'),flexDirection:'row',justifyContent:'space-between'}}>
          <Text style={[styles.valuesTextStyle]}>{minValue}</Text>
          <Text style={styles.descTextStyle}>{"  "+desc}</Text>
          <Text style={styles.valuesTextStyle}>{maxValue}</Text>
          </View>
            <Slider
                style={{width: wp('80%')}}
                value={valueSlider}
                onValueChange={value => set_valueSlider(value)}
                minimumValue = {minValue}
                maximumValue = {maxValue}
                step = {stepValue}
                minimumTrackTintColor = {'grey'}
                maximumTrackTintColor = {'#D3D3D3'}
                animateTransitions = {true}
                animationType = {'spring'}
                thumbTintColor ={'#37B57C'}
                thumbStyle={styles.thumb}
                trackStyle={styles.track}
                disabled = {status_QID === 'Submitted' ? true : false}
                
        />
        <Text style={styles.IndexName}>{"Selected : "+value}</Text>
        </View>

    )
}
export default questionnaireSliderComponent;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 5,
        alignItems: "center",
        justifyContent: "center",
        width:wp('80%')
    },

    thumb: {
        width: 30,
        height: 30,
        backgroundColor: '#6BC105',
        borderRadius:100
    },

    track:{
        height: 12,
        borderRadius: 20,        
    },

    IndexName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontNormal,
      color:'#000000',
      width:wp('80%'),
      textAlign:'center',
      marginBottom: wp('2%'),
    },

    valuesTextStyle: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontNormal,
      textAlign: "left",
      color:'#000000',
    },

    descTextStyle: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontXSmall,
      textAlign: "left",
      color:'red',
    },

});