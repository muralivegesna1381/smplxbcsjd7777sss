// @flow
//import { getBundleId } from '../../utils/device.info';

export const PROD = {
    uri: "https://mobile.wearablesclinicaltrials.com/App/",
    deviceConnectUrl: "prd.wearablesclinicaltrials.com",
    isHPN1Bcon: false,
  };
  
  export const DEV = {
    uri: "https://mobile.uat.wearablesclinicaltrials.com/App/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: false,
  };
  
  //////////GCP UAT/////////////
  export const GCPDEV = {
    uri:
      "https://devices.wearablesclinicaltrials.com/gcp.mobile.trial.webservices/App/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };
  
  //////GCP QA ///////////
  export const GCPQA = {
    uri: "https://wearables-mobileapp-webapis-ygue7fpaba-uc.a.run.app/app/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };
  //////GCP CLOUD RUN URL ///////////
  export const GCPCLOUD = {
    uri:
      "https://wearables-mobileapp-webapis-ygue7fpaba-uc.a.run.app/app/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };
  
  //////GCP CLOUD RUN URL Intest///////////
  export const GCPCLOUDINTEST = {
    uri:
      "https://wearables-mobileapp-webapis-intest-ygue7fpaba-uc.a.run.app/app/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };
  
  // export const GCPCLOUDUAT= {
  //   uri: "https://wearables-mobileapp-webapis-uat-ygue7fpaba-uc.a.run.app/app/",
  //   deviceConnectUrl: "tst.wearablesclinicaltrials.com",
  //   isHPN1Bcon: true,
  // };
  
  /////Migrated Service////////
  export const GCPCLOUDQA= {
    uri: 'https://wms-qa-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/migrated/',//"https://wmsmig-qa-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };

  // ///////Migrated Service////////
  export const GCPCLOUDUAT= {
    uri: 'https://wms-uat-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/migrated/',//"https://wmsmig-qa-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
    deviceConnectUrl: "tst.wearablesclinicaltrials.com",
    isHPN1Bcon: true,
  };

  //const bundleId = 'PROD';// 'PROD'; //'DEV';//getBundleId();
  //const bundleId = 'DEV';
  //const bundleId = 'GCPDEV';
  // const bundleId = "GCPQA";
  //const bundleId = "GCPCLOUD";
  //const bundleId = "GCPCLOUDINTEST";
  // const bundleId = "GCPCLOUDQA";
  const bundleId = "GCPCLOUDUAT";
  
  export let env = "";
  if (bundleId === "DEV") {
    env = "DEV";
  } else if (bundleId === "QA") {
    env = "QA";
  } else if (bundleId === "PREPROD") {
    env = "PREPROD";
  } else if (bundleId === "PROD") {
    env = "PROD";
  } else if (bundleId === "GCPDEV") {
    env = "GCPDEV";
  } else if (bundleId === "GCPQA") {
    env = "GCPQA";
  } else if (bundleId === "GCPCLOUD") {
    env = "GCPCLOUD";
  }  else if (bundleId === "GCPCLOUDQA") {
    env = "GCPCLOUDQA";
  }else if (bundleId === "GCPCLOUDINTEST") {
    env = "GCPCLOUDINTEST";
  } else if (bundleId === "GCPCLOUDUAT") {
    env = "GCPCLOUDUAT";
  }else {
    env = "DEV";
  }
  
  const Base = {
    Environment: function() {
      if (env === "QA") return JSON.stringify(QA);
      else if (env === "DEV") return JSON.stringify(DEV);
      else if (env === "PREPROD") return JSON.stringify(PREPROD);
      else if (env === "PROD") return JSON.stringify(PROD);
      else if (env === "GCPDEV") return JSON.stringify(GCPDEV);
      else if (env === "GCPQA") return JSON.stringify(GCPQA);
      else if (env === "GCPCLOUD") return JSON.stringify(GCPCLOUD);
      else if (env === "GCPCLOUDINTEST") return JSON.stringify(GCPCLOUDINTEST);
      else if (env === "GCPCLOUDQA") return JSON.stringify(GCPCLOUDQA);
      else if (env === "GCPCLOUDUAT") return JSON.stringify(GCPCLOUDUAT);
    },
  };
  
  export default Base;
  
  
