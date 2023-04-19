import React, { useState, useEffect,useRef } from 'react';
import {View,StyleSheet,TouchableOpacity,ImageBackground,Image,Text,ActivityIndicator} from 'react-native';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
 import Carousel, {Pagination} from 'react-native-snap-carousel';
import fonts from '../commonStyles/fonts'
import CommonStyles from '../commonStyles/commonStyles';

let defaultPetImg = require( "./../../../assets/images/otherImages/svg/defaultDogIcon_dog.svg");

const  PetsSelectionCarousel = ({route,petsArray,setValue,setSlideValue,isSwipeEnable,defaultPet,activeSlides,isFromScreen, ...props }) => {

    const [ndexValue,set_indexValue] = useState(0);
    const [petsArrayLocal, set_petsArrayLocal] = useState([]);
    const [imgLoader, set_imgLoader] = useState(true);
    const [indexCount, set_indexCount] = useState(0);
	  const carouselRef = useRef(null);

    React.useLayoutEffect(() => {

      if(defaultPet){

        let ind = getIndex(petsArray,defaultPet.petID);
        set_indexValue(ind);

      }
      
    }, [defaultPet,petsArray]);

    useEffect(() => {

    }, [activeSlides]);

    const renderScrollItem = (item) => {

        let ind = getIndex(petsArray,carouselRef.current.props.data[item].petID);
        // setValue(carouselRef.current.props.data[item]);
        // carouselRef.current.snapToItem(ind);
        set_indexCount(ind);
        if(activeSlides === ind && petsArray.length > 1){

        } else {
          setValue(carouselRef.current.props.data[item]);
          carouselRef.current.snapToItem(ind);
        }

        // if(activeSlides===ind){
          
        // } else {
        //   setValue(carouselRef.current.props.data[item]);
        //   carouselRef.current.snapToItem(ind);
        // }       
    };

    const editPetAction = (item) => {
        props.editPetAction(item);
    };

    function getIndex(arr,petID) {
      return arr.findIndex(obj => obj.petID === petID);
    };

  const renderItem = ({item, index}) => {

    return (

             <TouchableOpacity disabled = {!isSwipeEnable} style={styles.petComponentStyle} onPress={() => { renderScrollItem(index) }}>
                {index === activeSlides ? 
                  <ImageBackground source={require("./../../../assets/images/otherImages/png/ActiveSlider.png")} style={styles.gradientImgStyle} imageStyle={{ borderRadius: 8, borderColor:'white', borderWidth:0.5 }}>

                      <ImageBackground source={defaultPetImg} style={[styles.backdrop,{}]} imageStyle={{ borderRadius: 8, borderColor:'white', borderWidth:0.5 }}>
                        {item.photoUrl && item.photoUrl !=="" ? <ImageBackground source={{uri:item.photoUrl}} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                            set_imgLoader(false)}} style={[styles.backdrop,{}]} imageStyle={{ borderRadius: 5 }}>
                              {imgLoader ? <ActivityIndicator size='small' color="grey"/> : null}
                            </ImageBackground> : 
                            <ImageBackground source={defaultPetImg} style={[styles.backdrop,{}]} imageStyle={{ borderRadius: 5 }}>
                            </ImageBackground>}
                      </ImageBackground>

                      <View style={{height: hp("8%"),alignSelf:'center',flex:2,justifyContent:'center'}}>
                          
                          <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                              <Text numberOfLines={1} style={[styles.petTitle]}>{ item.petName.length> 9 ? item.petName.slice(0, 9)+"..."  : item.petName }</Text>
                          </View>

                          <View>
                              <Text numberOfLines={1} style={[styles.petSubTitle]}>{item.petBreed.length > 9 ? item.petBreed.slice(0, 12)+"..." : item.petBreed}</Text>
                              <Text style={[styles.genderTitle,]}>{ item.speciesId==='1' ? 'Dog ' : 'Cat '}<Text>{item.gender ? '- ' +item.gender : item.gender}</Text></Text>
                          </View>

                      </View>

                  {index === activeSlides && isFromScreen === "Dashboard" ? 
                          <TouchableOpacity style={styles.editPetBtnStyle} onPress={() => {editPetAction(item)}}>
                            <Image source={require("./../../../assets/images/otherImages/svg/petEditCarasoul.svg")} style={styles.editImgStyle}></Image>
                          </TouchableOpacity>
                       : null}
             
                  </ImageBackground> : 

                  <View style={{flexDirection:'row',flex:1}}>

                      <ImageBackground source={require("./../../../assets/images/otherImages/png/unActiveSlider.png")} style={styles.gradientImgStyle} imageStyle={{ borderRadius: 5 }}>

                          <ImageBackground source={defaultPetImg} style={[styles.backdrop,{}]} imageStyle={{ borderRadius: 8, borderColor:'white', borderWidth:0.5 }}>
                          {item.photoUrl && item.photoUrl !=="" ? 
                                <ImageBackground source={{uri:item.photoUrl}} onLoadStart={() => set_imgLoader(true)} onLoadEnd={() => {
                                    set_imgLoader(false)}} style={index=== activeSlides ? [styles.backdrop,{}] : [styles.backdrop]} imageStyle={{ borderRadius: 5 }}>
                                      {imgLoader ? <ActivityIndicator size="small" color="grey"/> : null}
                                </ImageBackground> : 
                                <ImageBackground source={defaultPetImg} style={index=== activeSlides ? [styles.backdrop,{}] : [styles.backdrop]} imageStyle={{ borderRadius: 5 }}></ImageBackground>}
                          </ImageBackground>

                            <View style={{height: hp("9%"),alignSelf:'center',flex:2,justifyContent:'center'}}>

                                <Text style={[styles.petTitle]}>{ item.petName.length> 9 ? item.petName.slice(0, 9)+"..."  : item.petName }</Text>

                                    <View style={{flexDirection:'row',justifyContent:'space-between'}}>
                                      <View>
                                        <Text numberOfLines={1} style={[styles.petSubTitle]}>{item.petBreed.length > 9 ? item.petBreed.slice(0, 9)+"..." : item.petBreed}</Text>
                                        <Text style={[styles.genderTitle,]}>{ item.speciesId === '1' ? 'Dog ' : 'Cat '}<Text style={[styles.genderTitle,]}>{item.gender ? '- ' +item.gender : item.gender}</Text></Text>
                                      </View>

                                    </View>
                                        
                            </View>
                      </ImageBackground>

                  </View>} 

            </TouchableOpacity>
    );
}

    return (
        <View style={styles.mainComponentStyle}> 

              <ImageBackground style={[styles.backViewGradientStyle]} imageStyle={{ borderRadius: 5 }} source={require("./../../../assets/images/otherImages/png/petCarasoulBck.png")}>

                  <View style={[styles.imageViewStyle]}>
                    <Carousel
                        ref={carouselRef}
                        data={petsArray}
                        renderItem={renderItem}
                        sliderWidth={wp('100%')}
                        itemWidth={wp('48%')} 
                      //  enableSnap={true}
                        layout={'default'}
                        // activeSlideAlignment = {petsArray && (indexCount === petsArray.length - 1) ? 'center' : 'start'}
                        activeSlideAlignment = {'start'}
                        firstItem={activeSlides}
                        hasParallaxImages={true}
                        // backgroundColor={'black'}
                          // centerMode = {false}
                        // centerSlidePercentage = {100}
                        onSnapToItem={data => renderScrollItem(data)}
                        // onPress={(index) => { ref.carouselRef.snapToNext(index); }}
                        scrollEnabled = {isSwipeEnable}
                        inactiveSlideOpacity = {1}
                        useScrollView={true}
                        enableSnap = {true}
                        // inactiveSlideScale = {100}
                        // inactiveSlideShift={0}
                        // layoutCardOffset={9}
                        //  currentIndex={6}
                        // currentScrollPosition = {activeSlide}
                        // inactiveSlideShift = {activeSlides}
                    />
                    {/* {getPagination()}  */}
                  </View>
              </ImageBackground>

         </View>
    );
  }
  
  export default PetsSelectionCarousel;

  const styles = StyleSheet.create({
    
    mainComponentStyle : {
      justifyContent:'center',
      minHeight:hp('12%'),
    },

    petComponentStyle : {
      flexDirection:'row',
      height:hp('9%'),  
    },

    backdrop: {
      resizeMode: 'contain',
      marginLeft:hp('1%'),
      marginRight:hp('1%'),
      aspectRatio:1,
      height:hp('6%'),
      alignSelf:'center',  
      justifyContent:'center'      
    },

    genderTitle : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontSmall,
      color: 'white', 
    },

    petTitle : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontXSmall,
      color: 'white', 
      marginBottom:hp('0.3%'),
    },

    petSubTitle : {
      ...CommonStyles.textStyleBold,
      fontSize: fonts.fontSmall,
      color: 'white', 
      marginBottom:hp('0.3%'),
    },

    imageViewStyle : {
      width:wp('100%'),
      alignSelf:'flex-start',
      marginLeft:wp('2%'),
    },

    imageViewStyle1 : {
      width:wp('100%'),
      alignSelf:'flex-start',
      marginRight:wp('2%'),     
    },

    editPetBtnStyle : {
      width: wp("8%"),
      aspectRatio:1,
    },

    editImgStyle : {
      width: wp("6%"),
      height: wp("5%"),
      resizeMode:'contain',
      overflow:'hidden',
      alignSelf: 'flex-end',
      marginRight: -1.5,
      marginTop: 0.8,        
    },

    backViewGradientStyle: {
      resizeMode: 'contain',
      flex:1,
      justifyContent:'center',       
    },

    gradientImgStyle : {
      resizeMode:'contain',
      height:hp('9%'),
      width:wp('45%'),
      flexDirection:'row',       
    },

  });