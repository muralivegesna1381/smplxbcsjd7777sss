// @flow
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { setContext } from 'apollo-link-context';
import { onError } from "apollo-link-error";
import { RestLink } from 'apollo-link-rest';
import BuildEnv from '../environment/environmentConfig';
//import * as Queries from './Queries';
import {Alert} from 'react-native';
import * as DataStorageLocal from "../../utils/storage/dataStorageLocal";
import * as Constant from "../../utils/constants/constant";
import * as AuthoriseCheck from './../../utils/authorisedComponent/authorisedComponent';
import * as Queries from "./../../config/apollo/queries";
import * as Apolloclient from './../../config/apollo/apolloConfig';

const Environment=  JSON.parse(BuildEnv.Environment());

const networklink = onError(({ operation,graphQLErrors, networkError }) => {

  console.log('networklink error',networkError);
  console.log('networklink graphQLErrors error',graphQLErrors);
  console.log('operation error',operation);

  if(networkError){
   
    if(networkError.statusCode == 403) {
      Apolloclient.client.writeQuery({ query: Queries.LOG_OUT_APP_NAVI, data: { data: { isLogOutNavi: 'logOutNavi', __typename: 'LogOutAppNavi' } }, });
    }else if (networkError.message==='Network request failed'){

      Alert.alert(
        "Connection Failed",
        "You are not connected to the Internet! Please check your connection and try again",
        [
          { text: "OK", onPress: () => console.log("OK Pressed") }
        ]
      );

    }else {
    }
  }
       
});

const _restLink = new RestLink({uri: Environment.uri});
const restLink =networklink.concat(_restLink);

const authLink = setContext(async (req, { headers }) => {
  
  let token = await DataStorageLocal.getDataFromAsync(Constant.APP_TOKEN);
  console.log('header : ', headers, req);
  console.log('Apollo Token ',token);
 return {
      headers: {
        ...headers,
        // Accept: Environment.Accept,
        Accept:  'application/json',
        'Content-Type': 'application/json',
        ClientToken: token 
        
      }
    };
});

export const cache = new InMemoryCache();

export const client = new ApolloClient({
  
  link:authLink.concat(restLink),
  cache: new InMemoryCache({
    dataIdFromObject: object => object.id,
  }),
  disableNetworkFetches:false,

  defaultOptions: {
    query: {
      fetchPolicy: 'no-cache',
    },
    watchQuery: {
      fetchPolicy: 'no-cache',
    }}});



 
