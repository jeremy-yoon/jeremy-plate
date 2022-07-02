import React, {useEffect, useState} from 'react';
import {View, TouchableOpacity, Platform} from 'react-native';
import styled from 'styled-components';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {colors} from 'styles/colors';
import n from 'helper/normalize';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';

//navigation
import HomeNavigation from './HomeNavigation';

//images
import IcHome from 'images/ic-home.svg';
import IcHomeActive from 'images/ic-home-active.svg';

//recoil
import {isShowNavAtom} from 'store/atom/common';
import {useRecoilState} from 'recoil';

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
    activeIcon: focused => {
      return <S.Button>{focused ? <IcHomeActive /> : <IcHome />}</S.Button>;
    },
  },
];
export default function BottomNavigation() {
  const [isShowNav, setIsShowNav] = useRecoilState(isShowNavAtom);

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarStyle: {
          display: isShowNav ? 'flex' : 'none',
          backgroundColor: 'white',
          borderRadius: n(100),
          shadowColor: 'black',
          shadowRadius: 10,
          shadowOpacity: 0.08,
          marginHorizontal: n(40),
          paddingVertical: Platform.OS == 'ios' ? n(27) : 0,
          paddingHorizontal: n(4),
          position: 'absolute',
          bottom: n(34, 'h'),
          alignItems: 'center',
          height: Platform.OS == 'ios' ? 'auto' : n(53, 'h'),
        },
        headerShown: false,
        activeTintColor: colors.primary,
        tabBarShowLabel: false,
        labelStyle: {display: 'none'},
      })}>
      {mainRoutes.map(route => (
        <Tab.Screen
          key={`screen-${route.name}`}
          name={route.name}
          component={route.component}
          listeners={({navigation, route}) => ({
            tabPress: e => {
              // Prevent default action
              e.preventDefault();
              if (route) {
                navigation.navigate({key: route.key});
              }
            },
          })}
          options={{
            tabBarIcon: ({focused}) => {
              if (!isShowNav) return null;
              return focused
                ? route.activeIcon(focused)
                : route.activeIcon(focused);
              // return focused ? route.activeIcon() : route.activeIcon()
            },
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const S = {};

S.Button = styled.View`
  width: 60px;
  height: 60px;
  justify-content: center;
  align-items: center;
`;

S.MissionButtonWrapper = styled.View`
  width: 68px;
  height: 68px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  padding: 12px;
  background-color: ${colors.white};
`;

S.MissionButton = styled.View`
  width: 54px;
  height: 54px;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  background-color: ${({focused}) => (focused ? colors.primary : colors.g5)};
`;
