import React, { useState, useEffect, useRef } from 'react';
import {View,Button,BackHandler} from 'react-native';
import SelectBehavioursUI from './selectBehavioursUI';
import { useLazyQuery } from "@apollo/react-hooks";
import * as Queries from "../../../../config/apollo/queries";
import * as Constant from "../../../../utils/constants/constant";
import * as DataStorageLocal from "../../../../utils/storage/dataStorageLocal";

const  SelectBehavioursComponent = ({navigation, route, ...props }) => {

    const [getBehavioursRequest,{loading: getBehavioursLoading, error: getBehavioursError, data: getBehavioursData,}] = useLazyQuery(Queries.GET_BEHAVIORS);

    const [selectedPet, set_selectedPet] = useState(undefined);
    const [obsText , set_obsText] = useState(undefined);
    const [isLoading, set_isLoading] = useState(false);
    const [loaderMsg, set_loaderMsg] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);
    let isLoadingdRef = useRef(0);

     useEffect(() => {

        if(route.params?.selectedPet){
            set_selectedPet(route.params?.selectedPet);
        }

        if(route.params?.obsText){
            set_obsText(route.params?.obsText);
        }

        set_isLoading(true);
        isLoadingdRef.current = 1;
        behavioursAPIRequest();

    }, [route.params?.selectedPet, route.params?.obsText]);

    /**
   * This Useeffect calls when there is cahnge in API responce
   * All the Behaviours data will be saved for rendering in UI
   */
  useEffect(() => {
    if (getBehavioursData) {
      if (getBehavioursData.getBehaviors.result.behaviors){
        set_isLoading(false);
        isLoadingdRef.current = 0;
        set_behavioursData(getBehavioursData.getBehaviors.result.behaviors);
      }
      if(getBehavioursError){
        set_isLoading(false);
        isLoadingdRef.current = 0;
      }
    }
  }, [getBehavioursLoading, getBehavioursError, getBehavioursData]);

  const behavioursAPIRequest = async () => {
    
      async function prepareAPIRequest() {
      set_isLoading(true);
      isLoadingdRef.current = 1;
      set_loaderMsg(Constant.BEHAVIOURS_LOADING_MSG);
      let clientId = await DataStorageLocal.getDataFromAsync(Constant.CLIENT_ID);
      let patientJson = {
        ClientID: "" + clientId,
      };
      await getBehavioursRequest({
        variables: { input: patientJson },
      });
    }
    prepareAPIRequest();
  };

    const submitAction = (obserItem) => {
        navigation.navigate("SelectDateComponent",{selectedPet : selectedPet , obsText : obsText, obserItem : obserItem});         
    };

    const navigateToPrevious = () => {        
        navigation.navigate("ObservationComponent");     
    };

    return (
        <SelectBehavioursUI 

            isLoading = {isLoading}
            loaderMsg = {loaderMsg}
            behavioursData = {behavioursData}
            navigateToPrevious = {navigateToPrevious}
            submitAction = {submitAction}
        />
    );

  }
  
  export default SelectBehavioursComponent;