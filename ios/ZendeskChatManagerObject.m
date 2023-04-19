//
//  ZendeskChatManagerObject.m
//  Wearables
//
//  Created by Cambridge Technology Inc on 08/05/21.
//  Copyright © 2021 Facebook. All rights reserved.
//

#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(ZendeskChatManagerObject, NSObject)

RCT_EXTERN_METHOD(initialiseZendeskChat: (NSString *)startChating callback:(RCTResponseSenderBlock)callback )
RCT_EXTERN_METHOD(zendeskSentMessage: (NSString *)messageText callback:(RCTResponseSenderBlock)callback )
RCT_EXTERN_METHOD(zendeskRecievedMessages: (NSString *)messageRecieved callback:(RCTResponseSenderBlock)callback )
RCT_EXTERN_METHOD(zendeskEndChat: (NSString *)stopChat callback:(RCTResponseSenderBlock)callback )

@end

