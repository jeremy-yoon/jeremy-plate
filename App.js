import React, {Suspense, useEffect, useRef, useState} from 'react';
import {Alert, SafeAreaView, Text, AppState, Linking} from 'react-native';
import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import RootNavigation from 'navigation/RootNavigation';
import {RecoilRoot} from 'recoil';
import RecoilNexus from 'recoil-nexus';
import messaging from '@react-native-firebase/messaging';
import {CodePushProvider, TrackingPermissionModal} from 'components/index';

const App = () => {
  const [isTrackingPermissionModal, setIsTrackingPermissionModal] =
    useState(false);

  const navigationRef = useNavigationContainerRef();

  /* Deep Linking 관련 세팅 */
  const Home = {
    path: 'home',
  };

  const Bottom = {
    screens: {
      HomeNavigation: Home,
      MarketNavigation: Market,
      MissionNavigation: Mission,
      CommunityNavigation: Community,
      MyNavigation: My,
    },
  };

  const prefix = 'joody://';

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        BottomNavigation: Bottom,
      },
    },
  };

  return (
    <CodePushProvider>
      <RecoilRoot>
        <Suspense fallback={<Text>로딩 중...</Text>}>
          <NavigationContainer linking={linking} ref={navigationRef}>
            <RecoilNexus />
            <RootNavigation />
            <TrackingPermissionModal
              isVisible={isTrackingPermissionModal}
              setIsVisible={setIsTrackingPermissionModal}
            />
          </NavigationContainer>
        </Suspense>
      </RecoilRoot>
    </CodePushProvider>
  );
};

export default App;
