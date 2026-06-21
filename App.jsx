import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import store from './store/store';
import Login from 'components/Login';
import Signup from 'components/Signup';
import './global.css';
import Home from 'components/Home';
import SplashScreen from 'components/SplashScreen';
import ClassData from 'components/ClassData';
import StudentsData from 'components/StudentsData';
import MarkAttendance from 'components/MarkAttendance';
import ShowAttendance from 'components/ShowAttendance';
import ProfileScreen from 'components/ProfileScreen';

import CustomDrawerContent from 'components/CustomDrawerContent';

const Drawer = createDrawerNavigator();

function HomeDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={Home}
        options={{ title: 'Home', headerShown: false }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile', headerShown: false }}
      />

    </Drawer.Navigator>
  );
}


const Stack = createNativeStackNavigator();


export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <PaperProvider>
          <NavigationContainer>
            <Stack.Navigator initialRouteName="SplashScreen">
              <Stack.Screen
                name="Login"
                component={Login}
                options={{ title: 'Login', headerShown: false }}
              />
              <Stack.Screen
                name="SplashScreen"
                component={SplashScreen}
                options={{ title: 'SplashScreen', headerShown: false }}
              />
              <Stack.Screen
                name="Signup"
                component={Signup}
                options={{ title: 'Signup', headerShown: false }}
              />
              <Stack.Screen
                name='HomeDrawer'
                component={HomeDrawerNavigator}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ClassData'
                component={ClassData}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='StudentsData'
                component={StudentsData}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='MarkAttendance'
                component={MarkAttendance}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='ShowAttendance'
                component={ShowAttendance}
                options={{ headerShown: false }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </Provider>
  );
}
