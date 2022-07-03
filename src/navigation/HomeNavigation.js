import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen} from './screens/home-nav-screens/HomeScreen';
import {Alert, TouchableOpacity} from 'react-native';

const Stack = createStackNavigator();

function HomeNavigation() {
  return (
    // <Stack.Navigator
    //   initialRouteName="HomeScreen"
    //   screenOptions={{
    //     headerShown: false,
    //     gestureEnabled: true,
    //     stackPresentation: 'modal',
    //   }}>
    //   <Stack.Screen name="HomeScreen" component={HomeScreen} />
    // </Stack.Navigator>
    <TouchableOpacity />
  );
}

export default HomeNavigation;
