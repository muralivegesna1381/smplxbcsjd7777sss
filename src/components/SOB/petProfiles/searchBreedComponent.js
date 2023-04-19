import React, { useState, useEffect } from 'react';
import {View,StyleSheet,Text,FlatList,TouchableOpacity,TextInput,Keyboard} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { useLazyQuery } from "@apollo/react-hooks";
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import HeaderComponent from '../../../utils/commonComponents/headerComponent';
import fonts from '../../../utils/commonStyles/fonts'
import CommonStyles from '../../../utils/commonStyles/commonStyles';
import * as Queries from "./../../../config/apollo/queries";
import LoaderComponent from './../../../utils/commonComponents/loaderComponent';

const  SearchBreedComponent = ({route, ...props }) => {

    const [getBreedDetails,{loading: getBreedDetailsLoading,error: getBreedDetailsError,data: getBreedDetailsData,},] = useLazyQuery(Queries.GET_BREED_DETAILS,);

    const navigation = useNavigation();
    const [isBtnEnable, set_isBtnEnable] = useState(false);
    const [selectedIndex, set_selectedIndex] = useState(undefined);
    const [searchText, set_searchText] = useState(undefined);
    const [breedsArray, set_breedsArray] = useState(undefined);
    const [filterBreedsArray, set_filterBreedsArray] = useState(undefined);
    const [isLoading, set_isLoading] = useState(true);
    const [isNeutered, set_isNeutered] = useState(undefined);
    const [gender, set_gender] = useState(undefined);
    const [petName, set_petName] = useState(undefined);
    const [deviceNo, set_deviceNo] = useState(undefined);

    useEffect(() => {

        if(route.params?.deviceNumber) {
            set_deviceNo(route.params?.deviceNumber);
        }

        if(route.params?.petName) {
            set_petName(route.params?.petName);
        }

        if(route.params?.gender) {
            set_gender(route.params?.gender);
        }

        if(route.params?.isNeutered) {
            set_isNeutered(route.params?.isNeutered);
        }
        
    }, [route.params?.deviceNumber, route.params?.petName, route.params?.gender, route.params?.isNeutered]);

    useEffect(() => {

        getBreeds();

    }, []);

    useEffect(() => { 

        if(getBreedDetailsData){
            set_breedsArray(getBreedDetailsData.breedDetails.result);
            set_filterBreedsArray(getBreedDetailsData.breedDetails.result);
            set_isLoading(false);
        }

        if(getBreedDetailsError){
            set_isLoading(false);
        }
    
    }, [getBreedDetailsLoading, getBreedDetailsError, getBreedDetailsData]);

    const getBreeds = async () => {
        await getBreedDetails();
    };

    const backBtnAction = (breedItem) => {
        navigation.navigate('PetBreedComponent',{breedItem : breedItem});  
    };

    const onCancelSearch = async () => {
        set_searchText(undefined);
        searchFilterFunction("");
        set_filterBreedsArray(breedsArray);
        Keyboard.dismiss();
    };

    const searchFilterFunction = (text) => {
        set_searchText(text);
        const newData = breedsArray.filter(function(item) {
          const itemData = item ? item.breedName.toUpperCase() : "".toUpperCase();
          const textData = text.toUpperCase();
          return itemData.indexOf(textData) > -1;
        });
    
        set_filterBreedsArray(newData);
        // this.setState({
        //   dataSource: newData,
        //   text: text,
        // });
    };

    const actionOnRow = (item) => {
        ///// Captures breed name and breed id after selecting the breed from the list ////
        backBtnAction(item);
    }

    return (
        <View style={[styles.mainComponentStyle]}>

          <View style={[styles.headerView,{}]}>
                <HeaderComponent
                    isBackBtnEnable={true}
                    isSettingsEnable={false}
                    isChatEnable={false}
                    isTImerEnable={false}
                    isTitleHeaderEnable={true}
                    title={'Pet Profile'}
                    backBtnAction = {() => backBtnAction()}
                />
            </View>

            <View style={{width:wp('100%'),height:hp('85%'),alignItems:'center'}}>

                <View style={styles.topView}>
                    <TextInput
                        style={styles.textInputStyle}
                        onChangeText={(text) => searchFilterFunction(text)}
                        value={searchText}
                        underlineColorAndroid="transparent"
                        placeholder="Search Here"
                        returnKeyLabel="Search"
                        returnKeyType="search"
                        onSubmitEditing={Keyboard.dismiss}
                    />
                    <TouchableOpacity
                        onPress={onCancelSearch}
                        style={styles.topButtonView}
                    >
                        <Text
                        style={[
                            styles.name,
                            { color: "#37B57C", marginLeft: hp("1.5%") },
                        ]}
                        >
                        {"Cancel"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    style={styles.flatcontainer}
                    data={filterBreedsArray}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity onPress={() => actionOnRow(item)}>
                        <View style={styles.flatview}>
                            <Text numberOfLines={2} style={[styles.name]}>{item.breedName}</Text>
                        </View>
                        </TouchableOpacity>
                    )}
                    enableEmptySections={true}
                    keyExtractor={(item) => item.breedName}
                />

            </View>
            {isLoading === true ? <LoaderComponent isLoader={true} loaderText = {'Please wait..'} isButtonEnable = {false} /> : null} 
         </View>
    );
  }
  
  export default SearchBreedComponent;

  const styles = StyleSheet.create({
    mainComponentStyle : {
        flex:1,
        backgroundColor:'white'
            
    },

    headerView : {
        backgroundColor:'white',
        width:wp('100%'),
        height:hp('12%'),
        justifyContent:'center',
    },

    topView: {
        height: hp("10%"),
        flexDirection: "row",
        alignItems: "center",
    },

    textInputStyle: {
        height: hp("5%"),
        flex: 3,
        borderWidth: 1,
        borderColor: "#37B57C",
        backgroundColor: "#FFFFFF",
        borderRadius: 5,
        marginLeft: wp("4%"),
        paddingLeft: wp("2%"),
    },

    name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontNormal,
        textAlign: "left",
        marginLeft: hp("3%"),
        color: "black",
      },
      topButtonView: {
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
        height: hp("5%"),
      },

      flatcontainer: {
        flex: 1,
      },

      flatview: {
        height: hp("8%"),
        marginBottom: hp("0.3%"),
        alignContent: "center",
        //backgroundColor:'#37B57C',
        justifyContent: "center",
        borderBottomColor: "grey",
        borderBottomWidth: wp("0.1%"),
        width:wp('90%'),
      },

      name: {
        ...CommonStyles.textStyleSemiBold,
        fontSize: fonts.fontMedium,
        textAlign: "left",
        marginLeft: hp("3%"),
        color: "black",
      },
  

  });