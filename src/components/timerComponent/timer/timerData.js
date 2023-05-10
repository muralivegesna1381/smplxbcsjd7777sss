import React, { useState, useEffect, useRef } from 'react';
import TimerUI from './timerUI';
import * as DataStorageLocal from '../../../utils/storage/dataStorageLocal';
import * as Constant from "../../../utils/constants/constant";
import { useNavigation } from "@react-navigation/native";
import moment from "moment";
import { useMutation,useQuery } from "@apollo/react-hooks";
import * as Queries from "../../../config/apollo/queries";
import Highlighter from "react-native-highlight-words";
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';

var PushNotification = require("react-native-push-notification");

let timer;

const TIMER_RESUME_FIRST = 1;
const TIMER_RESUME_SECOND = 2;
const TIMER_PAUSE = 3;
const TIMER_STOP = 4;
const TIMER_ENDED = 5;
const TIMER_INCREASE = 6;
const TIMER_ENDED_ALREADY = 7;

const TimerData = ({route, ...props }) => {

    const [updateTimerDetails,{loading: timerDetailsLoading,error: timerDetailsError,data: timerDetailsData,},] = useMutation(Queries.SEND_TIMER_DETAILS);
    const { loading, data } = useQuery(Queries.TIMER_START_QUERY, { fetchPolicy: "cache-only" });

    const [currentGlobalmilliseconds, set_currentGlobalmilliseconds] = useState(0);
    const [isTimerStarted, set_isTimerStarted] = useState(false);
    const [isTimerPaused, set_isTimerPaused] = useState(false);
    const [hours, set_hours] = useState('00');
    const [minutes, set_minutes] = useState('00');
    const [seconds, set_seconds] = useState('00');
    const [startDate, set_startDate] = useState('');
    const [pauseDate, set_pauseDate] = useState('');
    const [date, set_Date] = useState(new Date());
    const [timerPetsArray, set_timerPetsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const navigation = useNavigation();

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [isPopupShown, set_isPopupShown] = useState(0);
    const [popAlert, set_popAlert] = useState(undefined);
    const [isPopLftBtn, set_isPopLftbtn] = useState(undefined);
    const [poplftBtnTitle, set_poplftBtnTitle] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);
    const [popId, set_popId] = useState(undefined);

    const pauseFirstTimerIntervalId = useRef(null);
    const pauseSecondTimerIntervalId = useRef(null);
    const dismisspauseFirstTimerIntervalId = useRef(null);
    const dismisIncreaseTimerIntervalId = useRef(null);

    const clearPauseFirstTimer = useRef(null);
    const clearPauseSecondTimer = useRef(null);

    const refferTimer = useRef(0);
    let popIdRef = useRef(0);

     useEffect(() => {
        if(props.timerPetsArray){
            set_timerPetsArray(props.timerPetsArray);
        }
    }, [props.timerPetsArray,props.activityText,props.duration]);

    React.useEffect(() => {
        
        // getTimerData();  

        const focus = navigation.addListener("focus", () => {
          set_Date(new Date());
          getTimerData();          
        });

        return () => {
            focus();
          };

    }, []);

    // useEffect (() => {

    //     if(data){
    //         if(data.data.timerStart==='StartTimer'){
    //             console.log('Timer Main Component ',data)
    //             // getTimerData(); 
    //         }
    //     }
  
    // },[data]);

    useEffect(() => {

        set_isLoading(false);
        console.log('timer Details ',timerDetailsData)
        if(timerDetailsData){
            firebaseHelper.logEvent(firebaseHelper.event_timer_api_success, firebaseHelper.screen_timer_main, "Timer Api Success", "");
        }
               
        if(timerDetailsError){
            firebaseHelper.logEvent(firebaseHelper.event_timer_api_success, firebaseHelper.screen_timer_main, "Timer Api Fail", "error : "+timerDetailsError);
        }
    
    }, [timerDetailsData, timerDetailsError, timerDetailsLoading]);

    const getTimerData = async () => {

        refferTimer.current = 0;
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);
        if(timerData){
            
            if(timerData.isTimerStarted){

                setTimeout(() => {reCreateActualTimerNotification();}, 2000)
                set_isTimerStarted(timerData.isTimerStarted);
                set_isTimerPaused(timerData.isTimerPaused);
                set_startDate(new Date(timerData.startDate));
                onButtonStart(new Date(timerData.startDate));
                
            }

            if(timerData.isTimerPaused){

                set_isTimerStarted(timerData.isTimerStarted);
                set_isTimerPaused(timerData.isTimerPaused);
                set_startDate(new Date(timerData.startDate));
                set_pauseDate(new Date(timerData.pauseDate));
                let msec = new Date(timerData.pauseDate) - new Date(timerData.startDate);
                msec = msec;
                let seconds = (Math.floor((msec / 1000) % 60)).toString();
                seconds = seconds.length == 1 ? '0' + seconds : seconds;
                let minutes = (Math.floor((msec / 1000 / 60) % 60)).toString();
                minutes = minutes.length == 1 ? '0' + minutes : minutes;
                let hours = (Math.floor((msec  / 1000 / 3600 ) % 24)).toString();
                hours = hours.length == 1 ? '0' + hours : hours;

                set_hours(hours);
                set_minutes(minutes);
                set_seconds(seconds);

                getPauseTimerNotifications();
            }
        }
    }

    const navigateToPrevious = async () => { 
        
        clearInterval(timer); 
        await clearPausenotifications(); 

        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);
        if(timerData){
            saveTimerDataAsync(
                timerData.startDate,
                timerData.pauseDate,
                timerData.isTimerStarted,
                timerData.isTimerPaused,
                timerData.timerPetId,
                timerData.timerPetName,
                timerData.activityText,
                timerData.duration,
                timerData.actualDuration,
                timerData.resumeTime,
                timerData.milsSecs,
                timerData.isTimerIncreaseDone
            );
        }
              
        props.navigateToPrevious();
    }

    const goBtnAction = () => {
        props.goBtnAction(); 
    };

    const stopBtnAction = () => {
        createPopup('NO',true,'YES',Constant.ALERT_DEFAULT_TITLE,'Are you sure, want to stop timer?',TIMER_STOP,true,1);  
    };

    const pauseBtnAction = async (value) => {

        let durationObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        durationObj = JSON.parse(durationObj);

        if(value){

            set_pauseDate(new Date());
            set_isTimerPaused(value);
            set_isTimerStarted(false);

            var pDate = new Date();
            var rDate = new Date(durationObj.resumeTime);
            let timeDiff = pDate - rDate;
            let seconds = (Math.floor((timeDiff / 1000) % 60)).toString();
            seconds = seconds.length == 1 ? '0' + seconds : seconds;
            let minutes = (Math.floor((timeDiff / 1000 / 60) % 60)).toString();
            minutes = minutes.length == 1 ? '0' + minutes : minutes;
            let hours = (Math.floor((timeDiff  / 1000 / 3600 ) % 24)).toString();
            hours = hours.length == 1 ? '0' + hours : hours;
            let sec = seconds > 59 ? "00" : seconds;
            let elapsed = hours+':'+minutes+':'+sec;
            pauseTimer(elapsed);
            saveTimerDataAsync(
                startDate,
                new Date(),
                false,
                value,
                durationObj.timerPetId,
                durationObj.timerPetName,
                durationObj.activityText,
                durationObj.duration,
                durationObj.actualDuration,
                durationObj.resumeTime,
                durationObj.milsSecs+timeDiff,
                durationObj.isTimerIncreaseDone
                );
             
        }else {
            
            clearPausenotifications();
            let timeDiff = new Date(pauseDate) - new Date(startDate);
            let dateDiff1 = new Date() - new Date(timeDiff);
            set_isTimerPaused(value);
            set_isTimerStarted(true);
            set_startDate(new Date(dateDiff1));
            saveTimerDataAsync(
                new Date(dateDiff1),
                '',
                true,
                value,
                durationObj.timerPetId,
                durationObj.timerPetName,
                durationObj.activityText,
                durationObj.duration,
                durationObj.actualDuration,
                new Date(),
                durationObj.milsSecs,
                durationObj.isTimerIncreaseDone
            );

            reCreateActualTimerNotification();
            await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
            onButtonStart(new Date(dateDiff1));
        }

    };

    const timerLogsBtnAction = () => {
        props.timerLogsBtnAction();
    };

    const minmizeBtnAction = () => {
        navigateToPrevious();
    };

    const onButtonStart = async (dateValue) => {
            timer = setInterval(async () => {
            let msec = new Date() - dateValue;
            msec = msec;
            set_currentGlobalmilliseconds(msec);

            let seconds = (Math.floor((msec / 1000) % 60)).toString();
            seconds = seconds.length == 1 ? '0' + seconds : seconds;
            let minutes = (Math.floor((msec / 1000 / 60) % 60)).toString();
            minutes = minutes.length == 1 ? '0' + minutes : minutes;
            let hours = (Math.floor((msec  / 1000 / 3600 ) % 24)).toString();
            hours = hours.length == 1 ? '0' + hours : hours;

            set_hours(hours);
            set_minutes(minutes);
            set_seconds(seconds);
            saveMilliSecsAsync(msec);
            autoStopTimer(msec);

        }, 1000);
    };

    const autoStopTimer = async (msec) => {

        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);

        var approx = (Number(timerData.duration)*60000);
        var ms = msec;
        if(ms > approx){       

            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={"The Timer has ended. You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true,1);

            let diff = approx - timerData.milsSecs;
            let seconds = (Math.floor((diff / 1000) % 60)).toString();
            seconds = seconds.length == 1 ? '0' + seconds : seconds;
            let minutes = (Math.floor((diff / 1000 / 60) % 60)).toString();
            minutes = minutes.length == 1 ? '0' + minutes : minutes;
            let hours = (Math.floor((diff  / 1000 / 3600 ) % 24)).toString();
            hours = hours.length == 1 ? '0' + hours : hours;

            let sec = seconds;
            let elapsed = hours + ':' + minutes+':'+sec;
            clearTimer(elapsed,false);

        }

        // if(ms > (approx-15000) && ms < approx){
        if(ms > (approx-120000) && ms < approx && !timerData.isTimerIncreaseDone){
            
            if(refferTimer.current === 0){
                refferTimer.current = 1;
                set_isPopupShown(1);
                createPopup('NO', true, 'YES', 'Alert', 'Do you wish to increase the timer duration by '+ timerData.actualDuration +' more minutes? Select Yes to continue and No to cancel.', TIMER_INCREASE,true,1);
                dismissIncreasePopup();
            }

          }
      }

    const saveTimerDataAsync = async (sDate,pDate,isTStarted,isTPaused,timerPetId,petName,activityText,duration,actualDuration,resumeTime,milsSecs,isTimeIncrease) => {

        let asyncJson= {
            startDate : sDate,
            pauseDate : pDate,
            isTimerStarted : isTStarted,
            isTimerPaused : isTPaused,
            timerPetId : timerPetId,
            timerPetName : petName,
            activityText : activityText,
            duration : duration,
            actualDuration : actualDuration,
            resumeTime : resumeTime,
            milsSecs : milsSecs,
            isTimerIncreaseDone : isTimeIncrease
        }
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT,JSON.stringify(asyncJson));

    }

    const sendTimerDataToBAckend = async (status,elapsed) => {

        console.log('Update time ')
        set_isLoading(true);
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        let timerPetObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_SELECTED_PET);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        timerData = JSON.parse(timerData);
        timerPetObj = JSON.parse(timerPetObj);

        let sDate = moment(timerData.startDate).utcOffset("+00:00").format("YYYY-MM-DD HH:mm:ss");
        let json = {
            Category: timerData.activityText,
            ClientID: ""+clientId,//parseInt(clientId)
            PetID: ""+timerPetObj.petID,
            DeviceNumber: timerPetObj.devices[0].deviceNumber.toString(),
            Duration: elapsed.toString(),
            TimerDate: sDate.toString(),
        };

        if(status==='stop'){
            saveTimerDataAsync('','',false,false,'','','','','','',0,false);
        }
        console.log('Update time ',json)
        firebaseHelper.logEvent(firebaseHelper.event_timer_api, firebaseHelper.screen_timer_main, "Timer ended and sending the data to backend", "Pet Id : "+timerPetObj.petID);
        await updateTimerDetails({ variables: { input: json } });
                
    };

    // const updateTimerDetails = async (jsonValue,token) => {

    //     let serviceCallsObj = await ServiceCalls.managePetTimerLog(jsonValue,token);
    //     set_isLoading(false);

    //     if(serviceCallsObj && serviceCallsObj.logoutData){
    //         AuthoriseCheck.authoriseCheck();
    //         navigation.navigate('WelcomeComponent');
    //         return;
    //     }

    //     if(serviceCallsObj && !serviceCallsObj.isInternet){
    //         createPopup('',false,'OK',Constant.ALERT_NETWORK,Constant.NETWORK_STATUS,undefined,true,1); 
    //         return;
    //     }

    //     if(serviceCallsObj && serviceCallsObj.statusData){
    //         // firebaseHelper.logEvent(firebaseHelper.event_timer_api_success, firebaseHelper.screen_timer_main, "Timer Api Success", "");
    //     } else {
    //         firebaseHelper.logEvent(firebaseHelper.event_timer_api_success, firebaseHelper.screen_timer_main, "Timer Api Fail", "");
    //         createPopup('',false,'OK',Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,undefined,true,1);  
    //     }

    //     if(serviceCallsObj && serviceCallsObj.error) {
    //         firebaseHelper.logEvent(firebaseHelper.event_timer_api_success, firebaseHelper.screen_timer_main, "Timer Api Fail", "error : ");
    //         createPopup('',false,'OK',Constant.ALERT_DEFAULT_TITLE,Constant.SERVICE_FAIL_MSG,undefined,true,1);  
    //     }
    // };

    const increaseTimer = async () => {
        
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);
        refferTimer.current = 0;

        if(timerData.isTimerStarted) {
            let duration = (Number(timerData.duration) + Number(timerData.actualDuration)).toString();
            saveTimerDataAsync(
                timerData.startDate,
                timerData.pauseDate,
                timerData.isTimerStarted,
                timerData.isTimerPaused,
                timerData.timerPetId,
                timerData.timerPetName,
                timerData.activityText,
                duration,
                timerData.actualDuration,
                timerData.resumeTime,
                timerData.milsSecs,
                false
            );

            reCreateActualTimerNotification();

        } else {
            createPopup('NO', false, 'OK', 'Sorry!', 'Timer has already ended.', TIMER_ENDED_ALREADY,true,1);
        }

    };

    const saveTimerData = async () => {

        if(timer){
            clearInterval(timer);
        }
        timer = undefined;

        clearPausenotifications();
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);

        var approx = (Number(timerData.duration)*60000);
        let diff = currentGlobalmilliseconds - timerData.milsSecs;

        let seconds = (Math.floor((diff / 1000) % 60)).toString();
        seconds = seconds.length == 1 ? '0' + seconds : seconds;
        let minutes = (Math.floor((diff / 1000 / 60) % 60)).toString();
        minutes = minutes.length == 1 ? '0' + minutes : minutes;
        let hours = (Math.floor((diff  / 1000 / 3600 ) % 24)).toString();
        hours = hours.length == 1 ? '0' + hours : hours;
            
        let sec = seconds > 59 ? "00" : seconds;
        let elapsed = hours + ':' + minutes+':'+sec;
        clearTimer(elapsed,timerData.isTimerPaused);

    };

    const popOkBtnAction = async(value) => {

        if(popId === TIMER_RESUME_FIRST){

            pauseBtnAction(false);
            createPopup('', false, '', '', '', undefined,false); 

        } else if(popId === TIMER_RESUME_SECOND){

            pauseBtnAction(false);
            createPopup('NO',false,'','','',undefined,false,0); 
            
        } else if(popId === TIMER_STOP){

            saveTimerData();
            createPopup('NO',false,'','','',undefined,false,0); 
            
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={"You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true,1);

        } else if(popId === TIMER_ENDED){
            clearTimer('00:00:00',true);
            popCancelBtnAction();  

        } else if(popId === TIMER_ENDED_ALREADY){

            createPopup('NO',false,'','','',undefined,false,0); 
            let high = <Highlighter highlightStyle={{ fontWeight: "bold"}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={"You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true,1);
            
        }else if(popId === TIMER_INCREASE){

            increaseTimer();
            createPopup('', false, '', '', '', undefined,false);
            
        } else {

            popCancelBtnAction();   

        }

    };

    const popCancelBtnAction = async (value) => {

        if(popId === TIMER_INCREASE){
            let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
            timerData = JSON.parse(timerData);
            saveTimerDataAsync(timerData.startDate,timerData.pauseDate,timerData.isTimerStarted,timerData.isTimerPaused,timerData.timerPetId,timerData.timerPetName,timerData.activityText,timerData.duration,timerData.actualDuration,timerData.resumeTime,timerData.milsSecs,true);                       
        } 

        if(popId === TIMER_RESUME_FIRST){

            let storedObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
            storedObj = JSON.parse(storedObj);
            let storedObjTimer = {};
            if(storedObj) {
                storedObjTimer.pauseTimeFirst= storedObj.pauseTimeFirst;
                storedObjTimer.pauseTimeSecond= storedObj.pauseTimeSecond;
                storedObjTimer.isFirstDone=true;
                storedObjTimer.isSecondDone=storedObj.isSecondDone;
                await DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS,JSON.stringify(storedObjTimer));
            }

        } 

        createPopup('', false, '', '', '', undefined,false);

        if(popId === TIMER_RESUME_SECOND){

            clearTimer('00:00:00',true);
            await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
            let high = <Highlighter highlightStyle={{ fontWeight: "bold" }}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={
                "You can access the record under Menu > Timer > Timer Logs"
              }
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true,1);                
        }  

    };

    const clearTimer = async (elapsed, isPause) => {

        if(timer){
            clearInterval(timer);
        }
        set_hours('00');
        set_minutes('00');
        set_seconds('00');
        set_isTimerStarted(false);
        set_isTimerPaused(false);
        set_isPopupShown(0);
        clearPausenotifications();
        await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
        if(!isPause){
            sendTimerDataToBAckend('stop',elapsed);
        } else {
            saveTimerDataAsync('','',false,false,'','','','','','',0,false);
        }       

    };

    const pauseTimer = async (elapsed) => {

        console.log('Is First done1 ',elapsed)

        if(timer){
            clearInterval(timer);
        }

        let dateFirst = new Date();
        dateFirst.setMilliseconds(dateFirst.getMilliseconds() + ((Number(300)*1000)));
        // dateFirst.setMilliseconds(dateFirst.getMilliseconds() + ((Number(60)*1000)));

        let dateSecond = new Date();
        dateSecond.setMilliseconds(dateSecond.getMilliseconds() + ((Number(600)*1000)));
        // dateSecond.setMilliseconds(dateSecond.getMilliseconds() + ((Number(120)*1000)));

        var minutesToAdd=5;
        // var minutesToAdd=1;
        var currentDate = new Date();
        var futureDateFirst = new Date(currentDate.getTime() + minutesToAdd*60000);

        var minutesToAddSecond=10;
        // var minutesToAddSecond=2;
        var currentDateSecond = new Date();
        var futureDateSecond = new Date(currentDateSecond.getTime() + minutesToAddSecond*60000);

        let storedObjTimer = {};
        storedObjTimer.pauseTimeFirst= futureDateFirst;
        storedObjTimer.pauseTimeSecond= futureDateSecond;
        storedObjTimer.isFirstDone=false;
        storedObjTimer.isSecondDone=false;
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS,JSON.stringify(storedObjTimer));
        clearPausenotifications();
        createPushNotifications(dateFirst,"The timer is currently paused. Do you wish to resume it?");
        createPushNotifications(dateSecond,"The timer is currently paused. Do you wish to resume it?");
        firstPauseNotification(300000);
        secondPauseNotification(600000);
        // createPushNotifications(dateFirst,"The timer is currently paused. Do you wish to resume it?");
        // createPushNotifications(dateSecond,"The timer is currently paused. Do you wish to resume it?");
        // firstPauseNotification(60000);
        // secondPauseNotification(120000);

        // clearPauseFirstNotification(295000);
        sendTimerDataToBAckend('pause',elapsed);

    };

     /**
    * Here we create First Pause Local notification for iOS and Android
    */
    const createPushNotifications = (date, msg) => {
 
     PushNotification.localNotificationSchedule({
        channelId: "Wearables_Mobile_Android",
        title: "Wearables",
        message: msg, // (required)
        date: date,//date, //new Date(Date.now() + (10 * 1000)), // in 60 secs
        allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
        //timeoutAfter:120000,  
        ignoreInForeground:true, 
     });
 
   };

   /**
   * Here we create First Pause custom Alert iOS and Android
   * This alert will stay on screen for One min and dissappears if no user interaction
   */
    const firstPauseNotification = (num) => {   

        let pauseTimerFirst = setTimeout(() => {  
            createPopup('NO', true, 'YES', 'Alert', 'The timer is currently paused. Do you wish to resume it?', TIMER_RESUME_FIRST,true,1);
            dismissFirstPausePopup('first');
        }, num)

        pauseFirstTimerIntervalId.current = pauseTimerFirst;

    };

    /**
     * Here we create Second Pause custom Alert iOS and Android
     * This alert will stay on screen for One min and dissappears if no user interaction
     */
    const secondPauseNotification = (num) => {

        let pauseTimerSecond = setTimeout(() => {  
            createPopup('NO', true, 'YES', 'Alert', 'The timer is currently paused. Do you wish to resume it?', TIMER_RESUME_SECOND,true,1);
            dismissFirstPausePopup('second');
        }, num)

        pauseSecondTimerIntervalId.current = pauseTimerSecond;
    };

    const dismissFirstPausePopup = (value) => {
   
        let pauseTimerSecond = setTimeout(async () => {  
            createPopup('', false, '', '', '', undefined,false);
            if(value==='second'){

                let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                  searchWords={["Menu > Timer > Timer Logs"]}
                  textToHighlight={
                    "You can access the record under Menu > Timer > Timer Logs"
                  }
                />
                createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true);
            }

        }, 60000)
        // }, 30000)

        dismisspauseFirstTimerIntervalId.current = pauseTimerSecond;
    };

    const dismissIncreasePopup = (value) => {
   
        let pauseTimerIncrease = setTimeout(async () => {  
            createPopup('', false, '', '', '', undefined,false);
            let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
            timerData = JSON.parse(timerData);
            saveTimerDataAsync(timerData.startDate,timerData.pauseDate,timerData.isTimerStarted,timerData.isTimerPaused,timerData.timerPetId,timerData.timerPetName,timerData.activityText,timerData.duration,timerData.actualDuration,timerData.resumeTime,timerData.milsSecs,true); 
        }, 60000)
        // }, 30000)

        dismisIncreaseTimerIntervalId.current = pauseTimerIncrease;
    };

    const clearPauseFirstNotification = (num) => {   

        let clearPauseTimerFirst = setTimeout(() => {  

            PushNotification.cancelAllLocalNotifications();
            let dateSecond = new Date();
            dateSecond.setMilliseconds(dateSecond.getMilliseconds() + ((Number(600)*1000)));
            createPushNotifications(dateSecond,"The timer is currently paused. Do you wish to resume it?");
            // clearPauseSecondNotification(295000);
            if(clearPauseFirstTimer.current){
                clearTimeout(clearPauseFirstTimer.current);
          
              }

        }, num)

        clearPauseFirstTimer.current = clearPauseTimerFirst;

    };

    const clearPauseSecondNotification = (num) => {   

        let clearPauseTimerSecond = setTimeout(() => {  

            PushNotification.cancelAllLocalNotifications();
            if(clearPauseSecondTimer.current){
                clearTimeout(clearPauseSecondTimer.current);
          
              }
            
        }, num)

        clearPauseSecondTimer.current = clearPauseTimerSecond;

    };

    const getPauseTimerNotifications = async () => {

        clearPausenotifications();

        let durationObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
        durationObj = JSON.parse(durationObj);

           if(durationObj){
   
               let isFirstDone = durationObj.isFirstDone;
               let isSecondDone = durationObj.isSecondDone;
               let current = new Date();
               let futureDateFirst = new Date(durationObj.pauseTimeFirst);
               let futureDateSecond = new Date(durationObj.pauseTimeSecond);
         
               var minutesToAdd=1;
               var currentDate = futureDateFirst;
               var futureDateFirstExt = new Date(currentDate.getTime() + minutesToAdd*60000);

               if((current < futureDateFirstExt)){

                    let diff = futureDateFirst - current;
                    let diff1 = futureDateSecond - current;

                    if (isFirstDone){
                        secondPauseNotification(diff1);
                        reCreatePauseNotifications(diff,diff1,'secondPause');

                    } else {
                        firstPauseNotification(diff);
                        secondPauseNotification(diff1);
                        reCreatePauseNotifications(diff,diff1,'firstPause');
                    }

                } else if((current > futureDateFirstExt)){


                    var minutesToAddSec=1;
                    var currentDateSec = futureDateSecond;
                    var futureDateSecExt = new Date(currentDateSec.getTime() + minutesToAddSec*60000);

                    if((current < futureDateSecExt)){

                        let diff = futureDateFirst - current;
                        let diff1 = futureDateSecond - current;
                        secondPauseNotification(diff1);
                        reCreatePauseNotifications(diff,diff1,'secondPause');

                    } if((current > futureDateSecExt)){

                        clearInterval(widgetTimer); 
                        widgetTimer = undefined;
                        let high = <Highlighter highlightStyle={{fontWeight: "bold",}}
                        searchWords={["Menu > Timer > Timer Logs"]}
                        textToHighlight={"You can access the record under Menu > Timer > Timer Logs"}
                        />
                        createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true,1);
    
                    }

                }

            }
    
    };

    const saveMilliSecsAsync = async (millSecs) => {
        let storedObjTimer = {};
        storedObjTimer.milliSeconds= millSecs;
        DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT_MILLISECONDS,JSON.stringify(storedObjTimer))
    };

    const reCreateActualTimerNotification = async () => {

        PushNotification.cancelAllLocalNotifications();

        let durationObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        durationObj = JSON.parse(durationObj);

        let milSecObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT_MILLISECONDS);
        milSecObj = JSON.parse(milSecObj);

        if(durationObj!==null && milSecObj!==null){
            var approx = (Number(durationObj.duration)*60000)-120000;
            var milliSecs = Number(milSecObj.milliSeconds);
            if(milliSecs < approx){

                let dateFirst = new Date();
                dateFirst.setMilliseconds(dateFirst.getMilliseconds() + (Number(approx-milliSecs)));
                createPushNotifications(dateFirst,'Your timer is about to elapse. Please click this notifications to take action.');

            }
        }            

    };

    const reCreatePauseNotifications = async (fPTime,sPTIme,value) => {

        PushNotification.cancelAllLocalNotifications();
        let dateFirst = new Date();

        if(value==='firstPause') {

            dateFirst.setMilliseconds(dateFirst.getMilliseconds() + (Number(fPTime)));
            createPushNotifications(dateFirst,"The timer is currently paused. Do you wish to resume it?");   
            dateFirst.setMilliseconds(dateFirst.getMilliseconds() + (Number(sPTIme)));
            createPushNotifications(dateFirst,"The timer is currently paused. Do you wish to resume it?"); 

        } if(value==='secondPause') {

            dateFirst.setMilliseconds(dateFirst.getMilliseconds() + (Number(sPTIme)));
            createPushNotifications(dateFirst,"The timer is currently paused. Do you wish to resume it?"); 
            
        }

    };

    const clearPausenotifications = async () => {

        if(pauseFirstTimerIntervalId.current){
          clearTimeout(pauseFirstTimerIntervalId.current);
    
        }
        if(pauseSecondTimerIntervalId.current){
          clearTimeout(pauseSecondTimerIntervalId.current);
    
        }
        if(dismisspauseFirstTimerIntervalId.current) {
            clearTimeout(dismisspauseFirstTimerIntervalId.current); 
        }

        if(dismisIncreaseTimerIntervalId.current) {
            clearTimeout(dismisIncreaseTimerIntervalId.current); 
        }
        PushNotification.cancelAllLocalNotifications();
    
    };

    const createPopup = (lftBtnTitle, lftBtnEnable, rgtBtnTitle, title, message, popIdValue,isPop,popRef) => {

        set_isPopLftbtn(lftBtnEnable);
        set_popRightBtnTitle(rgtBtnTitle);
        set_poplftBtnTitle(lftBtnTitle);
        set_popAlert(title);
        set_popUpMessage(message);
        set_popId(popIdValue);
        set_isPopUp(isPop);
        popIdRef.current = popRef;

    };

    return (
        <TimerUI 
            hours = {hours}
            minutes = {minutes}
            seconds = {seconds}
            isTimerStarted = {isTimerStarted}
            isTimerPaused = {isTimerPaused}
            isLoading = {isLoading}
            isPopUp = {isPopUp}
            popUpMessage = {popUpMessage}
            isPopLeftBtnEnable = {isPopLftBtn}
            popRightBtnTitle = {popRightBtnTitle}
            poplftBtnTitle = {poplftBtnTitle}
            popAlert = {popAlert}
            navigateToPrevious = {navigateToPrevious}
            goBtnAction = {goBtnAction}
            stopBtnAction = {stopBtnAction}
            pauseBtnAction = {pauseBtnAction}
            timerLogsBtnAction = {timerLogsBtnAction}
            minmizeBtnAction = {minmizeBtnAction}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
        />
    );

  }
  
  export default TimerData;