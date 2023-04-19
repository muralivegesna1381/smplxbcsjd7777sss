//
//  ZDChatManager.m
//  ZD_PK
//
//  Created by valuri_mac on 26/04/21.
//

#import <Foundation/Foundation.h>

#import "React/RCTViewManager.h"

@interface RCT_EXTERN_MODULE(ZDChatManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(isVisibleButton, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onChatCallBack, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onChatEndSessionCallBack, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onChatRecievedMessage, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(chatEndSessionValue, BOOL)
RCT_EXPORT_VIEW_PROPERTY(chatSentMessage, [ChatUIEvent]())

@end


