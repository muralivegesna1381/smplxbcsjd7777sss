import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../utils/commonStyles/commonStyles';
import fonts from './../../utils/commonStyles/fonts';

/**
  * All the Styles for Dashboard Page are  declared here
  * These styles are imported in DashBoardUI class
*/

const DashBoardStyles = StyleSheet.create({

    mainComponentStyle : {
        flex:1,
        backgroundColor:'#F5F7F9'
    },

    headerView : {
        backgroundColor:'#F5F7F9',
        width:wp('100%'),
        height:hp('12%'),
        justifyContent:'center',
    },

    firstTimeUserStyle : {
        width:wp('80%'),
        height:hp('70%'),
        backgroundColor : '#F5F7F9',
        alignSelf:'center',
        justifyContent:'center',
        marginTop:wp('10%'),
    },

    ftTopViewStyle : {
        flex:1,
        justifyContent:'center'
    },

    ftdownViewStyle : {
        flex:2,
    },

    ftHeaderHeader1 : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'black', 
    },

    ftHeaderHeader2 : {
        fontSize: fonts.fontXXXLarge,
        ...CommonStyles.textStyleBold,
        color: 'black', 
    },

    ftHeaderHeader3 : {
        fontSize: fonts.fontXXXLarge,
        ...CommonStyles.textStyleRegular,
        color: '#93939C', 
    },

    ftHeaderHeader4 : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        color: 'black', 
        marginTop:wp('4%'),
        marginBottom:wp('4%'),
    },

    ftytLnksHeaderHeader : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleMedium,
        color: 'black', 
        flex:2,
        marginLeft: wp("2%"),
        marginRight: wp("2%"),
    },

    ytLinkViewStyle : {
        width:wp('80%'),
        height:hp('10%'),
        marginBottom:wp('2%'),
        borderBottomColor:'#707070',
        borderBottomWidth:0.2,
        flexDirection:'row',
        alignItems:'center',
        
    },

    youTubeThumbs : {
        flex:1,
        marginRight: wp("2%"),
        width:wp('25%'),
        height:hp('8%'),
        borderRadius:15
    },

    leadeBoardStyle : {
        height:hp('38%'),
        width:wp('100%'),
        backgroundColor:'#DFF3FA'
    },

    tilesViewStyle : {
        flexDirection:'row',
        borderWidth:0.5,
        borderColor:'#dedede',
        borderRadius:5,
        width:wp('44%'),
        height:hp('8%'),
        backgroundColor:'white',
        alignItems:'center'
    },

    sensorSelView : {
        width:wp('90%'),
        minHeight:hp('8%'),
        borderRadius:5,
        alignSelf:'center',
        marginTop:hp('1%'),
        borderColor:'#dedede',
        borderWidth:0.5,
        flexDirection:'row',
        backgroundColor:'white'
    },

    petDetailsView : {
        width:wp('90%'),
        minHeight:hp('10%'),
        alignSelf:'center',
        // marginTop:hp('1%'),
    },

    questionnaireView : {
        width:wp('90%'),
        height:hp('12%'),
        alignSelf:'center',
        marginTop:hp('1%'),
    },

    petDHeaderTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleLight,
        color: 'black', 
    },

    petDSubHeaderTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleBold,
        color: 'black',       
    },

    actyHeaderTextStyle : {
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleExtraBold,
        color: 'black', 
    },

    questionnaireTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'black', 
    },

    sensorHeader2 : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleBold,
        color: 'black', 
        marginBottom: hp("0.5%"),
    },

    sensorSubHeader2 : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleBold,
        color: '#6fc309', 
    },

    sensorSubHeader3 : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleBold,
        color: '#6fc309', 
    },

    actySubHeaderTextStyle : {
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleBold,
        color: '#9DA2A9', 
    },

    buttonstyle : {
        justifyContent: "center",
        alignItems:'center',
    },

    btnTextStyle: {
        color: '#DE1111',
        fontSize: fonts.fontNormal,
        ...CommonStyles.textStyleBold,
    },

    qstButtonstyle : {
        width: hp("6%"),
        height: hp("6%"),
    },

    qstbtnImgStyle : {
        width: hp("4.5%"),
        height: hp("4.5%"),
        resizeMode:'contain',
    },

    wtbtnImgStyle : {
        flex:1,
        resizeMode:'contain',
        marginLeft:hp('1%'),   
    },

    qstPointsHeaderTextStyle : {
        fontSize: fonts.fontLarge,
        ...CommonStyles.textStyleExtraBold,
        color: '#6BC100', 
        marginBottom:hp('0.5%'), 
    },

    openButtonstyle : {
        backgroundColor: "white",
        width: hp("10%"),
        height: hp("4%"),
        borderRadius: hp("0.5%"),
        justifyContent: "center",
        alignItems:'center',
        borderColor:'#EAEAEA',
        borderWidth:1.0,
    },

    openBtnTextStyle: {
        color: 'black',
        fontSize: fonts.fontXSmall,
        ...CommonStyles.textStyleExtraBold,
    },

    missingTextStyle : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
    },

    missingTextStyle1 : {
        textAlign:'center',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleRegular,
        marginTop:hp('1%'),
    },

    missingBackViewStyle : {
        width:wp('80%'), 
        justifyContent:'center', 
        alignItems:'center', 
        alignSelf:'center',
        marginTop:hp('1%'),
    },

    indexTextStyle : {
        fontSize: fonts.fontXXLarge,
        ...CommonStyles.textStyleBold,
        color: '#6BC100', 
    },

    detailsImgsStyle : {      
        width:wp('6%'),
        aspectRatio:1,
        resizeMode:'contain'
    },

    detailsBubImgStyle : {       
        width:wp('10%'),
        aspectRatio:1,
        borderColor:'#6BC105',
        alignItems:'center',
        justifyContent:'center', 
        borderWidth:1,
        borderRadius:5,
        marginLeft:hp('1.5%'),
        marginRight:hp('1%'),
    },

    missingDogImgStyle : {
        width:wp('15%'),
        resizeMode:'contain',
        alignSelf:'center',
    },

    quickselctionViewStyle : {
        width:wp('90%'),
        height:hp('8%'),
        borderRadius:5,
        alignSelf:'center',
        marginTop:hp('1%'),
        flexDirection:'row',
        backgroundColor:'#BEEEFF',
    },

    quickActionsInnerViewStyle : {
        justifyContent:'center',
        alignItems:'center',
        minHeight:hp('1%'),
        flex:1
    },

    quickbtnInnerImgStyle : {
        width:wp('6%'),
        height:hp('4%'),
        resizeMode:'contain',
    },

    quickbtnInnerTextStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleBold,
        color: 'black', 
        alignSelf:'center',
    },

    firmwareAlertStyle : {
        width:wp('4%'),
        height:hp('3%'),
        resizeMode:'contain',
        marginLeft:wp('0.5%'),
    },
  
    flatcontainer: {
        width: wp("90%"),
        marginTop: hp("2%"),
        flex:1,
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontSmall,
        textAlign: "left",
        color: "black",
        marginLeft: hp("1%"),
        marginRight: hp("1%"),
        marginTop: hp("1%"),
    },

    meterialViewStyle : {
        width:wp('26%'),
        height:hp('14%'),
        borderRadius:5,
        backgroundColor:'white',
        margin:  hp('1%'),
        alignSelf:'flex-start'
    },

    backdrop: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "contain",
    },

    backdrop1: {
        height: hp("8%"),
        width: wp("26%"),
        justifyContent:'center',
        resizeMode: "stretch",
    },

    playIconStyle : {      
        width: wp("6%"),
        height: hp("6%"),
        alignSelf: "center",       
        resizeMode: "contain",
    },

    eatingScoreViewStyle : {
        flexDirection:'row',
        marginTop:hp('1%'),
        justifyContent:'space-between',
        width:wp('90%'),
        height:hp('16%'),
        flexDirection:'row',
        alignItems:'center',
    },

    eatingScoreSubViewStyle : {
        width:wp('43%'),
        height:hp('14%'),
        borderRadius:5,
        justifyContent:'center'   
    },

    enthusasticTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontSmall,
        textAlign: "left",
        marginLeft:hp('2%'),
    },

    enthusiasticBtnStyle : {
        width:wp('25%'),
        height:hp('4%'),
        backgroundColor:'white',
        borderRadius:5,
        marginLeft:hp('2%'),
        marginTop:hp('1%'),
        alignItems:'center',
        justifyContent:'center'
    },

    imgScoreTextStyle : {
        ...CommonStyles.textStyleBold,
        fontSize: fonts.fontXSmall,
        textAlign: "left",
        marginLeft:hp('2%'),
    },

    progressStyle : {
        fontSize: fonts.fontSmall,
        ...CommonStyles.textStyleSemiBold,
        color: 'white', 
    },

    alertTextStyle: {
        color: 'white',
        fontSize: fonts.fontMedium,
        ...CommonStyles.textStyleSemiBold,
        textAlign: "center",
    },

});

export default DashBoardStyles;