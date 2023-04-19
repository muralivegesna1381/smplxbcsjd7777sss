import React, { useState, useEffect } from 'react';
import {View,} from 'react-native';
import SelectPetUI from './selectPetUI';

const SelectPetComponent = ({navigation, route, ...props }) => {

    const [petsArray, set_petsArray] = useState(undefined);
    const [selectedIndex, set_selectedIndex] = useState(undefined);

     useEffect(() => {
        set_petsArray(props.petsArray);
        set_selectedIndex(props.selectedIndex);
    }, [props.petsArray,props.selectedIndex]);

    const selectPetAction = (item) => {
        props.selectPetAction(item);
    }

    return (
        <SelectPetUI 
            petsArray = {petsArray}
            selectedIndex = {selectedIndex}
            selectPetAction = {selectPetAction}
        />
    );

  }
  
  export default SelectPetComponent;