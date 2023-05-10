import React, { useState, useEffect, useRef } from 'react';
import {View,Alert} from 'react-native';
import TimerWidgetUI from './timerWidgetUI';
import * as Constant from "../../../utils/constants/constant";
import {useQuery,useMutation} from '@apollo/react-hooks';
import * as Queries from "./../../../config/apollo/queries";
import * as Apolloclient from './../../../config/apollo/apolloConfig';
import moment from "moment";
import Highlighter from "react-native-highlight-words";
import * as DataStorageLocal from './../../../utils/storage/dataStorageLocal';
import * as firebaseHelper from './../../../utils/firebase/firebaseHelper';
import ReactNativeAN from 'react-native-alarm-notification';

var PushNotification = require("react-native-push-notification");

let widgetTimer = undefined;

const TIMER_RESUME_FIRST = 1;
const TIMER_RESUME_SECOND = 2;
const TIMER_PAUSE = 3;
const TIMER_STOP = 4;
const TIMER_ENDED = 5;
const TIMER_INCREASE = 6;
const TIMER_ENDED_ALREADY = 7;

const TimerWidgetComponent = ({navigation,route, ...props }) => {

    const [isTimerStarted, set_isTimerStarted] = useState(false);
    const [isTimerPaused, set_isTimerPaused] = useState(false);
    const [hours, set_hours] = useState('00');
    const [minutes, set_minutes] = useState('00');
    const [seconds, set_seconds] = useState('00');
    const [startDate, set_startDate] = useState('');
    const [pauseDate, set_pauseDate] = useState('');
    
    const refferTimer = useRef(0);
    const [isTimerVisible, set_isTimerVisible] = useState(false);
    const [isLoading, set_isLoading] = useState(false);
    const [petName, set_petName] = useState(undefined);
    const [activityText, set_activityText] = useState(undefined);

    const [isPopUp, set_isPopUp] = useState(false);
    const [popUpMessage, set_popUpMessage] = useState(undefined);
    const [popAlert, set_popAlert] = useState(undefined);
    const [isPopLftBtn, set_isPopLftbtn] = useState(undefined);
    const [poplftBtnTitle, set_poplftBtnTitle] = useState(undefined);
    const [popRightBtnTitle, set_popRightBtnTitle] = useState(undefined);
    const [popId, set_popId] = useState(undefined);
    const [isPopupShown, set_isPopupShown] = useState(false);

    const pauseFirstTimerIntervalId = useRef(null);
    const pauseSecondTimerIntervalId = useRef(null);
    const dismisspauseFirstTimerIntervalId = useRef(null);
    const dismisIncreaseTimerIntervalId = useRef(null);

    const clearPauseFirstTimer = useRef(null);
    const clearPauseSecondTimer = useRef(null);
    const isResumeTimerCancelled = useRef(false);

    const { loading, data } = useQuery(Queries.TIMER_WIDGET_QUERY, { fetchPolicy: "cache-only" });
    const [updateTimerDetails,{loading: timerDetailsLoading,error: timerDetailsError,data: timerDetailsData,},] = useMutation(Queries.SEND_TIMER_DETAILS);

    useEffect(() => {     
        if(data && data.data.__typename === 'TimerWidgetQuery'){
            getTimerVisibility();
            console.log('Timer Widet ',data);
        }        
    }, [data]);

    useEffect(() => {

        set_isLoading(false);
        if(timerDetailsData){
            firebaseHelper.logEvent(firebaseHelper.event_timer_widget_api_success, firebaseHelper.screen_timer_widget, "Timer Api in Widget Success", "");
        }

        if(timerDetailsError){
            firebaseHelper.logEvent(firebaseHelper.event_timer_Widget_api_fail, firebaseHelper.screen_timer_widget, "Timer Api in Widget Failed", "error : "+timerDetailsError);
        }
    
      }, [timerDetailsData, timerDetailsError, timerDetailsLoading]);

    const getTimerVisibility = async () => {
            
        let timerObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerObj = JSON.parse(timerObj);

        if(timerObj && data && data.data.screenName==='Dashboard'){   
            
                set_petName(timerObj.timerPetName);
                set_activityText(timerObj.activityText);
                refferTimer.current = 0;
                console.log('timerObj Widget ',timerObj)
                if(timerObj.isTimerStarted){

                    setTimeout(() => {  
                        reCreateActualTimerNotification();
                    }, 2000)

                    set_isTimerStarted(timerObj.isTimerStarted);
                    set_isTimerPaused(timerObj.isTimerPaused);
                    set_startDate(new Date(timerObj.startDate));
                    onButtonStart(new Date(timerObj.startDate));
                    set_isTimerVisible(true);
                    
                }

                if(timerObj.isTimerPaused){

                    set_isTimerStarted(timerObj.isTimerStarted);
                    set_isTimerPaused(timerObj.isTimerPaused);
                    set_startDate(new Date(timerObj.startDate));
                    set_pauseDate(new Date(timerObj.pauseDate));
                    let msec = new Date(timerObj.pauseDate) - new Date(timerObj.startDate);
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
                    set_isTimerVisible(true);

                    getPauseTimerNotifications();
                }
        } else if(timerObj && data && data.data.stopTimerInterval==='Stop'){ 

            if(widgetTimer){
                clearInterval(widgetTimer);
                widgetTimer = undefined;
                clearPausenotifications();
            }
            saveTimerWhenNavigates();
        }
        
        else {
            
            saveTimerWhenNavigates();
        }

    }

      const saveTimerWhenNavigates = async () => {
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
        // clearInterval(widgetTimer);
        set_isTimerVisible(false);
      }

    const onButtonStart = async (dateValue) => {

        if(widgetTimer){
            clearInterval(widgetTimer);
            widgetTimer = undefined;
        }

            widgetTimer = setInterval(async () => {

                let msec = new Date() - dateValue;
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
                saveMilliSecsAsync(msec);
                autoStopTimer(msec);
    
            }, 1000);       
        
    };

    const autoStopTimer = async (msec) => {

            let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
            timerData = JSON.parse(timerData);

            var approx = Number(timerData.duration)*60000;
            var ms = msec;
            if(ms > approx){       

            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={"The Timer has ended. You can access the record under Menu > Timer > Timer Logs"}/>
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true);

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
                if(!isResumeTimerCancelled.current){
                    createPopup('NO', true, 'YES', 'Alert', 'Do you wish to increase the timer duration by '+ timerData.actualDuration +' more minutes? Select Yes to continue and No to cancel.', TIMER_INCREASE,true);
                }
                dismissIncreasePopup();
            }

        }
    }

    const stopBtnAction = () => {
        firebaseHelper.logEvent(firebaseHelper.event_timer_widget_stop_action, firebaseHelper.screen_timer_widget, "User clicked on Stop button", "");
        createPopup('NO', true, 'YES', Constant.ALERT_DEFAULT_TITLE, 'Are you sure, want to stop timer?', TIMER_STOP,true);
    };

    const pauseBtnAction = async (value) => {

        let durationObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        durationObj = JSON.parse(durationObj);

        if(value){
            firebaseHelper.logEvent(firebaseHelper.event_timer_widget_pause_resume_action, firebaseHelper.screen_timer_widget, "Timer Widget pause/resume action", "Btn Action : Paused");
            set_pauseDate(new Date());
            clearInterval(widgetTimer);
            widgetTimer = undefined;
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

            let sec = seconds;
            let elapsed = hours + ':' + minutes+':'+sec;
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

            firebaseHelper.logEvent(firebaseHelper.event_timer_widget_pause_resume_action, firebaseHelper.screen_timer_widget, "Timer Widget pause/resume action", "Btn Action : Resumed");
            clearPausenotifications();
            let timeDiff = new Date(durationObj.pauseDate) - new Date(durationObj.startDate);
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

    const timerLogsBtnAction = async () => {
        firebaseHelper.logEvent(firebaseHelper.event_timer_widget_logs_action, firebaseHelper.screen_timer_widget, "Timer Widget logs action", "");
        Apolloclient.client.writeQuery({
            query: Queries.DASHBOARD_TIMER_WIDGET,
                 data: {
                   data: { 
                    timerStatus:'',timerBtnActions:'TimerLogs',__typename: 'DashboardTimerWidget'}
                   },
         })

    };

    const saveTimerDataAsync = async (sDate,pDate,isTStarted,isTPaused,timerPetId,petName,activityText,duration,actualDuration,resumeTime,milsSecs,isTimerIncrease) => {

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
            isTimerIncreaseDone : isTimerIncrease
        }
        await DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT,JSON.stringify(asyncJson));

    }

    const sendTimerDataToBAckend = async (status,elapsed) => {

        set_isLoading(true);
        let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        let timerPetObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_SELECTED_PET);
        let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);

        timerData = JSON.parse(timerData);
        timerPetObj = JSON.parse(timerPetObj);
        
        // let sDate = moment(timerData.startDate).format('YYYY-MM-DD HH:mm:ss');
        let sDate = moment(timerData.startDate).utcOffset("+00:00").format("YYYY-MM-DD HH:mm:ss");
        let json = {
            Category: timerData.activityText,
            ClientID: ""+clientId,//parseInt(clientId)
            PetID:""+timerPetObj.petID,
            DeviceNumber: timerPetObj.devices[0].deviceNumber.toString(),
            Duration: elapsed.toString(),
            TimerDate: sDate.toString(),
          };
        
        if(status==='stop'){
            saveTimerDataAsync('','',false,false,'','','','','','',0,false);
        }
        firebaseHelper.logEvent(firebaseHelper.event_timer_Widget_api, firebaseHelper.screen_timer_widget, "Timer Api in Widget initiated", "Pet Id : "+timerPetObj.petID);
        await updateTimerDetails({ variables: { input: json } });
                
    }

    const clearTimer = async (elapsed, isPause) => {

        if(widgetTimer){
            clearInterval(widgetTimer);
        }
        widgetTimer = undefined;
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

        if(widgetTimer){
            clearInterval(widgetTimer);
            widgetTimer = undefined;
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

     /**
    * Here we create First Local notification for iOS and Android
    */
      const createPushNotifications = async (date,msg) => {
 
        PushNotification.localNotificationSchedule({
            channelId: "Wearables_Mobile_Android", 
            title: "Wearables",
            message: msg, // (required)
            date: date,//new Date(Date.now() + 10 * 1000), // in 60 secs
            allowWhileIdle: true, // (optional) set notification to work while on doze, default: false
            //timeoutAfter:120000,  
            ignoreInForeground:true, 
          
        });

        // const alarmNotifData = {
        //     title: "My Notification Title",
        //     message: "My Notification Message",
        //     channel: "Wearables_Mobile_Android",
        //     small_icon: "ic_launcher",
        // };

        // const alarm = await ReactNativeAN.scheduleAlarm({ ...alarmNotifData, fire_date: '27-04-2023 15:40:00' });

    
      };

      const androidLocalNotification = () => {

       
      }
   
      /**
      * Here we create First Pause custom Alert iOS and Android
      * This alert will stay on screen for One min and dissappears if no user interaction
      */
    const firstPauseNotification = (num) => {   
   
           let pauseTimerFirst = setTimeout(async () => {  
            // await pauseNoAction();
            createPopup('NO', true, 'YES', 'Alert', 'The timer is currently paused. Do you wish to resume it?', TIMER_RESUME_FIRST,true);
            dismissFirstPausePopup('first');
           }, num)
   
           pauseFirstTimerIntervalId.current = pauseTimerFirst;
   
    };
   
       /**
        * Here we create Second Pause custom Alert iOS and Android
        * This alert will stay on screen for One min and dissappears if no user interaction
        */
    const secondPauseNotification = (num) => {
   
           let pauseTimerSecond = setTimeout(async () => {  
            // await pauseNoAction();
            createPopup('NO', true, 'YES', 'Alert', 'The timer is currently paused. Do you wish to resume it?', TIMER_RESUME_SECOND,true);
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
      console.log('Reopen Pause notifications ',durationObj);

           if(durationObj){
   
               let isFirstDone = durationObj.isFirstDone;
               let isSecondDone = durationObj.isSecondDone;
               let current = new Date();
               let futureDateFirst = new Date(durationObj.pauseTimeFirst);
               let futureDateSecond = new Date(durationObj.pauseTimeSecond);

               var minutesToAdd = 1;
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
                        let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
                            searchWords={["Menu > Timer > Timer Logs"]}
                            textToHighlight={
                                "You can access the record under Menu > Timer > Timer Logs"
                            }
                        />
                        createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true);
    
                    }


                }
 
        }
       
    };

    const saveMilliSecsAsync = async (millSecs) => {
        let storedObjTimer = {};
        storedObjTimer.milliSeconds= millSecs;
        DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT_MILLISECONDS,JSON.stringify(storedObjTimer))
    };

    const saveTimerData = async () => {
        if(widgetTimer){
            clearInterval(widgetTimer);
        }
        widgetTimer = undefined;

        clearPausenotifications();
        let timerData = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT);
        timerData = JSON.parse(timerData);

        let sec = seconds;
        let elapsed = hours + ':' + minutes+':'+sec;
        clearTimer(elapsed,timerData.isTimerPaused);
        removeTimerWidget();

    };

    const removeTimerWidget = () => {

        Apolloclient.client.writeQuery({
            query: Queries.DASHBOARD_TIMER_WIDGET,
                 data: {
                    data: { 
                        timerStatus:'StopTimer',timerBtnActions:'',__typename: 'DashboardTimerWidget'}
                    },
         })

    };

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
            createPopup('NO', false, 'OK', 'Sorry!', 'Timer has already ended.', TIMER_ENDED_ALREADY,true);
        }

    };

    const resumeTimer = async () => {

        pauseBtnAction(false);

    }

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

    const pauseNoAction = async () => {

        let storedObj = await DataStorageLocal.getDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
        storedObj = JSON.parse(storedObj);
        let storedObjTimer = {};
console.log('Auto Dismissel ',storedObj);
        if(!storedObj.isFirstDone) {

            storedObjTimer.pauseTimeFirst= storedObj.pauseTimeFirst;
            storedObjTimer.pauseTimeSecond= storedObj.pauseTimeSecond;
            storedObjTimer.isFirstDone=true;
            storedObjTimer.isSecondDone=false;
            await DataStorageLocal.saveDataToAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS,JSON.stringify(storedObjTimer));
        } else if(!storedObj.isSecondDone) {

            storedObjTimer.pauseTimeFirst= storedObj.pauseTimeFirst;
            storedObjTimer.pauseTimeSecond= storedObj.pauseTimeSecond;
            storedObjTimer.isFirstDone=true;
            storedObjTimer.isSecondDone=true;
            await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
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

    const createPopup = (lftBtnTitle, lftBtnEnable, rgtBtnTitle, title, message, popIdValue,isPop) => {

        set_isPopLftbtn(lftBtnEnable);
        set_popRightBtnTitle(rgtBtnTitle);
        set_poplftBtnTitle(lftBtnTitle);
        set_popAlert(title);
        set_popUpMessage(message);
        set_popId(popIdValue);
        set_isPopUp(isPop);

    };

    const popOkBtnAction = () => {

        if(popId === TIMER_RESUME_FIRST){

            resumeTimer();
            createPopup('', false, '', '', '', undefined,false); 

        } else if(popId === TIMER_RESUME_SECOND){

            resumeTimer();
            createPopup('', false, '', '', '', undefined,false);
            
        } else if(popId === TIMER_STOP){
            firebaseHelper.logEvent(firebaseHelper.event_timer_widget_stop_confirm_action, firebaseHelper.screen_timer_widget, "User clicked on Stop button", "Timer Stopped");
            saveTimerData();
            createPopup('', false, '', '', '', undefined,false);
            let high = <Highlighter 
                highlightStyle={{ fontWeight: "bold",}}
                searchWords={["Menu > Timer > Timer Logs"]}
                textToHighlight={"You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true);
            
        } else if(popId === TIMER_ENDED){

            clearTimer('00:00:00',true);
            removeTimerWidget();
            popCancelBtnAction();  

        } else if(popId === TIMER_ENDED_ALREADY){

            createPopup('', false, '', '', '', undefined,false);
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={ "You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!',high, TIMER_ENDED,true);
            
        }else if(popId === TIMER_INCREASE){

            increaseTimer();
            isResumeTimerCancelled.current = false;
            createPopup('', false, '', '', '', undefined,false);
            
        } else {

            popCancelBtnAction();   

        }
        
    };

    const popCancelBtnAction = async () => {

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

        // if(popId === TIMER_INCREASE){
        //     isResumeTimerCancelled.current = true;
        // }

        if(popId === TIMER_RESUME_SECOND){

            clearTimer('00:00:00',true);
            await DataStorageLocal.removeDataFromAsync(Constant.TIMER_OBJECT_PAUSE_NOTIFICATIONS);
            let high = <Highlighter highlightStyle={{ fontWeight: "bold",}}
              searchWords={["Menu > Timer > Timer Logs"]}
              textToHighlight={"You can access the record under Menu > Timer > Timer Logs"}
            />
            createPopup('NO', false, 'OK', 'Thank You!', high, TIMER_ENDED,true);
                
        }  

    };


    return (
        <TimerWidgetUI 
            // timerObj = {props.timerObj}
            hours = {hours}
            minutes = {minutes}
            seconds = {seconds}
            isTimerStarted = {isTimerStarted}
            isTimerPaused = {isTimerPaused}
            popAlert = {popAlert}
            poplftBtnTitle = {poplftBtnTitle}
            popRightBtnTitle = {popRightBtnTitle}
            isPopLftBtn = {isPopLftBtn}
            popUpMessage = {popUpMessage}
            isPopUp = {isPopUp}
            isTimerVisible = {isTimerVisible}
            petName = {petName}
            activityText = {activityText}
            stopBtnAction = {stopBtnAction}
            pauseBtnAction = {pauseBtnAction}
            timerLogsBtnAction = {timerLogsBtnAction}
            popOkBtnAction = {popOkBtnAction}
            popCancelBtnAction = {popCancelBtnAction}
        />
    );

  }
  
  export default TimerWidgetComponent;