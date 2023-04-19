//
//  EncryptPassword.m
//  AwesomeProject
//
//  Created by Admin on 12/18/19.
//  Copyright © 2019 Facebook. All rights reserved.
//
//
//#import <Foundation/Foundation.h>

//#import "React/RCTBridgeModule.h"

#import "React/RCTBridgeModule.h"


@interface RCT_EXTERN_MODULE(EncryptPassword, NSObject)
RCT_EXTERN_METHOD(encryptPassword: (NSString *)password callback:(RCTResponseSenderBlock)callback )
@end
