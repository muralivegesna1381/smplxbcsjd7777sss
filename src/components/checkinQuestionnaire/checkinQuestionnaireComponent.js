import React,{useState, useEffect,useRef} from 'react';
import {View,Text,TouchableOpacity,FlatList, Image,ImageBackground,StyleSheet,BackHandler} from 'react-native';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import * as Constant from "./../../utils/constants/constant";
import BuildEnvJAVA from './../../config/environment/enviJava.config';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as internetCheck from "./../../utils/internetCheck/internetCheck";
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview'
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

import QuestionnaireTextInput from './../../components/questionnaire/questionnaireCustomComponents/customComponents/questionnaireTextInputComponent';
import QuestionnaireRadioButtonComponent from './../../components/questionnaire/questionnaireCustomComponents/customComponents/questionnaireRadioButtonComponent';
import QuestionnaireMultySelectionComponent from './../../components/questionnaire/questionnaireCustomComponents/customComponents/questionnaireMultiSelectionComponent';
import QuestionnaireDropdownComponent from "./../../components/questionnaire/questionnaireCustomComponents/customComponents/questionnaireDropdownComponent";
import QuestionnaireSliderComponent from "./../../components/questionnaire/questionnaireCustomComponents/customComponents/questionnaireSliderComponent";

import downButtonImg from "./../../../assets/images/otherImages/svg/downArrowGrey.svg";
import upButtonImg from "./../../../assets/images/otherImages/svg/upArrow.svg";
import filterImg from "./../../../assets/images/otherImages/png/filter.png";
import gradientImg from "./../../../assets/images/otherImages/png/gradientPetBackview.png";
let defaultPetImg = require( "./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

let trace_inCheckinscreen;
let trace_Checkin_API_Complete;

const EnvironmentJava = JSON.parse(BuildEnvJAVA.EnvironmentJava());

const QUESTIONNAIRE_QUESTIONS_KEY = {
    QUESTIONITEM: 'questionItem',
    QUESTIONANSWER:'questionAnswer',
    QUESTIONNAIREID:'questionnaireId',
    ISMANDATORY:'isMandatory',
    QUESTIONTYPE : 'questionType'
};

const CheckinQuestionnaireComponent = ({navigation, route,...props}) => {

    const [questionsArray, set_questionsArray] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [questionnaireDict, set_questionnaireDict] = useState({});
    const [status, set_status] = useState(undefined);
    const [totalQuestions, set_totalQuestions] = useState(0);
    const [answeredQuestions, set_answeredQuestions] = useState(0);
    const [petId, set_petId] = useState(undefined);
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
    const [mandatoryQuestions, set_mandatoryQuestions] = useState(undefined);
    const [questionnaireId, set_questionnaireId] = useState(undefined);
    const [questionsArrayInitial, set_questionsArrayInitial] = useState(undefined);
    const [loginPets, set_loginPets] = useState(undefined);
    const [popID, set_popID] = useState(0);

    var indexArray = useRef([]);
    var questionnaireDictTemp = useRef({});
    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);

    useEffect(() => {

        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_auto_questionnaire_questions);   
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_auto_questionnaire_questions, "User in Checkin Questionnaire Screen", '');
        getCheckinQuestionnaires();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
        }; 
        
    }, []);

    useEffect(() => {
      if(route.params?.loginPets){
        set_loginPets(route.params?.loginPets);
      }
    }, [route.params?.loginPets]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    const initialSessionStart = async () => {
        trace_inCheckinscreen = await perf().startTrace('t_inCheckinQuestionnaireScreen');
    };

    const initialSessionStop = async () => {
        await trace_inCheckinscreen.stop();
    };

    const backBtnAction = () => {
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){
            firebaseHelper.logEvent(firebaseHelper.event_back_btn_action, firebaseHelper.screen_auto_questionnaire_questions, "User clicked on back button to navigate to Dashboard", '');
            navigation.navigate('DashBoardService');
        } 
    };

    const saveButtonAction = () => {
        
    };

    const submitButtonAction = async () => {

      let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let answerArray = [];
      var value = 0;
        questionsArray.map((item,index) => {
            let dict = questionnaireDict['QestionId_'+item.questionId+petId];
            let temp = {};
            if(item.isMandatory){

                if(dict){
                    if(dict.questionAnswer===""||dict.questionAnswer===undefined||dict.questionAnswer==='[]'){

                        set_popUpMessage(Constant.QUESTIONS_MANDATORY_MSG);  
                        set_popUpTitle('Alert');  
                        set_isPopUp(true); 
                        popIdRef.current = 1;

                    }else{     
                        
                        let srtValue=undefined;
                        if(dict.questionType === 'Multiple Choice, Checkboxes'){
                            
                             let multyAnswer = JSON.parse(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]);
                             var multyString = [];
                            for(let i=0; i<multyAnswer.length; i++){
                                multyString.push(multyAnswer[i].questionAnswer);                               
                            }
                            srtValue = multyString.join("###");
                        }
                        
                        temp.questionId = item.questionId;
                        temp.answer = dict.questionType === 'Multiple Choice, Checkboxes' ? srtValue :dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER];
                        answerArray.push(temp);
                        value=value+1;
                    }
                }else{
                    set_popUpMessage(Constant.QUESTIONS_MANDATORY_MSG);
                    set_popUpTitle('Alert');  
                    set_isPopUp(true); 
                    popIdRef.current = 1;
                }
 
            }else{

                    if(dict){

                        let srtValue=undefined;
                        if(dict.questionType === 'Multiple Choice, Checkboxes'){
                            
                             let multyAnswer = JSON.parse(dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]);
                             var multyString = [];
                            for(let i=0; i<multyAnswer.length; i++){
                                multyString.push(multyAnswer[i].questionAnswer);                               
                            }
                            srtValue = multyString.join("###");
                          }
    
                        temp.questionId = item.questionId;
                        temp.answer = dict.questionType === 'Multiple Choice, Checkboxes' ? srtValue :dict[QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER];
                        answerArray.push(temp);

                    } else {
                    
                    } 
            }
            return;
        })

        if(value===mandatoryQuestions){
            let answerDict  = {};
            answerDict.questionnaireId = questionnaireId;
            answerDict.petId = petId;
            answerDict.studyIds = null;
            answerDict.petParentId = clientId;
            answerDict.questionAnswers = answerArray;

            if(answerArray.length>0){
                sendAnswersToBackend(JSON.stringify(answerDict));
            }else{
                set_popUpMessage(Constant.QUESTIONS_MIN_ANSWER_MSG);
                set_popUpTitle('Alert');  
                set_isPopUp(true); 
                popIdRef.current = 1;
            }
              
        } else {
            set_popUpMessage(Constant.QUESTIONS_MANDATORY_MSG); 
            set_popUpTitle('Alert');  
            set_isPopUp(true); 
            popIdRef.current = 1;
        }
        
    };

    const popOkBtnAction = () => {

        if(popID === 1){
            navigation.navigate('DashBoardService',{loginPets:loginPets});
        }

      set_popUpMessage(undefined);
      set_popUpTitle(undefined);
      set_isPopUp(false);
      popIdRef.current = 0;
        
    };

    const getCheckinQuestionnaires = async () => {

      let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
      let petObj = await DataStorageLocal.getDataFromAsync(Constant.DEFAULT_PET_OBJECT);
      petObj = JSON.parse(petObj);
      set_defaultPetObj(petObj);
      set_petId(petObj.petID)

      set_isLoading(true);
      isLoadingdRef.current = 1;
      fetch(EnvironmentJava.uri + "getFeedbackQuestionnaireByPetId/" + petObj.petID,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "ClientToken" : token
          },
        }
      ).then((response) => response.json()).then(async (data) => {

        set_isLoading(false);
        isLoadingdRef.current = 0;
        if (data && data.status.success) {
          if(data.response.questionnaireList[0].questions){
            set_questionTitle(data.response.questionnaireList[0].questionnaireName);
            prepareQuestionsData(data.response.questionnaireList[0]);
          }

        } else if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
            AuthoriseCheck.authoriseCheck();
            navigation.navigate('WelcomeComponent');
        } else {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_popUpTitle('Alert');
            set_isPopUp(true);
            popIdRef.current = 1;
        }
  
      }).catch((error) => {
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_popUpTitle('Alert');
            set_isPopUp(true);
            popIdRef.current = 1;
      });
  
    };

    const getQuestionnaireQuestions = (key, subKey) => {

      const requiredSubDict = questionnaireDict['QestionId_'+key+petId];       
      if(requiredSubDict) {
         const _subKey = subKey || QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER;
         return requiredSubDict ? requiredSubDict[_subKey] : '';
      }
      return '';
      
    };

    const prepareQuestionsData = (questionsObject) => {

        set_questionnaireId(questionsObject.questionnaireId); 

        var value = 0;
        var tempQest = [];
        for(let i=0; i<questionsObject.questions.length; i++){
            if(questionsObject.questions[i].questionType === 'Image' || questionsObject.questions[i].questionType === 'Video'){
                
            }else{
                if(questionsObject.questions[i].isMandatory){
                    value=value+1;                    
                }
                tempQest.push(questionsObject.questions[i]);
            }

            set_questionsArray(tempQest);
            set_totalQuestions(tempQest.length);
            set_questionsArrayInitial(tempQest);
        }
        set_mandatoryQuestions(value);

    };
    
    const updateQuestionnaireQuestions= (item, answersArray,isMadatory,questionType) => {
      
      let tempDictRemove;
          if(!answersArray || answersArray==='[]'){
              const copyDict= questionnaireDict;
              delete copyDict['QestionId_'+item.questionId+petId];
              tempDictRemove = copyDict;
              set_questionnaireDict(tempDictRemove);
              set_answeredQuestions(Object.keys(tempDictRemove).length);
        
          }else {

            let tempDict = {...questionnaireDictTemp.current};
            tempDict['QestionId_'+item.questionId+petId] = {
           ...tempDict['QestionId_'+item.questionId+petId],
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM]: item,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]: answersArray,
            // [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONNAIREID]: id,
            [QUESTIONNAIRE_QUESTIONS_KEY.ISMANDATORY]:isMadatory,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONTYPE]:questionType,
        };
       
            questionnaireDictTemp.current = tempDict
            set_questionnaireDict(questionnaireDictTemp.current);
            set_answeredQuestions(Object.keys(questionnaireDictTemp.current).length);

          }
      
    };

    const filterQuestionsAction = (value) => {
      let tempArray = [];
      if(value==='All'){
          tempArray = questionsArrayInitial;

      }else {
          questionsArrayInitial.map((item,index) => {
          
              let dict = questionnaireDict['QestionId_'+item.questionId+petId];  
              if(dict && value==='Answered'){
                  tempArray.push(questionsArrayInitial[index]);
              }

              if(!dict && value==='Unanswered'){
                  tempArray.push(questionsArrayInitial[index]);
                  
              }
          })
      }  

      if(tempArray.length>0){
          set_isFiterEmpty(false);

      }else{
          set_isFiterEmpty(true);
      }
      set_questionsArray(tempArray);
    };

    const sendAnswersToBackend = async (answersDictToBackend) => {
        
      let internet = await internetCheck.internetCheck();
      firebaseHelper.logEvent(firebaseHelper.event_automated_checkin_questionnaire_api, firebaseHelper.screen_auto_questionnaire_questions, "Initiated API to Submit Automated Checkin Questionnaire "+petId, 'Internet Status : '+internet);
      if(!internet){
          set_isLoading(false);
          isLoadingdRef.current = 0;
          set_popUpTitle(Constant.ALERT_NETWORK);
          set_popUpMessage(Constant.NETWORK_STATUS);
          set_isPopUp(true);
          popIdRef.current = 1;
          return;

      }

    set_isLoading(true);
    isLoadingdRef.current = 1;
    let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
    trace_Checkin_API_Complete = await perf().startTrace('t_SaveQuestionAnswers_API');
    fetch( EnvironmentJava.uri + 'saveQuestionAnswers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json",
            "ClientToken" : token
        },
        body:answersDictToBackend,
        }).then((response) => response.json()).then(async (data) =>{
            
            set_isLoading(false);
            isLoadingdRef.current = 0;
            stopFBTrace();
            if(data.status.success===true){
                firebaseHelper.logEvent(firebaseHelper.event_automated_checkin_questionnaire_api_success, firebaseHelper.screen_auto_questionnaire_questions, "Automated Checkin Questionnaire API Success", '');
                set_popUpMessage('Your feedback is submitted successfully.');
                set_popID(1);
                set_popUpTitle('Thank You!');
                set_isPopUp(true);
                popIdRef.current = 1;
                // navigation.navigate('DashBoardService',{loginPets:loginPets});
                
            }else if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                AuthoriseCheck.authoriseCheck();
                navigation.navigate('WelcomeComponent');
            }else{
                firebaseHelper.logEvent(firebaseHelper.event_automated_checkin_questionnaire_api_fail, firebaseHelper.screen_auto_questionnaire_questions, "Automated Checkin Questionnaire API Fail", '');
                set_popUpMessage(Constant.SERVICE_FAIL_MSG);
                set_popUpTitle('Alert');
                set_isPopUp(true);
                popIdRef.current = 1;
            }
        }).catch((error) => {
            firebaseHelper.logEvent(firebaseHelper.event_automated_checkin_questionnaire_api_fail, firebaseHelper.screen_auto_questionnaire_questions, "Automated Checkin Questionnaire API Fail", 'error : '+error);
            stopFBTrace();
            set_isLoading(false);
            isLoadingdRef.current = 0;
            set_popUpMessage(Constant.SERVICE_FAIL_MSG);
            set_popUpTitle('Alert');
            set_isPopUp(true);
            popIdRef.current = 1;
        });

    }

    const stopFBTrace = async () => {
        await trace_Checkin_API_Complete.stop();
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

    const renderItemQuestionsFilter = ({ item, index }) => {
        return (

          <View>
            <TouchableOpacity key={index} style={{ padding: 1 }}
              onPress={() => {
                set_isQuestListOpen(!isQuestListOpen);
                set_filterName(item);
                // filterQuestions(item); 
                filterQuestionsAction(item);
              }}>

              <View style={{ padding: 10, backgroundColor: filterName===item ? '#6BC105':"white"}}>
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
                  <TouchableOpacity style={styles.collapseHeaderStyle} key={index} onPress={() => {

                    expandedIndex===index? set_expandedIndex(-1) : set_expandedIndex(index);
                    if(indexArray.current.includes(index)){
                        indexArray.current = indexArray.current.filter(item => item !== index)
                    }else{
                        indexArray.current.push(index);
                    }
                    }}>

                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                      <Text style={[styles.indexName]}>{index+1}</Text>
                    </View>

                    <View style={{flex:6,justifyContent:'center'}}>
                        <Text style={item.question && item.question.length > 75 ? [styles.questionnaireName,{marginTop:hp('1.2%'),marginBottom:hp('1.2%'),}] : [styles.questionnaireName]}>{item.question }{item.isMandatory ? <Text style={[styles.questionnaireName,{color:'red'}]}>  *</Text> : null}</Text>                                   
                    </View>
                                    
                    <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
                      {<Image source={indexArray.current.includes(index) ? upButtonImg : downButtonImg} style={styles.imageStyle}/>}                                          
                    </View>

                  </TouchableOpacity>

                  {indexArray.current.includes(index) ? 
                    
                    <View style={styles.collapsedBodyStyle}>
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
             )
        });
    }
   };

     
   return(

    <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={questionTitle.length>15 ? questionTitle.slice(0,20) + '...'  : questionTitle}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={[styles.petsSelView]}>

                <ImageBackground style={[styles.backViewGradientStyle]} imageStyle={{ borderRadius: 5 }} source={gradientImg}>

                    <View style={{alignItems:'center',justifyContent:'center',marginRight:hp('2%'),marginLeft:hp('3%'),}}>
                        {defaultPetObj && defaultPetObj.photoUrl && defaultPetObj.photoUrl!=='' ? <Image source={{uri:defaultPetObj.photoUrl}} style={[styles.petImageStyle]}/> : <Image source={defaultPetImg} style={[styles.petImageStyle]}/>}
                    </View>

                    <View style={{flex:3,justifyContent:'center'}}>
                        <Text style={[styles.petTitle]}>{defaultPetObj ? defaultPetObj.petName : ''}</Text>
                        <Text style={[styles.petSubTitle]}>{defaultPetObj ? defaultPetObj.petBreed : ''}</Text>
                        <Text style={[styles.petSubTitle]}>{defaultPetObj ? defaultPetObj.gender : ''}</Text>
                    </View>

                </ImageBackground>

            </View>

            <View style={{marginBottom:10}}>            
                <View style={styles.topBarStyles}>
                
                    <View style={styles.progressViewStyle}>               
                        <View style={{backgroundColor:'#6BC105',alignItems: "center",flex:calculateQuestionsPercentage()}}></View>
                    </View>

                
                    <View style={{width:wp('30%'),height:hp('5%')}}>

                        <View style={styles.filterButtonUI} onLayout={(event) => {
                                const layout = event.nativeEvent.layout;
                                const postionDetails = {x: layout.x,y: layout.y, width: layout.width, height: layout.height,};
                                set_dropDownPostion(postionDetails)
                            }}>
                            
                            <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',}} onPress={() => set_isQuestListOpen(!isQuestListOpen)}>
                                
                                <Text style={styles.filterTextStyle}>{filterName}</Text> 
                                <View style={styles.filterImageBackViewStyles}>
                                <Image style={styles.filterImageStyles} source={filterImg}></Image>  
                                </View>
                                    
                            </TouchableOpacity>

                        </View>

                    </View>

                </View>
            
                <View style={{marginTop:hp('1.5%'), position:'absolute',alignSelf:"center",alignItems:'center'}}>
                    <Text style={[styles.progressAnswered]}>{answeredQuestions + " of " + totalQuestions + " answered"}</Text>
                </View>
           
            </View>
            
            <View style={{alignItems:'center',height: status === 'Submitted' ? hp('65%') : hp('55%')}}>

              <KeyboardAwareScrollView showsHorizontalScrollIndicator={false}>
                {_renderQuetionItems()}
              </KeyboardAwareScrollView>
             
            </View>

            {status === 'Submitted' ? null : <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'SUBMIT'}
                    leftBtnTitle = {'SAVE'}
                    isLeftBtnEnable = {false}
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
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'OK'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {Constant.LOADER_WAIT_MESSAGE} isButtonEnable = {false} /> : null} 

            {isQuestListOpen && (<FlatList style={[ styles.questListStyle,{top:dropDownPostion.y + dropDownPostion.height,}]}
              data={filterOptions}
              renderItem={renderItemQuestionsFilter}
              keyExtractor={(item, index) => "" + index}
            />)}

            {isDropdown ? <View style={[styles.popSearchViewStyle]}>
                <FlatList
                  style={styles.flatcontainer}
                  data={questionsArray[ddIndex].questionAnswerOptions}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (

                    <TouchableOpacity onPress={() => actionOnRow(item)}>
                      <View style={flatview}>
                        <Text numberOfLines={2} style={[styles.name]}>{item.questionAnswer}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  enableEmptySections={true}
                  keyExtractor={(item,index) => index}/> 
                        
                </View> : null}

         </View>
    )
}
export default CheckinQuestionnaireComponent;

const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'#F2F2F2'    
    },
  
    petsSelView : {
        backgroundColor:'#91c2dd',
        width:wp('100%'),
        height:hp('10%'),
        borderRadius:5,
        justifyContent:'center',
        flexDirection:'row'
    },
  
    petImageStyle: {  
        width: wp('15%'),
        height: hp('6%'),
        resizeMode: "cover",
        overflow:'hidden',
        borderRadius:5,       
    },
  
    indexName: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontExtraSmall,
        textAlign: "left",
        color:'#000000'
    },
  
    questionnaireName: {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color:'#000000',
        marginRight:hp('1%'),
    },
  
    imageStyle: {
        height: hp('4%'),
        width: wp('4%'),
        resizeMode: "contain",
        marginRight: hp("1%"),
        tintColor:'black',
    },
  
    collapsedBodyStyle : {
        backgroundColor:'white',
        width:wp('90%'),
        marginBottom:hp('1%'),
        marginTop:hp('-1%'),
        minHeight:hp('8%'),
        alignItems:'center',
        justifyContent:'center'
    },
  
    collapseHeaderStyle : {
        marginBottom:hp('1%'),
        minHeight:hp('6%'),
        width:wp('90%'),
        backgroundColor:'white',
        flexDirection:'row',
    },
  
    petTitle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontNormal,
        color: 'white', 
    },
  
    petSubTitle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        color: 'white', 
    },
  
    progressAnswered : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontMedium,
        color:'#000000',
    },
  
    progressViewStyle : {
        flexDirection:'row',
        backgroundColor:'white',
        height:hp('4.8%'),
        width: wp("70%"), 
    },
  
    topBarStyles : {
        width: wp("100%"),
        height: hp("5%"),
        backgroundColor:'#6BC105',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },
  
    filterButtonUI : {
        width: wp("30%"),      
        height:hp('5%'),
        backgroundColor:'#D9D9D9',
        alignSelf:'center',
        marginLeft:wp('0.5%'),
        alignItems:'center',   
    },
  
    filterImageStyles : {
        marginLeft:wp('1%'),
        resizeMode:'contain',
        width: wp("5%"),      
        height:hp('4%'),
    },
  
    filterImageBackViewStyles : {      
        flex:1
    },
  
    filterTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color:'#000000',
        flex:2,
        textAlign:'center',
    },
  
    questListStyle: {
        position: "absolute",
        width: wp("40%"),
        backgroundColor: "gray",
        alignSelf: 'flex-end',
        marginTop:hp('25%'),
    },
  
    backViewGradientStyle: {
        resizeMode: 'contain',
        flex:1,
        justifyContent:'center',
        flexDirection:'row'
    },
  
    popSearchViewStyle : {
        height: hp("30%"),
        width: wp("95%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15, 
    },
  
    flatcontainer: {
        flex: 1,
    },
    
    flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignSelf: "center",
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
    },
    
    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        color: "black",
    },
    
});

 