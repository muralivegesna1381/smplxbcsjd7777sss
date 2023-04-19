//
//  ChatTVCell.swift
//  ZD_PK
//
//  Created by valuri_mac on 27/04/21.
//

import UIKit

class ChatTVCell: UITableViewCell {
  
  var titleLabel = UILabel()
  
  let messageLabel = UILabel()
  let bubbleBackgroundView = UIView()
  //let buttonNavigation = UIButton()

  var leadingConstraint: NSLayoutConstraint!
     var trailingConstraint: NSLayoutConstraint!
  
  var chatMessage: ChatMessage! {
      didSet {
          bubbleBackgroundView.backgroundColor = chatMessage.isIncoming ? .white : UIColor(red: 55/255.0, green: 181/255.0, blue: 124/255.0, alpha: 1)
          messageLabel.textColor = chatMessage.isIncoming ? .black : .white
        //buttonNavigation.backgroundColor = .red
          
//          messageLabel.text = chatMessage.text
        let stringOne = chatMessage.text
        let stringTwo = "link"

        let range = (stringOne as NSString).range(of: stringTwo)
        let attributedText = NSMutableAttributedString.init(string: stringOne )
        attributedText.addAttribute(NSAttributedString.Key.foregroundColor, value: UIColor.blue , range: range)

        messageLabel.attributedText = attributedText
          
          if chatMessage.isIncoming {
              leadingConstraint.isActive = true
              trailingConstraint.isActive = false
          } else {
              leadingConstraint.isActive = false
              trailingConstraint.isActive = true
          }
      }
  }
  
  override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
    super.init(style: style, reuseIdentifier: reuseIdentifier)
    print("reuseIdentifier");
    backgroundColor = .clear
     bubbleBackgroundView.backgroundColor = .yellow
            bubbleBackgroundView.layer.cornerRadius = 10
            bubbleBackgroundView.translatesAutoresizingMaskIntoConstraints = false
            addSubview(bubbleBackgroundView)
            //addSubview(buttonNavigation)
            addSubview(messageLabel)
            
    
    //        messageLabel.backgroundColor = .green
//            messageLabel.text = "We want to provide a longer string that is actually going to wrap onto the next line and maybe even a third line."
            messageLabel.numberOfLines = 0
            messageLabel.translatesAutoresizingMaskIntoConstraints = false
            
            // lets set up some constraints for our label
            let constraints = [
             
              
              
              messageLabel.topAnchor.constraint(equalTo: topAnchor, constant: 32),
//            messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32),
            messageLabel.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -32),
            messageLabel.widthAnchor.constraint(equalToConstant: 250),
            
            
//                         buttonNavigation.topAnchor.constraint(equalTo: topAnchor, constant: 32),
//                         //            messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32),
//                                     buttonNavigation.bottomAnchor.constraint(equalTo: bottomAnchor, constant: -32),
//                                     buttonNavigation.widthAnchor.constraint(equalToConstant: 250),
            
            bubbleBackgroundView.topAnchor.constraint(equalTo: messageLabel.topAnchor, constant: -24),
            bubbleBackgroundView.leadingAnchor.constraint(equalTo: messageLabel.leadingAnchor, constant: -16),
            bubbleBackgroundView.bottomAnchor.constraint(equalTo: messageLabel.bottomAnchor, constant: 24),
            bubbleBackgroundView.trailingAnchor.constraint(equalTo: messageLabel.trailingAnchor, constant: 16),
            ]

            NSLayoutConstraint.activate(constraints)
    
    leadingConstraint = messageLabel.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32)
    leadingConstraint.isActive = false

    trailingConstraint = messageLabel.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -32)
    trailingConstraint.isActive = true
    
//    leadingConstraint = buttonNavigation.leadingAnchor.constraint(equalTo: leadingAnchor, constant: 32)
//    leadingConstraint.isActive = false
//
//    trailingConstraint = buttonNavigation.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -32)
//    trailingConstraint.isActive = true
    
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

  
  func configureTitleLabel() {
    titleLabel.numberOfLines = 0
    titleLabel.font = UIFont.boldSystemFont(ofSize: 14)
    titleLabel.textColor = .red
  }
  
  
  func setupConstraint() {
    titleLabel.translatesAutoresizingMaskIntoConstraints = false
    titleLabel.centerYAnchor.constraint(equalTo: contentView.centerYAnchor).isActive = true
    titleLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 20).isActive = true
    titleLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -20).isActive = true
    titleLabel.heightAnchor.constraint(equalToConstant: 80).isActive = true
  }
}

