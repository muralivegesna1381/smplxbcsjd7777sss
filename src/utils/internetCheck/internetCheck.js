import NetInfo from "@react-native-community/netinfo";

export async function internetCheck  () {
//     let test = undefined;
     // test = await NetInfo.fetch().isConnected;
     let netInfo = await NetInfo.fetch(null,true);
     return netInfo.isConnected;
}

export async function internetTypeCheck  () {
     let netInfo = await NetInfo.fetch();
     return netInfo.type;
}
