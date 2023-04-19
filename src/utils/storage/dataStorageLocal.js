import AsyncStorage from "@react-native-community/async-storage";
import Constant from "../constants/constant"

export async function saveDataToAsync (constName,value) {
    AsyncStorage.setItem(constName,value);
}

export async function getDataFromAsync (constName) {
    let data = AsyncStorage.getItem(constName);
     return data;
}

export async function removeDataFromAsync (constName) {
    AsyncStorage.removeItem(constName);
    //  return data;
}