


import Foundation
import DKImagePickerController


@objc(ZendeskChatManagerObject)
class ZendeskChatManagerObject: RCTEventEmitter, ChatView  {
  
  //var chatLog: [ChatUIEvent] = []
  var client = APIClient()
  var delegate: ChatViewControllerDelegate!
  var dataSource: ChatViewControllerDataSource!
  var messagesArray =  [Any]()
  var endingChatValue = "";
  
  @objc var onRecivedChatMsgArray: RCTResponseSenderBlock?
  
  override func supportedEvents() -> [String]! {
    return ["zenDeskRecievedMsgsEvents"]
  }
  
  func updateChatLog() {
    self.messagesArray.removeAll()
    print("-----Names--------",dataSource.chatLog)
    for (index,name) in dataSource!.chatLog.enumerated() {

          if let chatmessage = dataSource.chatLog[index] as? ChatMessageEventType {
            let dateFormatter = DateFormatter()
            dateFormatter.dateFormat = "E, d MMM yyyy HH:mm:ss Z"
            let dateString = dateFormatter.string(from: chatmessage.timeStamp)
            //print("iOS Object",dateString);
            let para:NSMutableDictionary = NSMutableDictionary()
            para.setValue(chatmessage.id, forKey: "id")
            para.setValue(chatmessage.text, forKey: "text")
            para.setValue(chatmessage.type.rawValue, forKey: "type")
            para.setValue(dateString, forKey: "timeStamp")
           // para.setValue(index, forKey: "index")
            self.messagesArray.append(para)

          }
        }
    self.sendEvent(withName: "zenDeskRecievedMsgsEvents", body: self.messagesArray)
      //print("-----Names--------",self.messagesArray)
    self.messagesArray.removeAll()

  }

  @objc(initialiseZendeskChat:callback:)
  func initialiseZendeskChat(_ startChating: String, callback: RCTResponseSenderBlock) {
    print("Zeendesk---------Log")
    callback(["callback from iOS"])
    endingChatValue = startChating;
    initialSetup()
  }
  
  @objc(zendeskSentMessage:callback:)
  func zendeskSentMessage(_ messageText: String, callback: @escaping RCTResponseSenderBlock) {
    print("Zeendesk Chat message---------Log", messageText)

    sendMessageChat(msg: messageText as NSString)
    
    
    
//    onRecivedChatMsgArray = callback
    
//    DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { // Change `2.0` to the desired number of seconds.
//       // Code you want to be delayed
//      self.callBackMessagesArray()
//    }
    
//    onRecivedChatMsgArray = callback
    
//    updateChatLog()
//
//    if(dataSource.chatLog.count > 0){
//      let chatTextCell = dataSource.chatLog[0] as? ChatMessageEventType
//      callback([chatTextCell?.text ?? ""])
//    }else {
//      callback(["Sorry"])
//    }
    //callback([dataSource.chatLog])
//    print("Zeendesk Chat message Recieved---------Log", dataSource.chatLog)

    
//    if let chatTextCell = dataSource.chatLog[0] as? ChatMessageEventType {
//
//      callback([chatTextCell.text])
//
//    }else {
//
//      callback(["Sorry"])
//    }

  }
  
  @objc(zendeskRecievedMessages:callback:)
   func zendeskRecievedMessages(_ messageRecieved: String, callback: RCTResponseSenderBlock) {
     updateChatLog()
     callback([dataSource.chatLog])
   }
  
  @objc(zendeskEndChat:callback:)
  func zendeskEndChat(_ endChatting: String, callback: RCTResponseSenderBlock) {
    endingChatValue = endChatting;
    
    DispatchQueue.main.async {
      print("Zeendesk EndChat---------Log",self.client.isChatConnected)
      self.client.endChat();
      self.delegate=nil;
      self.dataSource=nil;
    }
    
    callback([dataSource.chatLog])
  }

  // Update the connection state with a new connection value
  var isChatConnected: Bool = false {
    didSet {
      let logMessage = isChatConnected ? "Connected" : "Chat is connecting...111111"
      print(logMessage)
    }
  }

  func initialSetup() {
    
    DispatchQueue.main.async {
    self.client = APIClient.init();
    self.client.resumeChatIfNeeded()
    self.isChatConnected = self.client.isChatConnected
    self.delegate = ChatControllerDelegate(client: self.client)
    self.dataSource = ChatControllerDataSource(withChatView: self, client: self.client)
    print("initialSetup ChatStatus1 : ", self.isChatConnected)
    }
    
  }
  
  func recievedChatLogs() {
    print("chatLogEvent dataSource : ",dataSource!.chatLog)

  }

  private func sendMessageChat(msg: NSString) {

    if (self.delegate == nil){
      self.delegate = ChatControllerDelegate(client: self.client)
    }
    
    if(self.dataSource == nil){
      self.dataSource = ChatControllerDataSource(withChatView: self, client: self.client)
    }
    print("sendMessage-------->", msg)
    self.delegate.chatController(self, sendMessage: msg as String)

  }

  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
}



////
////  ZendeskObject.swift
////  Wearables
////
////  Created by Cambridge Technology Inc on 08/05/21.
////  Copyright © 2021 Facebook. All rights reserved.
////
//
//import UIKit
//
//class ZendeskChatManagerObject: NSObject {
//
//  @objc var onChatCallBack: RCTDirectEventBlock?
//  @objc var onChatEndSessionCallBack: RCTDirectEventBlock?
//  @objc var onChatRecievedMessage: RCTDirectEventBlock?
//
//  @objc var isVisibleButton: Bool = false  {
//  didSet {
//    if isVisibleButton == true {
//      print("isVisibleButton set : ",isVisibleButton);
//
//    }else {
//      print("isVisibleButton set : endChat",isVisibleButton);
//    }
//  }
//  }
//
//  @objc var chatEndSessionValue: Bool = false  {
//   didSet {
//     print("chatCountValue is : ",chatEndSessionValue);
//
//    if(chatEndSessionValue == true){
//      client.endChat();
//      DispatchQueue.main.async {
//        if self.onChatEndSessionCallBack != nil {
//          self.onChatEndSessionCallBack!(["sessionEndChat": true])
//        }
//      }
//
//    }
//   }
//   }
//
//  @objc var chatSentMessage: NSString = ""  {
//  didSet {
//    print("chatSentMessage is : ",chatSentMessage);
//
//    if(chatSentMessage != ("" as AnyObject) as! NSString){
//     print("chatSentMessage is1 : ",chatSentMessage);
//   }
//  }
//  }
//
//  // Update the connection state with a new connection value
//  var isChatConnected: Bool = false {
//    didSet {
//      let logMessage = isChatConnected ? "Connected" : "Chat is connecting..."
//      print(logMessage)
//    }
//  }
//
//  class func instanceFromNib() -> NSObject {
//    print("iOS Initiation-------------")
//    return UINib(nibName: "ZDChat", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! NSObject
//  }
//
//
//
//  fileprivate let client = APIClient()
//
//  func initialSetup() {
//
////      delegate = ChatControllerDelegate(client: client)
////      dataSource = ChatControllerDataSource(withChatView: self, client: client)
//
//      client.resumeChatIfNeeded()
//      isChatConnected = client.isChatConnected
//
//      print("initialSetup : ", isChatConnected)
//
//    }
//
//  @objc private func pickImage() {
//
//  }
//
//  @objc private func sendMessage() {
//
//  }
//
//  func updateChatLog() {
//
//  //    let tempArray = dataSource.chatLog as? ChatMessageEventType
//  //    let chatTextCell = dataSource.chatLog[0] as? ChatMessageEventType
//  //    print ("Send Chat Messaages Array ---------- ", tempArray ?? "")
//  //
//  //    DispatchQueue.main.async {
//  //      if self.onChatRecievedMessage != nil {
//  //        print("chatRecievedMessage : ",chatTextCell?.text ?? "Hi")
//  //        self.onChatRecievedMessage!(["ChatMessagesArray": self.dataSource.chatLog[0].type.rawValue, "ChatMessagesArray1": self.dataSource.chatLog[0].id,  "ChatMessagesArray2": chatTextCell?.text ?? "Hi"])
//  //      }
//  //    }
//    }
//
//}
