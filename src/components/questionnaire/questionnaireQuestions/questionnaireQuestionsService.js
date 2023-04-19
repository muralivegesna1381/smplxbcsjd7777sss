import React,{useState, useEffect, useRef} from 'react';
import {BackHandler} from 'react-native';
import QuestionnaireQuestionsUI from "./questionnaireQuestionsUI"
import * as internetCheck from "./../../../utils/internetCheck/internetCheck";
import  * as QestionnaireDataObj from "./../questionnaireCustomComponents/questionnaireData/questionnaireSaveGetData";
import BuildEnvJAVA from './../../../config/environment/enviJava.config';
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import * as Queries from "./../../../config/apollo/queries";
import * as AuthoriseCheck from './../../../utils/authorisedComponent/authorisedComponent';
import perf from '@react-native-firebase/perf';

let trace_inQuestionnaireQuestionsScreen;
let trace_Questions_Submit_API_Complete;

const EnvironmentJava =  JSON.parse(BuildEnvJAVA.EnvironmentJava());

const Alert_Network_Id = 1;
const Alert_Save_Info_BackBtn_Id = 2;
const Alert_Madatory_Id = 3;
const Alert_Success_Id = 4;
const Alert_Min_Answer_Id = 5;
const Alert_Fail_Id = 6;

const QUESTIONNAIRE_QUESTIONS_KEY = {
  QUESTIONITEM: 'questionItem',
  QUESTIONANSWER:'questionAnswer',
  QUESTIONNAIREID:'questionnaireId',
  ISMANDATORY:'isMandatory',
  QUESTIONTYPE : 'questionType'
};

const QuestionnaireQuestionsService = ({navigation, route,...props}) => {

    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popUpTitle, set_popUpTitle] = useState(undefined);
    const [isPopUp, set_isPopUp] = useState(false);
    const [isPopUpLftBtn, set_isPopUpLftBtn] = useState(false);
    const [popupRBtnTitle, set_popupRBtnTitle] = useState(undefined)
    const [popupId, set_popupId] = useState(undefined);
    const [defaultPetObj, set_defaultPetObj] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [questionObject, set_questionObject] = useState(undefined);
    const [petId, set_petId] = useState(undefined);
    const [petURL, set_petURL] = useState(undefined);
    const [status, set_status] = useState(undefined);
    const [questionnaireId, set_questionnaireId] = useState(undefined);
    const [totalQuestions, set_totalQuestions] = useState(0);
    const [questionsArrayInitial, set_questionsArrayInitial] = useState(undefined);
    const [mandatoryQuestions, set_mandatoryQuestions] = useState(undefined);
    const [questionsArray, set_questionsArray] = useState(undefined);
    const [studyId, set_studyId] = useState(undefined);
    const [indexArray, set_indexArray] = useState([]);

    let popIdRef = useRef(0);
    let isLoadingdRef = useRef(0);
    let previouQstNo = useRef(0);
    var questionnaireDictTemp = useRef({});

    const [answeredQuestions, set_answeredQuestions] = useState(0);
    const [questionnaireDict, set_questionnaireDict] = useState({});
    const [filterOptions, set_filterOptions] = useState(['All','Answered','Unanswered']);
    const [isFiterEmpty, set_isFiterEmpty] = useState(undefined);

    useEffect(() => {
        initialSessionStart();
        firebaseHelper.reportScreen(firebaseHelper.screen_questionnaire_questions);
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_questionnaire_questions, "User in Questionnaire Qustions Screen", ''); 
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
        return () => {
            initialSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
          };

    }, []);
      
     useEffect(() => {

        if(route.params?.petObj){
            set_defaultPetObj(route.params?.petObj);
            set_petURL(route.params?.photoUrl);
        }

        if(route.params?.questionObject){
            set_questionObject(route.params?.questionObject);
            set_studyId(route.params?.questionObject.studyIds);
            prepareQuestionsData(route.params?.questionObject,route.params?.petObj);
        }

    }, [route.params?.petObj,route.params?.questionObject]);

    const handleBackButtonClick = () => {
          navigateToPrevious();
          return true;
    };

    const initialSessionStart = async () => {
        trace_inQuestionnaireQuestionsScreen = await perf().startTrace('t_inQuestionnaireQuestionsScreen');
    };
    
    const initialSessionStop = async () => {
        await trace_inQuestionnaireQuestionsScreen.stop();
    };

    const prepareQuestionsData = (questionsObject, defaultPetObj) => {

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
        set_status(questionsObject.status);

        if(questionsObject.questionnaireId){
            set_petId(defaultPetObj.petID);
            set_petURL(defaultPetObj.photoUrl);
            getInitialDict(questionsObject.questionnaireId,questionsObject.questions,questionsObject.status,defaultPetObj.petID);
        }
    };

    const getInitialDict = async (id,arrayQuest,statusQest,petID) => {

      let dict = await QestionnaireDataObj.getAnswer(id,petID);
      if(dict){
          set_questionnaireDict(dict);
          set_answeredQuestions(Object.keys(dict).length);
          previouQstNo.current = Object.keys(dict).length;
          if(statusQest==='Submitted'){
              updateSubmittedDictionary(arrayQuest,id,petID);
          }  
      }else{
  
          if(statusQest==='Submitted'){
              updateSubmittedDictionary(arrayQuest,id,petID);
          }           
       }
    };
  
    const updateSubmittedDictionary = async (arrayQuest,id,petID) => {
      for (let i=0 ; i < arrayQuest.length ; i++){
        if(arrayQuest[i].answer){  
            updateQuestionnaireQuestionsSubmitted(arrayQuest[i], arrayQuest[i].answer,arrayQuest[i].isMandatory,arrayQuest[i].questionType,id,petID);                
        }
      }
    };
  
    const updateQuestionnaireQuestionsSubmitted = (item, answersArray,isMadatory,questionType,id,petID) => {
         
        let tempDict = {...questionnaireDictTemp.current};
        tempDict['QestionId_'+item.questionId+petID] = {
          ...tempDict['QestionId_'+item.questionId+petID],
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM]: item,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]: answersArray,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONNAIREID]: id,
            [QUESTIONNAIRE_QUESTIONS_KEY.ISMANDATORY]:isMadatory,
            [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONTYPE]:questionType,
        };
      
        questionnaireDictTemp.current = tempDict
        set_questionnaireDict(questionnaireDictTemp.current);
        set_answeredQuestions(Object.keys(questionnaireDictTemp.current).length);
     
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
          let tempDict = {...questionnaireDict};
          tempDict['QestionId_'+item.questionId+petId] = {
              ...tempDict['QestionId_'+item.questionId+petId],
              [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONITEM]: item,
              [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONANSWER]: answersArray,
              [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONNAIREID]: questionnaireId,
              [QUESTIONNAIRE_QUESTIONS_KEY.ISMANDATORY]:isMadatory,
              [QUESTIONNAIRE_QUESTIONS_KEY.QUESTIONTYPE]:questionType,
          };
              set_questionnaireDict(tempDict);
              set_answeredQuestions(Object.keys(tempDict).length);
          }
    };

    const filterQuestionsAction = (value) => {
      let tempArray = [];
      set_indexArray([]);
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

    const navigateToPrevious = () => {  
        
        if(isLoadingdRef.current === 0 && popIdRef.current === 0){

            if(status === 'Submitted'){
                navigation.navigate("QuestionnaireStudyComponent");   
            } else if(Object.keys(questionnaireDict).length === previouQstNo.current){
                navigation.navigate("QuestionnaireStudyComponent");   
            }else {
                createPopup(Constant.QUESTIONS_ANSWER_BACKBTN_MSG,Alert_Save_Info_BackBtn_Id,Constant.ALERT_DEFAULT_TITLE,'YES',true,true,1);  
            }

        } 
    }

    const popOkBtnAction = async (value,) => {

        if(popupId === Alert_Network_Id || popupId === Alert_Madatory_Id || popupId === Alert_Min_Answer_Id || popupId === Alert_Fail_Id){
            popCancelBtnAction();
        } else if(popupId === Alert_Save_Info_BackBtn_Id){
            await QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
            popCancelBtnAction();
            navigation.navigate("QuestionnaireStudyComponent"); 
        } else if(popupId === Alert_Success_Id){
            popCancelBtnAction();
            navigation.navigate("QuestionnaireStudyComponent"); 
        } 
        
    };

    const popCancelBtnAction = () => {

        if(popupId === Alert_Save_Info_BackBtn_Id){
            navigation.navigate("QuestionnaireStudyComponent"); 
        }
        createPopup(undefined,undefined,undefined,undefined,false,false,0);  
    };

    const saveQuestions = (value) => {
      if(Object.keys(questionnaireDict).length === 0){
        createPopup(Constant.QUESTIONS_ANSWER_MSG,Alert_Min_Answer_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);  
      }else {
          QestionnaireDataObj.saveAnswer(questionnaireDict,questionnaireId,petId);
          navigation.navigate("QuestionnaireStudyComponent"); 
      }
    };

    const submitQuestionData = async () => {

        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);

        let answerArray = [];
        var value = 0;
        questionsArray.map((item,index) => {
            let dict = questionnaireDict['QestionId_'+item.questionId+petId];
            let temp = {};
            if(item.isMandatory){
                if(dict){
                    if(dict.questionAnswer===""||dict.questionAnswer===undefined||dict.questionAnswer==='[]'){ 
                        createPopup(Constant.QUESTIONS_MANDATORY_MSG,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);           
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
                    createPopup(Constant.QUESTIONS_MANDATORY_MSG,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
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

                }  
            }
            return;
        })

        if(value===mandatoryQuestions){

            let answerDict  = {};
            answerDict.questionnaireId = questionnaireId;
            answerDict.petId = petId;
            answerDict.studyIds = studyId;
            answerDict.petParentId = clientId;
            answerDict.questionAnswers = answerArray;
            if(answerArray.length>0){
                sendAnswersToBackend(JSON.stringify(answerDict));
            }else{ 
                createPopup(Constant.QUESTIONS_MIN_ANSWER_MSG,Alert_Min_Answer_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
            }
 
        } else {
            createPopup(Constant.QUESTIONS_MANDATORY_MSG,Alert_Madatory_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
        }

    };

    const sendAnswersToBackend = async (answersDictToBackend) => {
        
        let internet = await internetCheck.internetCheck();
        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api, firebaseHelper.screen_questionnaire_questions, "Initiated API to Submit Questionnaire "+petId, 'Internet Status : '+internet);
        if(!internet){
            set_isLoading(false);
            isLoadingdRef.current = 0;
            createPopup(Constant.NETWORK_STATUS,Alert_Network_Id,Constant.ALERT_NETWORK,'OK',false,true,1);
            return;
        }

        trace_Questions_Submit_API_Complete = await perf().startTrace('t_SaveQuestionAnswers_API');
        set_isLoading(true);
        isLoadingdRef.current = 1;
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
        fetch( EnvironmentJava.uri + 'saveQuestionAnswers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                "ClientToken" : token
            },
            body:answersDictToBackend,
            }).then((response) => response.json()).then(async (data) => {
                    set_isLoading(false);
                    isLoadingdRef.current = 0;
                    stopFBTrace();
                    if(data && data.errors && data.errors.length && data.errors[0].code==='WEARABLES_TKN_003'){
                        AuthoriseCheck.authoriseCheck();
                        navigation.navigate('WelcomeComponent');
                    }
                    if(data.status.success){
                        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_success, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Success", '');
                        QestionnaireDataObj.deleteQuestionnaire(questionnaireId,petId);
                        createPopup(Constant.QUESTIONS_SUBMIT_SUCCESS_MSG,Alert_Success_Id,Constant.ALERT_INFO,'OK',false,true,1);
                        updateDashboardData();

                    }else{
                        firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", '');
                        createPopup(Constant.SERVICE_FAIL_MSG,Alert_Fail_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
                    }
            }).catch((error) => {
                stopFBTrace();
                set_isLoading(false);
                isLoadingdRef.current = 0;
                createPopup(Constant.SERVICE_FAIL_MSG,Alert_Fail_Id,Constant.ALERT_DEFAULT_TITLE,'OK',false,true,1);
                firebaseHelper.logEvent(firebaseHelper.event_questionnaire_questions_submit_api_fail, firebaseHelper.screen_questionnaire_questions, "Submit Questionnaire API Fail", 'error : '+error);
            });
    };

    const stopFBTrace = async () => {
        await trace_Questions_Submit_API_Complete.stop();
    };

    const updateDashboardData = () => {
        Apolloclient.client.writeQuery({query: Queries.UPDATE_DASHBOARD_DATA,data: {data: { isRefresh:'refresh',__typename: 'UpdateDashboardData'}},});
    };


    const createPopup = (msg,pId,pTitle,pRghtTitle,isPLft,isPop,idRef) => {
        set_popUpMessage(msg);
        set_popupId(pId);
        set_popUpTitle(pTitle);
        set_popupRBtnTitle(pRghtTitle);
        set_isPopUpLftBtn(isPLft);
        set_isPopUp(isPop);
        popIdRef.current = idRef;
    };

    return(
        <>
            <QuestionnaireQuestionsUI

                defaultPetObj = {defaultPetObj}
                isPopUp = {isPopUp}
                popUpMessage = {popUpMessage}
                popUpTitle = {popUpTitle}
                popupRBtnTitle = {popupRBtnTitle}
                isPopUpLftBtn = {isPopUpLftBtn}
                isLoading = {isLoading}
                questionObject = {questionObject}
                questionnaireId = {questionnaireId}
                questionsArray = {questionsArray}
                totalQuestions = {totalQuestions}
                questionsArrayInitial = {questionsArrayInitial}
                mandatoryQuestions = {mandatoryQuestions}
                status = {status}
                petId = {petId}
                petURL = {petURL}
                questionnaireDict = {questionnaireDict}
                answeredQuestions = {answeredQuestions}
                filterOptions = {filterOptions}
                isFiterEmpty = {isFiterEmpty}
                indexArray = {indexArray}
                popOkBtnAction = {popOkBtnAction}
                popCancelBtnAction = {popCancelBtnAction}
                submitQuestionData = {submitQuestionData}
                saveQuestions = {saveQuestions}
                navigateToPrevious = {navigateToPrevious}
                updateQuestionnaireQuestions = {updateQuestionnaireQuestions}
                filterQuestionsAction = {filterQuestionsAction}
            
            />

        </>
    )
}
export default QuestionnaireQuestionsService;