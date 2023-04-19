import React from 'react';
import {View,Text} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashBoardService from "../components/dashBoard/dashBoardService";
import ObservationsListComponent from '../components/observationsJournal/observationsList/observationsListComponent';
import ObservationComponent from '../components/observationsJournal/addObservations/observation/observationComponent';
import {heightPercentageToDP as hp, widthPercentageToDP as wp,} from "react-native-responsive-screen";
import { NavigationContainer } from '@react-navigation/native';
import WelcomeComponent from '../components/welcomeComponent/WelcomeComponent';
import LoginComponent from '../components/loginComponents/loginComponent';
import OTPComponent from "../components/otpComponent/otpComponent";
import PswdComponent from "../components/pswdComponent/pswdComponent"
import ForgotPasswordComponent from '../components/forgotPassword/forgotPasswordComponent';
import PetParentProfileComponent from '../components/registration/petParentProfileComponent';
import RegisterAccountComponent from '../components/registration/registerAccountComponent';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const tabHiddenRoutes = ["AddObservationsComponent","Map"];

const Tabs = () => {
    
      const DashboardStack = () => {

        return(
            <Stack.Navigator>
                <Stack.Screen name="DashBoardService" component={DashBoardService} options={{headerShown: false}}/>    
            </Stack.Navigator>       
        );

      }

      const ObservationsStack = ({navigation, route}) => {
        
        React.useLayoutEffect(() => {

            if(tabHiddenRoutes.includes(getFocusedRouteNameFromRoute(route))){
                navigation.setOptions({tabBarStyle: {display: 'none'}});
            }else {
                navigation.setOptions({tabBarStyle: {display: 'flex'}});
            }
        }, [navigation, route]);

        return(
            <Stack.Navigator>
                <Stack.Screen name="ObservationsListComponent" component={ObservationsListComponent} options={{headerShown: false,}}/>
                <Stack.Screen name="ObservationComponent" component={ObservationComponent} options={{headerShown: false,}}/>   
            </Stack.Navigator>   
        );

      }

      const LoginStack = () => {
        return(
            <Stack.Navigator>
              <Stack.Screen
                  name="WelcomeComponent"
                  component={WelcomeComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="LoginComponent"
                  component={LoginComponent}
                  options={{headerShown: false}}
              />
            <Stack.Screen
                  name="OTPComponent"
                  component={OTPComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="PswdComponent"
                  component={PswdComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="ForgotPasswordComponent"
                  component={ForgotPasswordComponent}
                  options={{headerShown: false}}
              />  
    
            <Stack.Screen
                  name="PetParentProfileComponent"
                  component={PetParentProfileComponent}
                  options={{headerShown: false}}
              />  
    
            <Stack.Screen
                  name="RegisterAccountComponent"
                  component={RegisterAccountComponent}
                  options={{headerShown: false}}
              /> 
    
            </Stack.Navigator>
            
        );
      };

    return (

         <NavigationContainer>
            <Tab.Navigator>

            {/* <Tab.Screen name="Default" component={LoginStack}
                options = {({route})=>({
                    tabBarStyle : {
                        display : 'none',
                    },
                    headerShown:false,
                    tabBarShowLabel : false,
                    tabBarIcon : ({focused, color, size}) => (
                        <View>
                            <Text style={{color: focused ? 'green' : 'grey'}}>Login</Text>
                        </View>
                    ),
                })}></Tab.Screen> */}
                
                <Tab.Screen name="DashBoard" component={DashboardStack}
                options = {({route})=>({
                    tabBarStyle : {
                        display : 'flex',
                    },
                    headerShown:false,
                    tabBarShowLabel : false,
                    tabBarIcon : ({focused, color, size}) => (
                        <View>
                            <Text style={{color: focused ? 'green' : 'grey'}}>DashBoard</Text>
                        </View>
                    ),
                })}></Tab.Screen>
                <Tab.Screen name="Observations" component={ObservationsStack}
                options = {({route})=>({
                    headerShown:false,
                    tabBarShowLabel : false,
                    tabBarIcon : ({focused}) => (
                        <View>
                            <Text style={{color: focused ? 'green' : 'grey'}}>Observations</Text>
                        </View>
                    ),
                })}
                ></Tab.Screen>
            </Tab.Navigator>
            
         </NavigationContainer>

        // <Stack.Navigator>
        //     <Stack.Screen name="Home" component={HomeTabs} options={{headerShown:false}}/>

        // </Stack.Navigator>

        //     <Tab.Navigator
        //     screenOptions={{
        //         tabBarShowLabel : false,
        //         tabBarHideOnKeyboard:true,
        //         tabBarStyle : {
        //             // position : 'absolute',
        //             // bottom : 15,
        //              width:wp('100%'),
        //             elivation: 0,
        //             //backgroundColor: 'red',
        //             // height: 90,
        //             // borderRadius:15,
        //             alignSelf:'center'
        //         }
        //  }}
        // >

        // <Tab.Screen name = "Default" component={DefaultStack} 
                
                // options = {({route})=>({
                //     tabBarStyle : {
                //         display : 'none',
                //     },
                //     headerShown:false,
                //     tabBarIcon : ({focused}) => (
                //         <View>
                //             <Text style={{color: focused ? 'green' : 'grey'}}>Login</Text>
                //         </View>
                //     ),
                // })}
        //     />

        //     <Tab.Screen name = "DashBoard" component={DashBoardStack} 
        //         options = {{
        //             headerShown:false,                   
        //             tabBarIcon : ({focused}) => (
        //                 <View>
        //                     <Text style={{color: focused ? 'green' : 'grey'}}>Home</Text>
        //                 </View>
        //             ),
        //         }}
            
        //     />
        //     <Tab.Screen name = "Observations" component={ObservationsStack} 
                
        //         options = {({route})=>({
        //             headerShown:false,
        //             tabBarIcon : ({focused}) => (
        //                 <View>
        //                     <Text style={{color: focused ? 'green' : 'grey'}}>Observations</Text>
        //                 </View>
        //             ),
        //         })}
        //     />

        // </Tab.Navigator>

    );
}

export default Tabs;



/**
 
const DefaultStack = () => {
        return(
            <Stack.Navigator
                initialRouteName="WelcomeComponent"
                screenOptions={{gestureEnabled: false}}>
              <Stack.Screen
                  name="WelcomeComponent"
                  component={WelcomeComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="LoginComponent"
                  component={LoginComponent}
                  options={{headerShown: false}}
              />
    
    <Stack.Screen
              name="OTPComponent"
              component={OTPComponent}
              options={{headerShown: false}}
          />

        <Stack.Screen
              name="PswdComponent"
              component={PswdComponent}
              options={{headerShown: false}}
          />

        <Stack.Screen
              name="ForgotPasswordComponent"
              component={ForgotPasswordComponent}
              options={{headerShown: false}}
          />  

        <Stack.Screen
              name="PetParentProfileComponent"
              component={PetParentProfileComponent}
              options={{headerShown: false}}
          />  

        <Stack.Screen
              name="RegisterAccountComponent"
              component={RegisterAccountComponent}
              options={{headerShown: false}}
          /> 

        <Stack.Screen
                    name="DashBoardService"
                    component={DashBoardService}
                    options={{headerShown: false}}
                />
    
            </Stack.Navigator>
            
        );
      };

 */


      /**
       
      const DashBoardStack = () => {
            return(
                <Stack.Navigator
                    initialRouteName="DashBoardService"
                    screenOptions={{gestureEnabled: false}}>
                <Stack.Screen
                    name="DashBoardService"
                    component={DashBoardService}
                    options={{headerShown: false}}
                />
        
                </Stack.Navigator>
            
            );
      };

      const ObservationsStack = () => {
        return(
            <Stack.Navigator
                initialRouteName="ObservationsListComponent"
                screenOptions={{gestureEnabled: false}}>
              <Stack.Screen
                  name="ObservationsListComponent"
                  component={ObservationsListComponent}
                  options={{headerShown: false}}
              />

            <Stack.Screen
                    name="AddObservationsComponent"
                    component={AddObservationsComponent}
                    // screenOptions={tabBarStyle = {
                    //     display : 'none',
                    // }}
                    options={{
                        headerShown: false,
                        
                        
                    }}
                />
    
            </Stack.Navigator>
            
        );
      };

      const LoginStack = () => {
        return(
            <Stack.Navigator>
              <Stack.Screen
                  name="WelcomeComponent"
                  component={WelcomeComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="LoginComponent"
                  component={LoginComponent}
                  options={{headerShown: false}}
              />
            <Stack.Screen
                  name="OTPComponent"
                  component={OTPComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="PswdComponent"
                  component={PswdComponent}
                  options={{headerShown: false}}
              />
    
            <Stack.Screen
                  name="ForgotPasswordComponent"
                  component={ForgotPasswordComponent}
                  options={{headerShown: false}}
              />  
    
            <Stack.Screen
                  name="PetParentProfileComponent"
                  component={PetParentProfileComponent}
                  options={{headerShown: false}}
              />  
    
            <Stack.Screen
                  name="RegisterAccountComponent"
                  component={RegisterAccountComponent}
                  options={{headerShown: false}}
              /> 
    
            </Stack.Navigator>
            
        );
      };


       */