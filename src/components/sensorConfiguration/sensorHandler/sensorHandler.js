import React, { useState, useEffect } from "react";
import {NativeEventEmitter, NativeModules, AppState, Dimensions, Platform, PermissionsAndroid, Alert,} from "react-native";
import BleManager from "react-native-ble-manager";
import { stringToBytes, bytesToString } from "convert-string";
import * as bleUUID from "./../../../utils/bleManager/blemanager";
import { BluetoothStatus } from "react-native-bluetooth-status";
import RNAndroidLocationEnabler from "react-native-android-location-enabler";
import * as DataStorageLocal from "./../../../utils/storage/dataStorageLocal";
import * as Constant from "./../../../utils/constants/constant";

var Buffer = require("buffer/").Buffer;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);
const delayTime = 500;

var devicesArray = [];

class SensorHandler {
  static sharedInstance = null;

  static getInstance() {

    if (this.sharedInstance === null) {
      this.sharedInstance = new SensorHandler();
    }

    return this.sharedInstance;
  }

  constructor() {

    this.handleDiscoverPeripheral = this.handleDiscoverPeripheral.bind(this);
    this.handleStopScan = this.handleStopScan.bind(this);
    this.handleUpdateValueForCharacteristic = this.handleUpdateValueForCharacteristic.bind(this);
    this.handleDisconnectedPeripheral = this.handleDisconnectedPeripheral.bind(this);
    // this.handleAppStateChange = this.handleAppStateChange.bind(this);

    this.deviceNumber = "";
    this.peripheralId = "";

    this.scanningSuccess = false;
    this.cancelConnectTimer = null;
    this.sensorCallBack = null;
    this.callBack = null;
    this.wifiList = [];
    this.wifiListNames = [];
    this.stopScan = false;
    this.dissconnectErrorCallBack = null;
    this.sensorType = undefined;

    this.addBleListners();
    this.getSensorType();

  };

   addBleListners = () => {

    BleManager.start({ showAlert: false }).then(() => {
      // BleManager.checkState()
    });

    // this.handleAppState = AppState.addEventListener("change",this.handleAppStateChange);
    this.handlerDiscover = bleManagerEmitter.addListener("BleManagerDiscoverPeripheral",this.handleDiscoverPeripheral);
    this.handlerStop = bleManagerEmitter.addListener("BleManagerStopScan",this.handleStopScan);
    this.handlerDisconnect = bleManagerEmitter.addListener("BleManagerDisconnectPeripheral",this.handleDisconnectedPeripheral);
    this.handlerUpdate = bleManagerEmitter.addListener("BleManagerDidUpdateValueForCharacteristic",this.handleUpdateValueForCharacteristic);

  };

  removeBleListners = () => {
    this.handlerDiscover.remove();
    this.handlerStop.remove();
    this.handlerDisconnect.remove();
    this.handlerUpdate.remove();
    if (this.sharedInstance != null) {
      this.sharedInstance = null;
    }
  };

  getSensorType = async () => {
    let sensorType1 = await DataStorageLocal.getDataFromAsync(Constant.SENSOR_TYPE_CONFIGURATION);
    if(sensorType1){
      this.sensorType = sensorType1;
    }
  };

  handleAppStateChange = (nextAppState) => {
  };

  handleDiscoverPeripheral(peripheral) {
    console.log("handleDiscoverPeripheral-------->  : ",peripheral,peripheral.name);
    if (peripheral.name) {
      devicesArray.push(peripheral.name);
      this.checkForServerDevice(peripheral);
    }
  };

  handleStopScan() {
    if (this.scanningSuccess === true) {
      // this.connectToSensor();
      this.sensorCallBack({data: { status: 200, peripheralId: this.peripheralId },});
    } else {
      this.sensorCallBack({ error: "unable to connect" });
    }
  };

  handleDisconnectedPeripheral(data) {
    if(data.status===133){
      this.dissconnectErrorCallBack({
        dissconnectError : { status: 500, wearableSensors: '133 error' },
      });
    }
  };

  handleUpdateValueForCharacteristic(data) {
  };

   startScan = (dNumber,callback) => {

    this.scanningSuccess = false;
    this.sensorCallBack = callback;
    this.deviceNumber=dNumber;

    if (this.peripheralId !== "") {

      BleManager.isPeripheralConnected(this.peripheralId, []).then(
        
        (isConnected) => {
          if (isConnected) {

            callback({
              data: { status: 200, peripheralId: this.peripheralId },
            });
          } else {

            BleManager.scan([], 30, true, { numberOfMatches: 1 });
          }
        }
      );
    } else {
      BleManager.scan([], 30, true, { numberOfMatches: 1 });
    }
  };

  checkForServerDevice(peripheral) {
    
    if(this.sensorType==='HPN1Sensor'){
      if (peripheral.name.startsWith("HPN1")) {
            this.setPeripharalId(peripheral.id);
          this.scanningSuccess = true;
          BleManager.stopScan().then(() => {});
      }

    } else {

      if (peripheral.name.startsWith("AGL") && peripheral.name.length > 8) {
        const pnamewithAGL = peripheral.name.replace(/:/g, "");
        const pname = pnamewithAGL.substr(pnamewithAGL.length - 6).toLowerCase();
        this.setPeripharalId(peripheral.id);
        let dname = this.deviceNumber;
  
        if (dname.length == 7) {
          dname = dname.substr(0, dname.length - 1);
        } else if (dname.length > 7) {
          dname = dname.replace(/:/g, "");
          dname = dname.substr(dname.length - 6).toLowerCase();
        }
  
        if (dname.toLowerCase().endsWith(pname)) {
          this.peripheralId = peripheral.id;
          this.scanningSuccess = true;
          BleManager.stopScan().then(() => {});
        }
      }

    }
  };

  setPeripharalId = (pId) => {
    this.peripheralId = pId;
  };

  connectToSensor = async (perId,callback) => {   

    this.sensorCallBack = callback;
    
    // this.peripheralId = perId;
    if (Platform.OS === "ios") {
      this.cancelConnectTimer = setTimeout(this.cancelConnection, 50000);
    }

    BleManager.connect(this.peripheralId).then(() => {

        if (Platform.OS === "ios") {
          clearTimeout(this.cancelConnectTimer);
        }
        this.sensorCallBack({data: { status: 200, peripheralId: this.peripheralId },});

      }).catch((error) => {
        this.sensorCallBack({ error: "unable to connect" });
      });
  };

  writeDataToSensor = (serviceId, characterId, writeVal, callback) => {

    this.callBack = callback;
    this.dissconnectErrorCallBack = callback;
    setTimeout(() => {
      BleManager.isPeripheralConnected(this.peripheralId, []).then((isConnected) => {
          if (isConnected === true) {
            this.writeData(serviceId, characterId, writeVal, this.callBack);
          } else {
            if (Platform.OS === "ios") {
              this.cancelConnectTimer = setTimeout(this.cancelConnection,50000);
            }
            BleManager.connect(this.peripheralId).then(() => {
                if (Platform.OS === "ios") {
                  clearTimeout(this.cancelConnectTimer);
                }
                this.writeData(serviceId, characterId, writeVal, this.callBack);
              }).catch((error) => {
                this.callBack({ error: "unable to connect" });
              });
          }
        }).catch((error) => {
          this.callBack({ error: "isPeripheralConnected error" });
        });
    }, 1500);

  };

  writeData = (serviceId, characterId, writeVal, callback) => {

    this.callBack = callback;
    setTimeout(() => {
      BleManager.retrieveServices(this.peripheralId).then(async (peripheralInfo) => {
          setTimeout(() => {

            BleManager.write(this.peripheralId,serviceId,characterId,writeVal,10000000).then((characteristic) => {
                this.callBack({ data: { status: 200 } });
              }).catch((error) => {
                this.callBack({ error: "unable to connect" });
              });

          }, 1500);

        }).catch((error) => {
          this.callBack({ error: "unable to connect" });
        });
    }, 1500);

  };

  readWifiCount = (writeVal, callback) => {

    this.sensorCallBack = callback;
    this.dissconnectErrorCallBack = callback;
    this.wifiList = [];
    const wifiScan = this.sensorType === "HPN1Sensor" ? [1, 60] : [5];;

    this.writeDataToSensor(this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_COMMAND_SERVICE : bleUUID.COMM_SERVICE,
    this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_SCAN : bleUUID.COMMAND_CHAR, wifiScan,
      ({ data, error }) => {
        if (data) {

          this.readDataFromSensor(this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_COMMAND_SERVICE : bleUUID.WIFI_SERVICE, 
          this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_SCAN_RESULTS : "a1731ef0-a5b8-11e5-a837-0800200c9a66",
            ({ data: wifiData, error: wifiError }) => {
              if (wifiData) {
                if (wifiData.sensorData) {
                  this.sensorCallBack({data: {status: 500,wifiData: wifiData,wifiDataCount: wifiData.sensorData[0],},});
                } else {
                  this.sensorCallBack({data: { status: 500, wifiData: wifiData },});
                }
              } else{
                this.sensorCallBack({ data: { status: 200, wifiList: [] } });
              }

            }
          );
        } else if (error) {
          this.sensorCallBack({ error: "Please enter the Wi-Fi name." });
        }
      }
    );
  };

  readDataFromSensor = (serviceId, characterId, callback) => {
    this.callBack = callback;
    this.dissconnectErrorCallBack = callback;

    setTimeout(() => {

      try {

        BleManager.isPeripheralConnected(this.peripheralId, []).then((isConnected) => {

          if (isConnected === true) {
            this.readData(serviceId, characterId, this.callBack);
          } else {

            if (Platform.OS === "ios") {
              this.cancelConnectTimer = setTimeout(this.cancelConnection,50000);
            }

            BleManager.connect(this.peripheralId).then(() => {
                if (Platform.OS === "ios") {
                  clearTimeout(this.cancelConnectTimer);
                }
                this.readData(serviceId, characterId, this.callBack);
              }).catch((error) => {
                this.callBack({ error: "unable to connect" });
              });
          }
        }).catch((error) => {
          this.callBack({ error: "isPeripheralConnected error" });
        });

      } catch(e){
        this.callBack({ error: "isPeripheralConnected error" });
      }
      
    }, 1500);

  };

  readData = (serviceId, characterId, callback) => {
    this.callBack = callback;
    setTimeout(() => {
      BleManager.retrieveServices(this.peripheralId).then(async (peripheralInfo) => {
          setTimeout(() => {

            BleManager.read(this.peripheralId, serviceId, characterId).then((characteristic) => {
                this.callBack({data: { status: 200, sensorData: characteristic },});
              }) .catch((error) => {
                this.callBack({ error: "unable to read data" });
              });
          }, delayTime);

        }).catch((error) => {
          this.callBack({ error: "unable to read data" });
        });
    }, 1500);
  };

  retrieceWifiListAfterCount = (wifiData, callback) => {
    
    this.sensorCallBack = callback;
    this.wifiList = [];

    if (wifiData) {
      const buffer = Buffer.from(wifiData.sensorData);
      const totalWifiCount = buffer.readUInt8(0, true);
      if (totalWifiCount > 0) {
        this.retrieveWifiList(this.sensorType === "HPN1Sensor" ? 1 : 0,totalWifiCount > 10 ? 10 : totalWifiCount);
      } else {
        this.sensorCallBack({ data: { status: 200, wifiList: [] } });
      }
    } else {
      this.sensorCallBack({ data: { status: 200, wifiList: [] } });
    }

  };

  toHexString = (byteArray) => {
    return Array.prototype.map.call(byteArray, function(byte) {
        return ("0" + (byte & 0xff).toString(16)).slice(-2);
      }).join("");
  };

  retrieveWifiList = (wificommand, totalcount) => {
 
    const wifiListCommand = [wificommand];
    this.writeDataToSensor( this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_COMMAND_SERVICE : bleUUID.WIFI_SERVICE,
    this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_SCAN_INDEX : bleUUID.WIFI_LATCH_CHAR,wifiListCommand,
      ({ data, error }) => {
        if (data) {

          this.readDataFromSensor( this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_COMMAND_SERVICE : bleUUID.WIFI_SERVICE,
          this.sensorType === "HPN1Sensor" ? bleUUID.HPN1_WIFI_SCAN_SSID1 : "a1736d12-a5b8-11e5-a837-0800200c9a66",

            ({ data: wifiData, error: wifiError }) => {

              if (wifiData) {

                const characteristic = wifiData.sensorData; //Buffer.from(wifiData.sensorData);
                let wifiname = characteristic ? bytesToString(characteristic) : characteristic;

                if (wifiname && wifiname !== null && wifiname !== "") {

                  if(this.sensorType === "HPN1Sensor"){
                    const strWifi = wifiname.replace(/\0.*$/g,'');
                  if(strWifi.length > 19){

                    this.readDataFromSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_SCAN_SSID2,
                      ({ data: wifiData1, error: wifiError1 }) => {

                        if (wifiData1) {

                          const characteristic = wifiData1.sensorData; //Buffer.from(wifiData.sensorData);
                          let wifiname1 = characteristic ? bytesToString(characteristic) : characteristic;
                         
                          this.wifiList.push(wifiname+wifiname1);
                          const uniqueNames = Array.from(new Set(this.wifiList));
                          this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});

                          if (wificommand === totalcount - 1) {
                            const uniqueNames = Array.from(new Set(this.wifiList));
                            this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});
                          } else {
                            if (this.stopScan === false) {
                              this.retrieveWifiList(wificommand + 1, totalcount);
                            }
                          }
                        } else if(wifiError1){
                          this.sensorCallBack({ error: "error in fetching wifi list" });
                        }
                      });

                  } else {
                    this.wifiList.push(wifiname);
                    const uniqueNames = Array.from(new Set(this.wifiList));
                    this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});
                    if (wificommand === totalcount - 1) {

                      const uniqueNames = Array.from(new Set(this.wifiList));
                      this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});
                    } else {
                      if (this.stopScan === false) {
                        this.retrieveWifiList(wificommand + 1, totalcount);
                      }
                    }

                  }

                  } else {

                    const characteristic = wifiData.sensorData; //Buffer.from(wifiData.sensorData);
                    let wifiname = characteristic ? bytesToString(characteristic) : characteristic;

                    if (wifiname && wifiname !== null && wifiname !== "") {
                      this.wifiList.push(wifiname);
                    }

                    const uniqueNames = Array.from(new Set(this.wifiList));
                    this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});

                    if (wificommand === totalcount - 1) {
                      const uniqueNames = Array.from(new Set(this.wifiList));
                      this.sensorCallBack({data: { status: 200, wifiList: uniqueNames },});
                    } else {
                      if (this.stopScan === false) {
                        this.retrieveWifiList(wificommand + 1, totalcount);
                      }
                    }

                  }

                }
          
              } else if (wifiError) {
                this.sensorCallBack({ error: "error in fetching wifi list" });
              } else {
                this.sensorCallBack({ error: "error in fetching wifi list" });
              }
            }
          );
        } else if (error) {
          this.sensorCallBack({ error: "unable to fetch wifi list" });
        }
      }
    );
  };

  configuredWIFIList = (wificommand, totalcount, callback) => {
    this.sensorCallBack = callback;
    let indexValue = 0;
    this.retrieveWifiListConfigured(wificommand, totalcount, indexValue);
  };

  retrieveWifiListConfigured = (wificommand, totalcount, indexValue) => {

    const wifiListCommand = [wificommand];

    this.writeDataToSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_LIST_INDEX,wifiListCommand,
      ({ data, error }) => {
        if (data) {

          this.readDataFromSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_SSID1,
            ({ data: wifiData, error: wifiError }) => {

              if (wifiData) {

                const characteristic = wifiData.sensorData; //Buffer.from(wifiData.sensorData);  
                let wifiname = characteristic ? bytesToString(characteristic) : characteristic;

                if (wifiname && wifiname !== null && wifiname !== "") {

                  const strWifi = wifiname.replace(/\0.*$/g,'');

                  if(strWifi.length > 19){

                    this.readDataFromSensor(bleUUID.HPN1_WIFI_COMMAND_SERVICE,bleUUID.HPN1_WIFI_SSID2,
                      ({ data: wifiData1, error: wifiError1 }) => {

                        if (wifiData1) {
                          const characteristic1 = wifiData1.sensorData; //Buffer.from(wifiData.sensorData);              
                          let wifiname1 = characteristic1 ? bytesToString(characteristic1) : characteristic1;

                          let configJson = {
                            indexValue: indexValue,
                            ssidName: wifiname+wifiname1,
                          };
                          this.wifiList.push(configJson);
                          this.wifiListNames.push(wifiname+wifiname);

                          this.sensorCallBack({data: {status: 200, wifiList: this.wifiList,wifiListNames: this.wifiListNames,completionMsg: "Continue",},});

                          //if (wificommand === totalcount - 1) {
                          if (wificommand === totalcount) {
                            this.sensorCallBack({data: {status: 200,wifiList: this.wifiList,wifiListNames: this.wifiListNames,completionMsg: "Completed",},});
                          } else {
                            this.retrieveWifiListConfigured(wificommand + 1,totalcount,indexValue + 1);
                          }

                        } else if(wifiError1){
                        }
                      });
                      
                  
                  } else {
                    let configJson = {
                      indexValue: indexValue,
                      ssidName: wifiname,
                    };
                    this.wifiList.push(configJson);
                    this.wifiListNames.push(wifiname);

                    this.sensorCallBack({data: {status: 200, wifiList: this.wifiList,wifiListNames: this.wifiListNames,completionMsg: "Continue",},});

                    //if (wificommand === totalcount - 1) {
                    if (wificommand === totalcount) {
                      this.sensorCallBack({data: {status: 200,wifiList: this.wifiList,wifiListNames: this.wifiListNames,completionMsg: "Completed",},});
                    } else {
                      this.retrieveWifiListConfigured(wificommand + 1,totalcount,indexValue + 1);
                    }

                  }
                  
                }
                
              } else if (wifiError) {
                const uniqueNames = Array.from(new Set(this.wifiList));
                this.sensorCallBack({data: {status: 201,wifiList: uniqueNames,wifiListNames: this.wifiListNames, completionMsg: "InComplete",},
                });
              }
            }
          );
        } else if (error) {
          const uniqueNames = Array.from(new Set(this.wifiList));
          this.sensorCallBack({data: {status: 201,wifiList: uniqueNames,wifiListNames: this.wifiListNames,completionMsg: "InComplete",},
          });
        }
      }
    );
  };

  clearConfiguredWIFIArray = () => {
    this.wifiList = [];
    this.wifiListNames = [];
  };

  stopScanProcess = (value) => {
    this.stopScan = value;
  };

  clearPeriID = () => {
    this.peripheralId = "";
  }

  dissconnectSensor = () => {
    if (this.peripheralId) {
      BleManager.disconnect(this.peripheralId);     
    }
  };

  removeBleConfiguration = () => {
    if (this.sharedInstance != null) {
      this.sharedInstance = null;
    }
  };

  dissconnectHPN1Sensor = () => {
    if (this.peripheralId) {
      BleManager.disconnect(this.peripheralId);
    }
  };

  cancelConnection = () => {
    this.callBack({ error: "unable to connect" });
    clearTimeout(this.cancelConnectTimer);
  };

}

export default SensorHandler;