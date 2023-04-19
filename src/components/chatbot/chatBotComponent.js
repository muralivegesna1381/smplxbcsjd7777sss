import React,{useState, useEffect,useRef} from 'react';
import { Platform, Alert, NativeEventEmitter, NativeModules, Text, Linking,BackHandler } from "react-native";
import ChatbotUI from "./chatBotUI"
import AsyncStorage from "@react-native-community/async-storage";
import * as Constant from "../../utils/constants/constant";
import Highlighter from 'react-native-highlight-words';
import useInterval from '../../utils/intervalHook/intervalhook';
import * as DataStorageLocal from "./../../utils/storage/dataStorageLocal";
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

let trace_inChatbotScreen;

const ChatBotComponent = ({navigation, route,...props}) => {

    const [chatbotVisible, set_chatbotVisible] = useState(true);
    const [isChatEndSession, set_isChatEndSession] = useState(false);

    const isChatEnded = useRef('Yes');
    const isChatmimised = useRef(undefined);
    const defaultChatDate = useRef(undefined);
    const defaultChatDateSetValue = useRef("chatEnded");
    var subscriptionIos = useRef();
    const [messages, setMessages] = useState([
    ]);
    const [delay, setDelay] = useState(null);

    useEffect(() => {  

      chatBotSessionStart();
      firebaseHelper.reportScreen(firebaseHelper.screen_chatbot);
      firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_chatbot, "User in Chatbot Screen", '');
      startChatSession();
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      
      return () => {
        chatBotScreenSessionStop();
        BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
      };

    },[]);

    useInterval(() => {
      setDelay(null);
      let tempText = "Sorry, I am not sure I understand you. Let’s send an email to the customer support team at support@wearablesclinicaltrials.com";
      let welcomeMsgTemp1 = {
        _id: "123456",
        createdAt: new Date(),
        text:<Text onPress={ ()=>                    
          Linking.openURL(replaceCommaLine('mailto:support@wearablesclinicaltrials.com?subject=SendMail&body=Description'))}>{<Highlighter
            highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
            searchWords={['support@wearablesclinicaltrials.com']}
            textToHighlight={replaceCommaLine(tempText)}
          />}</Text> ,
          user: {
          _id: 3,
          name: "Wearables Support",
        },
    };
    let temp = [...messages];
    temp.push(welcomeMsgTemp1);
    setMessages(temp);

    }, delay);

    // Android physical back button
    const handleBackButtonClick = () => {
        return true;
    }
    const chatBotSessionStart = async () => {
      trace_inChatbotScreen = await perf().startTrace('t_Chabot_Screen');
    };
  
    const chatBotScreenSessionStop = async () => {
      await trace_inChatbotScreen.stop();
    };


    const startChatSession = async () => {
        firebaseHelper.logEvent(firebaseHelper.event_chat_request_trigger, firebaseHelper.screen_chatbot, "User requested chat", '');
        await getZDChatMinimizeStatus();
        await getChatBotEndStatus();
        await getDefaultDateValue();
        await getDefaultDateSetValue();
        await getZDChatArrayValues();
        eventZendeskMethod();
    }

    const onChatBotButtonClickedChat = async (visible) => {
        set_chatbotVisible(visible);
        saveDefaultDateSetValue("chatIntiated");
        if(defaultChatDateSetValue.current==="chatEnded"){
          saveDefaultDateValue(new Date);
          defaultChatDateSetValue.current = "chatIntiated"
        }
          if(visible===true && isChatmimised.current===true){
          await setZDChatMinimizeStatus(!isChatmimised.current)
          if(Platform.OS === "android" ){
            NativeModules.ZDChatbotAndroidBridging.zdChatAndroidConnector("react Native Module Android",(value) => {
            })
      
          }else {
            NativeModules.ZendeskChatManagerObject.initialiseZendeskChat( "Start Chat", (value) => {
            }) 
          }
        } else {
        }
      };

      const prepareChatArrayOnReload = (msgArray) => {
        let textURL = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        let tempArray = [];
          tempArray = msgArray.map((message) => ({           
            _id: message.id,
            createdAt: new Date(message.timeStamp),
            text:
              message.type === "agentMessage" &&
              message.text.toString().includes("How-to videos" || "How-to Videos" || "how-to videos" || "how to videos") ? (
                <Text
                  onPress={() => {

                  }}
                  style={{ color: "blue" }}
                >
                  {replaceCommaLine(message.text.toString())}
                </Text>
              ) : (
                (textURL.test(message.text.toString()) ? 
                  message.text.includes('support@wearablesclinicaltrials.com') ? 
                  
                  <Text onPress={ ()=>  
                   
                    Linking.openURL(replaceCommaLine(message.text))}>{<Highlighter
                      highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
                      searchWords={['support@wearablesclinicaltrials.com']}
                      textToHighlight={replaceCommaLine(message.text)}
                    />}</Text> 

                  : 
                                   
                  <Text style={{color:'blue',textDecorationLine: 'underline'}} onPress={ ()=>  
                   
                  Linking.openURL(replaceCommaLine(message.text))}>{replaceCommaLine(message.text)}</Text> 
                :
                 <Text>{replaceCommaLine(message.text.toString())}</Text>
                
                )  
                
              ),
            user: {
              _id: message.type === "visitorMessage" ? 1 : null,
              name: "Wearables Support",
            },
            
          }));
    
          setMessages(tempArray);
      }

      function replaceCommaLine(data) {
        //convert string to array and remove #
        let dataToArray = data.split('#').map(item => item.trim());
        return dataToArray.join("\n");
    }

    const eventZendeskMethod = () => {
        if(Platform.OS === "android"){
          const eventEmitter = new NativeEventEmitter(NativeModules.ZDChatbotAndroidBridging);
          subscriptionIos.current = eventEmitter.addListener('zenDeskRecievedMsgsEvents', onSessionConnect);
        }else {
          const eventEmitter = new NativeEventEmitter(NativeModules.ZendeskChatManagerObject);
          subscriptionIos.current = eventEmitter.addListener('zenDeskRecievedMsgsEvents', onSessionConnect);
        }
      };

      const onSessionConnect = (event) => {
       
        getDefaultDateValue();   

        let textURL = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
        let welcomeMsg = {
          id:"12345",
          text:"Hey! I am your virtual assistant. How may I help you?",
          timeStamp: new Date(defaultChatDate.current),
          type: "agentMessage"
        };
    
        let welcomeMsgTemp = {
          _id: "12345",
            createdAt: new Date(defaultChatDate.current),
            text:"Hey! I am your virtual assistant. How may I help you?",
            type: "agentMessage",
            user: {
              _id: 2,
              name: "Wearables Support",
         },
        };
    
        let tempArray = [];
        let convertedArray = Platform.OS === "android" ? JSON.parse(event.eventProperty) : event;

          tempArray = convertedArray.map((message) => ({
            
            _id: message.id,
            createdAt: new Date(message.timeStamp),
            type:message.type,
            text:
              message.type === "agentMessage" &&
              (message.text.toString().includes("How-to videos" || "How-to Videos" || "how-to videos" || "how to videos")) ? (
                <Text
                  onPress={() => {
                   // navigationChangeChatbot(7);
                   //navigation to how to videos
                  }}
                  style={{ color: "blue" }}
                >
                  {replaceCommaLine(message.text.toString())}
                </Text>
              ) : (
                (
                  
                  textURL.test(message.text.toString()) ? 
                  message.text.includes('support@wearablesclinicaltrials.com') ? 
                  
                  <Text onPress={ ()=>  
                   
                    Linking.openURL(replaceCommaLine('mailto:support@wearablesclinicaltrials.com?subject=SendMail&body=Description'))}>{<Highlighter
                      highlightStyle={{color: 'blue',textDecorationLine: 'underline'}}
                      searchWords={['support@wearablesclinicaltrials.com']}
                      textToHighlight={replaceCommaLine(message.text)}
                    />}</Text> 
                  : 
                  <Text style={{color:'blue',textDecorationLine: 'underline'}} onPress={ ()=>  
                   
                  Linking.openURL(replaceCommaLine(message.text))}>{replaceCommaLine(message.text)}</Text> 
                :
                  <Text>{replaceCommaLine(message.text)}</Text>

                )          
              ),
            user: {
              _id: message.type === "visitorMessage" ? 1 : null,
              type:message.type,
              name: "Wearables Support",
            },
          }));
    
            if(isChatEnded.current === 'No'){
              let insertWelcomeMsgArray = addAfter(tempArray,welcomeMsgTemp);
              let inserWelcomeMsgArrayAsync = addAfter(convertedArray,welcomeMsg);
              setMessages(insertWelcomeMsgArray);
              saveChatMessages(inserWelcomeMsgArrayAsync);
            }else {
              prepareDefaultMsgArray();
            } 

            if(convertedArray.length>0){
              let lastMsgType = convertedArray[convertedArray.length-1].type
              if(lastMsgType==='agentMessage'){
                setDelay(null);
              }
            }
            
       };
       
    
       function addAfter(array, newItem) {
        if(array[0].text !== "Hey! I am your virtual assistant. How may I help you?"){
          array.splice(0, 0, newItem);
        }

        
        return array;
    }

      const onSendChatMessage = (messages) => {
        isChatEnded.current = 'No';
        saveChatBotEndStatus('No');   
        firebaseHelper.logEvent(firebaseHelper.event_chat_message_sent_trigger, firebaseHelper.screen_chatbot, "User sent a message in chat", ''+messages);
        setDelay(5000);
        if (Platform.OS === "android") {
          NativeModules.ZDChatbotAndroidBridging.zdChatInitializer(
            messages[0].text,
            (value) => {
            }
          );
        } else {
          NativeModules.ZendeskChatManagerObject.zendeskSentMessage(
            messages[0].text,
            (value) => {
            }
          );
        }
        // //setMessages(previousMessages => GiftedChat.append(previousMessages, messages))
      }

      ///////////////Getting Values from async /////////////////
      const getZDChatMinimizeStatus = async () => {

          firebaseHelper.logEvent(firebaseHelper.event_chat_minimize_trigger, firebaseHelper.screen_chatbot, "User minimized chatbot", '');
        AsyncStorage.getItem(Constant.ZDCHAT_MINIMIZE_STATUS).then((status) => {
          if (status) {
            //set_isChatmimised(JSON.parse(status));
            isChatmimised.current = JSON.parse(status);
          }else {
            //set_isChatmimised(true);
            isChatmimised.current = true
          }
          onChatBotButtonClickedChat(chatbotVisible);
        });
      };

      const getChatBotEndStatus = async () => {
        isChatEnded.current = 'Yes'
      };

      const getDefaultDateValue = async () => {

        AsyncStorage.getItem(Constant.ZDCHAT_DEFAULT_MSG_DATE).then((value) => {
              if(value){
                defaultChatDate.current = value;
              }else {
                //defaultChatDate.current = new Date();
              }
          });
      };

      const getDefaultDateSetValue = async () => {

        AsyncStorage.getItem(Constant.ZDCHAT_DEFAULT_DATE_SET_VALUE).then((value) => {
              if(value){
                defaultChatDateSetValue.current = value;
              }else {
              }
          });
      };

      const getZDChatArrayValues = async () => {
        
        AsyncStorage.getItem(Constant.ZDCHAT_MESSAGES_ARRAY).then((messagesArray) => {
          if (messagesArray.length>0) {
            prepareChatArrayOnReload(JSON.parse(messagesArray));
          }else {
            prepareDefaultMsgArray();
            
          }
        });
      }

      ///////////////Saving Values from async /////////////////
      const saveChatMessages = async(msgArray,value) => {

        if(value==='backGround'){
         // await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_MESSAGES_ARRAY,JSON.stringify(msgArray))
          AsyncStorage.setItem(Constant.ZDCHAT_MESSAGES_ARRAY,  JSON.stringify(msgArray)).then(
          )
        }else {
         // await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_MESSAGES_ARRAY,JSON.stringify(msgArray))
          AsyncStorage.setItem(Constant.ZDCHAT_MESSAGES_ARRAY, JSON.stringify(msgArray));
        }    
      }

      const saveDefaultDateSetValue  = async (value) => {
        //await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_DEFAULT_DATE_SET_VALUE,value.toString())

        try {
          await AsyncStorage.setItem(Constant.ZDCHAT_DEFAULT_DATE_SET_VALUE, value.toString());
        } catch (error) {
        }
      };

      const saveDefaultDateValue  = async (value) => {
       // await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_DEFAULT_MSG_DATE, value.toString())
        try {
          await AsyncStorage.setItem(Constant.ZDCHAT_DEFAULT_MSG_DATE, value.toString());
        } catch (error) {
        }
      };

      const setZDChatMinimizeStatus = async (status) => {

        try {

          //await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_MINIMIZE_STATUS,JSON.stringify(status));

          await AsyncStorage.setItem(
            Constant.ZDCHAT_MINIMIZE_STATUS,
            JSON.stringify(status)
          );
          set_isChatmimised(status);
        } catch (error) {}
      };

      const saveChatBotEndStatus = async (value) => {
       // await DataStorageLocal.saveDataToAsync(Constant.ZDCHAT_ENDED_STATUS, value);

        try {
          await AsyncStorage.setItem(Constant.ZDCHAT_ENDED_STATUS, value);
        } catch (error) {
        }
      };

      const prepareDefaultMsgArray = () => {
        saveChatMessages([{
          id:"12345",
          text:"Hey! I am your virtual assistant. How may I help you?",
          timeStamp: new Date(),
          type: "agentMessage"
          
        }]);
        setMessages([{
          _id: "12345",
          createdAt: new Date(),
          text:"Hey! I am your virtual assistant. How may I help you?",
          user: {
            _id: 2,
            name: "Wearables Support",
          },
        }]);
      }

      const navigationChangeChatbot = async (index) => {
        //props.navigationChangeChatbotComponent1(index);
      }

      const zendeskActions = (value) => {
        props.zendeskAction(value);            
      }

      const endZendeskSession = (value) => {
        endChatAlert("Alert", "Are you sure you want to close the chat?");
        //props.zendeskAction(value);            
      }

      const endChatAlert = (tittle, message, visiblity) => {
        Alert.alert(
          tittle,
          message,
          [
            {
              text: "NO",
              onPress: () => {},
            },
            {
              text: "YES",
              onPress: () => {
               set_isChatEndSession(false);
              endZendeskChatFromChatting();
              },
            },
          ],
          { cancelable: false }
        );
      };

      const endZendeskChatFromChatting = async () => {
        prepareDefaultMsgArray();
        backBtnAction();
        set_chatbotVisible(false);
        setZDChatMinimizeStatus(true);
        isChatEnded.current = 'Yes';
        saveChatBotEndStatus('Yes');
        defaultChatDateSetValue.current = "chatEnded"
        saveDefaultDateSetValue("chatIntiated");
        firebaseHelper.logEvent(firebaseHelper.event_chat_session_end_trigger, firebaseHelper.screen_chatbot, "User closed chatbot", '');
        props.zendeskActionEnd(false); 
        
        if (Platform.OS === "android") {   
          // prepareDefaultMsgArray();
            NativeModules.ZDChatbotAndroidBridging.zdChatEnd(
              "react Native Module Android",
              (value) => {
              }
            );          
        } else {

          NativeModules.ZendeskChatManagerObject.zendeskEndChat("End Chat",
            (value) => {
              // prepareDefaultMsgArray();
            }
          );
        }

        
      };

      const backBtnAction = () => {
        navigation.navigate("DashBoardService");
      };

      const chatMiniBtnAction = () => {
        backBtnAction();
      };

return(

    <>
    <ChatbotUI
    zendeskActions = {zendeskActions}
    endZendeskSession = {endZendeskSession}
    onSendChatMessage = {onSendChatMessage}
    chatMiniBtnAction = {chatMiniBtnAction}
    backBtnAction = {backBtnAction}
    messagesChat = {messages}
    />    
    </>
    
)
}
export default ChatBotComponent;
