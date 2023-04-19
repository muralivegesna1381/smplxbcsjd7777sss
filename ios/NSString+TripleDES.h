//
//  NSString+TripleDES.h
//  PetParent
//
//  Created by CarlLiu on 16/4/19.
//  Copyright © 2016 Carl. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonDigest.h>
#import <CommonCrypto/CommonCryptor.h>
#import <Security/Security.h>

@interface NSString (TripleDES)
+ (NSString *)TripleDES:(NSString *)plainText encryptOrDecrypt:(CCOperation)encryptOrDecrypt;

@end
