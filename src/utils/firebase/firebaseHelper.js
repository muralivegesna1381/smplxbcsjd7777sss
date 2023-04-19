import analytics from '@react-native-firebase/analytics';
import * as Constant from "../../utils/constants/constant";
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";

let isAnalyticsEnabled = true;

/////////////////////////// Screens //////////////////////////
export const screen_appInitial = 'App_Initial_Page';
export const screen_appInitial_tutorial = 'App_Initial_Tutorial_Page';
export const screen_login = 'Login_Page';
export const screen_forgrotPassword = 'Forgot_Password_Page';
export const screen_otp = 'OTP_Page';
export const screen_pswd = 'Password_Page';
export const screen_change_password = 'Change_Password_Page';
export const screen_change_name = 'Change_Password_Page';
export const screen_change_phone = 'Change_Password_Page';
export const screen_dashboard = 'Dashboard_Page';
export const screen_observations = 'Observations_List_Page';
export const screen_quick_video = 'Observations_Quick_Video_Page';
export const screen_view_observations = 'View_Observation_Page';
export const screen_add_observations_date = 'Add_Observations_Date_Page';
export const screen_add_observations_pets = 'Add_Observations_Pets_Selection_Page';
export const screen_add_observations_text_beh = 'Add_Observations_Text_Behavior_Page';
export const screen_add_observations_media = 'Add_Observations_Media_Page';
export const screen_add_observations_review = 'Add_Observations_Review_Page';
export const screen_menu = 'Menu_Page';
export const screen_questionnaire_study = 'Questionnaire_Study_Page';
export const screen_questionnaire_questions = 'Questionnaire_Questions_Page';
export const screen_account_main = 'Account_Main_Page';
export const screen_timer_main = 'Timer_Main_Page';
export const screen_timer_activity = 'Timer_Activity_Page';
export const screen_timer_pets = 'Timer_Pets_Page';
export const screen_timer_time_duration = 'Timer_Time_Duration_Page';
export const screen_timer_logs = 'Timer_Logs_Page';
export const screen_timer_widget = 'Timer_Widet_Page';
export const screen_campaign = 'Campaign_Page';
export const screen_pet_edit = 'Pet_Edit_Page';
export const screen_SOB_petName = 'SOB_Pet_Name_Page';
export const screen_SOB_petGender = 'SOB_Pet_Gender_Page';
export const screen_SOB_petNeutered = 'SOB_Pet_Neutered_Page';
export const screen_SOB_petBreed = 'SOB_Pet_Breed_Page';
export const screen_SOB_petAge = 'SOB_Pet_Age_Page';
export const screen_SOB_petWeight = 'SOB_Pet_Weight_Page';
export const screen_SOB_petFeeding = 'SOB_Pet_Feeding_Pref_Page';
export const screen_SOB_petType = 'SOB_Pet_Type_Page';
export const screen_SOB_sensorType = 'SOB_Sensor_Type_Page';
export const screen_SOB_deviceNumber = 'SOB_Device_Number_Page';
export const screen_SOB_Review = 'SOB_Device_Review_Page';
export const screen_support = 'Support_Page';
export const screen_learning_center = 'Learning_Center_Page';
export const screen_app_orientation = 'App_Orientation_Page';
export const screen_chatbot = 'Chatbot_Page';
export const screen_eating_enthusiasm = 'Eating_Enthusiasm_Page';
export const screen_eating_enthusiasm_date = 'Eating_Enthusiasm_Date_Page';
export const screen_eating_enthusiasm_time = 'Eating_Enthusiasm_Time_Page';
export const screen_image_based_score = 'Image_based_scoring_Page';
export const screen_image_based_score_measurements = 'Image_based_scoring_measurements_Page';
export const screen_image_based_score_image_upload = 'Image_based_scoring_Image_Upload_Page';
export const screen_Senosor_Initial = 'Sensor_Initial_Page';
export const screen_Sensor_charge_confirm = 'Sensor_Charge_Confirm_Page';
export const screen_sensor_select_screen = 'Sensor_Select_Action_Page';
export const screen_find_sensor = 'Find_Sensor_Page';
export const screen_connect_sensor = 'Connect_Sensor_Page';
export const screen_sensor_nearby_wifi = 'Sensor_NearBy_WIFI_Page';
export const screen_sensor_add_manually = 'Sensor_Add_Maually_Page';
export const screen_sensor_pn_noti_initial = 'Sensor_Push_Noti_Instructions_Page';
export const screen_sensor_pn_noti = 'Sensor_Push_Notifications_Permissions_Page';
export const screen_sensor_command_component = 'Sensor_Command_Settings_Page';
export const screen_sensor_firmware = 'Sensor_Firmware_Page';
export const screen_sensor_connect_common = 'Sensor_Connect_Common_Page';
export const screen_sensor_HPN1_WiFi = 'Sensor_HPN1_Configured_WiFi_List_Page';
export const screen_sensor_write_details = 'Sensor_Write_Details_Page';
export const screen_multipleDevices = 'Multiple_Devices_Page';
export const screen_rewards = 'Reward_Points_Page';
export const screen_leaderBoard = 'LeaderBoard_Page';
export const screen_pet_history_weight = 'Pet_Weight_History_Page';
export const screen_pet_weight_enter = 'Enter_Pet_Weight_New_Page';
export const screen_auto_questionnaire_questions = 'Automated_checkin_Questionnaire_Page';
export const screen_feedback = 'Feedback_Page';
export const screen_send_feedback = 'Send_Feedback_Page';
export const screen_view_feedback = 'View_Feedback_Page';
export const screen_privacy = 'View_Privacy_Page';
export const screen_settings = 'View_Settings_Page';
export const screen_faqs = 'View_Faqs_Page';
export const screen_user_guides = 'View_User_Guides_Page';
export const screen_tutorial_videos_guides = 'View_Tutorial_Videos_Page';
export const screen_register_account = 'Register_Account_Page';
export const screen_register_parent_profile_account = 'Register_Account_Parent_Profile_Page';
export const screen_beacons_locations = 'Beacons_Locations_Page';
export const screen_beacons_list = 'Beacons_List_Page';
export const screen_connect_beacons = 'Connect_Beacons_Page';
export const screen_beacons_instructions = 'Beacons_Instructions_Page';
export const screen_beacons_range_screen = 'Beacons_Range_Configure_Page';
export const screen_pdfViewer_screen = 'PDF_Viewer_Page';

/////////////////////////// Events //////////////////////////

/////////////////////////// Initial Page //////////////////////////
export const event_initial_internet_check = 'InitialPage_InternetCheck';
export const event_initial_background_upload = 'InitialPage_ObsUpload_Check';
export const event_initial_user_logged_status = 'InitialPage_Login_Status';
export const event_initial_login_success = 'InitialPage_Login_Success';
export const event_initial_login_fail = 'InitialPage_Login_Fail';
export const event_initial_Pets_success = 'InitialPage_Pets_Success';
export const event_initial_Pets_fail = 'InitialPage_Pets_Fail';
export const event_initial_modular_success = 'InitialPage_Modular_Success';
export const event_initial_default_pet = 'InitialPage_Default_Pet';
export const event_initial_user_status = 'InitialPage_User_Status';
export const event_initial_user_details_success = 'InitialPage_User_Details_Success';
export const event_initial_user_details_fail = 'InitialPage_User_Details_Fail';

export const event_next_success = 'Tutorial_Skip_Button_Trigger';

/////////////////////////// Login Page //////////////////////////
export const event_login = 'LoginAction_Trigger';
export const event_login_fail = 'LoginFail_Trigger';
export const event_login_success = 'LoginSuccess_Trigger';
export const event_login_getPets_success = 'Login_GetPets_Success_Trigger';
export const event_login_getPets_fail = 'LoginFail_GetPets_Fail_Trigger';
export const event_login_getModularity_success = 'Login_GetModularity_Success_Trigger';
export const event_login_getModularity_fail = 'Login_GetPets_Fail_Trigger';
export const event_login_user_details_success = 'LoginPage_User_Details_API_Success';
export const event_login_user_details_fail = 'LoginPage_User_Details_API_Fail';
export const event_login_forgotPswd = 'Login_Forgot_Password_Trigger';
export const event_login_registration = 'Login_Registration_Trigger';

/////////////////////////// Forgot Password Page //////////////////////////
export const event_forgot_password = 'ForgotPassword_Action_Trigger';
export const event_forgot_password_api_success = 'ForgotPassword_Api_Success';
export const event_forgot_password_api_fail = 'ForgotPassword_Api_Fail';

/////////////////////////// OTP Page //////////////////////////
export const event_OTP = 'OTP_Action_Trigger';
export const event_otp_api_success = 'OTP_Api_Success';
export const event_OTP_api_fail = 'OTP_Api_Fail';

/////////////////////////// Password Page //////////////////////////
export const event_password = 'Password_Action_Trigger';
export const event_password_api_success = 'Password_Api_Success';
export const event_password_api_fail = 'Password_Api_Fail';

/////////////////////////// Account Main Page //////////////////////////
export const event_account_edit_action = 'Account_Edit_Action_Trigger';
export const event_account_logout = 'Account_Logout_Action_Trigger';
export const event_account_main_api = 'Account_Main_Api_Trigger';
export const event_account_main_api_success = 'Account_Main_Api_Success';
export const event_account_main_api_fail = 'Account_Main_Api_Fail';

/////////////////////////// Change Password Page //////////////////////////
export const event_change_password = 'Change_Password_Action_Trigger';
export const event_change_password_api_success = 'Change_Password_Api_Success';
export const event_change_password_api_fail = 'Change_Password_Api_Fail';

/////////////////////////// Change Name Page //////////////////////////
export const event_change_name = 'Change_Name_Action_Trigger';
export const event_change_name_api_success = 'Change_Name_Api_Success';
export const event_change_name_api_fail = 'Change_Name_Api_Fail';

/////////////////////////// Change Phone Page //////////////////////////
export const event_change_phone = 'Change_Phone_Action_Trigger';
export const event_change_phone_api_success = 'Change_Phone_Api_Success';
export const event_change_phone_api_fail = 'Change_Phone_Api_Fail';

/////////////////////////// Dashboard Page //////////////////////////
export const event_dashboard_timer_widget = 'Dashboard_Timer_Widget_Trigger';
export const event_dashboard_Android_bk = 'Dashboard_Android_Back_Btn_Trigger';
export const event_dashboard_Timer_Quick = 'Dashboard_Timer_Quick_Btn_Trigger';
export const event_dashboard_ChatBot = 'Dashboard_Chatbot_Btn_Trigger';
export const event_dashboard_Menu = 'Dashboard_Menu_Btn_Trigger';
export const event_dashboard_Quick_Video = 'Dashboard_Quick_Video_Btn_Trigger';
export const event_dashboard_Support = 'Dashboard_Support_Btn_Trigger';
export const event_dashboard_getPets_success = 'Dashboard_Getpets_Success_Trigger';
export const event_dashboard_getPets_fail = 'Dashboard_Getpets_Fail_Trigger';
export const event_dashboard_getModularity_success = 'Dashboard_Modularity_Success_Trigger';
export const event_dashboard_getModularity_fail = 'Dashboard_Modularity_Fail_Trigger';
export const event_dashboard_getQuestionnaire_success = 'Dashboard_Get_Questionnaire_Success_Trigger';
export const event_dashboard_getQuestionnaire_fail = 'Dashboard_Get_Questionnaire_Fail_Trigger';
export const event_dashboard_getCampaign_success = 'Dashboard_Get_Campaign_Success_Trigger';
export const event_dashboard_getCampaign_fail = 'Dashboard_Get_Campaign_Fail_Trigger';
export const event_dashboard_getLeaderboard_success = 'Dashboard_Get_Leaderboard_Success_Trigger';
export const event_dashboard_getLeaderboard_fail = 'Dashboard_Get_Leaderboard_Fail_Trigger';
export const event_dashboard_petSwipe = 'Dashboard_Pet_Swipe_Trigger';
export const event_dashboard_sensor_setup = 'Dashboard_Sensor_Trigger';
export const event_dashboard_onBoaring = 'Dashboard_Onboard_Pet_Trigger';
export const event_dashboard_Questionnaire = 'Dashboard_Questionnaire_Trigger';
export const event_dashboard_editpet = 'Dashboard_Edit_Pet_Trigger';
export const event_dashboard_devices_selection = 'Dashboard_Devices_Button_Trigger';
export const event_dashboard_firmwareUpdate = 'Dashboard_Firmware_Update_Trigger';
export const event_dashboard_enthusiasm = 'Dashboard_Enthusiasm_Trigger';
export const event_dashboard_imageScoring = 'Dashboard_ImageScoring_Trigger';
export const event_dashboard_defaultPet_modularity = 'Dashboard_DefaultPet_Modularity';
export const event_dashboard_getMeterials_Api = 'Dashboard_Get_Meterials_Api';
export const event_dashboard_getMeterials_success = 'Dashboard_Get_Meterials_Api_Success';
export const event_dashboard_getMeterials_fail = 'Dashboard_Get_Meterials_Api_Fail';

/////////////////////////// Timer Main Page //////////////////////////
export const event_timer_go_action = 'Timer_Main_Go_Button_Trigger';
export const event_timer_logs_action = 'Timer_Main_Logs_Button_Trigger';
export const event_timer_api_success = 'Timer_Api_Success';
export const event_timer_api_fail = 'Timer_Api_Fail';
export const event_timer_api = 'Timer_Api';
export const event_timer_activity = 'Timer_Activity_Trigger';
export const event_timer_selected_pet = 'Timer_selected_pet_Trigger';
export const event_timer_selected_time = 'Timer_selected_Time_Trigger';
export const event_timer_minimize_time = 'Timer_Minimize_Button_Trigger';
export const event_timer_widget_pause_resume_action = 'Timer_Pause_Resume_Button_Trigger';
export const event_timer_widget_logs_action = 'Timer_Logs_Button_Trigger';
export const event_timer_widget_stop_action = 'Timer_Stop_Button_Trigger';
export const event_timer_widget_stop_confirm_action = 'Timer_Stop_Confirm_Button_Trigger';
export const event_timer_widget_api_success = 'Timer_Widget_Api_Success';
export const event_timer_Widget_api_fail = 'Timer_Widget_Api_Fail';
export const event_timer_Widget_api = 'Timer_Widget_Api';

/////////////////////////// Pet Edit Page //////////////////////////
export const event_pet_img_choose_action = 'Choose_Pet_Img_Action_Trigger';
export const event_pet_img_selection_done = 'Selction_Pet_Image_Done';
export const event_pet_img_selection_cancel = 'Selction_Pet_Image_Cancel';
export const event_pet_img_api_success = 'Pet_Img_Api_Success';
export const event_pet_img_api_fail = 'Pet_Img_Api_Fail';

/////////////////////////// Observations List Page //////////////////////////
export const event_observations_new_btn = 'Observation_Add_Action_Trigger';
export const event_observations_view_btn = 'Obserrvations_View_Action_Trigger';
export const event_observation_list_api = 'Observation_List_Api';
export const event_observation_list_api_success = 'Observation_List_Api_Success';
export const event_observation_list_api_fail = 'Observation_List_Api_Fail';
export const event_observation_list_Swipe_Action= 'Observation_List_Swipe_Trigger';
export const event_behaviors_api = 'Get_Behaviors_Api';
export const event_behaviors_api_success = 'Get_Behaviors_Api_Success';
export const event_behaviors_api_fail = 'Get_Behaviors_Api_Fail';
export const event_delete_observation_api = 'Delete_Observation_Api';
export const event_delete_observation_api_success = 'Delete_Observation_Api_Success';
export const event_delete_observation_api_fail = 'Delete_Observation_Api_Fail';
export const event_edit_observation_Action = 'Edit_Observation_Action_Trigger';
export const event_observation_quick_video = 'Observation_Quick_Video_Pet';
export const event_observation_quick_video_action = 'Observation_Quick_Video_Action_Trigger';
export const event_observation_quick_video_media_action = 'Observation_Quick_Video_Media_Action_Trigger';
export const event_observation_quick_video_delete_media_action = 'Observation_Quick_Video_Delete_Media_Action_Trigger';

/////////////////////////// Add Observations Flow //////////////////////////
export const event_add_observations_pet_selection = 'Add_Observation_Pet_selection_Action_Trigger';
export const event_add_observations_txtBeh_api = 'Add_Observation_Txt_Behavior_Api';
export const event_add_observations_txtBeh_api_success = 'Add_Observation_Txt_Behavior_Api_Success';
export const event_add_observations_txtBeh_api_fail = 'Add_Observation_Txt_Behavior_Api_Fail';
export const event_add_observations_txtBeh_submit = 'Add_Observation_Txt_Behavior_Submit_Action_Trigger';
export const event_add_observations_date_submit = 'Add_Observation_Date_Submit_Action_Trigger';
export const event_add_observations_media_submit = 'Add_Observation_Media_Submit_Action_Trigger';
export const event_add_observations_review_submit = 'Add_Observation_Review_Submit_Action_Trigger';
export const event_add_observations_review_submit_nomedia = 'Add_Observation_Review_Submit_NoMedia_Action_Trigger';
export const event_add_observations_review_submit_media = 'Add_Observation_Review_Submit_Media_Action_Trigger';
export const event_add_observations_review_submit_multimedia = 'Add_Observation_Review_Submit_MultiMedia_Action_Trigger';
export const event_add_observations_api_success = 'Add_Observation_Api_Success';
export const event_add_observations_api_fail = 'Add_Observation_Api_Fail';

/////////////////////////// SOB Flow //////////////////////////
export const event_SOB_petName_submit_btn = 'SOB_Pet_Name_Action_Submit_Trigger';
export const event_SOB_petGender_submit_btn = 'SOB_Pet_Gender_Submit_Action_Trigger';
export const event_SOB_petNeutered_submit_btn = 'SOB_Pet_Neutered_Submit_Action_Trigger';
export const event_SOB_petBreed_submit_btn = 'SOB_Pet_Breed_Submit_Action_Trigger';
export const event_SOB_petBreed_api = 'SOB_Pet_Breed_Api_Trigger';
export const event_SOB_petBreed_api_success = 'SOB_Pet_Breed_Api_Success';
export const event_SOB_petBreed_api_fail = 'SOB_Pet_Breed_Api_Fail';
export const event_SOB_petAge_submit_button = 'SOB_Pet_Age_Submit_Action_Trigger';
export const event_SOB_petWeight_submit_button = 'SOB_Pet_Weight_Submit_Action_Trigger';
export const event_SOB_petFeeding_api_success = 'SOB_Pet_Feeding_Api_Success';
export const event_SOB_petFeeding_api_fail = 'SOB_Pet_Feeding_Api_Fail';
export const event_SOB_petFeeding_submit = 'SOB_Pet_Feeding_Submit_Trigger';
export const event_SOB_petType_submit = 'SOB_Pet_Type_Submit_Trigger';
export const event_SOB_sensorType_submit = 'SOB_Sensor_Type_Submit_Trigger';
export const event_SOB_device_number_submit = 'SOB_Device_Number_Submit_Trigger';
export const event_SOB_device_number_api = 'SOB_Device_Number_Api';
export const event_SOB_device_number_api_fail = 'SOB_Device_Number_Api_fail';
export const event_SOB_device_number_api_success = 'SOB_Device_Number_Api_Success';
export const event_SOB_device_number_Sequence_validation = 'SOB_Device_Number_Sequence_Validation';
export const event_SOB_device_numbe_missing_assign = 'SOB_Device_Number_Missing_Assign';
export const event_SOB_device_numbe_missing_assign_api_success = 'SOB_Device_Number_Missing_Assign_Api_Success';
export const event_SOB_device_numbe_missing_assign_api_fail = 'SOB_Device_Number_Missing_Assign_Api_Fail';
export const event_SOB_review_api_fail = 'SOB_Review_Api_Fail';
export const event_SOB_review_api_Success = 'SOB_Review_Api_Success';
export const event_SOB_review_api = 'SOB_Review_Api';
export const event_SOB_review_userData_api_fail = 'SOB_Review_UserData_Api_Fail';
export const event_SOB_review_userData_api_Success = 'SOB_Review_UserData_Api_Success';

/////////////////////////// Sensor Flow //////////////////////////
export const event_Sensor_type = 'Sensor_type';
export const event_sensor_ble_status = 'Sensor_Ble_Status';
export const event_sensor_setupStatus = 'Sensor_Setup_Status';
export const event_sensor_action_Type = 'Sensor_Action_Type_Trigger';
export const event_sensor_connection_status = 'Sensor_Connection_Status';
export const event_sensor_connection_mail = 'Sensor_Connection_Status_Report_Mail';
export const event_sensor_connection = 'Sensor_Connection';
export const event_sensor_wifi_command = 'Sensor_Nearby_WiFi_Initiate_Command';
export const event_sensor_hpn1_config_no_wifi = 'Sensor_HPN1_Configured_WiFi_Count';
export const event_sensor_hpn1_wifi_max_limit = 'Sensor_HPN1_Configured_WiFi_Max_Limit';
export const event_sensor_HPN1_readWIFISystemStatus_fail = "Sensor_HPN1_ReadWIFISystemStatus_fail";
export const event_sensor_nearby_wifi_count = 'Sensor_Nearby_WiFi_Count';
export const event_sensor_nearby_wifi_count_fail = 'Sensor_Nearby_WiFi_Count_fail';
export const event_sensor_nearby_wifi_list_count_final = 'Sensor_Nearby_WiFi_List_count_Final';
export const event_sensor_nearby_wifi_list_fetch_completed = 'Sensor_Nearby_WiFi_List_Fetch_Completed';
export const event_sensor_nearby_wifi_list_fetch_fail = 'Sensor_Nearby_WiFi_Names_List_Fetch_fail';
export const event_sensor_stop_scanning = 'Sensor_Stop_Scanning_Button_Trigger';
export const event_sensor_refresh_scanning = 'Sensor_Refresh_Scanning_Button_Trigger';
export const event_sensor_HPN1_max_limit_btn = 'Sensor_HPN1_Max_Limit_Button_Trigger';
export const event_sensor_configure_btn_action = 'Sensor_Configure_Submit_Trigger';
export const event_sensor_select_max_ssid_length = 'Sensor_Select_SSID_Max_Length_Submit_Trigger';
export const event_sensor_HPN1_duplicate_SSID_btn_action = 'Sensor_HPN1_Duplicate_SSID_Button_Trigger';
export const event_sensor_add_manual_btn_action = 'Sensor_Add_Manually_Button_Trigger';
export const event_sensor_submit_btn_action = 'Sensor_Add_Manual_Submit_Button_Trigger';
export const event_sensor_pnq_intst_next_btn_action = 'Sensor_PNQ_Intstruction_Next_Button_Trigger';
export const event_sensor_pnq_next_btn_action = 'Sensor_PNQ_Select_Next_Button_Trigger';
export const event_sensor_PNP_api_fail = 'Sensor_PNP_Api_Fail';
export const event_sensor_PNP_api_Success = 'Sensor_PNP_Api_Success';
export const event_sensor_PNP_api = 'Sensor_PNP_Api';
export const event_command_btn_action = 'Sensor_Command_Button_Trigger';
export const event_command_success = 'Sensor_Command_Success';
export const event_command_fail = 'Sensor_Command_Fail';
export const event_firmware_details = 'Sensor_Firmware_Details';
export const event_firmware_battery = 'Sensor_Firmware_Battery';
export const event_firmware_update_action_Trigger = 'Sensor_Firmware_Update_Button_Trigger';
export const event_firmware_update_success = 'Sensor_Firmware_Update_Success';
export const event_firmware_update_fail = 'Sensor_Firmware_Update_Fail';
export const event_sensor_HPN1_configured_WiFi_list = 'Sensor_HPN1_Configured_WiFi_List';
export const event_sensor_HPN1_configured_WiFi_delete_action = 'Sensor_HPN1_Configured_WiFi_Delete_Trigger';
export const event_sensor_HPN1_configured_WiFi_delete_index = 'Sensor_HPN1_Configured_WiFi_Delete_Index';
export const event_sensor_HPN1_configured_WiFi_delete_index_confirm = 'Sensor_HPN1_Configured_WiFi_Delete_Index_Confirm';
export const event_sensor_HPN1_initiate_command_write_details = 'Sensor_HPN1_Initiate_Command_Write_Details';
export const event_sensor_HPN1_SSID_write_status = 'Sensor_HPN1_SSID_Write_Status';
export const event_sensor_HPN1_SSID_write = 'Sensor_HPN1_SSID_Write';
export const event_sensor_HPN1_SSID_write_fail = "Sensor_HPN1_SSID_Write_Fail";
export const event_sensor_HPN1_pswd_write = 'Sensor_HPN1_Password_Write';
export const event_sensor_HPN1_pswd_write_fail = 'Sensor_HPN1_Password_Write_Fail';
export const event_sensor_HPN1_security_write = 'Sensor_HPN1_Security_Write';
export const event_sensor_HPN1_security_write_fail = 'Sensor_HPN1_Security_Write_Fail';
export const event_sensor_HPN1_write_details_confirm = 'sensor_HPN1_wWite_Detials_Confirm';
export const event_sensor_HPN1_write_details_confirm_fail = 'Sensor_HPN1_wWite_Details_Confirm_Fail';
export const event_sensor_write_details_navi = 'Sensor_Write_Details_Navigation';
export const event_sensor_write_details_try_action = 'Sensor_Write_Details_Try_button_Trigger';
export const event_sensor_aglCmas_write_sequence = 'Sensor_AglCmas_Write_Sequence';
export const event_sensor_aglCmas_write_sequence_fail = 'Sensor_AglCmas_Write_Sequence_Fail';
export const event_sensor_aglCmas_eventLog = 'Sensor_AglCmas_EventLog';
export const event_sensor_write_details_api = 'Sensor_Write_Details_Api';
export const event_sensor_write_details_api_success = 'Sensor_Write_Details_Api_Success';
export const event_sensor_write_details_api_fail = 'Sensor_Write_Details_Api_Fail';
export const event_sensor_write_details_getPets_api = 'Sensor_Write_Details_GetPets_Api';
export const event_sensor_write_details_getPets_api_success = 'Sensor_Write_Details_GetPets_Api_Success';
export const event_sensor_write_details_getPets_api_fail = 'Sensor_Write_Details_GetPets_Api_Fail';

//Support page
export const event_support_menu_trigger = 'Support_Page_Menu_Trigger';

//Learning center page
export const event_Learning_center_page_api = 'Learning_Center_Page_Api';
export const event_Learning_center_page_api_success = 'Learning_Center_Page_Api_Success';
export const event_Learning_center_page_api_failure = 'Learning_Center_Page_Api_Fail';

//App orientation Page
export const event_app_orientation_start_trigger = 'App_Orientation_Begin_Trigger';
export const event_app_orientation_finish = 'App_Orientation_Finish';
export const event_app_orientation_interrupted = 'App_Orientation_Interrupted';

//Chatbot page
export const event_chat_request_trigger = 'Chatbot_Session_Begin_Trigger';
export const event_chat_message_sent_trigger = 'Chatbot_Message_Sent_Trigger';
export const event_chat_minimize_trigger = 'Chatbot_minimize_Trigger';
export const event_chat_session_end_trigger = 'Chatbot_Session_End_Trigger';

//Image based scoring
export const event_image_scoring_button_trigger = 'Image_Scoring_Button_Selection_Trigger';
export const event_image_scoring_pet_image_scoring_scales_api = 'ImageScoring_PetImageScoring_Score_Api';
export const event_image_scoring_pet_image_scoring_scales_api_success = 'ImageScoring_PetImageScoring_Score_Api_Success';
export const event_image_scoring_pet_image_scoring_scales_api_failure = 'ImageScoring_PetImageScoring_Score_Api_Fail';
export const event_image_scoring_measurement_button_trigger = 'Image_Scoring_Measure_Button_Trigger';
export const event_image_scoring_imagepicker_trigger = 'Image_Scoring_ImagePicker_Trigger';
export const event_image_scoring_imagepicker_selected_trigger = 'Image_Scoring_ImagePicker_Selected_Trigger';
export const event_image_scoring_imagepicker_cancelled_trigger = 'Image_Scoring_ImagePicker_Cancelled_Trigger';
export const event_image_scoring_image_upload_api = 'Image_Scoring_ImageUpload_Api';
export const event_image_scoring_image_upload_api_success = 'Image_Scoring_ImageUpload_Api_Success';
export const event_image_scoring_image_upload_api_fail = 'Image_Scoring_ImageUpload_Api_Fail';
export const event_image_scoring_page_final_api = 'ImageScoring_Page_Api';
export const event_image_scoring_page_api_final_success = 'ImageScoring_Page_Final_Api_Success';
export const event_image_scoring_page_api_final_failure = 'ImageScoring_Page_Final_Api_Fail';

///////////// Point Tracking Module /////////////////
export const event_campaign_button_trigger = 'Campaign_Button_Selection_Trigger';
export const event_getTotal_points_button_trigger = 'Rewards_GetTotal_Points_Button_Selection_Trigger';
export const event_getRewardsDetails_api_success = 'Get_RewardsDetails_Api_Success';
export const event_getRewardsDetails_api_fail = 'Get_RewardsDetails_Api_Fail';
export const event_getTotalListofPoints_api_success = 'Get_TotalListofPoints_Api_Success';
export const event_getTotalListofPoints_api_fail = 'Get_TotalListofPoints_Api_Fail';
export const event_getRewardsRedeemedDetailsService_api_success = 'Get_RewardsRedeemedDetailsService_Api_Success';
export const event_getRewardsRedeemedDetailsService_api_fail = 'Get_RewardsRedeemedDetailsService_Api_Fail';
export const event_getRewardsDetails_api = 'Get_RewardsDetails_Api';
export const event_getTotalListofPoints_api = 'Get_TotalListofPoints_Api';
export const event_getRewardsRedeemedDetailsService_api = 'Get_RewardsRedeemedDetailsService_Api';
export const event_campaign_Action_trigger = 'Campaign_Button_Selection_Trigger';
export const event_reward_points_Action_trigger = 'Reward_Points_Button_Selection_Trigger';
export const event_leaderBoard_api_success = 'LeaderBoard_Api_Success';
export const event_leaderBoard_api_fail = 'LeaderBoard_Api_Fail';

///////////// Pet Weight /////////////////
export const event_pet_weight_history_button_trigger = 'Pet_Weight_Button_Selection_Trigger';
export const event_pet_weight_history_api = 'Get_Pet_Weight_History_Api';
export const event_pet_weight_history_api_success = 'Get_Pet_Weight_History_Api_Success';
export const event_pet_weight_history_api_fail = 'Get_Pet_Weight_History_Api_Fail';
export const event_pet_weight_new_api = 'Get_Pet_Weight_New_Api';
export const event_pet_weight_new_api_success = 'Get_Pet_Weight_New_Api_Success';
export const event_pet_weight_new_api_fail = 'Get_Pet_Weight_New_Api_Fail';

///////////// Questionnaire Study //////////////
export const event_questionnaire_study_pet_swipe_button_trigger = 'Questionnaire_Study_Pet_Swipe_Button_Trigger';
export const event_questionnaire_study_question_button_trigger = 'Questionnaire_Study_Question_Button_Trigger';
export const event_questionnaire_study_api = 'Questionnaire_Study_Api';
export const event_questionnaire_study_api_success = 'Questionnaire_Study_Api_Success';
export const event_questionnaire_study_api_fail = 'Questionnaire_Study_Api_Fail';
export const event_questionnaire_questions_submit_api = 'Questionnaire_Questions_Submit_Api';
export const event_questionnaire_questions_submit_api_success = 'Questionnaire_Questions_Submit_Api_Success';
export const event_questionnaire_questions_submit_api_fail = 'Questionnaire_Questions_Submit_Api_Fail';

///////////// Questionnaire Automated checkin //////////////
export const event_automated_checkin_questionnaire_api = 'Automated_Checkin_Questionnaire_Api';
export const event_automated_checkin_questionnaire_api_success = 'Automated_Checkin_Questionnaire_Api_Success';
export const event_automated_checkin_questionnaire_api_fail = 'Automated_Checkin_Questionnaire_Api_Fail';

//Eating enthusiasm
export const event_get_pet_eating_enthusiasm_scale_api = 'Eating_Enthusiasm_Scale_Api';
export const event_get_pet_eating_enthusiasm_scale_api_success = 'Eating_Enthusiasm_Scale_Api_Success';
export const event_get_pet_eating_enthusiasm_scale_api_failure = 'Eating_Enthusiasm_Scale_Api_Fail';
export const event_pet_eating_enthusiasm_scale_selection_trigger = 'Eating_Enthusiasm_Scale_Selected_Action_Trigger';
export const event_get_scale_selection_value = 'Eating_Enthusiasm_Date_Page_Scale_Selected_Value';
export const event_get_pet_feeding_time_api = 'Get_Pet_Feeding_Time_Api';
export const event_get_pet_feeding_time_api_success = 'Get_Pet_Feeding_Time_Success';
export const event_get_pet_feeding_time_api_failure = 'Get_Pet_Feeding_Time_Fail';
export const event_submit_pet_feeding_time_api = 'Submit_Pet_Feeding_Time_Api';
export const event_submit_pet_feeding_time_api_success = 'Submit_Pet_Feeding_Time_Success';
export const event_submit_pet_feeding_time_api_failure = 'Submit_Pet_Feeding_Time_Fail';

//Eating enthusiasm
export const event_add_device_btn_trigger = 'Add_Device_Action_Trigger';
export const event_device_selection_trigger = 'Device_Selection_Action_Trigger';

/////////////// Feedback Module ////////////////////
export const event_feedback_details_api = 'Feedback_Details_Api';
export const event_feedback_details_api_success = 'Feedback_Details_Api_Success';
export const event_feedback_details_api_failure = 'Feedback_Details_Api_Fail';

export const event_send_feedback_details_api = 'Send_Feedback_Api';
export const event_send_feedback_details_api_success = 'Send_Feedback_Api_Success';
export const event_send_feedback_details_api_failure = 'Send_Feedback_Api_Fail';

///////////Registeration/////////////////
export const event_registration_account_action = 'Register_Account_Button_Trigger';
export const event_registration_account_api = 'Registration_Account_Api';
export const event_registration_account_api_success = 'Registration_Account_Api_Success';
export const event_registration_account_api_fail = 'Registration_Account_Api_Fail';
export const event_registration_otp_api = 'Registration_Account_OTP_Api';
export const event_registration_otp_api_success = 'Registration_Account_OTP_Api_Success';
export const event_registration_otp_api_fail = 'Registration_Account_OTP_Api_Fail';
export const event_registration_account_Profile_action = 'Register_Account_Patent_Profile_Button_Trigger';

/////////////// Beacons ///////////////////
export const event_beacons_locations_next_action = 'Beacons_Locations_Next_Button_Trigger';
export const event_beacons_scan_initiated = 'Finding_Nearby_Beacons_Initiated';
export const event_beacons_scan_completed = 'Finding_Nearby_Beacons_Completed';
export const event_beacons_ble_status = 'Beacon_Ble_Status';
export const event_beacons_configure_submit = 'Beacon_Configure_Submit_Button_Trigger';
export const event_beacons_configure_connection = 'Beacon_Configure_Connection_Status';


export const event_menu = 'Menu_Button_Trigger';
export const event_back_btn_action = 'Back_Button_Trigger';

export const event_screen = "screen_visit";

export async function setUserId(userId) {
    if (isAnalyticsEnabled) {
        await analytics().setUserId(userId)
    }
}

export async function setUserProperty(email, clientId) {
    if (isAnalyticsEnabled) {
        await analytics().setUserProperty("email", email);
        await analytics().setUserProperty("clientId", clientId);
    }
}

export async function reportScreen(screen_name) {
    if (isAnalyticsEnabled) {
        await analytics().logScreenView({
            screen_name: screen_name,
            screen_class: screen_name,
        });
    }
}

export async function logEvent(eventName, screenName, description, more_info) {
    if (isAnalyticsEnabled) {
        let email = await DataStorageLocal.getDataFromAsync(Constant.USER_EMAIL_LOGIN);
        let parms = {
            "screenName": screenName,
            "description": description,
            "more_info": 'Email: ' + email + '\n' + more_info
        }
        await analytics().logEvent(eventName, parms)
    }
}