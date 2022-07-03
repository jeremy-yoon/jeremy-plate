import React, {useEffect, useState} from 'react';
import {Alert, TouchableOpacity} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
// import {colors} from 'styles/colors';
// import n from 'helper/normalize';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import HomeNavigation from './HomeNavigation';
// import IcHome from 'images/ic-home.svg';
// import IcHomeActive from 'images/ic-home-active.svg';

const Tab = createBottomTabNavigator();
const isTabBarVisible = route => {
  const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeScreen';
  return ['HomeScreen'].includes(routeName);
};
const mainRoutes = [
  {
    name: '홈',
    component: HomeNavigation,
    initRouteName: 'HomeScreen',
    // activeIcon: focused => {
    //   return <>{focused ? <IcHomeActive /> : <IcHome />}</>;
    // },
  },
];
export default function BottomNavigation() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        // tabBarStyle: {
        //   backgroundColor: 'white',
        //   borderRadius: n(100),
        //   shadowColor: 'black',
        //   shadowRadius: 10,
        //   shadowOpacity: 0.08,
        //   marginHorizontal: n(40),
        //   paddingVertical: n(27),
        //   paddingHorizontal: n(4),
        //   position: 'absolute',
        //   bottom: n(34),
        //   alignItems: 'center',
        //   height: 'auto',
        // },
        headerShown: false,
        // activeTintColor: colors.primary,
        tabBarShowLabel: false,
        labelStyle: {display: 'none'},
      })}>
      {mainRoutes.map(route => (
        <Tab.Screen
          key={`screen-${route.name}`}
          name={route.name}
          component={route.component}
          // listeners={({navigation, route}) => ({
          //   tabPress: e => {
          //     // Prevent default action
          //     e.preventDefault();
          //     if (route) {
          //       navigation.navigate({key: route.key});
          //     }
          //   },
          // })}
          // options={{
          //   tabBarIcon: ({focused}) => {
          //     return focused
          //       ? route.activeIcon(focused)
          //       : route.activeIcon(focused);
          //     // return focused ? route.activeIcon() : route.activeIcon()
          //   },
          // }}
        />
      ))}
    </Tab.Navigator>
  );
}
