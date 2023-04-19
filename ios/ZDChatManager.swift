//
//  ZDChatManager.swift
//  ZD_PK
//
//  Created by valuri_mac on 26/04/21.
//

import Foundation

@objc(ZDChatManager)
class ZDChatManager: RCTViewManager {
  override func view() -> UIView! {

   
    return ZDChatController() //.instanceFromNib()

  }

  override static func requiresMainQueueSetup() -> Bool {
     return true
   }


}
