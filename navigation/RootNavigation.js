import * as React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import BottomNavigation from './BottomNavigation';
import SplashScreen from 'screens/splash-screens/SplashScreen';
import HomeNavigation from './HomeNavigation';
import {userTokenAtom} from 'store/atom/user';
import {useRecoilState} from 'recoil';
import {ROOT_WEB_URL} from 'helper/address';
import {Platform} from 'react-native';
import UniteNavigation from './UniteNavigation';

const Stack = createStackNavigator();

function RootNavigation() {
  return (
    <Stack.Navigator
      initialRouteName={BottomNavigation}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        stackPresentation: 'modal',
        style: {backgroundColor: 'pink'},
        animationEnabled: Platform.select({ios: true, android: false}),
      }}>
      <Stack.Screen name="SplashScreen" component={SplashScreen} />
      <Stack.Screen name="UniteNavigation" component={UniteNavigation} />
      <Stack.Screen name="BottomNavigation" component={BottomNavigation} />
    </Stack.Navigator>
  );
}

export default RootNavigation;
