import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,ScrollView,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import PetsSelectionCarousel from "../../../utils/petsSelectionCarousel/petsSelectionCarousel";
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import moment from "moment";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";

const  QuestionnaireStudyUI = ({route, ...props }) => {

    const [isPopUp, set_isPopUp] = useState(false);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [petsArray, set_petsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [questionnaireData, set_questionnaireData] = useState(undefined);
    const [activeSlide, set_activeSlide] = useState(0);

    useEffect(() => {
      
      set_petsArray(props.petsArray);
      set_defaultPetObj(props.defaultPetObj);

      if(props.defaultPetObj && props.petsArray){
        let index = 0;
        for(var i = 0; i < props.petsArray.length; i++) {
            if (props.petsArray[i].petID == props.defaultPetObj.petID) {
              index = i;
                break;
            }
        }

        set_activeSlide(index);
      } 

    }, [props.petsArray, props.defaultPetObj]);

    useEffect(() => {
      set_isPopUp(props.isPopUp);
      set_isLoading(props.isLoading);
      set_questionnaireData(props.questionnaireData);
    }, [props.isLoading,props.questionnaireData,props.isPopUp]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    }

  const questPetSelection = async (pObject) => {
    await DataStorageLocal.saveDataToAsync(Constant.QUESTIONNAIRE_SELECTED_PET, JSON.stringify(pObject));
      props.questPetSelection(pObject);
  }

  const selectQuetionnaireAction = (item) => {
    props.selectQuetionnaireAction(item);
  }

  // Renders the Questionnaires in the list
  const _renderStudyItems = () => {
    if(questionnaireData) {
        return questionnaireData.map((item,index) => {
            return (
               <>
               <View>
               <TouchableOpacity onPress={() => selectQuetionnaireAction(item)}>
               <View style={styles.cellBackView}>
                        <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                            <Text style={styles.indexName}>{index+1}</Text>
                        </View>
                        <View style={{flex:4,marginRight:wp('1%'),justifyContent:'center',marginBottom:wp('2%'),marginTop:wp('2%')}}>
                            <Text style={styles.QuestionnaireName}>{item.questionnaireName}</Text>
                            <Text style={styles.QuestionnaireSubName}>{"Due by: "+moment(new Date(item.endDate)).format("MM-DD-YYYY")}</Text>
                        </View>

                        <View style={{flex:2,justifyContent:'center',alignItems:'center',marginRight:hp('2%')}}>
                            <View style={item.status === "Submitted" ? styles.cellStatusViewSubmitted : item.status === "Open" ? styles.cellStatusViewPending : styles.cellStatusViewElapsed}>
                            <Text style={item.status === "Submitted" ? [styles.cellStatusText,{color:'#6BC105'}] : item.status === "Open" ? [styles.cellStatusText] : [styles.cellStatusText,{color:'#FF2323'}]}>{item.status}</Text>
                            </View>
                        </View>
                  </View>
               </TouchableOpacity>
               </View>
               </>
             )
        });
    }
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
                    title={'Questionnaire'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>
            <View style={[CommonStyles.petsSelViewHeaderStyle]}>
                {defaultPetObj ? <PetsSelectionCarousel
                    petsArray={petsArray}
                    isSwipeEnable = {true}
                    defaultPet = {defaultPetObj}
                    activeSlides = {activeSlide}
                    setValue={(pObject) => {
                        questPetSelection(pObject);
                    }}
                /> : null}

            </View>

            <ScrollView>
              {questionnaireData ? <View style={{alignItems:'center', marginTop:hp('3')}}>
                
                {_renderStudyItems()}
              </View> : 
              (isLoading === false ?<View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
                <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
              </View> : null)
              }
            </ScrollView>

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {props.popUpTitle}
                    message={props.popUpMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                />
            </View> : null}
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.QUESTIONNAIRE_LOADING_MSG} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default QuestionnaireStudyUI;

  const styles = StyleSheet.create({

    indexName: {
      ...CommonStyles.textStyleExtraBoldItalic,
      fontSize: fonts.fontLarge,
      textAlign: "left",
      color:'#6BC105'
    },

    cellBackView : {
      backgroundColor:'white',
      minHeight:hp('8%'),
      width:wp('90%'),
      borderRadius:5,
      justifyContent:'center',
      flexDirection:'row',
      marginBottom:hp('1%'),
      borderWidth:0.5,
      borderColor:'#EAEAEA'
      
    },

    QuestionnaireName: {
      ...CommonStyles.textStyleMedium,
      fontSize: fonts.fontMedium,
      textAlign: "left",
      color:'#000000'
    },

    QuestionnaireSubName: {
      ...CommonStyles.textStyleRegular,
      fontSize: fonts.fontXSmall,
      textAlign: "left",
      color:'#9DA2A9'
    },

    cellStatusViewPending :{
      height:hp('4%'),
      width:hp('11%'),
      alignItems:'center',
      justifyContent:'center',
      borderRadius:5,
      borderColor:'#252CB1',
      borderWidth:1
    },

    cellStatusViewElapsed :{
      height:hp('4%'),
      width:hp('11%'),
      backgroundColor:'#FCD1D1',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:5,
      borderColor:'#FF2323',
      borderWidth:1
    },

    cellStatusViewSubmitted :{
      height:hp('4%'),
      width:hp('11%'),
      backgroundColor:'white',
      alignItems:'center',
      justifyContent:'center',
      borderRadius:5,
      borderColor:'#6BC105',
      borderWidth:1
    },

    cellStatusText:{
      ...CommonStyles.textStyleExtraBold,
      fontSize: fonts.fontSmall,
      color:'#252CB1',
      textTransform: 'uppercase'
    },

  });