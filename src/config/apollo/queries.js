// @flow

import gql from "graphql-tag";


export const GET_USER_LOGIN = gql`
  mutation login {
    login(input: $input)
      @rest(type: "login", method: "POST", path: "ClientLogin") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_DEVICE_INFO = gql`
  query SensorInfo {
    SensorInfo(input: $input)
      @rest(type: "SensorInfo", method: "POST", path: "GetPatients") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_MODULARITY_DETAILS = gql`
  query ModularityDetails {
    ModularityDetails(input: $input)
      @rest(
        type: "ModularityDetails"
        method: "POST"
        path: "GetMobileAppConfigsByPetParentID"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_OSERVATIONS = gql`
  query ObservationsList {
    ObservationsList(input: $input)
      @rest(type: "ObservationsList", method: "POST", path: "GetObservations") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_EMAIL_VERIFICATON_CODE = gql`
  mutation SendEmailVerificationCode {
    SendEmailVerificationCode(input: $input)
      @rest(
        type: "SendEmailVerificationCode"
        method: "POST"
        path: "SendEmailVerificationCode"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_USER_VERIFICATION_ACCOUNT = gql`
  mutation verificationCode {
    verificationCode(input: $input)
      @rest(
        type: "verificationCode"
        method: "POST"
        path: "CheckClientSMSCode"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_USER_EMAIL_VERIFICATION_CODE = gql`
  mutation emailVerification {
    emailVerification(input: $input)
      @rest(
        type: "emailVerification"
        method: "POST"
        path: "SendEmailVerificationCode"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_USER_CREATE_PASSWORD = gql`
  mutation createPassword {
    createPassword(input: $input)
      @rest(
        type: "createPassword"
        method: "POST"
        path: "SetClientPasswordBySMSCode"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const Manage_ClientInfo = gql`
  mutation ManageClientInfo {
    ManageClientInfo(input: $input)
      @rest(
        type: "ManageClientInfo"
        method: "POST"
        path: "ManageClientInfo"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_BEHAVIORS = gql`
  query getBehaviors {
    getBehaviors(input: $input)
      @rest(type: "getBehaviors", method: "POST", path: "GetBehaviors") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const UPLOAD_OBSERVATIONS_DATA = gql`
  mutation uploadOBSData {
    uploadOBSData(input: $input)
      @rest(type: "uploadOBSData", method: "POST", path: "UploadObservation") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_CLIENT_INFO = gql`
  query ClientInfo {
    ClientInfo(input: $input)
      @rest(type: "ClientInfo", method: "POST", path: "GetClientInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const CHANGE_USER_INFO = gql`
  mutation changeUserInfo {
    changeUserInfo(input: $input)
      @rest(type: "changeUserInfo", method: "POST", path: "ChangeClientInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const CHANGE_USER_PASSWORD = gql`
  mutation changeUserpswd {
    changeUserpswd(input: $input)
      @rest(
        type: "changeUserPassword"
        method: "POST"
        path: "ChangePassword"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_TIMER_DETAILS = gql`
mutation SendTimerDetails {
    SendTimerDetails(input: $input)
      @rest(
        type: "SendTimerDetails"
        method: "POST"
        path: "ManagePetTimerLog"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const DEVICE_VALIDATION = gql`
  mutation deviceValidation {
    deviceValidation(input: $input)
      @rest(type: "deviceValidation", method: "POST", path: "ValidateDeviceNumber") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_BREED_DETAILS = gql`
  query breedDetails {
    breedDetails(input: $input)
      @rest(type: "breedDetails", method: "GET", path: "GetPetBreedItems") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const ON_BOARD_PET = gql`
  mutation onBoardPet {
    onBoardPet(input: $input)
      @rest(type: "onBoardPet", method: "POST", path: "CompleteOnboardingInfo") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_SENSOR_STATUS_UPDATE = gql`
  mutation sensorUpdate {
    sensorUpdate(input: $input)
      @rest(type: "sensorUpdate", method: "POST", path: "UpdateSensorSetupStatus") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_SENSOR_NOTIFICATION_SETTINGS = gql`
  mutation sendSensorNotifications {
    sendSensorNotifications(input: $input)
      @rest(type: "sendSensorNotifications", method: "POST", path: "ManageSensorChargingNotificationSettings") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const GET_TIMER_DETAILS = gql`
  query timerLogs {
    timerLogs(input: $input)
      @rest(type: "timerLogs", method: "POST", path: "GetPetTimerLog") {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const SEND_FEEDBACK = gql`
  mutation sendFeedback {
    sendFeedback(input: $input)
      @rest(
        type: "sendFeedback"
        method: "POST"
        path: "ManageMobileAppScreensFeedback"
      ) {
      success
      errors
      warnings
      responseCode
      responseMessage
      result
    }
  }
`;

export const TIMER_START_QUERY = gql`
  query TimerStartQuery {
    data {
      timerStart
    }
  }
`;

export const TIMER_WIDGET_QUERY = gql`
  query TimerWidgetQuery {
    data {
      screenName
      stopTimerInterval
    }
  }
`;

export const DASHBOARD_TIMER_WIDGET = gql`
  query DashboardTimerWidget {
    data {
      timerStatus
      timerBtnActions
    }
  }
`;

export const LOG_OUT_APP = gql`
  query LogOutApp {
    data {
      isLogOut
    }
  }
`;

export const LOG_OUT_APP_ERROR = gql`
  query LogOutAppError {
    data {
      isLogOutError
    }
  }
`;

export const LOG_OUT_APP_NAVI = gql`
  query LogOutAppNavi {
    data {
      isLogOutNavi
    }
  }
`;

export const DASHBOARD_PT_WIDGET = gql`
  query DashboardPTWidget {
    data {
      isPTNavigation
    }
  }
`;

export const UPLOAD_VIDEO_BACKGROUND = gql`
  query UploadVideoBackground {
    data {
      obsData
    }
  }
`;

export const UPLOAD_VIDEO_BACKGROUND_STATUS = gql`
  query UploadVideoBackgroundStatus {
    data {
      statusUpload
      stausType
      mediaTYpe
      observationName
      fileName
      uploadProgress
      progressTxt
      internetType
    }
  }
`;

export const UPDATE_DASHBOARD_DATA = gql`
  query UpdateDashboardData {
    data {
      isRefresh
    }
  }
`;

