import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,BackHandler,ScrollView} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import moment from 'moment';
import * as firebaseHelper from './../../utils/firebase/firebaseHelper';
import perf from '@react-native-firebase/perf';

const  ViewFeedbackComponent = ({navigation,route, ...props }) => {

    const [feedbackItem, set_feedbackItem] = useState(undefined);

    let trace_in_View_Feedback_Screen;
   
    //setting firebase helper
    useEffect(() => {
        firebaseHelper.reportScreen(firebaseHelper.screen_view_feedback);   
        firebaseHelper.logEvent(firebaseHelper.event_screen, firebaseHelper.screen_view_feedback, "User is in View Feedback Screen", ''); 
        viewFeedbackSessionStart();
        BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);

         return () => {
            viewFeedbackSessionStop();
            BackHandler.removeEventListener('hardwareBackPress', handleBackButtonClick);
         };

    } , []);

    // setting the feedback item to view
    useEffect(() => {

        if(route.params?.feedbackItem){
            set_feedbackItem(route.params?.feedbackItem);
        }
        
    }, [route.params?.feedbackItem]);

    const handleBackButtonClick = () => {
        backBtnAction();
        return true;
    };

    // Naigates to previous screen
    const backBtnAction = () => {
        navigation.navigate('FeedbackComponent');
    };


    const viewFeedbackSessionStart = async () => {
        trace_in_View_Feedback_Screen = await perf().startTrace('t_View_Feedback_Screen');
      };
    
      const viewFeedbackSessionStop = async () => {
        await trace_in_View_Feedback_Screen.stop();
      };
  

    return (
        <View style={[styles.mainComponentStyle]}>

            <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Feedback'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={styles.middleViewStyle}>

                <ScrollView>

                    <View style={[styles.dataViewStyle,{alignItems:'flex-start',justifyContent:'center'}]}>
                        <Text style={[styles.feedTextStyles,{}]}>{feedbackItem ? feedbackItem.feedback : '--'}</Text>
                    </View>

                 <View style={styles.dataViewStyle}>

                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{'Pet Name : '}</Text>
                        <Text style={styles.selectedDataTextStyles}>{feedbackItem ? feedbackItem.petName : '--'}</Text>
                    </View>

                </View>

                <View style={styles.dataViewStyle}>

                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{'User : '}</Text>
                        <Text style={styles.selectedDataTextStyles}>{feedbackItem ? feedbackItem.petOwnerName : '--'}</Text>
                    </View>

                </View>

                <View style={styles.dataViewStyle}>

                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{'Date : '}</Text>
                        <Text style={styles.selectedDataTextStyles}>{feedbackItem ? moment(feedbackItem.feedbackDate).format("MM-DD-YYYY") : '--'}</Text>
                    </View>

                </View>

                <View style={styles.dataViewStyle}>

                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{'Screen : '}</Text>
                        <Text style={styles.selectedDataTextStyles}>{feedbackItem ? feedbackItem.pageName : '--'}</Text>
                    </View>

                </View>

                <View style={styles.dataViewStyle}>

                    <View style={styles.viewStyle}>
                        <Text style={styles.labelTextStyles}>{'Device Model : '}</Text>
                        <Text style={styles.selectedDataTextStyles}>{feedbackItem ? feedbackItem.deviceType : '--'}</Text>
                    </View>

                </View>

                </ScrollView>

            </View>
            
        </View>
    );
  }
  
  export default ViewFeedbackComponent;

  const styles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'           
    },

    viewStyle : {
        flexDirection:'row',
        justifyContent:'space-between',
        width:wp('70%'),
        alignContent:'center'
    },

    middleViewStyle : {
        alignItems:'center',
        marginTop: hp("5%"),
        height:hp('80%'),
    }, 

    dataViewStyle : {
        minHeight:hp('6%'),
        width:wp('80%'),
        marginTop: hp("2%"),
        borderRadius:5,
        borderColor:'#EAEAEA',
        borderWidth:1,
        justifyContent:'center',
        alignItems:'center'
    },

    labelTextStyles : {
        ...CommonStyles.textStyleMedium,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        alignSelf:'center',
    },

    selectedDataTextStyles : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        color:'black',
        flex:1,
        numberOfLines:10,
        marginTop: hp("1%"),
        marginBottom: hp("1%"),
        textAlign:'right'
    },

    feedTextStyles : {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        color:'black',
        marginTop:hp('1%'),
        marginBottom:hp('1%'),
        marginLeft:hp('2%'),
        marginRight:hp('2%'),
        textAlign:"left"
    },

  });