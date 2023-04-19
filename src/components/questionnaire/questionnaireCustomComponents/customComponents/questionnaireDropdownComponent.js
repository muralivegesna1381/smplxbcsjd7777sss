import React,{useState, useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-material-dropdown-v2-fixed';

let downArrowImg = require('./../../../../../assets/images/otherImages/svg/downArrowGrey.svg');

const questionnaireDropdownComponent = ({navigation,_questionId,value,setValue, answerArray,status_QID,route,...props}) => {

    const [checkValue,set_checkValue]=useState('Please Select');
    const [answers, set_answers] = useState([]);

    /**
     * This component is used to select values from Dropdown
     * all the values in the dropdown will be initialised here from answersArray props
     * Third-Party library used for this Dropdown is material drodown
     */
    useEffect(() => {      
      
      let temp = [];
      for(let i=0; i<answerArray.length;i++){
        let json = {value: answerArray[i].questionAnswer };
        temp.push(json);
        if(answerArray[i].questionAnswerId===value || answerArray[i].questionAnswer===value){
          set_checkValue(answerArray[i].questionAnswer);
        }
      }
      set_answers(temp);
    },[]);

    // This useEffect refresh the ui when pet parent selcts the value from Dropdown list
    useEffect(() => {  

      if(checkValue==='Please Select'){
        setValue('');
      }else {
        setValue(checkValue);
      }
        
    },[checkValue]);

    /**
     * All the UI elements for Dropdown
     * Initialises 
     */
    return(
        <View style={styles.container}>
          <Dropdown
              value={checkValue}
              data={answers}
              dropdownOffset={{ 'top': 10}}
              containerStyle = {styles.dropdown}
              // inputContainerStyle={{ borderBottomColor: 'transparent' }}
              rippleCentered={true}
              onChangeText={(value)=> {set_checkValue(value)}}
              disabled={status_QID==="Submitted" ? true : false}
              // borderBottomColor = {'green'}
              // borderBottomWidth = {1}
              shadowHidden = {true}
              drawerWidth = {10}
              icon = {downArrowImg}
              baseColor = {'transparent'}
              dropdownPosition = {0}
          />
      </View>
    )
}
export default questionnaireDropdownComponent;

const styles = StyleSheet.create({

    container: {
        justifyContent: 'center',
        alignSelf: 'center',
        width:wp('80%'),
        borderRadius:5,
        borderColor:'grey',
        borderWidth:1,
        alignItems:'center',
        marginBottom: hp("2%"),
        // backgroundColor:'#818588'
      },
      dropdown: {
        width:wp('80%'),
        height:hp('5.5%'),
        justifyContent: 'center',
        marginTop: hp("2.5%"),
      },
});