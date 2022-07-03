import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
// import BottomNavigation from './BottomNavigation';
import {SafeAreaView, StatusBar} from 'react-native';
import LoginNavigation from './LoginNavigation';

const Stack = createStackNavigator();

function RootNavigation() {
  let initRouteName = 'LoginNavigation';

  return (
    <Stack.Navigator
      // initialRouteName={getToken() ? 'BottomNavigation' : initRouteName}
      initialRouteName={LoginNavigation}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: 'modal',
        style: {backgroundColor: 'pink'},
      }}>
      <Stack.Screen name="LoginNavigation" component={LoginNavigation} />
      {/* <Stack.Screen name="BottomNavigation" component={BottomNavigation} /> */}
    </Stack.Navigator>
  );
}

export default RootNavigation;
