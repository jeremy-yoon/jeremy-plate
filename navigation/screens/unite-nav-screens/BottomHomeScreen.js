import React, {useEffect, useRef, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  BackHandler,
  Alert,
  Platform,
} from 'react-native';
import {isShowNavAtom} from 'store/atom/common';
import {useRecoilState} from 'recoil';
import {WebView} from 'react-native-webview';

import {useFocusEffect} from '@react-navigation/native';
import {ROOT_WEB_URL} from 'helper/address';

import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';
import {postRequest} from 'apis/common';

import {LoadingIndicator} from 'components';
import {BottomTabBar} from 'components/BottomTabBar';

export const BottomHomeScreen = ({route}) => {
  let webviewRef = useRef(null);
  const [isShowNav, setIsShowNav] = useRecoilState(isShowNavAtom);
  const [isLoading, setIsLoading] = useState(true);

  const [currentUrl, setCurrentUrl] = useState('/');

  const [address, setAddress] = useState(`${ROOT_WEB_URL}/`);

  //   const address = `${ROOT_WEB_URL}/`;
  const onNavigationStateChange = url => {
    if (url) {
      setCurrentUrl(url.url);
    }
  };

  const onRefresh = () => {
    if (webviewRef.current) {
      webviewRef.current.reload();
    }
  };

  useEffect(() => {
    setIsShowNav(true);
  }, [currentUrl]);

  const fcmTokenRegister = async fcmToken => {
    try {
      const result = await postRequest(`/v1/fcm/devices/`, {
        registration_id: fcmToken,
        type: Platform.OS,
        device_id: DeviceInfo.getUniqueId(),
      });
    } catch (e) {}
  };

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      const fcm_token = await messaging().getToken();
      // isRegisterFcmToken(fcm_token);
      fcmTokenRegister(fcm_token);
    }
  };

  useEffect(() => {
    requestUserPermission();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: 'FOCUS_HOME',
        }),
      );
      const onBackPress = () => {
        if (currentUrl == address) {
          Alert.alert('종료', '앱을 종료하시겠습니까?', [
            {
              text: '취소',
              onPress: () => null,
            },
            {text: '확인', onPress: () => BackHandler.exitApp()},
          ]);
          return true;
        } else {
          webviewRef.current.goBack();
        }
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  return (
    <>
      <WebView
        allowsFullscreenVideo={true}
        // onLoadEnd={handleEndLoading}
        allowsInlineMediaPlayback={true}
        source={{
          // headers: customHeaders,
          uri: `${address}`,
        }}
        ref={webviewRef}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'LOGOUT') {
              setToken(null);
              navigation.replace('LoginNavigation');
            }
            if (data.type == 'HIDE_NAV') {
              setIsShowNav(false);
            } else if (data.type == 'SHOW_NAV') {
              setIsShowNav(true);
            }
            if (data.type === 'CHANNEL_SHOW') {
              openKakaoChannelTalk();
            }
          } catch (e) {}
        }}
        // onMessage={event => {
        //   try {
        //     const data = JSON.parse(event.nativeEvent.data);
        //     console.log(data.type);
        //     if (data.type === 'IS_SHOW_NAV') {
        //       setIsShowNav(data.isShow);
        //     }
        //   } catch (e) {}
        // }}
        onLoadStart={() => setIsLoading(true)}
        onLoad={() => {
          setIsLoading(false);
          if (Platform.OS == 'ios')
            webviewRef.current.postMessage(
              JSON.stringify({
                type: 'IS_iOS_APP',
              }),
            );
        }}
        onContentProcessDidTerminate={onRefresh}
      />
      {isLoading && <LoadingIndicator />}
      <BottomTabBar
        webviewRef={webviewRef}
        currentUrl={currentUrl}
        setAddress={setAddress}
      />
    </>
  );
};
