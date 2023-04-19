import React,{useState, useEffect,useRef} from 'react';
import {View,Text,TouchableOpacity,FlatList, Image,ImageBackground} from 'react-native';
import BottomComponent from "../../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import AlertComponent from '../../../utils/commonComponents/alertComponent';
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import LoaderComponent from '../../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../../utils/constants/constant";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'

import QuestionnaireQuestionsStyles from "./questionnaireQuestionsStyles";
import  * as QestionnaireDataObj from "./../questionnaireCustomComponents/questionnaireData/questionnaireSaveGetData";
import QuestionnaireTextInput from './../questionnaireCustomComponents/customComponents/questionnaireTextInputComponent';
import QuestionnaireRadioButtonComponent from './../questionnaireCustomComponents/customComponents/questionnaireRadioButtonComponent';
import QuestionnaireMultySelectionComponent from './../questionnaireCustomComponents/customComponents/questionnaireMultiSelectionComponent';
import QuestionnaireDropdownComponent from "./../questionnaireCustomComponents/customComponents/questionnaireDropdownComponent";
// import QuestionnaireImageComponent from "./../questionnaireCustomComponents/imageVideoComponents/questionnaireImageComponent";
// import QuestionnaireVideoComponent from "./../questionnaireCustomComponents/imageVideoComponents/questionnaireVideoComponent";
import QuestionnaireSliderComponent from "./../questionnaireCustomComponents/customComponents/questionnaireSliderComponent";

import downButtonImg from "./../../../../assets/images/otherImages/svg/downArrowGrey.svg";
import upButtonImg from "./../../../../assets/images/otherImages/svg/upArrow.svg";
import filterImg from "./../../../../assets/images/otherImages/png/filter.png";
import gradientImg from "./../../../../assets/images/otherImages/png/petCarasoulBck.png";
let defaultPetImg = require( "./../../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const QUESTIONNAIRE_QUESTIONS_KEY = {
    QUESTIONITEM: 'questionItem',
    QUESTIONANSWER:'questionAnswer',
    QUESTIONNAIREID:'questionnaireId',
    ISMANDATORY:'isMandatory',
    QUESTIONTYPE : 'questionType'
  };

const QuestionnaireQuestionsUI = ({navigation, route,...props}) => {

    const [questionsArray, set_questionsArray] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [questionnaireDict, set_questionnaireDict] = useState({});
    const [status, set_status] = useState(undefined);
    const [totalQuestions, set_totalQuestions] = useState(0);
    const [answeredQuestions, set_answeredQuestions] = useState(0);
    const [petId, set_petId] = useState(undefined);
    const [petURL, set_petURL] = useState(undefined);
    const [filterOptions, set_filterOptions] = useState(['All','Answered','Unanswered']);
    const [isQuestListOpen, set_isQuestListOpen] = useState(false);
    const [dropDownPostion, set_dropDownPostion] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [expandedIndex,set_expandedIndex] = useState(-1);  
    const [filterName, set_filterName] = useState('All');
    const [isFiterEmpty, set_isFiterEmpty] = useState(undefined);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);  
    const [isLoading, set_isLoading] = useState(false);
    const [isDropdown, set_isDropDown] = useState(false);
    const [ddIndex,set_ddIndex] = useState(0);
    const [dropDownItem,set_dropDownItem] = useState(undefined);
    const [dropDownValue,set_dropDownValue] = useState('Please select');
    const [questionTitle, set_questionTitle] = useState('');

    var indexArray = useRef([]);

    useEffect(() => {
        set_defaultPetObj(props.defaultPetObj);
        set_questionsArray(props.questionsArray);
        // set_questionsArrayInitial(props.questionsArrayInitial);
        // set_mandatoryQuestions(props.mandatoryQuestions);
        set_questionnaireDict(props.questionnaireDict);
        if(props.questionObject){
            set_questionTitle(props.questionObject.questionnaireName);
        }
        // set_questionTitle(props.questionObject.questionnaireName);
    }, [props.defaultPetObj,props.questionsArray,props.questionsArrayInitial,props.mandatoryQuestions,props.questionnaireDict,props.questionObject]);

    useEffect(() => {
        set_status(props.status);
        set_totalQuestions(props.totalQuestions);
        set_answeredQuestions(props.answeredQuestions);
        set_isFiterEmpty(props.isFiterEmpty);
        indexArray.current = props.indexArray;
    }, [props.totalQuestions,props.status,props.answeredQuestions,props.isFiterEmpty,props.indexArray]);

    useEffect(() => {
        set_petId(props.petId);
        set_petURL(props.petURL);
        set_filterOptions(props.filterOptions);
    }, [props.petId,props.petURL]);

    useEffect(() => {
        set_popUpMessage(props.popUpMessage);
        set_popUpTitle(props.popUpTitle);
        set_isPopUp(props.isPopUp);
        set_isLoading(props.isLoading);
       
    }, [props.popUpMessage,props.popUpTitle,props.isPopUp,props.isLoading]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const saveButtonAction = () => {
        props.saveQuestions();
    };

    const submitButtonAction = () => {
        props.submitQuestionData();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction();
    };

    const getQuestionnaireQuestions = (key, subKey) => {

      const requiredSubDict = questionnaireDict['QestionId_'+key+petId];       
      if(requiredSubDict) {
         const _subKey = subKey || QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER;
         return requiredSubDict ? requiredSubDict[_subKey] : '';
      }
      return '';
      
    };
    
    const updateQuestionnaireQuestions= (item, answersArray,isMadatory,questionType) => {
      props.updateQuestionnaireQuestions(item, answersArray,isMadatory,questionType);
    };

    const calculateQuestionsPercentage = (item) =>{
        let _questionsflex = totalQuestions ? answeredQuestions/totalQuestions :100/100;
        return _questionsflex;
    };

    const actionOnRow = (item) => {
        updateQuestionnaireQuestions(item,item.questionAnswer,dropDownItem.isMandatory,dropDownItem.questionType);
        set_isDropDown(!isDropdown);
        set_dropDownValue(item.questionAnswer);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    const dropDownBtnAction = (item,index) => {

        let value = undefined;
        value = getQuestionnaireQuestions(item.questionId);
        set_isDropDown(!isDropdown);
        set_ddIndex(index);
        set_dropDownItem(item);
    }

    const {

        petsSelView,
        petImageStyle,
        indexName,
        questionnaireName,
        imageStyle,
        collapsedBodyStyle,
        collapseHeaderStyle,
        petTitle,
        petSubTitle,
        progressAnswered,
        progressViewStyle,
        topBarStyles,
        filterButtonUI,
        filterImageStyles,
        filterTextStyle,
        questListStyle,
        filterImageBackViewStyles,
        backViewGradientStyle,
        dropDownBtnStyle,
        dropTextStyle,
        popSearchViewStyle,
        flatcontainer,
        flatview,
        name
      } = QuestionnaireQuestionsStyles;

    const renderItemQuestionsFilter = ({ item, index }) => {
        return (
          <View>
            <TouchableOpacity key={index} style={{ padding: 1 }} onPress={() => {
                set_isQuestListOpen(!isQuestListOpen);
                set_filterName(item);
                props.filterQuestionsAction(item);
              }}
            >
              <View style={{ padding: 10, backgroundColor: filterName===item ? '#6BC105':"white",borderBottomWidth:1, borderBottomColor:'#818588'}}>
                <Text style={{ color: filterName===item ? "white":"black" }}>{item}</Text>
              </View>
            </TouchableOpacity>
          </View>
        );
      };

  const _renderQuetionItems = () => {
    if(questionsArray) {
        return questionsArray.map((item,index) => {
            return (
               <>                  
               <TouchableOpacity style={collapseHeaderStyle} key={index} onPress={() => {
                    expandedIndex===index? set_expandedIndex(-1) : set_expandedIndex(index);
                    if(indexArray.current.includes(index)){
                        indexArray.current = indexArray.current.filter(item => item !== index)
                    }else{
                        indexArray.current.push(index);
                    }

                    }}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                    <Text style={[indexName]}>{index+1}</Text>
                        </View>
                            <View style={{flex:6,justifyContent:'center'}}>
                                <Text style={[questionnaireName]}>{item.question }{item.isMandatory ? <Text style={[questionnaireName,{color:'red'}]}>  *</Text> : null}</Text>
                            </View>                          
                            <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                {<Image source={indexArray.current.includes(index) ? upButtonImg : downButtonImg} style={imageStyle}/>}                                          
                            </View>
                    </TouchableOpacity>

                    {indexArray.current.includes(index) ? 
                    
                    <View style={collapsedBodyStyle}>
                        {item.questionType==="Text Area" ?  <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 500)'}   
                            maxLength = {500}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={true}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                        /> : null}
                       {item.questionType==="Text Box" ?  <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 20)'}   
                            maxLength = {20}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={false}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                       /> : null}
                       {item.questionType==="Multiple Choice, Radio Button" ? <QuestionnaireRadioButtonComponent
                            selectedAnswer={getQuestionnaireQuestions(item.questionId)}
                            answersArray = {questionsArray[index].questionAnswerOptions}
                            textAnswer = {getQuestionnaireQuestions(item.questionId)}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }} 
                       /> : null}
                       {item.questionType==="Multiple Choice, Checkboxes" ?  <QuestionnaireMultySelectionComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            selectedArray={getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            setValue={(selectedArray) => {
                                updateQuestionnaireQuestions(item,selectedArray,item.isMandatory,item.questionType);
                            }} 
                       /> : null}
                       {item.questionType==="Dropdown" ?  
                       <QuestionnaireDropdownComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }}/> 
 
                       : null}

                        </View> 
                    
                    : null}

               </>
             )
        });
    }
   };
   
   const renderItem = ({ item, index }) => {
    return (
        <>           
               <TouchableOpacity style={[collapseHeaderStyle]} key={index} onPress={() => {
                    expandedIndex===index? set_expandedIndex(-1) : set_expandedIndex(index);
                    if(indexArray.current.includes(index)){
                        indexArray.current = indexArray.current.filter(item => item !== index)
                    }else{
                        indexArray.current.push(index);
                    }

                    }}>
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                        <Text style={[indexName]}>{index+1}</Text>
                    </View>
                    <View style={{flex:6,justifyContent:'center'}}>
                                {/* <Text style={[questionnaireName]}>{item.question }{item.isMandatory ? <Text style={[questionnaireName,{color:'red'}]}>  *</Text> : null}</Text>                                    */}
                                <Text style={item.question && item.question.length > 75 ? [questionnaireName,{marginTop:hp('1.2%'),marginBottom:hp('1.2%'),}] : [questionnaireName]}>{item.question }{item.isMandatory ? <Text style={[questionnaireName,{color:'red'}]}>  *</Text> : null}</Text>                                   

                    </View>
                                    
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                                {<Image source={indexArray.current.includes(index) ? upButtonImg : downButtonImg} style={imageStyle}/>}                                          
                    </View>
                </TouchableOpacity>

                    {indexArray.current.includes(index) ? 
                    
                    <View style={[collapsedBodyStyle]}>
                        {item.questionType==="Text Area" ?  
                        <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 500)'}   
                            maxLength = {500}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={true}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                        /> 
                        : null}
                       {item.questionType==="Text Box" ?  
                       <QuestionnaireTextInput
                            placeholder={'Enter Text (Limit: 20)'}   
                            maxLength = {20}
                            textAnswer={getQuestionnaireQuestions(item.questionId)}
                            isMultiLineText={false}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }}
                       /> 

                       : null}
                       {item.questionType==="Multiple Choice, Radio Button" ? <QuestionnaireRadioButtonComponent
                            selectedAnswer={getQuestionnaireQuestions(item.questionId)}
                            answersArray = {questionsArray[index].questionAnswerOptions}
                            textAnswer = {getQuestionnaireQuestions(item.questionId)}
                            status_QID = {status}
                            setValue={(textAnswer) => {
                                updateQuestionnaireQuestions(item,textAnswer,item.isMandatory,item.questionType);
                            }} 
                       /> : null}
                       {item.questionType==="Multiple Choice, Checkboxes" ?  <QuestionnaireMultySelectionComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            selectedArray={getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            setValue={(selectedArray) => {
                                updateQuestionnaireQuestions(item,selectedArray,item.isMandatory,item.questionType);
                            }} 
                       /> : null}
                       {item.questionType==="Dropdown" ?  
                       <QuestionnaireDropdownComponent
                            value={getQuestionnaireQuestions(item.questionId)}
                            answerArray = {questionsArray[index].questionAnswerOptions}
                            status_QID = {status}
                            setValue={(value) => {
                                updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                            }}/> 
 
                       : null}

                       {item.questionType === "Slider Scale" ? <QuestionnaireSliderComponent
                                value={getQuestionnaireQuestions(item.questionId)}
                                minValue = {item.floor}
                                maxValue = {item.ceil}
                                breakValue = {item.tickStep}
                                desc = {item.questionAnswerOptions[0].questionAnswer}
                                status_QID = {status}
                                setValue={(value) => {
                                    updateQuestionnaireQuestions(item,value,item.isMandatory,item.questionType);
                                }}/> 
                        : null}

                        </View> 
                    
                    : null}
               </>
             );

   }
     
   return(

    <View style={[CommonStyles.mainComponentStyle,{backgroundColor:'#F2F2F2'}]}>

            <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={questionTitle.length>15 ? questionTitle.slice(0,20) + '...'  : questionTitle}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={[petsSelView]}>

                <ImageBackground style={[backViewGradientStyle]} imageStyle={{ borderRadius: 5 }} source={gradientImg}>

                    <View style={{alignItems:'center',justifyContent:'center',marginRight:hp('2%'),marginLeft:hp('3%'),}}>
                        {petURL ? <Image source={{uri:petURL}} style={[petImageStyle]}/> : <Image source={defaultPetImg} style={[petImageStyle]}/>}
                    </View>

                    <View style={{flex:3,justifyContent:'center'}}>
                        <Text style={[petTitle]}>{defaultPetObj ? defaultPetObj.petName : ''}</Text>
                        <Text style={[petSubTitle]}>{defaultPetObj ? defaultPetObj.petBreed : ''}</Text>
                        <Text style={[petSubTitle]}>{defaultPetObj ? defaultPetObj.gender : ''}</Text>
                    </View>

                </ImageBackground>

            </View>

            <View style={{marginBottom:10}}>            
                <View style={topBarStyles}>
                
                    <View style={progressViewStyle}>               
                        <View style={{backgroundColor:'#6BC105',alignItems: "center",flex:calculateQuestionsPercentage()}}></View>
                    </View>

                
                    <View style={{width:wp('30%'),height:hp('5%')}}>
                        <View style={filterButtonUI} onLayout={(event) => {
                                const layout = event.nativeEvent.layout;
                                const postionDetails = {
                                    x: layout.x,
                                    y: layout.y,
                                    width: layout.width,
                                    height: layout.height,
                                };
                                set_dropDownPostion(postionDetails)
                            }}>
                            
                            <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',}} onPress={() => set_isQuestListOpen(!isQuestListOpen)}>
                                
                                <Text style={filterTextStyle}>{filterName}</Text> 
                                <View style={filterImageBackViewStyles}>
                                <Image style={filterImageStyles} source={filterImg}></Image>  
                                </View>
                                    
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            
                <View style={{marginTop:hp('1.5%'), position:'absolute',alignSelf:"center",alignItems:'center'}}>
                    <Text style={[progressAnswered]}>{answeredQuestions + " of " + totalQuestions + " answered"}</Text>
                </View>
           
            </View>
            
            {!isFiterEmpty ? <View style={{alignItems:'center',height: status === 'Submitted' ? hp('65%') : hp('55%')}}>

              <KeyboardAwareScrollView>
                {/* {_renderQuetionItems()} */}

                <View style={{ marginTop: hp('2%'),}}>

                <FlatList
                    data={questionsArray}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => "" + index}
                    keyboardShouldPersistTaps='always'
                    removeClippedSubviews = {false}
                />

                </View>
                
              </KeyboardAwareScrollView>
             
            </View> : 
            <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("15%"),}}>
                <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                <Text style={[CommonStyles.noRecordsTextStyle,{marginTop: hp("2%")}]}>{Constant.NO_RECORDS_LOGS}</Text>
                <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
            </View>}

            {status === 'Submitted' ? null : <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'SAVE'}
                    isLeftBtnEnable = {true}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => submitButtonAction()}
                    leftButtonAction = {async () => saveButtonAction()}
                />
            </View> }

            {isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {popUpTitle}
                    message={popUpMessage}
                    isLeftBtnEnable = {props.isPopUpLftBtn}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'NO'}
                    rightBtnTilte = {props.popupRBtnTitle}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

            {isQuestListOpen && (<FlatList style={[ questListStyle,{top:dropDownPostion.y-20 + dropDownPostion.height,}]}
              data={filterOptions}
              renderItem={renderItemQuestionsFilter}
              keyExtractor={(item, index) => "" + index}
            />)}

            {isDropdown ? <View style={[popSearchViewStyle]}>
                    <FlatList
                            style={flatcontainer}
                            data={questionsArray[ddIndex].questionAnswerOptions}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity onPress={() => actionOnRow(item)}>
                                <View style={flatview}>
                                    <Text numberOfLines={2} style={[name]}>{item.questionAnswer}</Text>
                                </View>
                                </TouchableOpacity>
                            )}
                            enableEmptySections={true}
                            keyExtractor={(item,index) => index}
                        /> 
                        
                </View> : null}

         </View>
    )
}
export default QuestionnaireQuestionsUI;

 