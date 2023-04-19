import AsyncStorage from '@react-native-community/async-storage';
import { empty } from 'apollo-boost';

export async function getAnswer(questionnairId,clientId){
    let _answers = await AsyncStorage.getItem('CTWQuestionnaire') ;
    let _answerObject = JSON.parse(_answers) ;
    let temp = undefined;
    if(_answerObject){
        temp = _answerObject['QuestionnaireId_'+questionnairId+clientId];
    }
    return temp;
}
    
export async function saveAnswer(dict,questionnairId,clientId){

    let _answers = await AsyncStorage.getItem('CTWQuestionnaire');
    let _existingObject = JSON.parse(_answers);
    let tempObject = {};
    if(_existingObject){
        tempObject = _existingObject;
    }      
    tempObject['QuestionnaireId_'+questionnairId+clientId]=dict;    
    let stringfy = JSON.stringify(tempObject);  
    AsyncStorage.setItem('CTWQuestionnaire', stringfy);   
}

export async function deleteQuestionnaire(questionnairId,clientId){

    let tempDict;
    let dictItem = JSON.parse(await AsyncStorage.getItem('CTWQuestionnaire'));
    if(dictItem){

        const copyDict= dictItem
        delete copyDict['QuestionnaireId_'+questionnairId+clientId];
        tempDict = copyDict;
        let stringify = JSON.stringify(tempDict);
        AsyncStorage.setItem('CTWQuestionnaire', stringify); 

    } 
    
}