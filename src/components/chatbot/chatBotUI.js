import React,{useState, useEffect,useCallback} from 'react';
import {View, StyleSheet,Image} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import { GiftedChat, Send, Bubble, InputToolbar, } from "react-native-gifted-chat";
import CommonStyles from './../../utils/commonStyles/commonStyles';
import fonts from './../../utils/commonStyles/fonts';
import HeaderComponent from './../../utils/commonComponents/headerComponent';

const ChatBotUI = ({navigation, route,...props}) => {

    const [chatSendMessageText, set_chatSendMessageText] = useState("");
    const [messages, set_messages] = useState(props.messagesChat);

    useEffect(() => {   
        set_messages(props.messagesChat);
    },[props.messagesChat]);

    const backBtnAction = () => {
      props.backBtnAction();
    };

    const chatMiniBtnAction = () => {
      props.chatMiniBtnAction();
    };

    const chatCloseBtnAction = () => {
      props.endZendeskSession();
    };

    const renderBubble = (props) => {
        return (
          <Bubble
            {...props}
            wrapperStyle={{
              left: { backgroundColor: "#E7E7E9" },
              right: { backgroundColor: "#C1D5A8" },
              size: { width: hp("5%") },         
            }}
            containerStyle={{
              left: {marginTop:10},
              right: {marginTop:10},         
            }}
            textStyle={{
              right: {
                color: "black",
              },
            }}

          />
        );
      };

      const renderSend = (props) => {
        return (
          <Send
            {...props}>

            <View style={{justifyContent:'center',width:wp("12%")}}>
              <Image source={require("../../../assets/images/chatImages/sendChat.svg")} style={styles.sendBtnStyle}/>
            </View>

          </Send>
        );
      };

      const scrollToBottomComponent = () => {
        // return <ScrollChatIcon name="angle-double-down" size={22} color="#333" />;
      };

      const onSend = useCallback((messages = []) => {
        props.onSendChatMessage(messages);
      }, []);

      const customtInputToolbar = props => {
        return (
          <InputToolbar
            {...props}
            containerStyle={{
              backgroundColor: "#EAEAEA",
              borderRadius:5,
              // borderTopColor: "#E8E8E8",
              // borderTopWidth: 1,
              // padding: 8
            }}
          />
        );
      };

return(

    <>
    <View style={{alignItems:'center',flex:1}}>

          <View style={[CommonStyles.headerView]}>
                <HeaderComponent
                    isBackBtnEnable={false}
                    isSettingsEnable={false}
                    isChatEnable={true}
                    isTImerEnable={true}
                    isTitleHeaderEnable={true}
                    title={'Chat Bot'}
                    backBtnAction = {() => backBtnAction()}
                    timerBtnAction = {() => chatMiniBtnAction()}
                    chatBtnAction = {() => chatCloseBtnAction()}
                />
            </View>

        <View style={styles.chatViewStyle}>
            <GiftedChat
              text={chatSendMessageText}
              // placeholder={'Hello'}
              onInputTextChanged={(text) => set_chatSendMessageText(text)}
              messages={messages}
              editable={false}
              onSend={(text) => onSend(text)}
              user={{_id: 1,}}
              showUserAvatar={true}
              renderAvatar={null}
              alwaysShowSend={true}
              renderSend={renderSend}
              scrollToBottom={true}
              scrollToBottomComponent={scrollToBottomComponent}
              renderBubble={renderBubble}
              inverted={false}
              renderUsernameOnMessage={true}
              onLongPress={(ctx, currentMessage) => {console.log("Tap")}}
              renderInputToolbar={props => customtInputToolbar(props)}
              // renderSystemMessage={props => customSystemMessage(props)}
              // textInputProps = {props => customInputMessage(props)}
            />
          </View>
      </View>
    </>
    
)
}
export default ChatBotUI;

const styles = StyleSheet.create({

  chatViewStyle : {
    height: hp("87%"),
    width: wp("95%"),
  },

  titleStyle: {
    color: 'black',
    fontSize: fonts.fontNormal,
    ...CommonStyles.textStyleBold,
    textAlign:'center',
    marginLeft: wp("2%"),
  },

  buttonsStyle : {
    marginLeft: wp("2%"),
    marginRight: wp("2%"),
    marginBottom: wp("1%"),
    width: hp("3%"),
    height: hp("3%"),
    resizeMode:"contain"
  },

  sendBtnStyle : {
    width: hp("5%"),
    height: hp("5%"),
    resizeMode:"contain"
  },

  headerSelectionView : {
    flex:6,
    minHeight:hp('4%'),
    flexDirection:'row',
    alignItems:'center',
  },

});
