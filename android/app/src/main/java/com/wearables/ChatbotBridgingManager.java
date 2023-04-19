package com.wearables;

import android.os.Build;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.zendesk.service.CancellableCompositeZendeskCallback;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import zendesk.chat.Chat;
import zendesk.chat.ChatLog;
import zendesk.chat.ChatProvider;
import zendesk.chat.ChatState;
import zendesk.chat.ConnectionProvider;
import zendesk.chat.ConnectionStatus;
import zendesk.chat.ObservationScope;
import zendesk.chat.Observer;
import zendesk.chat.Providers;

public class ChatbotBridgingManager extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";
    private static ReactApplicationContext reactContext;
    final String zendURL = "https://mobileteamctepl.zendesk.com/";
    final String appID = "302323408370970625";
    final String clientId = "MpzFQA7e6CzxRsL6OzuOfxGwCcSVmvIV";
    ObservationScope observationScope = null;
    ChatProvider chatProviders = null;
    Boolean isChatConnected = false;
    private ConnectionProvider connectionProvider = null;

    public ChatbotBridgingManager(@NonNull ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    public String getName() {
        return "ZDChatbotAndroidBridging";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
        constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
        return constants;
    }

    @ReactMethod
    public void zdChatAndroidConnector(
            String password,
            Callback successCallback) throws Exception {

        Log.d("Hello", "Chatbot");
    }

    @ReactMethod
    public void zdChatInitializer(
            String chatMsg,
            Callback successCallback) throws Exception {

        Chat.INSTANCE.init(reactContext, clientId, appID);
        //Logger.setLoggable(true);
        Providers providers = Chat.INSTANCE.providers();
        if (providers == null) {
            return;
        }

        connectionProvider = providers.connectionProvider();
        connectionProvider.connect();
        observationScope = new ObservationScope();
        connectionProvider.observeConnectionStatus(new ObservationScope(), new Observer<ConnectionStatus>() {
            @Override
            public void update(ConnectionStatus connectionStatus) {
                if (connectionStatus == ConnectionStatus.CONNECTED) {
                    isChatConnected = true;
                    sendChatMessage(chatMsg);
                } else {
                    isChatConnected = false;
                }
            }
        });
        Chat.INSTANCE.clearCache();
        chatProviders = Chat.INSTANCE.providers().chatProvider();
        chatProviders.observeChatState(observationScope, new Observer<ChatState>() {
            @RequiresApi(api = Build.VERSION_CODES.N)
            @Override
            public void update(ChatState chatState) {
//                Log.d("TEST_ZENDESK", "LOGS--> :" + chatState.getChatLogs());
//                Log.d("TEST_ZENDESK", "" + chatState.isChatting());
                List<ChatLog> chatList = chatState.getChatLogs();
                String chatId = chatState.getChatId();

                String currentChatId = chatProviders.getChatState().getChatId();
//                Log.d("TEST_ZENDESK1111111", "List Array " +chatList);
//                Log.d("TEST_ZENDESK222222", "Chat Id " +chatId);

                WritableMap params = Arguments.createMap();

                List<ChatLog> chatArrayListObject = new ArrayList<ChatLog>();
//                chatArrayListObject = chatList;

                if(currentChatId == chatId){

                    chatArrayListObject = chatList;
                }
                Gson gson = new Gson();
                String listString = gson.toJson(
                        chatArrayListObject,
                        new TypeToken<ArrayList<ChatLog>>() {
                        }.getType());

                try {
                    JSONArray jsonArray = new JSONArray(listString);
//                    Log.e("TAGGG_JSON--------->", "" + jsonArray.length());
                    JSONArray finalArray = new JSONArray();
                    String[] finalString = new String[jsonArray.length()];

                    JSONObject tempJson = jsonArray.getJSONObject(0);
//                    Log.d("TEST_ZENDES333333", "Chat Id " +tempJson);

                    for (int i = 0; i < jsonArray.length(); i++) {
                        try {
                            JSONObject chatJsonObject = jsonArray.getJSONObject(i);

                            JSONObject finalJson = new JSONObject();
                            if (chatJsonObject.has("message")) {
                                finalJson.put("text", chatJsonObject.opt("message"));
                                if (chatJsonObject.has("id")) {
                                    finalJson.put("id", chatJsonObject.opt("id"));

                                }

                                if (chatJsonObject.has("chatParticipant")) {
                                    //change to visitorMessage from VISITOR
                                    if(chatJsonObject.optString("chatParticipant").equals("VISITOR")){
                                        finalJson.put("type", "visitorMessage");
                                    }
                                    else if (chatJsonObject.optString("chatParticipant").equals("TRIGGER")){
                                        finalJson.put("type", "agentMessage");
                                    }

                                }

                                if (chatJsonObject.has("createdTimestamp")) {
                                    //Fri, 21 May 2021 18:24:02 +0530

                                    finalJson.put("timeStamp", chatJsonObject.opt("createdTimestamp"));

                                }
                                finalArray.put(finalJson);
                                finalString[i]= finalJson.toString();

                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                    }

//                    Log.d("Final array------->", finalArray.toString());
//                    Log.d("Final string------->", finalString.toString());

                    params.putString("eventProperty", finalArray.toString());
                    sendEvent(reactContext, "zenDeskRecievedMsgsEvents", params);

                } catch (JSONException e) {
                    e.printStackTrace();
                }

            }
        });
    }

    @ReactMethod
    public void zdChatEnd(
            String password,
            Callback successCallback) throws Exception {

        //Log.d("Hello", "Chatbot");

        chatEnd();
    }


    private void sendEvent(ReactContext reactContext,

                           String eventName,

                           @Nullable WritableMap params) {

        reactContext

                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)

                .emit(eventName, params);

    }

    public void sendChatMessage(String message) {
        chatProviders.sendMessage(message);
    }

    public void chatEnd() {

        if(chatProviders!=null){
            //chatProviders.clearDepartment(new CancellableCompositeZendeskCallback<>());
            chatProviders.endChat(new CancellableCompositeZendeskCallback<>());
            //connectionProvider.disconnect();
        }

    }

}
