import React,{useState, useEffect} from 'react';
import {View, Text,TouchableOpacity,StyleSheet} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';

const questionnaireRadioButtonComponent = ({navigation,value,answersArray,selectedAnswer,setValue,status_QID, route,...props}) => {

    const [checkValue,set_checkValue]=useState('');
    const [answers, set_answers] = useState([]);

  /**
   * Sets the default values recieved from where it initialises
   */
    useEffect(() => {   
      set_checkValue(selectedAnswer);
      set_answers(answersArray)
    },[answersArray]);

    /**
     * Radio Button UI
     * Options will be suplied to this component from where it initialises
     * Most likely YES or NO options
     * Selected values will passed to Parent class
     */
    const _renderRadioItems = () => {
        if(answers) {
            return answers.map((item,index) => {
                return (
                   <>
                   <View style={{marginBottom:hp('1%')}}>
                        <TouchableOpacity disabled = {status_QID==="Submitted" ? true : false} style={checkValue===answers[index].questionAnswer ? [styles.selectedBtnStyle] : [styles.unSelectedBtnStyle]} onPress={()=>{
                            setValue(answers[index].questionAnswer),
                            set_checkValue(answers[index].questionAnswer)
                        }} >  
                        <Text style={checkValue===answers[index].questionAnswer ? [styles.selectedTextColor] : [styles.unSelectedTextColor]}>{answers[index].questionAnswer}</Text>          
                      </TouchableOpacity>

                   </View>
            
                   </>
                 )
            });
            }
       };

    return(

        <View style={styles.smsContainer} >
          {_renderRadioItems()}
          </View>
    )
}
export default questionnaireRadioButtonComponent;

const styles = StyleSheet.create({

    smsContainer: {
        marginLeft:wp('2%'),
        marginRight:wp('2%'),   
    },

     selectedTextColor: {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontMedium,
        textAlign: "center",
        color:'#6BC105',
        marginRight:wp('2%'),
        marginLeft:wp('2%'),        
      },

      unSelectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        textAlign: "center",
        color:'#6C6C6C',
        marginRight:wp('2%'),
        marginLeft:wp('2%'),
        marginRight:wp('2%'),
        marginLeft:wp('2%'),
      },

      unSelectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#ededed',
        borderRadius:15,
        borderColor:'#B1B1B5',
        borderWidth:1,
        justifyContent:'center',
      },

      selectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#D9F4BA',
        borderRadius:15,
        borderColor:'#6BC105',
        borderWidth:1,
        justifyContent:'center',
      }

});