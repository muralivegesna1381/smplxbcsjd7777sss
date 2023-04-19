package com.passwordenvryption;


import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.wearables.BASE64Encoder;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.DESedeKeySpec;

public class PasswordEncryption extends ReactContextBaseJavaModule {
    //constructor
    public PasswordEncryption(ReactApplicationContext reactContext) {
        super(reactContext);
    }
    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "Device";
    }
    //Custom function that we are going to export to JS
    @ReactMethod
    public void getDeviceName(String pass, Callback cb) {
        try{
            // cb.invoke(null, android.os.Build.MODEL);

            String key = "8com.itlogica.petparent8";
            DESedeKeySpec dks = new DESedeKeySpec(key.getBytes("UTF-8"));
            SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DESede");
            SecretKey securekey = keyFactory.generateSecret(dks);

            Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
            cipher.init(Cipher.ENCRYPT_MODE, securekey);
            byte[] b = cipher.doFinal(pass.getBytes());

            // BASE64Encoder encoder = new BASE64Encoder();
            BASE64Encoder encoder = new  BASE64Encoder();

            String encryptPassword = encoder.encode(b).replaceAll("\r", "").replaceAll("\n", "");
            cb.invoke(encryptPassword);


        }catch (Exception e){
            cb.invoke(e.toString(), null);
        }
    }



    @ReactMethod
    public void encryptPassword(
            String password,
            Callback successCallback) throws Exception {
        String key = "8com.itlogica.petparent8";
        DESedeKeySpec dks = new DESedeKeySpec(key.getBytes("UTF-8"));
        SecretKeyFactory keyFactory = SecretKeyFactory.getInstance("DESede");
        SecretKey securekey = keyFactory.generateSecret(dks);

        Cipher cipher = Cipher.getInstance("DESede/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, securekey);
        byte[] b = cipher.doFinal(password.getBytes());

        // BASE64Encoder encoder = new BASE64Encoder();
        BASE64Encoder encoder = new  BASE64Encoder();

        String encryptPassword = encoder.encode(b).replaceAll("\r", "").replaceAll("\n", "");
        successCallback.invoke(encryptPassword);
    }

    @ReactMethod
    public void getCompressFile(String pass, Callback cb) {
        Log.d("TEST"," onSuccess  ");
        cb.invoke("Encryption done");

    }

}