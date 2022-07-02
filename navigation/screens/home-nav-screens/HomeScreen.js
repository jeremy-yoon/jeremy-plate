import React, {useEffect, useRef, useState, useCallback} from 'react';
import {BackHandler, Alert, Platform, AppState, Linking} from 'react-native';
import {useRecoilState} from 'recoil';
import {WebView} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';
import messaging from '@react-native-firebase/messaging';
import {checkNotifications} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';
import {TestIds, useRewardedAd} from 'react-native-google-mobile-ads';
import BackgroundTimer from 'react-native-background-timer';
import Sound from 'react-native-sound';

import {ROOT_WEB_URL} from 'helper/address';
import navVisibleUrl from 'helper/visibleUrl';

import {LoadingIndicator, NotificationPermissionModal} from 'components/index';

import BACKGROUND_MUSIC from 'assets/sounds/turtleTheme.mp3';

import {isBGMPlayingAtom, isShowNavAtom} from 'store/atom/common';
import {postRequest} from 'apis/common';

export const HomeScreen = ({route, navigation}) => {
  let webviewRef = useRef(null);

  const [isShowNav, setIsShowNav] = useRecoilState(isShowNavAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotificationPermissionModal, setIsNotificationPermissionModal] =
    useState(false);
  const [currentUrl, setCurrentUrl] = useState('/');

  // 사운드 관련
  const backgroundMusic = React.useRef();
  const [isWebviewLoadEnd, setIsWebviewLoadEnd] = React.useState(false);
  const [isPlaying, setIsPlaying] = useRecoilState(isBGMPlayingAtom);

  const {isLoaded, isClosed, load, show, isEarnedReward} = useRewardedAd(
    __DEV__
      ? TestIds.REWARDED
      : Platform.OS === 'ios'
      ? 'ca-app-pub-7226755196078791/3689416034'
      : 'ca-app-pub-7226755196078791/6087267095',
    {
      requestNonPersonalizedAdsOnly: true,
    },
  );

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isClosed) {
      load();
      if (isEarnedReward) {
        webviewRef.current.postMessage(
          JSON.stringify({
            type: 'COMPLETE_ADMOB',
          }),
        );
      }
    }
  }, [isClosed, load]);

  let address =
    `${ROOT_WEB_URL}` + (route.params?.url ? `${route.params?.url}` : '/');

  const onClickIGotIt = () => {
    setIsNotificationPermissionModal(false);
    requestUserPermission();
  };

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

  // 사운드 관련

  const playMusic = () => {
    setIsPlaying(true);
  };

  const pauseMusic = () => {
    setIsPlaying(false);
  };

  const onLoadStartWebView = () => {
    setIsWebviewLoadEnd(false);
  };

  const onLoadEndWebView = () => {
    setIsWebviewLoadEnd(true);
  };

  const onBGMLoadEnd = () => {
    if (!backgroundMusic.current) {
      return;
    }
    backgroundMusic.current.setNumberOfLoops(-1);
    if (backgroundMusic.current.isLoaded()) onCheckPlayBGM();
  };

  const onPlayBGM = () => {
    if (!backgroundMusic.current) {
      return;
    }
    backgroundMusic.current.getCurrentTime((second, playing) => {
      if (!playing) {
        backgroundMusic.current.play(isSuccess => {});
      }
    });
  };

  const onPauseBGM = () => {
    if (!backgroundMusic.current) {
      return;
    }
    backgroundMusic.current.getCurrentTime((second, playing) => {
      if (playing) {
        backgroundMusic.current.pause();
      }
    });
  };

  const onStopBGM = () => {
    if (!backgroundMusic.current) {
      return;
    }
    backgroundMusic.current.release();
    backgroundMusic.current = null;
  };

  const onCheckPlayBGM = () => {
    if (isPlaying) {
      onPlayBGM();
    } else {
      onPauseBGM();
    }
  };

  const onAppStateChange = status => {
    if (status === 'active') {
      onCheckPlayBGM();
    } else {
      onPauseBGM();
    }
  };

  useEffect(() => {
    if (!isWebviewLoadEnd) {
      onPauseBGM();
    } else {
      if (!backgroundMusic.current) {
        backgroundMusic.current = new Sound(BACKGROUND_MUSIC, onBGMLoadEnd);
        if (Platform.OS === 'ios') {
          Sound.setCategory('Ambient');
        }
      } else {
        onCheckPlayBGM();
      }
    }
  }, [isPlaying, isWebviewLoadEnd]);

  useEffect(() => {
    const appStateListener = AppState.addEventListener(
      'change',
      onAppStateChange,
    );
    return () => {
      appStateListener.remove();
    };
  }, [isPlaying]);

  useFocusEffect(
    useCallback(() => {
      if (isWebviewLoadEnd && !backgroundMusic.current) {
        backgroundMusic.current = new Sound(BACKGROUND_MUSIC, onBGMLoadEnd);
        if (Platform.OS === 'ios') {
          Sound.setCategory('Ambient');
        }
      }
      return () => {
        onStopBGM();
      };
    }, [isPlaying, isWebviewLoadEnd]),
  );

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
      fcmTokenRegister(fcm_token);
    }
  };

  const checkPermission = () => {
    if (Platform.OS == 'ios') {
      checkNotifications().then(status => {
        if (status.status !== 'granted') {
          setIsNotificationPermissionModal(true);
        } else {
          // 이미 승인된 상태에서는 서버에 fcm업데이트 요청을 보낸다
          requestUserPermission();
        }
      });
    } else {
      checkNotifications().then(status => {
        if (status.status !== 'granted') {
          setIsNotificationPermissionModal(true);
        } else {
          // 이미 승인된 상태에서는 서버에 fcm업데이트 요청을 보낸다
          requestUserPermission();
        }
      });
    }
  };

  useEffect(() => {
    checkPermission();
  }, []);

  /* Deep Linking 이동 */
  // useEffect(() => {
  //   if (route.params?.pushUrl) {
  //     navigation.push('CommunityScreen', {
  //       url: route.params?.pushUrl,
  //     });
  //   }
  // }, [route.params]);

  useFocusEffect(
    useCallback(() => {
      if (navVisibleUrl.includes(address)) {
        setIsShowNav(true);
      } else {
        setIsShowNav(false);
      }
    }, [address]),
  );

  useFocusEffect(
    useCallback(() => {
      webviewRef.current.postMessage(
        JSON.stringify({
          type: 'FOCUS_HOME',
        }),
      );
      const onBackPress = () => {
        if (`${ROOT_WEB_URL}/` == address) {
          Alert.alert('종료', '앱을 종료하시겠습니까?', [
            {
              text: '취소',
              onPress: () => null,
            },
            {text: '확인', onPress: () => BackHandler.exitApp()},
          ]);
          return true;
        } else {
          return false;
        }
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  const appState = useRef(AppState.currentState);
  let timeoutId = null;
  let time = 0;

  const handleAppStateChange = nextAppState => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // 액티브 상태 감지

      // 웹뷰가 존재하고,
      if (webviewRef.current && time >= 300) {
        webviewRef.current.reload();
      }
      BackgroundTimer.clearInterval(timeoutId);
      time = 0;
    }
    if (
      appState.current.match(/inactive|active/) &&
      nextAppState === 'background'
    ) {
      // 백그라운드 감지
      timeoutId = BackgroundTimer.setInterval(() => {
        // 타이머 시작
        time += 1;
      }, 1000);
    }
    appState.current = nextAppState;
  };

  let appstatelistener;
  useEffect(() => {
    if (!address.includes('/map/square/', '/collection')) {
      appstatelistener = AppState.addEventListener(
        'change',
        handleAppStateChange,
      );
      return () => {
        appstatelistener.remove();
      };
    }
  }, []);

  return (
    <>
      <WebView
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        source={{
          uri: `${address}`,
        }}
        ref={webviewRef}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={event => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'CLICK_ADMOB') {
              show();
            }

            if (data.type === 'IS_SHOW_NAV') {
              setIsShowNav(data.isShow);
            }
            if (data.type == 'URL_OPEN') {
              Linking.openURL(data.url);
            }
            if (data.type == 'STACK_PUSH') {
              navigation.push('HomeScreen', {
                url: data.url,
                postQuery: data.query,
              });
            }
            if (data.type == 'STACK_POP') {
              navigation.pop();
            }
            if (data.type == 'BGM_PLAY') {
              playMusic();
            }
            if (data.type == 'BGM_PAUSE') {
              pauseMusic();
            }
          } catch (e) {}
        }}
        onLoadStart={() => {
          setIsLoading(true);
          onLoadStartWebView();
        }}
        onLoad={() => {
          webviewRef.current.postMessage(
            JSON.stringify({
              type: 'IS_MOBILE_APP',
            }),
          );
          if (Platform.OS == 'ios') {
            webviewRef.current.postMessage(
              JSON.stringify({
                type: 'IS_iOS_APP',
              }),
            );
          }

          if (isPlaying) {
            webviewRef.current.postMessage(
              JSON.stringify({
                type: 'BGM_PLAY',
              }),
            );
          } else {
            webviewRef.current.postMessage(
              JSON.stringify({
                type: 'BGM_PAUSE',
              }),
            );
          }
        }}
        onLoadEnd={({nativeEvent}) => {
          if (!nativeEvent.loading) {
            setIsLoading(false);
            onLoadEndWebView();
          }
        }}
        onContentProcessDidTerminate={onRefresh}
      />
      {isLoading && <LoadingIndicator />}
      {isNotificationPermissionModal && (
        <NotificationPermissionModal
          isVisible={isNotificationPermissionModal}
          setIsVisible={setIsNotificationPermissionModal}
          onClickIGotIt={onClickIGotIt}
        />
      )}
    </>
  );
};
