import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

const  SupportUI = ({route, ...props }) => {

  const [arraySupport, set_arraySupport] = useState(undefined);

    useEffect(() => {
      set_arraySupport(props.arraySupport);
    }, [props.arraySupport]);

    const backBtnAction = () => {
        props.navigateToPrevious();
    };

    const selectSupportAction = (item) => {
        props.selectSupportAction(item);
    };

    const _renderSupportItems = () => {
      if(arraySupport) {
          return arraySupport.map((item,index) => {
              return (
                 <>
                 <View style={styles.renderStyle}>
                    <View style={styles.renderBckView}>
                      <TouchableOpacity style={{flexDirection:'row', alignItems:'center'}} onPress={() => selectSupportAction(item)}>
                        <Image source={item.img} style={styles.imgStyle}/>
                        <View>
                          <Text style={styles.headerText}>{item.header}</Text>
                          {item && item.header==='Phone' ? <Text style={styles.subHeaderText}>{'Mon - Fri 9 AM - 6 PM CST'}</Text> : null}
                        </View>
                      </TouchableOpacity>
                    </View>
                 </View>
                 </>
               )
          });
        }
     };

    return (
        <View style={[CommonStyles.mainComponentStyle]}>

          <View style={[CommonStyles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Support'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{alignItems:'center',height:hp('90%')}}> 
              <Image source={require("./../../../../assets/images/otherImages/svg/supportCat.svg")} style={styles.headerImgStyle}/>
              <KeyboardAwareScrollView showsVerticalScrollIndicator ={false}>             
                <View style={{marginTop:hp('2%'),marginBottom:hp('5%')}}>
                  {_renderSupportItems()}
                </View>
              </KeyboardAwareScrollView>
            </View>  

         </View>
    );
  }
  
  export default SupportUI;

  const styles = StyleSheet.create({

    renderStyle : {
      width:wp('80%'),
      alignSelf:'center'
    },

    renderBckView : {
      width:wp('80%'),
      height: hp('10%'),
      backgroundColor:'#f5f7f9',
      borderRadius: 15,
      marginBottom:wp('3%'),
      justifyContent:'center',     
    },

    imgStyle : {
      width: wp('10%'),
      aspectRatio:1,
      resizeMode: 'contain',
      marginLeft:hp('3%'),
      marginRight:wp('5%'),
    },

    headerImgStyle : {
      width: wp('100%'),
      resizeMode: 'contain',
    },

    headerText : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontLarge,
      color:'black',
      marginBottom:hp('1%')
    },

    subHeaderText : {
      ...CommonStyles.textStyleSemiBold,
      fontSize: fonts.fontMedium,
      color:'grey',
      marginBottom:hp('1%')
    },

  });