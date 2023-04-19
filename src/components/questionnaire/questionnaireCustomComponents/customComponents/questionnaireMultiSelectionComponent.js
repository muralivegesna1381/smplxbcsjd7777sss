import React,{useState, useEffect,useRef} from 'react';
import {View, Text,TouchableOpacity,StyleSheet} from 'react-native';
import fonts from './../../../../utils/commonStyles/fonts';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../../utils/commonStyles/commonStyles';

const questionnaireMultiSelectionComponent = ({navigation,_questionId,value,setValue,answerArray, selectedArray,status_QID,route,...props}) => {

    const [answersArray,set_answersArray]=useState([]);
    var selectedAnswers = useRef([]);
    var tempAnswersArray = useRef([]);

    /**
     * This component is used for selecting multiple options
     * Options will be supplied from where this component initialises
     * Default option selection will be set in this useEffect.
     */
    useEffect(() => {  
      if(status_QID==="Submitted" && selectedArray && selectedArray.length>0){
        const res = selectedArray.split('###');
        let tempArray = res;
        let tempJsonArray = [];

        for (let i = 0 ; i < tempArray.length; i++){
            let jsonValue = {"questionAnswer":tempArray[i]};
            tempJsonArray.push(jsonValue);
        }

        if(tempJsonArray && tempJsonArray.length>0){
          tempAnswersArray.current=[];
          tempAnswersArray.current=tempJsonArray;
          let temp=[];
          let check = tempJsonArray;
          for (let i = 0; i<check.length; i++){
            temp.push(check[i].questionAnswer);
          }
          selectedAnswers.current=temp;
        }

      }else{
        if(selectedArray && selectedArray.length>0){
          tempAnswersArray.current=[];
          tempAnswersArray.current=JSON.parse(selectedArray);
          let temp=[];
          let check = JSON.parse(selectedArray);
          for (let i = 0; i<check.length; i++){
            temp.push(check[i].questionAnswer);
          }
          
          selectedAnswers.current=temp;
        }else{
        }
        
      }
      
      set_answersArray(answerArray);
    },[answerArray]);

    /**
     * UI for Multiple answers
     * When selectedAnswers, particular options will be in selection mode
     * Else all options will be in default state
     * Values will be saved / deleted based on seletion / unselection
     * selected objects will passed to parent class for saving objects as default.
     * @returns 
     */
      const _renderMultiAnswers = () => {
        if(answersArray) {
            return answersArray.map((itemExists,index) => {
                return (
                   <>
                     <View style={styles.selectionContainer}>
                     <View style={selectedAnswers.current.includes(itemExists.questionAnswer) ? [styles.unSelectedBtnStyle] : [styles.selectedBtnStyle]}>
                        <TouchableOpacity disabled = {status_QID==="Submitted" ? true : false} onPress={()=>{

                            if (selectedAnswers.current.includes(itemExists.questionAnswer)){
                              selectedAnswers.current = selectedAnswers.current.filter(item => item !== itemExists.questionAnswer);
                              var index = tempAnswersArray.current.findIndex(e => e.questionAnswer === itemExists.questionAnswer);
                                if (index != -1) {
                                  tempAnswersArray.current.splice(index, 1);
                                } else {
                                }
                            }else {
                              tempAnswersArray.current.push(itemExists);
                              selectedAnswers.current.push(itemExists.questionAnswer);
                            }
                            
                             tempAnswersArray.current = Array.from(new Set(tempAnswersArray.current));
                            setValue(JSON.stringify(tempAnswersArray.current));
                        }} >  
                        <View style={{width:wp('80%')}}>
                            <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',}}>
                            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <View style={selectedAnswers.current.includes(itemExists.questionAnswer) ? [styles.unSelPointsViewStyle] : [styles.selPointsViewStyle]}>
                            <Text style={selectedAnswers.current.includes(itemExists.questionAnswer) ? [styles.selPointsTextStyle] : [styles.unSelPointsTextStyle]}>{index+1}</Text> 
                            </View>
                            </View>
                            <View style={{flex:5}}>
                            <Text style={selectedAnswers.current.includes(itemExists.questionAnswer) ? [styles.selectedTextColor] : [styles.unSelectedTextColor]}>{answersArray[index].questionAnswer}</Text>  
                            </View>
                            
                        </View>  
                        </View>      
                      </TouchableOpacity>

                   </View>
                      </View>
                   </>
                 )
            });
          }
       };

    return(
        <View >         
          <View>
          {_renderMultiAnswers()}
          </View>

        </View>

    )
}
export default questionnaireMultiSelectionComponent;

const styles = StyleSheet.create({

    selectionContainer: {
        marginLeft:wp('2%'),
        marginRight:wp('2%'),
        marginBottom:wp('2%'),       
    },

    selectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontExtraSmall,
        textAlign: "left",
        color:'#6BC105',
        marginRight:wp('2%'),
        marginBottom:hp('1%'),
        marginTop:hp('1%'),
      },

      unSelectedTextColor: {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontExtraSmall,
        textAlign: "left",
        color:'#6C6C6C',
        marginRight:wp('2%'),
        marginBottom:hp('1%'),
        marginTop:hp('1%'),
      },

      unSelectedBtnStyle : {

        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#D9F4BA',
        borderRadius:15,
        borderColor:'#6BC105',
        borderWidth:1,
        marginHorizontal:10,
        justifyContent:'center',
        alignItems:'center'
        
      },

      selectedBtnStyle : {
        width:wp('80%'),
        minHeight:hp('6'),
        backgroundColor:'#EDEDED',
        borderRadius:15,
        borderColor:'#B1B1B5',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center',
        marginHorizontal:10,
      },
      selPointsViewStyle : {
        width:wp('8%'),
        height:hp('3.6%'),
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'white',
        borderColor:'#B1B1B5',
        borderWidth:1
      },

      unSelPointsViewStyle : {
        width:wp('8%'),
        height:hp('3.6%'),
        alignItems:'center',
        justifyContent:'center',
        borderRadius:8,
        backgroundColor:'#6BC105',
        borderColor:'#36b57b',
        borderWidth:1
      },

      selPointsTextStyle: {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontExtraSmall,
        textAlign: "center",
        color:'white',
      },

      unSelPointsTextStyle: {
        // ...CommonStyles.textStyleRegular,
        // fontSize: fonts.fontExtraSmall,
        // textAlign: "center",
        // color:'#6C6C6C',
      },
});