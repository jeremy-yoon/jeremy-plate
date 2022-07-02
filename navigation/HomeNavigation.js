import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {HomeScreen} from '../screens/home-nav-screens/HomeScreen';

const Stack = createStackNavigator();

function HomeNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="HomeScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: Platform.select({ios: true, android: false}),
        stackPresentation: 'modal',
      }}>
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
    </Stack.Navigator>
  );
}

export default HomeNavigation;
