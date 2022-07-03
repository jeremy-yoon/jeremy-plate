import {createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import {LoginScreen} from 'navigation/screens/login-nav-screens/LoginScreen';

const Stack = createStackNavigator();

function LoginNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="LoginScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: 'modal',
      }}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
    </Stack.Navigator>
  );
}
export default LoginNavigation;
