import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,TouchableOpacity,Image, FlatList} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import Fonts from './../../utils/commonStyles/fonts'
import CommonStyles from './../../utils/commonStyles/commonStyles';

const  MenuUI = ({route, ...props }) => {

  const [renderArray, set_renderArray] = useState(undefined);

    useEffect(() => {

      let tempArray = [];
      if(props.modularityArray&&props.renderArray){
        
        for (let i=0; i<props.renderArray.length; i++){
          if(props.modularityArray.includes(props.renderArray[i].mobileAppConfigID)){
            tempArray.push(props.renderArray[i]);
          }
        }
        
      } else {

        if(props.renderArray){
        
          for (let i=0; i<props.renderArray.length; i++){
            if(props.renderArray[i].mobileAppConfigID === 0){
              tempArray.push(props.renderArray[i]);
            }
  
          }
        }

      }

      set_renderArray(tempArray);
      
    }, [props.renderArray,props.modularityArray]);

    const menuBtnAction = (item,index) => {
      props.menuBtnAction(item);
    };

    const menuHeaderBtnAction = () => {
      props.menuHeaderBtnAction();
    };

    return (
        <View style={[styles.mainComponentStyle]}>

          <View style={styles.topView}>

            <TouchableOpacity style = {{width:wp('35%')}} onPress={() => menuHeaderBtnAction()}>
                <View style = {{flexDirection:'row',marginLeft:wp('5%'),alignItems:'center'}}>
                    <Image source={require('../../../assets/images/sideMenuImages/svg/menuImg.svg')} style={styles.hImgStyle} />
                    <Text style={styles.headerTextStyle}>{'Menu'}</Text>
                </View>
            </TouchableOpacity>
              
          </View>

          <View style={styles.menuView}>

            <FlatList
                style={styles.flatcontainer}
                data={renderArray}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (

                    <View style={{alignItems:'center',width: wp('30%'),}}>

                        <TouchableOpacity  onPress={() => menuBtnAction(item, index)}>
                            <View style={styles.flatview}>
                              <Image source={item.iconImg} style={styles.btnImgStyle} />
                            </View>
                            <Text style={[styles.labelTextStyle]}>{item.title}</Text>
                        </TouchableOpacity>

                    </View> 

                )}
                keyExtractor={(item) => item.title}
                numColumns={3}
            />

          </View>

        </View>
    );
  }
  
  export default MenuUI;

  const styles = StyleSheet.create({

    mainComponentStyle : {
      flex:1,
      backgroundColor:'#DFE0E9'         
    },

    topView : {
      flex : 1,
      justifyContent:'center',
    },

    menuView : {
      flex : 4,
      alignItems:'center',
    },

    flatcontainer: {
      width: wp('90%'),
      alignSelf:'center',      
    },

    flatview: {
      width:wp('22%'),
      aspectRatio:1,
      justifyContent:'center',
      alignItems:'center',
      backgroundColor:'white',
      margin:  hp('1%'),
      borderRadius:5,
      marginTop :  hp('3%'),
    },

    headerTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontXLarge,
      color:'black',
      marginLeft:wp('5%'),
    },

    labelTextStyle : {
      ...CommonStyles.textStyleBold,
      fontSize: Fonts.fontSmall,
      color:'black',
      marginTop:wp('2%'),
      textAlign:'center'
    },

    btnImgStyle : {
      width:wp('10%'),
      aspectRatio:1,
      resizeMode:'contain',
    },

    hImgStyle : {
      width:wp('6%'),
      aspectRatio:1,
      resizeMode:'contain',
    },

  });