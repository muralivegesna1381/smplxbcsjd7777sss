import {StyleSheet} from 'react-native';
import {widthPercentageToDP as wp,heightPercentageToDP as hp} from 'react-native-responsive-screen';
import CommonStyles from './../../../utils/commonStyles/commonStyles';
import fonts from './../../../utils/commonStyles/fonts'

/**
 * All the styles for QuetionnaireQuestions feature set here.
 * These styles are imported in QuestionnaireQuestionsUi class
 */
const QuestionnaireQuestionsStyles = StyleSheet.create({

    petsSelView : {
      backgroundColor:'#91c2dd',
      width:wp('100%'),
      height:hp('10%'),
      borderRadius:5,
      justifyContent:'center',
      flexDirection:'row'
    },

    petImageStyle: {  
      width: wp('15%'),
      height: hp('6%'),
      resizeMode: "cover",
      overflow:'hidden',
      borderRadius:5,      
    },

    indexName: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontExtraSmall,
      textAlign: "left",
      color:'#000000'
    },

    questionnaireName: {
      ...CommonStyles.textStyleMedium,
      fontSize: fonts.fontMedium,
      textAlign: "left",
      color:'#000000',
      marginRight:hp('1%'),
    },

    imageStyle: {
      height: hp('4%'),
      width: wp('4%'),
      resizeMode: "contain",
      marginRight: hp("1%"),
      tintColor:'black',
    },

    collapsedBodyStyle : {
      backgroundColor:'white',
      width:wp('90%'),
      marginBottom:hp('1%'),
      marginTop:hp('-1%'),
      minHeight:hp('8%'),
      alignItems:'center',
      justifyContent:'center',
    },

    collapseHeaderStyle : {
      marginBottom:hp('1%'),
      minHeight:hp('6%'),
      width:wp('90%'),
      backgroundColor:'white',
      flexDirection:'row',
    },

    petTitle : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontNormal,
      color: 'white', 
    },

    petSubTitle : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontXSmall,
      color: 'white', 
    },

    progressAnswered : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontMedium,
      color:'#000000',
    },

    progressViewStyle : {
      flexDirection:'row',
      backgroundColor:'white',
      height:hp('4.8%'),
      width: wp("70%"), 
    },

    topBarStyles : {
        width: wp("100%"),
        height: hp("5%"),
        backgroundColor:'#6BC105',
        alignItems:'center',
        justifyContent:'center',
        flexDirection:'row'
    },

    filterButtonUI : {
        width: wp("30%"),      
        height:hp('5%'),
        backgroundColor:'#D9D9D9',
        alignSelf:'center',
        marginLeft:wp('0.5%'),
        alignItems:'center',
        
    },

    filterImageStyles : {
        marginLeft:wp('1%'),
        resizeMode:'contain',
        width: wp("5%"),      
        height:hp('4%'),
    },

    filterImageBackViewStyles : {      
      flex:1
    },

    filterTextStyle : {
        ...CommonStyles.textStyleRegular,
        fontSize: fonts.fontXSmall,
        color:'#000000',
        flex:2,
        textAlign:'center',
    },

    questListStyle: {
        position: "absolute",
        width: wp("40%"),
        backgroundColor: "white",
        alignSelf: 'flex-end',
        marginTop:hp('25%'),
        borderColor:'#818588',
        borderWidth:1
    },

    backViewGradientStyle: {
      resizeMode: 'contain',
      flex:1,
      justifyContent:'center',
      flexDirection:'row'
      
    },

    dropDownBtnStyle : {

        width: wp("80%"),      
        height:hp('5%'),
        backgroundColor:'white',
        borderRadius:10,
        borderColor:'#EAEAEA',
        borderWidth:1,
        justifyContent:'center',

    },

    dropTextStyle : {

      ...CommonStyles.textStyleMedium,
      fontSize: fonts.fontMedium,
        color:'#000000',
        marginLeft:hp('2%'),
        marginRight:hp('2%'),
        

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

    flatcontainer: {
      flex: 1,
  },

  flatview: {
      height: hp("8%"),
      marginBottom: hp("0.3%"),
      alignSelf: "center",
      justifyContent: "center",
      borderBottomColor: "grey",
      borderBottomWidth: wp("0.1%"),
      width:wp('90%'),
  },

  name: {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      textAlign: "left",
      color: "black",
  },

});

export default QuestionnaireQuestionsStyles;