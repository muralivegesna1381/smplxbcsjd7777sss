// @flow
//import { getBundleId } from '../../utils/device.info';
  
//////GCP CLOUD RUN URL ///////////
export const JAVACLOUDAPI = {
  uri:
    "https://wearables-mobileapp-webapis-ygue7fpaba-uc.a.run.app/app/",
    isHPN1Bcon: true,
};

  //////GCP CLOUD RUN INTEST URL ///////////
  export const JAVAINTESTAPI = {
    uri:
      "https://wms-int-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
      isHPN1Bcon: true,
  };

  //////GCP CLOUD RUN QA URL ///////////
  export const JAVAQAAPI = {
    uri:
      "https://wms-qa-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
      isHPN1Bcon: true,
  };

  //////GCP CLOUD RUN UAT URL ///////////
  export const JAVAUATAPI = {
    uri:
      "https://wms-uat-ygue7fpaba-uc.a.run.app/wearables_mobile_services/app/",
      isHPN1Bcon: true,
  };
  
  //const bundleId = JAVACLOUDAPI
  // const bundleId = "JAVAINTESTAPI";
  // const bundleId = "JAVAQAAPI";
  const bundleId = "JAVAUATAPI";
  
  export let env = "";
  if (bundleId === "DEV") {
    env = "DEV";
  } else if (bundleId === "JAVACLOUDAPI") {
    env = "JAVACLOUDAPI";
  }else if (bundleId === "JAVAINTESTAPI") {
    env = "JAVAINTESTAPI";
  } else if (bundleId === "JAVAUATAPI") {
    env = "JAVAUATAPI";
  } else if (bundleId === "JAVAQAAPI") {
    env = "JAVAQAAPI";
  }else {
    env = "DEV";
  }
  
  const BaseJava = {
    EnvironmentJava: function() {
      if (env === "JAVACLOUDAPI") return JSON.stringify(JAVACLOUDAPI);
      else if (env === "JAVAINTESTAPI") return JSON.stringify(JAVAINTESTAPI);
      else if (env === "JAVAUATAPI") return JSON.stringify(JAVAUATAPI);
      else if (env === "JAVAQAAPI") return JSON.stringify(JAVAQAAPI);
    },
  };
  
  export default BaseJava;
  
  