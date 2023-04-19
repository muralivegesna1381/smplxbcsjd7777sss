import React, { useState, useEffect } from 'react';
import {View,} from 'react-native';
import ViewObservationsUi from './viewObservationUI';

const  ViewObservationComponent = ({navigation, route, ...props }) => {

    const [obsObject, set_obsObject] = useState(undefined);
    const [behavioursData, set_behavioursData] = useState(undefined);

    useEffect(() => {

    }, [props.isPopUp,props.popUpMessage,props.popUpAlert,props.popUplftBtnEnable,props.popUplftBtnTitle,props.popupRgtBtnTitle]);

     useEffect(() => {

        if(props.obsObject){
            set_obsObject(props.obsObject);       
        }

        set_behavioursData(props.behavioursData);

    }, [props.obsObject,props.behavioursData]);

    const deleteButtonAction = (item) => {
        props.deleteButtonAction(item);
    };

    const navigateToPrevious = () => { 
        props.navigateToPrevious()    
    };

    const viewAction = (value) => {
        props.viewAction(value);
    };

    const leftButtonAction = () => {
        props.leftButtonAction();
    };

    const popOkBtnAction = () => {
        props.popOkBtnAction(false);
    };

    const popCancelBtnAction = () => {
        props.popCancelBtnAction();
    };

    return (
        <ViewObservationsUi 
            obsObject = {obsObject}
            behavioursData = {behavioursData}
            mediaArray = {props.mediaArray}
            isLoading = {props.isLoading}
            popupRgtBtnTitle = {props.popupRgtBtnTitle}
            popUplftBtnEnable = {props.popUplftBtnEnable}
            popUplftBtnTitle = {props.popUplftBtnTitle}
            popUpMessage = {props.popUpMessage}
            popUpAlert = {props.popUpAlert}
            isPopUp = {props.isPopUp}
            navigateToPrevious = {navigateToPrevious}
            deleteButtonAction = {deleteButtonAction}
            viewAction = {viewAction}
            leftButtonAction = {leftButtonAction}
            popCancelBtnAction = {popCancelBtnAction}
            popOkBtnAction = {popOkBtnAction}
        />
    );

  }
  
  export default ViewObservationComponent;