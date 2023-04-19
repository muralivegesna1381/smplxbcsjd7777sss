import React, { useState, useEffect } from "react";
import { NativeEventEmitter,NativeModules,AppState,Dimensions,Platform,PermissionsAndroid,Alert,} from "react-native";
import BleManager from "react-native-ble-manager";
import { BluetoothStatus } from "react-native-bluetooth-status";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import * as Constant from "./../../utils/constants/constant";

var Buffer = require("buffer/").Buffer;

const window = Dimensions.get("window");

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const delayTime = 500;

var beaconsArray = [];

class BeaconsHandler {
  static beaconsSharedInstance = null;

  static getInstanceforBeacons() {

    if (this.beaconsSharedInstance === null) {
      this.beaconsSharedInstance = new BeaconsHandler();
    }

    return this.beaconsSharedInstance;
  }

  constructor() {

    /**
     *  Binding sensor listner methods
     */

    this.handleDiscoverPeripheralBeacon = this.handleDiscoverPeripheralBeacon.bind(this);
    this.handleStopScanBeacons = this.handleStopScanBeacons.bind(this);
    this.handleUpdateValueForCharacteristicBeacons = this.handleUpdateValueForCharacteristicBeacons.bind(this);
    this.handleDisconnectedPeripheralBeacons = this.handleDisconnectedPeripheralBeacons.bind(this);
    // this.handleAppStateChangeBeacons = AppState.addEventListener("change",this.handleAppStateChangeBeacons);
    this.beaconPeripheralId = "";
    this.scanningSuccess = false;
    this.beaconCancelConnectTimer = null;
    this.beaconSensorCallBack = null;
    this.callBack = null;
    this.beaconReturnConnectTimer = null;

    this.addBeaconBleListners();
  }

  /**
   *  Addiing Sensor event listners
   *  Requesting Sensor releated permissions
   *  Enable Sensor releated settings
   *  Checking sensor setting status in IOS
   */
  addBeaconBleListners = () => {
    BleManager.start({ showAlert: true }).then(() => {
    });

    // this.handleAppStateBeacon = AppState.addEventListener(
    //   "change",
    //   this.handleAppStateChangeBeacons
    // );
    this.handlerDiscoverBeacon = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral",this.handleDiscoverPeripheralBeacon);

    this.handlerDisconnectBeacons = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral",this.handleDisconnectedPeripheralBeacons);
    this.handlerUpdateBeacons = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic",this.handleUpdateValueForCharacteristicBeacons);

  };

  /**
   *  removing listeners from memory
   */
  removeBeaconsBleListners = () => {

    if (this.beaconsSharedInstance != null) {
      this.handlerDiscoverBeacon.remove();
      this.beaconsSharedInstance = null;
    }

  };

  showAlertWithMessage = (tittle, message) => {
    Alert.alert(
      tittle,
      message,
      [
        {
          text: "OK",
          onPress: () => {
          },
        },
      ],
      { cancelable: false }
    );
  };

  // handleAppStateChangeBeacons = (nextAppState) => {
  // };

  handleDiscoverPeripheralBeacon(peripheral) {
    if (peripheral.advertising.localName==='RBDot') {
      this.checkForServerDevice(peripheral);
    }
  }

  /**
   * This method is called after bluetooth scanning is completed
   */
  handleStopScanBeacons() {
    
    if (this.scanningSuccess === true) {
      //this.connectToSensor();
      
    } else {
      this.beaconSensorCallBack({ error: "unable to connect" });
    }
  }

  /**
   * This method gets called when sensor device is disconnected
   */
  handleDisconnectedPeripheralBeacons(data) {
    console.log("Beacons handleDisconnectedPeripheral data : ", data);
  }

  handleUpdateValueForCharacteristicBeacons(data) {
    console.log("Beacons Received data from " + data.peripheral + " characteristic " + data.characteristic, data.value);
  }

  /**
   *  start scanning bluetooth devices
   */
  startScanBeacons = (callback) => {
    this.scanningSuccess = false;
    this.beaconSensorCallBack = callback;
    // console.log("Beacons scanning started : ", callback, this.beaconSensorCallBack, this.beaconPeripheralId);
    console.log("Beacons scanning started peripheral : ", this.beaconPeripheralId);

    if (this.beaconPeripheralId !== "") {
      BleManager.isPeripheralConnected(this.beaconPeripheralId, []).then(
        (isConnected) => {

          if (isConnected) {
            console.log("Beacons Peripheral is connected!");
            callback({ data: { status: 200, beaconPeripheralId: this.beaconPeripheralId },});
          } else {
            console.log("Beacons Peripheral is NOT connected!");
            BleManager.scan([], 60, true, { numberOfMatches: 1 });
          }
        }
      );
    } else {
      console.log("Beacons Peripheral is else!");
      BleManager.scan([], 60, true, { numberOfMatches: 1 });
    }
  };

  setPeripharalId = (pId) => {
    this.beaconPeripheralId = pId;
    console.log("Beacons setPeripharalId call : ", pId);

  };

  getConnectedPeripheralDevices = () => {
    BleManager.getConnectedPeripherals([]).then((results) => {

      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        console.log("Beacons-----peripheral.id, peripheral : ", peripheral.id, peripheral);
      }
    });
  };

  /**
   *  checks for alloted device from scanned devices
   */
  checkForServerDevice(peripheral) {

    //console.log("stop scan call back", peripheral.advertising.serviceUUIDs,peripheral.id);

    if(peripheral.advertising.serviceUUIDs){

        if(peripheral.advertising.serviceUUIDs[0] === 'F0CEC428-2EBB-47AB-A753-0CE09E9FE64B' || peripheral.advertising.serviceUUIDs[0] === 'f0cec428-2ebb-47ab-a753-0ce09e9fe64b'|| peripheral.advertising.localName === 'RBDot'){
            this.setPeripharalId(peripheral.id);
            beaconsArray.push(peripheral.id);
            console.log("Beacons CheckForServerDevice Array----------> ", beaconsArray);
              this.scanningSuccess = true;
              
              setTimeout(() => {
                BleManager.stopScan().then(() => {

                    if(beaconsArray.length>0){
                      const uniqueNames = Array.from(new Set(beaconsArray));
                       this.beaconSensorCallBack({ data: uniqueNames});

                    }

                  });
              }, 500);
          }
    }

  }

  /**
   *  Tries to establish connection with sensor device
   *
   */
  connectToBeacon = async (beaconPeripheralId,callback) => {
    this.beaconPeripheralId=beaconPeripheralId;
    this.beaconSensorCallBack = callback;
    console.log("connectToBeacon : ", this.beaconPeripheralId);

    if (Platform.OS === "ios") {
      this.beaconCancelConnectTimer = setTimeout(this.cancelConnectionBeacon, 50000);
    }
    //
    console.log("before connect");

    BleManager.connect(this.beaconPeripheralId)
      .then(() => {
        console.log("first connected peripheral", this.beaconPeripheralId);
        if (Platform.OS === "ios") {
          clearTimeout(this.beaconCancelConnectTimer);
        }
        this.beaconSensorCallBack({
          data: { status: 200, beaconPeripheralId: this.beaconPeripheralId },
        });
      })
      .catch((error) => {
        console.log("error in connecting sensor");
        this.beaconSensorCallBack({ error: "unable to connect" });
      });
  };

  cancelConnectionBeacon = () => {

    console.log("cancelConnectionBeacon");
    
    if(this.beaconPeripheralId){

      BleManager.disconnect(this.beaconPeripheralId);
    }

    clearTimeout(this.beaconCancelConnectTimer);
  };

  disconnectAllBeacons = (beaconId) => {

    BleManager.disconnect(beaconId);
  }

  readDataFromBeacon = async (serviceId, characterId,uuid,beaconType) => {
    
    let data = {status: 202, sensorData: '', id:uuid, beaconType:beaconType};

    let isConnected = await BleManager.isPeripheralConnected(uuid, []);
        if(isConnected === true){
          console.log("readDataFromBeacon Connected ", isConnected,uuid);

          data = await this.readDataB(serviceId, characterId, uuid,beaconType);

        }else {

          console.log("readDataFromBeacon Connected1 ", isConnected);

          if (Platform.OS === "ios") {
           // console.log("readDataFromBeacon Connected1 ", isConnected);
            this.beaconCancelConnectTimer = setTimeout(
              this.cancelConnectionBeacon,
              5000
            );
          }

          console.log("readDataFromBeacon Connected2 ", isConnected,uuid);

          try {
            console.log("readDataFromBeacon try Connect ", isConnected,uuid);
             this.beaconReturnConnectTimer = setTimeout(
          
                data = { status: 205, sensorData: '', id:uuid, beaconType:beaconType},
                50000
              );
              clearTimeout(this.beaconReturnConnectTimer);
            await BleManager.connect(uuid);

            if (Platform.OS === "ios") {
              clearTimeout(this.beaconCancelConnectTimer);
              this.beaconCancelConnectTimer=null;
              
            }
             data = await this.readDataB(serviceId, characterId,uuid, beaconType);

        } catch {
          console.log("Could not disconnect")
          if (Platform.OS === "ios") {
            clearTimeout(this.beaconCancelConnectTimer);
            this.beaconCancelConnectTimer=null;
            
          }
           data = { status: 201, sensorData: '', id:uuid, beaconType:beaconType};
            console.log("Could not disconnect");
            
            return data; 
        }

        }

        return data;
  };

  readDataB = async (serviceId, characterId,uuid,beaconType) => {

    let pheripheralInfo = await BleManager.retrieveServices(uuid);
    let characterStics = await BleManager.read(uuid, serviceId, characterId);
    let data = { status: 200, sensorData: characterStics, id:uuid, beaconType:beaconType};

    return data;

  };

  writeDataToBeacon= (serviceId, characterId, bName, uuid,callback) => {
    this.callBack = callback;
    setTimeout(() => {
      BleManager.isPeripheralConnected(uuid, [])
        .then((isConnected) => {
          if (isConnected === true) {
            this.writeDataBeacon(serviceId, characterId, bName, uuid,this.callBack);
          } else {
            if (Platform.OS === "ios") {
              this.beaconCancelConnectTimer = setTimeout(
                this.cancelConnectionBeacon,
                50000
              );
            }
            //
            console.log("before connect");

            BleManager.connect(uuid)
              .then(() => {
                console.log("first connected peripheral", uuid);
                if (Platform.OS === "ios") {
                  console.log("readDataFromSensor clearTimeout ");
                  clearTimeout(this.beaconCancelConnectTimer);
                }
                this.writeDataBeacon(serviceId, characterId, bName, uuid,this.callBack);
                //this.beaconSensorCallBack({data:{status:200}})
              })
              .catch((error) => {
                console.log("error in connecting sensor");
                this.callBack({ error: "unable to connect" });
              });
          }
        })
        .catch((error) => {
          console.log("writeDataToSensor catch error:", error);
          this.callBack({ error: "isPeripheralConnected error" });
        });
    }, 1500);
  };

  /**
   *  Retrieve sensor services before write data
   *  Write data to Sensor device
   */
  writeDataBeacon = (serviceId, characterId, bName, uuid,callback) => {
    console.log("write Beacon data with command : ",uuid,serviceId,characterId,bName,);
    this.callBack = callback;
    setTimeout(() => {
      BleManager.retrieveServices(uuid)
        .then(async (peripheralInfo) => {
          console.log("retrieveSensorServices peripheralInfo",peripheralInfo.services);
          //const command =  [1];
          setTimeout(() => {
            console.log("before write data command : ",serviceId,characterId,bName,uuid,);

            BleManager.write(
              uuid,
              serviceId,
              characterId,
              bName,             
              100000
            )
              .then((characteristic) => {
                console.log("Write data to Beacon - write command success : ",characteristic);
                this.callBack({ data: { status: 200, character:characteristic } });
              })
              .catch((error) => {
                console.log("write data error : ", error);

                this.callBack({ data: { status: 200, error:error } });
              });
          }, 1500);
        })
        .catch((error) => {
          this.callBack({ error: "unable to connect" });
          console.log(" error retrieveServices: ", error);
        });
    }, 1500);
  };

  clearBeaconTImeoutAfterWrite = (pID) => {

    BleManager.disconnect(pID);
  }

  clearBeaconArray = () => {

    beaconsArray=[];
  }

  removeBleListners = () => {
    console.log("Removing listeners");
    this.handlerDiscoverBeacon.remove();
    // this.handlerStop.remove();
    this.handlerDisconnectBeacons.remove();
    this.handlerUpdateBeacons.remove();
    if (this.beaconsSharedInstance != null) {
      console.log("Removing listeners--------Beacons");
      this.beaconsSharedInstance = null;
    }
  };

}

export default BeaconsHandler;
