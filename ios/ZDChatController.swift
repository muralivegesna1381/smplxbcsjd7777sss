//
//  ZDChatController.swift
//  ZD_PK
//
//  Created by valuri_mac on 26/04/21.
//



import UIKit
import DKImagePickerController

struct ChatMessage {
    let text: String
    let isIncoming: Bool
  let isButtonEnable: Bool
}

@objc(ZDChatController)

class ZDChatController: UIView {
  
  @objc var onChatCallBack: RCTDirectEventBlock?
  @objc var onChatEndSessionCallBack: RCTDirectEventBlock?
  @objc var onChatRecievedMessage: RCTDirectEventBlock?
//
    @objc var isVisibleButton: Bool = false  {
  didSet {
    if isVisibleButton == true {
      print("isVisibleButton set : ",isVisibleButton);

    }else {
      print("isVisibleButton set : endChat",isVisibleButton);
      //client.endChat();
    }
  }
  }
  
  @objc var chatEndSessionValue: Bool = false  {
   didSet {
     print("chatCountValue is : ",chatEndSessionValue);

    if(chatEndSessionValue == true){
      client.endChat();
      DispatchQueue.main.async {
        if self.onChatEndSessionCallBack != nil {
          self.onChatEndSessionCallBack!(["sessionEndChat": true])
        }
      }
      
    }
    //client.endChat()
   }
   }
  
  
//  @IBOutlet var tableView: UITableView!
//  @IBOutlet var bottomConstraint: NSLayoutConstraint!
//  @IBOutlet weak var messageTextField: UITextField!
  //@IBOutlet weak var sendButton: UIButton!
  
  var tableView = UITableView()
  var delegate: ChatViewControllerDelegate!
  var dataSource: ChatViewControllerDataSource!
  var chatArrayMessages = [ChatUIEvent]()
  var heightConst = -10

  var bottomControlsStackView: UIStackView?

  // Update the connection state with a new connection value
  var isChatConnected: Bool = false {
    didSet {
      let logMessage = isChatConnected ? "Connected" : "Chat is connecting..."
      print(logMessage)
    }
  }

  fileprivate let client = APIClient()
    
override init(frame: CGRect) {
  super.init(frame: frame)
  
  //let bounds = UIScreen.main.bounds
  self.heightConst = Int(-10)
  
  //self.addSubview(button)
  self.addSubview(bgView)
  self.tableViewSetup()
  self.bottomView()
  
  print("init BarcodeScanController frame : ", frame, UIScreen.main.bounds, frame)
  self.initialSetup()
  
  self.setupConstraints()
 // self.addSubview(button)

}
required init?(coder aDecoder: NSCoder) {
super.init(coder: aDecoder);
  print("init(coder:) has not been implemented")
}
  
  class func instanceFromNib() -> UIView {
      return UINib(nibName: "ZDChat", bundle: nil).instantiate(withOwner: nil, options: nil)[0] as! UIView
    }
    
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    print("layoutSubviews : ",self.frame)

    //self.frame = UIScreen.main.bounds
  }
  
  override func point(inside point: CGPoint, with event: UIEvent?) -> Bool {
    return true
  }
  
  
  func initialSetup() {

    tableView.estimatedRowHeight = 44.0
    tableView.rowHeight = UITableView.automaticDimension
    
    delegate = ChatControllerDelegate(client: client)
    dataSource = ChatControllerDataSource(withChatView: self, client: client)
    
    client.resumeChatIfNeeded()
    isChatConnected = client.isChatConnected
    
    setupKeyboardEvents()
    //updateSendButtonState()
    
//    chatArrayMessages = dataSource.chatLog.reversed()
    
    print("initialSetup dataSource.chatLog.count : ", dataSource.chatLog.count)
    
   
  }
  
  
  private func tableViewSetup() {
    bgView.addSubview(tableView)
    tableView.translatesAutoresizingMaskIntoConstraints = false
    tableView.delegate = self
    tableView.dataSource = self
    tableView.rowHeight = 100
    tableView.register(ChatTVCell.self, forCellReuseIdentifier: "chatCell")

    tableView.separatorStyle = .none
    tableView.backgroundColor =  UIColor(red: 226/255.0, green: 241/255.0, blue: 238/255.0, alpha: 1)
    
  }
  
  private var isOversized = false {
      didSet {
          //messageTextView.reload()
          messageTextView.isScrollEnabled = isOversized
      }
  }
  
  private let maxHeight: CGFloat = 100
  
  
  private func bottomView() {

//      //bottomControlsStackView = UIStackView(arrangedSubviews: [pinButton, messageTextField, sendButton])
     bottomControlsStackView = UIStackView(arrangedSubviews: [messageTextView, sendButton])
      bottomControlsStackView?.translatesAutoresizingMaskIntoConstraints = false
      bottomControlsStackView?.distribution = .equalCentering
      bottomControlsStackView?.backgroundColor = .darkGray
      bottomControlsStackView?.spacing = 30.0

    bgView.addSubview(bottomControlsStackView!)
    messageTextView.delegate = self

      NSLayoutConstraint.activate([
        bottomControlsStackView!.bottomAnchor.constraint(equalTo:bgView.bottomAnchor, constant: -10),
        bottomControlsStackView!.centerXAnchor.constraint(equalTo: bgView.centerXAnchor),
        bottomControlsStackView!.heightAnchor.constraint(equalTo: bgView.heightAnchor, multiplier: 0.1),
        bottomControlsStackView!.widthAnchor.constraint(equalTo: bgView.widthAnchor, multiplier: 0.96)
          ])
    messageTextView.widthAnchor.constraint(equalTo: bgView.widthAnchor, multiplier: 0.65,constant:70).isActive = true
   messageTextView.heightAnchor.constraint(equalTo: bgView.heightAnchor, multiplier: 0.07,constant:10).isActive = true

  }
  
  private let pinButton: UIButton = {
      let button = UIButton(type: .system)
      button.setImage(UIImage(named: "upload"), for: .normal)
      //button.setTitle("PREV", for: .normal)
      button.translatesAutoresizingMaskIntoConstraints = false
      button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 14)
      button.setTitleColor(.gray, for: .normal)
     // button.backgroundColor = .systemPink
      button.addTarget(self, action: #selector(pickImage), for: .touchUpInside)
      return button
  }()
  
  

  private let messageTextField: UITextField = {
      let textField = UITextField()
      textField.placeholder = "Want to chat with us?"
      textField.font = UIFont.systemFont(ofSize: 15)
      textField.borderStyle = UITextField.BorderStyle.roundedRect
      textField.autocorrectionType = UITextAutocorrectionType.no
      textField.keyboardType = UIKeyboardType.default
      textField.returnKeyType = UIReturnKeyType.done
      textField.clearButtonMode = UITextField.ViewMode.whileEditing
      textField.contentVerticalAlignment = UIControl.ContentVerticalAlignment.center
    textField.isEnabled = true
    textField.isSelected = true
    textField.addTarget(self, action: #selector(textFieldEditingChanged), for: .editingChanged)
      textField.translatesAutoresizingMaskIntoConstraints = false

      return textField
  }()
  
  private let messageTextView: UITextView = {
    
    let chatTextView = UITextView()
    //chatTextView.delegate = self
    chatTextView.text = "Want to chat with us?"
    chatTextView.textColor = .gray
    chatTextView.clipsToBounds = true;
    chatTextView.layer.cornerRadius = 5.0;
    chatTextView.frame = CGRect(x: 0, y: 0, width: 250, height: 50)
     chatTextView.font = .systemFont(ofSize: 15)
    chatTextView.translatesAutoresizingMaskIntoConstraints = true
    chatTextView.isScrollEnabled = false
    
    

//    let fixedWidth = chatTextView.frame.size.width
//    chatTextView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
//    let newSize = chatTextView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
//    var newFrame = chatTextView.frame
//    newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
//    chatTextView.frame = newFrame
    //chatTextView.sizeToFit()
    
    return chatTextView
  }()

  
  private let sendButton: UIButton = {
    
    let image = UIImage(named: "send-button-white.png")
      let button = UIButton(type: .system)
    //button.frame = CGRect(x: 30, y: 30, width: 30, height: 30)
//      button.setTitle("Send", for: .normal)
      button.translatesAutoresizingMaskIntoConstraints = false
//      button.titleLabel?.font = UIFont.boldSystemFont(ofSize: 14)
//      button.setTitleColor(.white, for: .normal)
      button.setImage(image, for: .normal)
    button.imageEdgeInsets = UIEdgeInsets(top: 45, left: 40, bottom: 45, right: 40)
    button.tintColor = .white
    //button.setBackgroundImage(image, for: UIControl.State.normal)
      //button.backgroundColor = .red
      button.addTarget(self, action: #selector(sendMessage), for: .touchUpInside)
      return button
  }()
  
  lazy var bgView: UIView = {
    let bounds = UIScreen.main.bounds
    let v = UIView.init(frame: CGRect(x: 0, y: 0, width: bounds.width, height: bounds.height-140))
      v.backgroundColor = UIColor(red: 55/255.0, green: 181/255.0, blue: 124/255.0, alpha: 1)//UIColor.orange
     // v.autoresizingMask = [.flexibleWidth, .flexibleHeight]

      return v
    }()
  
  lazy var button: UIButton = {
      let b = UIButton.init(type: UIButton.ButtonType.system)
      b.titleLabel?.font = UIFont.systemFont(ofSize: 50)
      //b.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    
    b.titleLabel?.text="hello";
      
      return b
    }()

  
  fileprivate func setupConstraints() {
     print("setupBottomControls")
    
    tableView.topAnchor.constraint(equalTo: bgView.topAnchor, constant:0).isActive = true
    tableView.leadingAnchor.constraint(equalTo: self.leadingAnchor).isActive = true
    tableView.trailingAnchor.constraint(equalTo: self.trailingAnchor).isActive = true
    tableView.bottomAnchor.constraint(equalTo: bottomControlsStackView?.topAnchor ?? bgView.bottomAnchor).isActive = true
    
  }
  func setupKeyboardEvents() {
    NotificationCenter.default.addObserver(
      forName: UIResponder.keyboardDidShowNotification,
      object: nil,
      queue: OperationQueue.main) { [weak self] notification in
        let info = notification.userInfo!
        let _: CGRect = (info[UIResponder.keyboardFrameEndUserInfoKey] as! NSValue).cgRectValue
        
        UIView.animate(withDuration: 0.2, animations: {
         // self?.bottomConstraint.constant = keyboardFrame.size.height
          //self?.layoutIfNeeded()
        })
    }
    
    NotificationCenter.default.addObserver(
      forName: UIResponder.keyboardDidHideNotification,
      object: nil,
      queue: OperationQueue.main) { [weak self] notificaiton in
        //self?.bottomConstraint.constant = 0
    }
  }
  
  func fundiactivateConst () {
    
    NSLayoutConstraint.deactivate([
    bottomControlsStackView!.bottomAnchor.constraint(equalTo:bgView.bottomAnchor, constant: -10),
    bottomControlsStackView!.centerXAnchor.constraint(equalTo: bgView.centerXAnchor),
    bottomControlsStackView!.heightAnchor.constraint(equalTo: bgView.heightAnchor, multiplier: 0.1),
    bottomControlsStackView!.widthAnchor.constraint(equalTo: bgView.widthAnchor, multiplier: 0.96)
      ])
  }
}

//MARK: - Actions

extension ZDChatController {
  
  @objc private func pickImage() {
    
    print("pickImage");
    let pickerController = DKImagePickerController()

    pickerController.singleSelect = true
    pickerController.didSelectAssets = { (assets: [DKAsset]) in

      assets[0].fetchOriginalImage { (image, info) in
        //self.delegate.chatController(self, didSelectImage: image!)
      }
    }
    
   // self.present(pickerController, animated: true) {}
  }
    
  @objc private func sendMessage() {

    print("sendMessage-------->",messageTextView.text ?? 0)
    if (messageTextView.text ?? "").isEmpty || messageTextView.text == "Want to chat with us?"  {
         return
       }
    //self.delegate.chatController(self, sendMessage: messageTextView.text!)
    messageTextView.text = ""
   // updateSendButtonState()
    
    messageTextView.textColor = .gray
    let fixedWidth = messageTextView.frame.size.width
    messageTextView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    let newSize = messageTextView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    var newFrame = messageTextView.frame
    newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
    messageTextView.frame = newFrame
  }
  
  func updateTableContentInset() {
      let numRows = self.tableView.numberOfRows(inSection: 0)
      var contentInsetTop = self.tableView.bounds.size.height
      for i in 0..<numRows {
          let rowRect = self.tableView.rectForRow(at: IndexPath(item: i, section: 0))
          contentInsetTop -= rowRect.size.height
          if contentInsetTop <= 0 {
              contentInsetTop = 0
              break
          }
      }
      self.tableView.contentInset = UIEdgeInsets(top: contentInsetTop,left: 0,bottom: 0,right: 0)
  }
  
}


//MARK: - UITextFieldDelegate


extension ZDChatController: UITextFieldDelegate {
  
  func textFieldShouldBeginEditing(_ textField: UITextField) -> Bool {
         print("TextField should begin editing method called")
         return true
     }
  
  func textFieldDidBeginEditing(_ textField: UITextField) {
         // became first responder
         print("TextField did begin editing method called")
     }
  
  func textFieldShouldReturn(_ textField: UITextField) -> Bool {
    print("textFieldShouldReturn")
    sendMessage()
    textField.resignFirstResponder()
    return true
  }
  
  @objc func textFieldEditingChanged() {
    print("textFieldEditingChanged")
    //updateSendButtonState()
  }
  
  func updateSendButtonState() {
    //sendButton.isEnabled = !(messageTextField.text ?? "").isEmpty
    //sendButton.isEnabled = !(messageTextView.text ?? "").isEmpty
  }
}

extension ZDChatController: UITextViewDelegate {
  
 func textViewDidBeginEditing(_ textView: UITextView) {
      //textView.backgroundColor = UIColor.lightGray
      
      if (textView.text == "Want to chat with us?")
      {
          textView.text = ""
          textView.textColor = .black
      }
  
//  let fixedWidth = textView.frame.size.width
//  textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
//  let newSize = textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
//  var newFrame = textView.frame
//  newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
//  textView.frame = newFrame;
      
  }
  
  func textViewDidEndEditing(_ textView: UITextView) {
      textView.backgroundColor = UIColor.white
    print ("textViewDidEndEditing Height is ----------- ")
    textView.text = "Want to chat with us?"
    textView.textColor = .gray
    let fixedWidth = textView.frame.size.width
    textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    let newSize = textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    var newFrame = textView.frame
    newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
    textView.frame = newFrame

  }
  
  func textView(_ textView: UITextView, shouldChangeTextIn range: NSRange, replacementText text: String) -> Bool {
    
    //print ("shouldChangeTextIn Height is ----------- ")
    textView.textColor = .black
      if text == "\n" {
        
        sendMessage()
          textView.resignFirstResponder()
          return false
      }
    
    let fixedWidth = textView.frame.size.width
    textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    let newSize = textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    var newFrame = textView.frame
    newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
    textView.frame = newFrame;
      
      return true
      
  }
  
  func textViewDidChange(_ textView: UITextView) {
    
    print ("textViewDidChange Height is1 ----------- ",self.messageTextView.frame)
    
    let fixedWidth = textView.frame.size.width
    textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    let newSize = textView.sizeThatFits(CGSize(width: fixedWidth, height: CGFloat.greatestFiniteMagnitude))
    var newFrame = textView.frame
    newFrame.size = CGSize(width: max(newSize.width, fixedWidth), height: newSize.height)
    textView.frame = newFrame;
    self.messageTextView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    
    //self.fundiactivateConst()
    print ("Frame Height is ----------- ",self.messageTextView.frame)
  }
   
}


//MARK: - Table Delegate/Datasource

extension ZDChatController: UITableViewDataSource, UITableViewDelegate {
  
  func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
    //print("tableView dataSource.chatLog.count : ", dataSource.chatLog.count)
    return  dataSource.chatLog.count
  }
  
  func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
      let cellToDeSelect:UITableViewCell = tableView.cellForRow(at: indexPath as IndexPath)!
      cellToDeSelect.contentView.backgroundColor = .clear

    if let chatTextCell = dataSource.chatLog[indexPath.row] as? ChatMessageEventType {
       if(chatTextCell.text.contains("how-to videos") && chatTextCell.type.rawValue=="agentMessage"){
//        print("Index didSelect-------",chatArrayMessages[indexPath.row])
//        print("Index didSelect-------",chatTextCell.text)
        DispatchQueue.main.async {
          if self.onChatCallBack != nil {
            print("onImageCaptured 1 count : ")
            self.onChatCallBack!(["ZendeskiOS": chatTextCell.text])
          }
        }
      }
    }
  }
  
  private func tableView(tableView: UITableView, didDeselectRowAtIndexPath indexPath: NSIndexPath) {
    let cellToDeSelect:UITableViewCell = tableView.cellForRow(at: indexPath as IndexPath)!
    cellToDeSelect.contentView.backgroundColor = .none
   // print("Index deselect-------",indexPath.row)
  }

  func tableView(_ tableView: UITableView, willDisplay cell: UITableViewCell, forRowAt indexPath: IndexPath) {
  
    //let middleIndex = ((tableView.indexPathsForVisibleRows?.first?.row)! + (tableView.indexPathsForVisibleRows?.last?.row)!)/2
    //print("Index willdisplay-------",middleIndex)
  
  }
  
  func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {

    let cell = tableView.dequeueReusableCell(withIdentifier: "chatCell" ) as! ChatTVCell
    cell.selectionStyle = .none
    
    if let chatTextCell = dataSource.chatLog[indexPath.row] as? ChatMessageEventType {

//      let url = URL(string: chatTextCell.text)
//      print("URL ------------- ",url ?? 0)
//      if(chatTextCell.text as AnyObject === "Click here" as AnyObject && chatTextCell.type.rawValue=="agentMessage"){
//      }
      
      let chatMessage1 = ChatMessage(text: chatTextCell.text, isIncoming: chatTextCell.type.rawValue=="agentMessage" ? true : false, isButtonEnable: true);
        
        cell.chatMessage = chatMessage1
  
    }
    return cell
  }
}



extension ZDChatController: ChatView {

  
  func updateChatLog() {
    
//    let tempArray = dataSource.chatLog as? ChatMessageEventType
//    let chatTextCell = dataSource.chatLog[0] as? ChatMessageEventType
//    print ("Send Chat Messaages Array ---------- ", tempArray ?? "")
//    
//    DispatchQueue.main.async {
//      if self.onChatRecievedMessage != nil {
//        print("chatRecievedMessage : ",chatTextCell?.text ?? "Hi")
//        self.onChatRecievedMessage!(["ChatMessagesArray": self.dataSource.chatLog[0].type.rawValue, "ChatMessagesArray1": self.dataSource.chatLog[0].id,  "ChatMessagesArray2": chatTextCell?.text ?? "Hi"])
//      }
//    }
    
    self.tableView.reloadData()
    let last = self.tableView.numberOfRows(inSection: 0) - 1

    if(last < 0) {
      return
    }
    self.updateTableContentInset()
    self.tableView.scrollToRow(at: IndexPath(row: last, section: 0), at: .bottom, animated: true)

    self.tableView.setNeedsLayout()
    self.tableView.layoutIfNeeded()
    print("Test dataSource.chatLog.count : ", self.dataSource.chatLog.count)
  }
}


