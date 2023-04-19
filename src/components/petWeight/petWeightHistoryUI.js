import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image,FlatList,ImageBackground} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from './../../utils/commonComponents/headerComponent';
import fonts from './../../utils/commonStyles/fonts'
import AlertComponent from './../../utils/commonComponents/alertComponent';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import * as Constant from "./../../utils/constants/constant";
import moment from "moment";
import LoaderComponent from './../../utils/commonComponents/loaderComponent';
import BottomComponent from "./../../utils/commonComponents/bottomComponent";
import DatePicker from 'react-native-date-picker';

const  PetWeightHistoryUI = ({route, ...props }) => {

    const [weightHistoryArray, set_weightHistoryArray] = useState([]);
    const [dropDownPostion, set_DropDownPostion] = useState({x: 0,y: 0,width: 0,height: 0});
    const [isListOpen, set_ListOpen] = useState(false);
    const [isFromDate, set_isFromDate] = useState(false);
    const [isToDate, set_isToDate] = useState(false);
    const [fromDate, set_fromDate] = useState(undefined);
    const [toDate, set_toDate] = useState(undefined);
    const [datePickerDate, set_datePickerDate] = useState(new Date());
    const [datePickerDateTo, set_datePickerDateTo] = useState(new Date());
    const [filterLogsArray, set_filterLogsArray] = useState(undefined);
    const [noLogsShow, set_noLogsShow] = useState(undefined);

    useEffect(() => {
        set_weightHistoryArray(props.weightHistoryArray);
        set_filterLogsArray(props.weightHistoryArray);
        set_noLogsShow(props.noLogsShow);
    }, [props.weightHistoryArray,props.isLoading,props.noLogsShow]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const enterWeightAction = (value,item) => {
        props.enterWeightAction(value,item);
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const filterData = async () => {
      
        var upperLimit;
        var lowerLimit;
        let data = [];

        if (toDate && fromDate) {

              var parts = fromDate.split('-');
      
              var mydate = parts[2] + "-" + parts[0] + "-" + parts[1] + "T00:00:00.000Z";
      
              lowerLimit = Date.parse(mydate);
      
              var toDateparts = toDate.split('-');
      
              var toDateString = toDateparts[2] + "-" + toDateparts[0] + "-" + toDateparts[1] + "T23:59:00.000Z";
      
              upperLimit = Date.parse(toDateString);
      
              data = weightHistoryArray.filter((item) => lowerLimit <= Date.parse(item.createdDate) && Date.parse(item.createdDate, "toUTC") <= upperLimit)
              .map(({ createdDate, weight, weightUnit }) => ({ createdDate, weight, weightUnit }));

          } 

        set_ListOpen(false);
    
        if(data.length<1){
            set_noLogsShow(true);
        } else {
            set_noLogsShow(false);
        }
        
        set_filterLogsArray(data);
        set_isFromDate(false);
        set_isToDate(false);
      };

      const convertLocalDateToUTCDate = (date, toUTC) => {
        date = new Date(date);
        var localTime = date.getTime();
        date = localTime;
        date = new Date(date);
    
        return date;
      }

    const restFilter = () => {
        set_filterLogsArray(weightHistoryArray);
        set_noLogsShow(false);
        set_isFromDate(false);
        set_isToDate(false);
        set_fromDate(undefined);
        set_toDate(undefined);
        set_datePickerDate(new Date());
        set_datePickerDateTo(new Date());
    };

    const doneAction = (value) => {

        if(value==='From'){
            datePickerDate ? set_fromDate(moment(datePickerDate).format('MM-DD-YYYY')) : moment(new Date()).format('MM-DD-YYYY');
        } else if(value==='To'){
            datePickerDateTo ? set_toDate(moment(datePickerDateTo).format('MM-DD-YYYY')) : moment(new Date()).format('MM-DD-YYYY');
        }

        set_isFromDate(false);
        set_isToDate(false);

    };

    const cancelAction = () => {

        if(!fromDate){
            set_fromDate(undefined);
        }

        if(!toDate){
            set_toDate(undefined);
        }
        set_isFromDate(false);
        set_isToDate(false);

    };

    const closeAction = () => {
        set_ListOpen(!isListOpen)
        set_isToDate(false);
        set_isFromDate(false);
      }

    const renderItem = ({ item, index }) => {

        return (

            <View style={styles.cellBackViewStyle}>
                
                <Text style={[styles.tdTextextStyle,{flex:1}]}>{index+1}</Text>
                <Text style={[styles.tdTextextStyle,{flex:2}]}>{"" + moment(item.createdDate).format("MM-DD-YYYY")}</Text>
                <View style= {{flexDirection:'row',flex:1.5}}>
                <Text style={[styles.tdTextextStyle]}>{item.weight}<Text>{item.weightUnit ? ' '+item.weightUnit : ''}</Text></Text> 
                 
                </View>
                
                <TouchableOpacity style={{width:wp('5%'),height:hp('5%'),flex:0.5,}} disabled = {index===0 ? false : true} key={index} onPress={() => {enterWeightAction('edit',item)}}>
                    {index===0 ? <Image style={[styles.editImgStyle]} source={require("../../../assets/images/otherImages/svg/weightEdit.svg")}></Image> : <View style={{flex:1}}></View>}
                </TouchableOpacity>     

            </View>
        );
    };

    return (
        <View style={[CommonStyles.mainComponentStyle,{alignItems:'center'}]}>
          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Weight'}
                    headerColor = {'#F5F7F9'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View>

                {!noLogsShow || weightHistoryArray.length > 0 ? <View style={styles.mainViewStyle}>

                <ImageBackground style={[styles.filterBtnStyle]} imageStyle={{ borderRadius: 5 }} source={require("./../../../assets/images/otherImages/svg/filterGradientImg.svg")}>

                    <TouchableOpacity style={styles.filterBtnStyle} onPress={() => {set_ListOpen(!isListOpen)}}>
                        <View>
                            
                            <View onLayout={(event) => {const layout = event.nativeEvent.layout;
                                const postionDetails = {x: layout.x,y: layout.y,width: layout.width,height: layout.height,};
                                set_DropDownPostion(postionDetails);
                                }} style={[styles.SectionStyle]}>
                                
                                {<Text style = {styles.hTextextStyle}>{'Filter'}</Text>}
                                <Image style={[styles.filterIconStyle]} imageStyle={{ borderRadius: 5 }} source={require("./../../../assets/images/otherImages/svg/filterIcon.svg")}></Image>
                                
                            </View>
                        </View>
                    </TouchableOpacity>

                </ImageBackground>

                </View> : null}
                
                {!noLogsShow ? <View style={styles.headingView}>

                        <Text style={[styles.hTextextStyle,{flex:1}]}>{'S.NO'}</Text>
                        <Text style={[styles.hTextextStyle,{flex:2}]}>{'DATE'}</Text>
                        <Text style={[styles.hTextextStyle,{flex:1}]}>{'WEIGHT'}</Text>
                        <Text style={[styles.hTextextStyle,{flex:0.5}]}>{''}</Text>

                </View> : null}

                {!noLogsShow ? <View style={[styles.recordListStyle,{height: hp("55%")}]}>
                        <FlatList
                            data={filterLogsArray}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => "" + index}
                        />
                    </View> : (!props.isLoading ? <View style={{justifyContent:'center', alignItems:'center',marginTop: hp("5%"),}}>
                        <Image style= {[CommonStyles.nologsDogStyle]} source={require("./../../../assets/images/dogImages/noRecordsDog.svg")}></Image>
                        <Text style={[CommonStyles.noRecordsTextStyle]}>{Constant.NO_RECORDS_LOGS}</Text>
                        <Text style={[CommonStyles.noRecordsTextStyle1]}>{Constant.NO_RECORDS_LOGS1}</Text>
                        </View> : null)}

                    {isListOpen ? <View style={[styles.timerFilterListStyle,{ top: dropDownPostion.y + dropDownPostion.height },]}>

                    <ImageBackground style={{alignItems: "center",justifyContent : "center",}} imageStyle={{ borderRadius: 25 }} source={require("./../../../assets/images/otherImages/svg/bgTimerFilter.svg")}>

                        <TouchableOpacity style={styles.filterViewBtnStyle} onPress={() => { set_isFromDate(!isFromDate); set_isToDate(false);}}>
                            <Text style = {fromDate ? [styles.dropTextStyle,{color:'black'}] : [styles.dropTextStyle]}>{fromDate ? fromDate.toString() : 'From Date'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity disabled = {fromDate ? false : true} style={styles.filterViewBtnStyle} onPress={() => {set_isFromDate(false);set_isToDate(!isToDate);}}>
                            <Text style = {toDate ? [styles.dropTextStyle,{color:'black'}] : [styles.dropTextStyle]}>{toDate ? toDate.toString() : 'To Date'}</Text>
                        </TouchableOpacity>

                        <View style={{flexDirection:'row',width: wp("80%"),justifyContent:'space-between'}}>

                            <TouchableOpacity style={styles.filterRestBtnStyle} onPress={() => {restFilter()}}>
                                <Text style = {styles.dropBtnTextextStyle}>{'RESET'}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.filterSubmitBtnStyle} disabled={(fromDate && toDate) ? false : true} onPress={() => {filterData()}}>
                                <Text style = {styles.dropBtnTextextStyle}>{'SUBMIT'}</Text>
                            </TouchableOpacity>

                        </View>

                        <View style={[styles.dropCloseImgStyle]}>

                            <TouchableOpacity  onPress={() => closeAction()}>
                                <Image style= {[styles.closeIconStyle]} source={require("./../../../assets/images/otherImages/svg/timerCloseIcon.svg")}></Image>
                            </TouchableOpacity>

                        </View>

                    </ImageBackground>

                </View> : null}
            </View>  

            {!isFromDate && !isToDate ? <View style={CommonStyles.bottomViewComponentStyle}>
                <BottomComponent
                    rightBtnTitle = {'ENTER NEW WEIGHT'}
                    isLeftBtnEnable = {false}
                    rigthBtnState = {true}
                    isRightBtnEnable = {true}
                    rightButtonAction = {async () => enterWeightAction('new')}
                />
            </View> : null}

            {props.isPopUp ? <View style={CommonStyles.customPopUpStyle}>
                <AlertComponent
                    header = {'Alert'}
                    message={props.popupMessage}
                    isLeftBtnEnable = {false}
                    isRightBtnEnable = {true}
                    leftBtnTilte = {'Cancel'}
                    rightBtnTilte = {'LOGIN'}
                    popUpRightBtnAction = {() => popOkBtnAction()}
                    // popUpLeftBtnAction = {() => popCancelBtnAction()}
                />
            </View> : null}

            {isFromDate ? <View style={[styles.popSearchViewStyle,{height:hp('45%'),justifyContent:'center'}]}>

                    <View style={styles.datePickerMViewStyle}>

                        <View style={{flexDirection:"row",justifyContent:'space-between',marginBottom:hp('2%')}}>
                            <TouchableOpacity style={{backgroundColor:'white',height: hp('4%'),width: wp('35%'),borderRadius:5,alignItems:'center',justifyContent:'center'}} onPress={() => cancelAction()}>
                            <Text style={styles.doneTexStyle}>{'Cancel'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor:'white',height: hp('4%'),width: wp('35%'),borderRadius:5,alignItems:'center',justifyContent:'center'}} onPress={() => doneAction('From')}>
                                <Text style={styles.doneTexStyle}>{'Done'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerSubViewStyle}>
                            <DatePicker 
                                date={datePickerDate} 
                                onDateChange={(date) => set_datePickerDate(date)} 
                                mode = {"date"} 
                                textColor = {'black'} 
                                // minimumDate = {toDate ? datePickerDateTo : new Date('1900:01:01')}
                                maximumDate = {datePickerDateTo}
                                style={styles.datePickeStyle}
                            />
                        </View>                               
                    </View>
                            
                </View> : null}

                {isToDate ? <View style={[styles.popSearchViewStyle,{height:hp('45%'),justifyContent:'center'}]}>

                    <View style={styles.datePickerMViewStyle}>

                        <View style={{flexDirection:"row",justifyContent:'space-between',marginBottom:hp('2%')}}>
                            <TouchableOpacity style={{backgroundColor:'white',height: hp('4%'),width: wp('35%'),borderRadius:5,alignItems:'center',justifyContent:'center'}} onPress={() => cancelAction()}>
                            <Text style={styles.doneTexStyle}>{'Cancel'}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{backgroundColor:'white',height: hp('4%'),width: wp('35%'),borderRadius:5,alignItems:'center',justifyContent:'center'}} onPress={() => doneAction('To')}>
                                <Text style={styles.doneTexStyle}>{'Done'}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.datePickerSubViewStyle}>
                            <DatePicker 
                                date={datePickerDateTo} 
                                onDateChange={(date) => set_datePickerDateTo(date)} 
                                mode = {"date"} 
                                textColor = {'black'} 
                                maximumDate = {new Date()}
                                minimumDate = {fromDate && datePickerDate ? datePickerDate : new Date('1900:01:01')}
                                style={styles.datePickeStyle}
                            />
                        </View>                               
                    </View>
                            
                </View> : null}

            {props.isLoading ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null} 

         </View>
    );
  }
  
  export default PetWeightHistoryUI;

  const styles = StyleSheet.create({

    headingView : {
        width:wp('85%'),
        height:hp('6%'),
        flexDirection:'row',
        alignItems : 'center',
        // marginTop:hp('2%'),
    },

    hTextextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
        margin:hp('1%'),
    },

    tdTextextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleMedium,
        color: 'black',     
        margin:hp('1%'), 
    },

    recordListStyle : {
        width:wp('85%'),
        height:hp('75%'),
    },

    cellBackViewStyle : {
        flexDirection:'row',
        marginBottom:wp('1%'),
        marginTop:wp('1%'), 
        borderWidth:1,
        borderColor:'#EAEAEA',
        borderRadius:5,
        backgroundColor:'white',
        height: wp("10%"),
        alignItems:'center',
        justifyContent:'center',
    },

    editImgStyle : {
        resizeMode:'contain',          
        width:wp('5%'),
        height:hp('5%'),
    },

    mainViewStyle : {
        width:wp('85%'),
        height:hp('8%'),
        justifyContent:'center',
        alignItems:'center',
        marginTop:wp('5%')
    },

    filterBtnStyle : {
        width:wp('85%'),
        height:hp('5%'),
        borderRadius:5,
        borderColor:'#dedede',
        borderWidth:0.5,
        alignItems:'center',
        justifyContent:'center'
    },

    SectionStyle: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: hp("8%"),
        width: wp("80%"),
        borderRadius: hp("0.5%"),
        alignSelf: "center",
    },

    filterIconStyle : {
        width:wp('4%'),
        height:hp('4%'),
        resizeMode:'contain',
        marginLeft: hp('2%'),
    },

    timerFilterListStyle: {
        position: "absolute",
        width: wp("100%"),
        minHeight: hp("40%"),
        borderRadius : 15,
        alignSelf:'center'
    },

    filterViewBtnStyle : {
        width: wp("80%"),
        height: wp("10%"),
        backgroundColor : 'white',
        margin : wp("2%"),
        borderRadius : 5,
        justifyContent : "center",
        borderColor:'#EAEAEA',
        borderWidth:0.5
    },

    filterSubmitBtnStyle : {
        width: wp("35%"),
        height: wp("10%"),
        backgroundColor : '#CCE8B0',
        marginTop : wp("2%"),
        borderRadius : 5,
        alignItems:'center',
        justifyContent : "center",
        borderWidth:0.5,
        borderColor:'#6BC100'
    },

    filterRestBtnStyle : {
        width: wp("35%"),
        height: wp("10%"),
        backgroundColor : '#E7E7E9',
        marginTop : wp("2%"),
        borderRadius : 5,
        alignItems:'center',
        justifyContent : "center",
        borderWidth:0.5,
        borderColor:'#323232'
    },

    dropBtnTextextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleBold,
        color: 'black',               
    },

    dropTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: '#7F7F81', 
        marginLeft: wp('3%'),       
    },

    dropCloseImgStyle : {
        width:wp('10%'),
        height:hp('5%'),
        bottom:-10, 
        alignItems:'flex-end',
        justifyContent:'flex-end'
    },

    popSearchViewStyle : {
        height: hp("30%"),
        width: wp("95%"),
        backgroundColor:'#DCDCDC',
        bottom:0,
        position:'absolute',
        alignSelf:'center',
        borderTopRightRadius:15,
        borderTopLeftRadius:15,  
    },

    datePickerMViewStyle : {
        alignSelf:'center',
        borderRadius:5,
        marginBottom:hp('2%')
    },
  
    datePickerSubViewStyle : {
        width: wp('80%'),
        height: hp('30%'),
        alignSelf:'center',
        backgroundColor:'#f9f9f9',
        alignItems:'center',
        justifyContent:'center',       
    },
  
    datePickeStyle : {
        backgroundColor:'white',
        width: wp('70%'),
        height: hp('25%'),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 1,
    },

  });