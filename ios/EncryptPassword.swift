//
//  EncryptPassword.swift
//  AwesomeProject
//
//  Created by Admin on 12/18/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import Foundation
import CommonCrypto

@objc(EncryptPassword)
class EncryptPassword: NSObject {

  @objc(encryptPassword:callback:)
  func encryptPassword(_ password: String, callback: RCTResponseSenderBlock) {
    let encryptedPassword = NSString.tripleDES(password, encryptOrDecrypt: CCOperation(kCCEncrypt))
    callback([encryptedPassword])
  }
  
 
  
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
