////*********** New ***********////

/////// Saving Data ///////
export const IS_USER_LOGGED_INN = "isUserLoggedInn";
export const IS_USER_SKIPPED = "isUserSkipped";
export const DEFAULT_PET_OBJECT = "defaultPetObject";
export const APP_TOKEN = "token";
export const CLIENT_ID = "ClientId";
export const PET_ID = "petId";
export const MODULATITY_OBJECT = "modularityObject";
export const TIMER_PETS_ARRAY = "timerPetsArray";
export const TOTAL_PETS_ARRAY = "totalPetsArray";
export const TIMER_OBJECT = "timerDataObject";
export const ADD_OBSERVATIONS_PETS_ARRAY = "addObservationsPetsArray";
export const POINT_TRACKING_PETS_ARRAY = "pointTrackingPetsArray";
export const QUESTIONNAIR_PETS_ARRAY = "questionnairePetsArray";
export const IS_FIRST_TIME_USER = 'isFirstTimeUser';
export const QUESTIONNAIRE_SELECTED_PET = 'questionnaireSelectedPet';
export const OBS_SELECTED_PET = 'obsSelectedPet';
export const TIMER_SELECTED_PET = 'timerSelectedPet';
export const USER_EMAIL_LOGIN = 'userEmailLogin';
export const USER_PSD_LOGIN = 'userPsdLogin';
export const DEFAULT_PET_OBJECT1 = "defaultPetObject1";
export const FCM_TOKEN = "fcmToken";
export const USER_EMAIL_LOGIN_TEMP = "userEmailLoginTemp";
export const SAVE_SOB_PETS = "saveSOBPets";
export const SAVE_FIRST_NAME = "saveFirstName";
export const SAVE_SECOND_NAME = "saveSecondName";
export const ONBOARDING_OBJ = "onboardingObj";
export const OBSERVATION_DATA_OBJ = "observationDataObj";
export const EATINGENTUSIASTIC_DATA_OBJ = "eatingEnthusiasticDataObj";
export const TIMER_DATA_FLOW_OBJ = "timerDataFlowObj";
export const TIMER_OBJECT_PAUSE_NOTIFICATIONS = "timerObjectPauseNotifications";
export const TIMER_OBJECT_MILLISECONDS = "timerDataObjectMilliSeconds";
export const SENOSR_INDEX_VALUE = "sensorIndexValue";
export const MULTY_SENSOR_INDEX = "multySensorIndex";

export const VIDEO_PATH_OBSERVATION = "videoPathObservation";
export const DELETE_IMG = "deleteImg";
export const DELETE_VIDEO = "deleteVideo";
export const LEADERBOARD_ARRAY = "leaderBoardArray";
export const LEADERBOARD_CURRENT = "leaderBoardCurrent";
export const OBSERVATION_UPLOAD_DATA = "observationUploadData";
export const DELETE_MEDIA_RECORDS = "deleteMediaRecords";
export const UPLOAD_PROCESS_STARTED = "uploadProcessStarted";
export const SENSOR_TYPE_CONFIGURATION = "sensorTypeConfiguration";
export const CONFIGURED_WIFI_LIST = "ConfiguredWIFIList";
export const CONFIGURED_WIFI_SSID_COUNT = "ConfiguredWIFISSIDCount";

export const BEACON_INSTANCE_ID = "beaconInstanceId";

///// Error / Success / Other Messages /////

export const ALERT_FORGOT_PASSWORD_API_FAILURE = "Please check the email you have entered and try again.";
export const LOADER_WAIT_MESSAGE = "Please wait..";
export const OTP_VERIFICATION_CODE_FAILURE = "Please check the verification code and try again";
export const INVALID_PSWD = "Invalid Password";
export const PASSWORD_CREATION_SUCCESS = "Your password reset is successful.";
export const REGISTRATION_SUCCESS = "You have registered successfully to the Wearables app.";
export const EMAIL_ALREADY_EXISTS = "Email already exists";
export const OBSERVATION_LOADING_MSG = "Please wait while we load your data";
export const DASHBOARD_LOADING_MSG = "Please wait while we load your data";
export const DASHBOARD_LEADERBOARD_LOADER_MSG = 'please wait while we get your leaderboard data';
export const BEHAVIOURS_LOADING_MSG = "Please wait while we load your Behaviours data";
export const UPLOAD_OBS_DATA_MSG = "Please wait while we upload your observation data";
export const UPLOAD_OBS_IMAGE_MSG = "Please wait while uploading Image";
export const ALERT_NETWORK = "Connection Failed";
export const NETWORK_STATUS ="You are not connected to the Internet! Please check your connection and try again";
export const CHANGE_PSWD_SUCCESS = "Password is changed successfully";
export const CHANGE_EMAIL_SUCCESS = "Email changed successfully";
export const CHANGE_NAME_SUCCESS = "Name changed successfully";
export const CHANGE_PHONE_SUCCESS = "Mobile number changed successfully";
export const ALERT_INFO = "Success";
export const EMAIL_ERROR_UPDATE ="Email cannot be updated now. Please try again later";
export const NAME_ERROR_UPDATE ="Name cannot be updated now. Please try again later";
export const PHONE_ERROR_UPDATE ="Phone cannot be updated now. Please try again later";
export const LOGIN_FAILED_ALERT = "Login Failed";
export const LOGIN_FAILED_MSG = "Please check your Email and/or Password.";
export const DEVICE_VALIDATION_LOADER_MSG = "Please wait while we validate your sensor";
export const NO_RECORDS_FOUND = "No Records found!";
export const SENSOR_LOADER_MSG = "Please wait while we are setting up the sensor";
export const SENSOR_RETRY_MESSAGE ="Unable to connect! Please shake the sensor to make sure it’s awake.";
export const SENSOR_RETRY_MESSAGE_HPN1 ="Unable to connect! Please make sure that the sensor is in charging mode";
export const SENSOR_RETRY_MESSAGE_2 ="Unable to connect! Please ensure the sensor and your mobile phone are in close proximity.";
export const SENSOR_RETRY_MESSAGE_3 ="Unable to connect! Please contact support@wearablesclinicaltrials.com";
export const SENSOR_CONNECT_ERROR = "Unable to connect! Please contact ";
export const SUPPORT_URL = "support@wearablesclinicaltrials.com";
export const SENSOR_FAIL_1 = "No SSID, Wifi connection was not attempted";
export const SENSOR_FAIL_2 ="Invalid Wi-Fi Network Name (SSID) or Password. Please check and try again.";
export const SENSOR_FAIL_3 ="Invalid Wi-Fi Network Name (SSID). Please check and try again";
export const SENSOR_FAIL_4 = "Invalid Password. Please check and try again. ";
export const SENSOR_FAIL_5 ="Timed Out Access Point Connection Attempt, failed Wifi access point connection";
export const SENSOR_FAIL_6 = "Failed Rudp server connection";
export const SENSOR_FAIL_7 ="Wifi connection aborted due to low bandwidth between Sensor and Rudp server.";
export const SENSOR_FAIL_8 ="Wifi connection aborted due to Sensor low battery condition detected during Rudp upload.";
export const ALERT_DEFAULT_TITLE = "Alert";
export const DEVICE_MISSING_DASHBOARD = "Oops! No Sensor seems to be associated with your pet";
export const DEVICE_PENDING_DASHBAORD = "Please complete the sensor setup for your pet as it is still pending.";
export const LOGIN_LOADER_MSG = "Logging In…";
export const SPLASH_LOADER_MSG = "PREPARING YOUR DATA. PLEASE WAIT..";//"Preparing your data. Please wait..";
export const OTP_LOADER_MSG = "Please wait while we validate your verification code";
export const CREATE_PSD_LOADER_MSG = "Please wait while we create your account";
export const DEFAULT_UPDATE_LOADER_MSG = "Please wait while we process your request";
export const SERVICE_FAIL_MSG = "Woof! There seems to be a problem. Please try after sometime.";
export const SERVICE_FAIL_IMG_FB_MSG = "Woof! There seems to be a problem while uploading the media. Please try after sometime.";
export const QUSTIONNAIRES_NOT_FOUND = "No Questionnaires found!";
export const QUESTIONNAIRE_LOADING_MSG = "Please wait while we load your data";
export const QUESTIONS_ANSWER_MSG = "Please answer at least one question to save the Questionnaire.";
export const QUESTIONS_ANSWER_BACKBTN_MSG = "Would you like to save the information before leaving?";
export const QUESTIONS_MANDATORY_MSG = "Please answer all the mandatory questions!";
export const QUESTIONS_MIN_ANSWER_MSG = "Answer Atleast one Question in order to submit";
export const QUESTIONS_SUBMIT_SUCCESS_MSG = "Thank You! Your responses are submitted."
export const NO_OBSERVATIONS_FOUND = "No observations found!";
export const TIMER_LOGOUT_MSG = "Logging out of the app while the Timer is running is not permitted.";
export const LOG_OUT_MSG = "Are you sure, you want to logout?";
export const PET_CREATE_UNSUCCESS_MSG = "Unable to add your pet, please try again later";
export const PET_CREATE_SUCCESS_MSG = "You have successfully onboarded your pet.";
export const DASHBOARD_QUEST_LOADING_DATA = "Please wait while we load your Questionnaire's";
export const SYNC_SUCCESS = "Sync completed successfully";
export const SYNC_FAIL = "Sync unsuccessful";
export const FIRMWARE_SUCCESS = "Firm setting completed successfully";
export const FIRMWARE_FAILED = "No Firmware update found!";
export const FIRMWARE_UPTO_DATE = "Firmware is upto date";
export const FIRMWARE_CONFIRMATION ="Do you wish to check for the latest firmware update?";
export const RESTORE_FACTORY_SUCCESS = "Factory settings restored successfully";
export const RESTORE_FACTORY_FAIL = "Restore Factory settings  unsuccessfull";
export const RESTORE_FACTOTY_CONFIRMATION = "Are you sure you wish to restore your sensor to factory settings?";
export const ERASE_SENSOR_SUCCESS = "Sensor data erased successfully";
export const ERASE_SENSOR_FAIL = "Sensor data erased unsuccessfully";
export const SYNC_CONFIRMATION = "Are you sure you wish to sync sensor data to cloud?";
export const ERASE_CONFIRMATION = "Are you sure you wish to erase sensor data that has not been sent to the cloud?";
export const LOCATION_PERMISSION = "Location permission is required to find the sensor. Please enable location services from Settings > Location Services to proceed further.";
export const ENABLE_BLUETOOTH_MESSAGE = "Please enable Bluetooth to manage the sensor";
export const SENSOR_ASSIGN_PET_SUCCESS_MSG = "The sensor is successfully assigned to your pet. Next, please click on the Configure button below to complete the sensor configuration.";
export const NO_TIMER_LOGS = "Sorry. There are no logs to show here....";
export const NO_FEEDBACK_LOGS = "Sorry. There are no records to show here....";
export const MAX_VIDEO_DURATION_MSG = "Please ensure the video duration is less than 5 minutes";
export const NO_RECORDS_LOGS = "It's an empty bowl!";
export const NO_RECORDS_LOGS1 = "No records found.";
export const BCSCORING_SUCCESS_MSG = "Your pet’s BCS score has been submitted successfully";
export const BFISCORING_SUCCESS_MSG = "Your pet’s BFI score has been submitted successfully";
export const HWPMEASUREMENT_SUCCESS_MSG = "Your pet’s HWP measurements has been submitted successfully";
export const STOOL_SCORING_SUCCESS_MSG = "Your pet’s Stool score has been submitted successfully";
export const BLE_ENABLE_MSG = "Please enable Bluetooth in order to continue";
export const UPLOAD_OBS_SUBMIT_MSG = "Your observation is now being uploaded and can be tracked on the dashboard."+ "\n" + "It's recommended to stay on the app while the observation is being uploaded.";
export const UPLOAD_OBS_SUBMIT_MSG_ANDROID = "Your observation is now being uploaded and can be tracked on the dashboard."+ "\n" + "It's recommended not to close the app while the observation is being uploaded.";
export const UPLOAD_OBS_REQUEST_MSG_IOS = "Your observation is now being uploaded and can be tracked on the dashboard.We recommend you stay on the app while we upload the observation details.";
export const UPLOAD_OBS_REQUEST_MSG_ANDROID = "We recommend not to close the app while we upload the observation media. We will let you know once the observation media upload is successful. ";
export const UPLOAD_OBS_LOGOUT_MSG = "The observation media upload is still in progress. We recommend not to Logout from the app until the media upload is complete.";
export const NETWORK_TYPE_WIFI = "Uploading media cannot be happen in Cellular Network! Please switch on your Wi-Fi and try again";
export const DELETE_OBS_MSG = "Are you sure you want to delete this observation?";
export const EDIT_OBS_MSG = "Are you sure you want to edit this observation?";
export const AUTO_LOGOUT_MSG = "Multiple sessions for the same login are not permitted. You will now be logged out.";


//Your observation is now being uploaded and can be tracked on the dashboard.We recommend you stay on the app while we upload the observation details.

/////// Old App Constants//////


export const PERIPHERAL_ID_KEY = "peripheralId";

export const PET_NUMBER = "noOfPets";
export const INSTANT_PETID = "instantPetID";

export const SENSOR_TYPE = "sensor_Type";


export const PET_NAME_SENSOR_DISPLAY = "petNameSensorDisplay";
export const PET_ID_WIFINAME_UPLOAD = "petIDSensorWifiNameUpload";
export const IS_SETUP_DONE = "isSetupDOne";
export const DEVICE_NUMBER_SENSOR_DISPLAY = "deviceNumberSensorDisplay";
export const SCREEN_FLOW = "screenflow";
export const NEW_USER_PET_COUNT = "newUserPetCount";
export const DEVICE_NAME = "deviceNameIdentity";
export const USER_EMAIL = "userEmail";


export const TIMER_OBJECT_ANDROID_NOTI_STOP = "timerDataObjectAndroidNotiStop";
export const TIMER_PET_DETAILS_OBJECT = "timerPetDetailsObject";
export const TIMER_CATEGORY_DETAILS_OBJECT = "timerCategoryDetailsObject";
export const TIMER_STATE = "timerState";
export const TIMER_OBJECT_POP_INCREASE_TIMER ="timerDataObjectPopIncreaseTimer";
export const TIMER_OBJECT_POP_PAUSE_TIMER = "timerDataObjectPopPauseTimer";
export const TIMER_OBJECT_TIMER_DIFF = "timerObjectTimerDiff";
export const USER_PASSWORD = "userPassword";
export const DEVICE_NUMBER = "deviceNumber";
export const EMAIL_MATCH = "Email mismatch!";
export const ALERT = "Alert";
export const MANDATORY = "All fields are mandatory";
export const EMAIL_NOT_CORRECT = "Invalid Mail ID. Please check the mail ID format and try again";
export const ERROR_UPDATING_DATA ="There seems to be a problem in processing you request. Please try after sometime.";
export const PHONE_COUNT = "Please enter a valid phone number";
export const FIRST_LAST_EMPTY = "All fields are mandatory";
export const PSWD_EMPTY = "Both fields are mandatory";
export const PSWD_LENGTH = "Password does not conform to the password policy";
export const PSWD_MATCH = "Password and Confirm password should be same";
export const OLD_NEW_PSWD_MATCH ="Old password and new password cannot be same";
export const DEVICE_TYPE = "deviceType";
export const EMAIL_NOT_EXISTS = "Email does not exist!";
export const VERIFICATION_CODE ="Please check the verification code and try again";
export const OBSER_LENGTH = "Please enter an Observation name";
export const OBSER_DATE = "Please select a date";

export const EMAIL_EMPTY = "Please enter e-mail";

export const ALERT_FORGOT_PASSWORD_SUCCESS ="Please check your registered email for password reset details.";
export const ALERT_FORGOT_PASSWORD_FAILURE ="Please check the email you have entered and try again.";
export const FEEDBACK_SUCCESS_MSG_TITLE = "Thank You";
export const FEEDBACK_UN_SUCCESS_MSG_TITLE = "Sorry";
export const FEEDBACK_SUCCESS_MSG = "Your feedback is submitted successfully";
export const FEEDBACK_UN_SUCCESS_MSG = "Please contact System Administrator!";
export const FEEDBACK_ALERT = "Please enter the feedback";
export const APP_STATE = "appState";



export const isFIRST_USER = "false";


export const HPN_SENSOR_RETRY_MESSAGE = "Unable to connect! Please ensure your sensor is plugged in and charging (Green long flash).";

export const ENABLE_LOGGER = "disable";

export const BEACON_INFO_ARRAY= "beaconInfoArray";
export const ZDCHAT_MINIMIZE_STATUS = "zdChatMinimizeStatus";
export const ZDCHAT_MESSAGES_ARRAY= "zdChatMessagesArray";
export const APP_STATE_CHATBOT = "appStateChatbot";
export const ZDCHAT_ENDED_STATUS= "zdChatEndedStatus";
export const ZDCHAT_DEFAULT_MSG_DATE= "zdChatDefaultMsgDate";
export const ZDCHAT_DEFAULT_DATE_SET_VALUE= "zdChatDefaultDateSetValue";
export const PET_TIMER_ARRAY = "petTimerArray";
export const SELECTED_PETID_OBSER = "selectedPetIdObser";
export const TOTAL_PETS_QUESTIONNAIRE = "totalPetsQuestionnaire";
export const SAVE_DROPDOWN_DICTIONARY = "saveDropdownDictionary";
export const TIMER_CHANGE_OPEN_STATUS = "timerChangeOpenStatus";


