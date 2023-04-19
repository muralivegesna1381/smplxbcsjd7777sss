package com.videoCompression;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

import android.Manifest;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Environment;
import android.util.Log;
import android.webkit.MimeTypeMap;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import com.abedelazizshe.lightcompressorlibrary.CompressionListener;
import com.abedelazizshe.lightcompressorlibrary.VideoCompressor;
import com.abedelazizshe.lightcompressorlibrary.VideoQuality;
import com.abedelazizshe.lightcompressorlibrary.config.Configuration;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import org.apache.commons.io.FilenameUtils;

import java.io.File;
import java.io.IOException;
import java.sql.Time;
import java.util.ArrayList;

public class VideoCompression extends ReactContextBaseJavaModule {
    ReactApplicationContext react_Context;
    public VideoCompression(ReactApplicationContext reactContext) {
        super(reactContext);
        react_Context = reactContext;

    }
    //Mandatory function getName that specifies the module name
    @Override
    public String getName() {
        return "VideoCompression";
    }

    @ReactMethod
    public void getDeviceName(String pass, Callback cb) {
        Log.d("TEST"," onSuccess  "+pass);

        // Here, thisActivity is the current activity
//        if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
//
//            // Permission is not granted// Should we show an explanation?
//            if (ActivityCompat.shouldShowRequestPermissionRationale(getReactApplicationContext(),Manifest.permission.WRITE_EXTERNAL_STORAGE)) {
//                // Show an explanation to the user *asynchronously* -- don't block// this thread waiting for the user's response! After the user// sees the explanation, try again to request the permission.
//            } else {
//                // No explanation needed; request the permissionActivityCompat.requestPermissions(thisActivity,
//                new String[]{Manifest.permission.WRITE_EXTERNAL_STORAGE},
//                        MY_PERMISSIONS_WRITE_EXTERNAL_STORAGE);
//
//                // MY_PERMISSIONS_REQUEST_READ_CONTACTS is an// app-defined int constant. The callback method gets the// result of the request.
//            }
//        } else {
//            // Permission has already been granted
//        }

//        File f = new File(pass);
//        Log.d("File","onStart"+f.exists());
//        Log.d("File","Absolute path"+f.getAbsolutePath());
//        try {
//            Log.d("File","Get Path"+f.getCanonicalPath());
//        } catch (IOException e) {
//            e.printStackTrace();
//        }

        String extention = FilenameUtils.getExtension(pass);
        String fullPath = FilenameUtils.getFullPath(pass);
        String fileName = FilenameUtils.getBaseName(pass);
        Log.d("File","Extention "+extention);
        Log.d("File","Absolute path "+fullPath);
        Log.d("File","FileName "+fileName);

        String destPath = fullPath +fileName +"compressedFile." + extention;
        Log.d("File","desti  "+destPath);

        ArrayList<Uri>  videoList=  new ArrayList<>();
        videoList.add(Uri.fromFile(new File(pass)));

//        String destPath1[] = pass.split("\\.");
//        String destPath = destPath1[0] + "_compressed" + "."+ destPath1[1];
//
        VideoCompressor.start(
                getReactApplicationContext(), // => This is required if srcUri is provided. If not, pass null.
                Uri.fromFile(new File(pass)), // => Source can be provided as content uri, it requires context.
                null, // => This could be null if srcUri and context are provided.
                destPath,
                new CompressionListener() {

                    int progressCount = 1;

                    @Override
                    public void onStart() {
                        // Compression start
                        Log.d("VideoUploadWearables","onStart");
//                        cb.invoke("onStart","started");
                    }

                    @Override
                    public void onSuccess() {
                        // On Compression success
                        Log.d("VideoUploadWearables","onSuccess");
                        cb.invoke(destPath);
                    }

                    @Override
                    public void onFailure(String failureMessage) {
                        // On Failure
                        Log.d("VideoUploadWearables","Failure"+failureMessage);
//                        cb.invoke("fail",failureMessage);
                    }

                    @Override
                    public void onProgress(float v) {
                        WritableMap params = Arguments.createMap();

                        if (Math.round(v) == (10 * progressCount)){
                            progressCount += 1;
                            Log.d("VideoUploadWearables11","Progress "+Math.round(v));
                            params.putString("eventProperty", String.valueOf(v));
                            sendEvent(react_Context, "videoUploadRecieveProgressMsg", params);
                        }

//                        cb.invoke(v);
                        // Update UI with progress value
               /* runOnUiThread(new Runnable() {
                    public void run() {
                        progress.setText(progressPercent + "%");
                        progressBar.setProgress((int) progressPercent);
                    }
                });*/
                    }

                    @Override
                    public void onCancelled() {
                        // On Cancelled
                    }
                }, new Configuration(
                        VideoQuality.MEDIUM,
                        false,
                        false,
                        null /*videoHeight: double, or null*/,
                        null /*videoWidth: double, or null*/,
                        null /*videoBitrate: int, or null*/
                )
        );



    }

    private String getfileExtension(Uri uri)
    {
        String extension;
        ContentResolver contentResolver = getReactApplicationContext().getContentResolver();
        MimeTypeMap mimeTypeMap = MimeTypeMap.getSingleton();
        extension= mimeTypeMap.getExtensionFromMimeType(contentResolver.getType(uri));
        return extension;
    }

    private void sendEvent(ReactContext reactContext,

                           String eventName,@Nullable WritableMap params) {

        reactContext

                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)

                .emit(eventName, params);

    }


}
