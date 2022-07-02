import {createStackNavigator} from '@react-navigation/stack';
import * as React from 'react';
import {Platform} from 'react-native';
import {BottomHomeScreen} from 'screens/unite-nav-screens/BottomHomeScreen';
import {StackWebviewScreen} from 'screens/unite-nav-screens/StackWebviewScreen';

const Stack = createStackNavigator();

function UniteNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="BottomHomeScreen"
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: 'modal',
        animationEnabled: Platform.select({ios: true, android: false}),
      }}>
      <Stack.Screen name="BottomHomeScreen" component={BottomHomeScreen} />
      <Stack.Screen name="StackWebviewScreen" component={StackWebviewScreen} />
    </Stack.Navigator>
  );
}
export default UniteNavigation;
