import React from 'react';
import {Platform, Alert, Linking, BackHandler} from 'react-native';
import styled from 'styled-components';
import {useRecoilState} from 'recoil';
import codePush from 'react-native-code-push';
import {CommonActions, useNavigation} from '@react-navigation/native';

import {colors} from 'styles/colors';
import {useCodePush} from 'components';
import {getRequest} from 'apis/common';

import {userTokenAtom} from 'store/atom/user';

import {
  APP_STORE_LINK,
  PLAY_STORE_LINK,
  IOS_VERSION,
  ANDROID_VERSION,
} from 'helper/appStatus';
import {isStaging} from 'helper/address';

/*
앱 실행 프로세스
1. 앱 푸시 업데이트 체크 및 다운로드
2. 토큰 검증
-. 스플레시 이미지
*/

const SplashScreen = () => {
  const navigation = useNavigation();
  const {progress, status, onStartSync} = useCodePush();

  const [token, setToken] = useRecoilState(userTokenAtom);
  const [updateProgress, setUpdateProgress] = React.useState(null);
  const [updateStatus, setUpdateStatus] = React.useState('Loading...');
  const [versionValid, setVersionValid] = React.useState(false);

  React.useEffect(() => {
    checkVersion();
  }, []);

  React.useEffect(() => {
    checkCodePushUpdate(status);
    setUpdateProgress(progress);
  }, [progress, status]);

  const AppUpdateAlert = () => {
    Alert.alert(
      '필수 업데이트',
      `필수 업데이트를 진행해야합니다.${'\n'}${
        Platform.OS === 'ios' ? '앱스토어' : '플레이스토어'
      }를 확인해주세요.`,
      [
        {
          text: '확인',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL(APP_STORE_LINK);
            } else {
              Linking.openURL(PLAY_STORE_LINK);
            }
          },
        },
      ],
      {
        cancelable: false,
      },
    );
  };

  const AppQuitAlert = () =>
    Alert.alert(
      '서버 점검중입니다.',
      '잠시후에 다시 실행해주세요.',
      [
        {
          text: '확인',
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp();
            }
            return;
          },
        },
      ],
      {cancelable: false},
    );

  const checkVersion = React.useCallback(async () => {
    setUpdateStatus('필수 업데이트 확인중...');
    try {
      const currentVersion =
        Platform.OS === 'ios' ? IOS_VERSION : ANDROID_VERSION;
      const result = await getRequest(
        `/v1/board/version/?os=${Platform.OS}`,
        {},
      );
      if (currentVersion !== result.data.version && result.data.is_essential) {
        // 현재 앱 버전 정보보다 아래 버전 사용시
        setVersionValid(false);
        AppUpdateAlert();
        return;
      }
      setVersionValid(true);
      setUpdateStatus('필수 업데이트 확인 완료');
      setTimeout(() => {
        onStartSync();
      }, 500);
    } catch (error) {
      if (error.response?.data?.detail.includes('토큰이 유효하지 않습니다')) {
        setToken(null);
        goToLogin();
      } else {
        console.log(error, 'error');
        setVersionValid(false);
        AppQuitAlert();
      }
    }
  }, [versionValid]);

  const checkCodePushUpdate = React.useCallback(_status => {
    switch (_status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
        setUpdateStatus('패키지 업데이트 확인중...');
        break;
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
        setUpdateStatus('패키지 다운로드중...');
        break;
      case codePush.SyncStatus.AWAITING_USER_ACTION:
        setUpdateStatus('사용자 응답 기다리는중...');
        break;
      case codePush.SyncStatus.INSTALLING_UPDATE:
        setUpdateStatus('업데이트 설치중...');
        break;
      case codePush.SyncStatus.UP_TO_DATE:
        setUpdateStatus('최신 버전이에요!');
        setTimeout(() => {
          checkTokenValid();
        }, 500);
        break;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        setUpdateStatus(`업데이트 설치 완료{'\n'}앱이 재실행됩니다.`);
        setTimeout(() => {}, 500);
        break;
      default:
        break;
    }
  }, []);

  const goToHome = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: 'BottomNavigation'}],
      }),
    );
  };

  const goToLogin = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [{name: 'LoginNavigation'}],
      }),
    );
  };

  const validToken = async () => {
    try {
      await getRequest(`/v1/auth/valid-token/`);
      goToHome();
    } catch (e) {
      setToken(null);
      goToLogin();
    }
  };

  const checkTokenValid = () => {
    if (token) {
      validToken();
    } else {
      goToLogin();
    }
  };

  return (
    <S.ScreenWrapper>
      <S.LoadingWrapper>
        {isStaging && <S.LoadingText>Staging</S.LoadingText>}
        <S.LoadingText>{updateStatus}</S.LoadingText>
        <S.LoadingProgressText>
          {updateProgress && `${(Number(updateProgress) * 100).toFixed(0)}%`}
        </S.LoadingProgressText>
      </S.LoadingWrapper>
    </S.ScreenWrapper>
  );
};

export default SplashScreen;

const S = {};

S.ScreenWrapper = styled.View`
  flex: 1;
  background-color: #f4f4f0;
  justify-content: flex-end;
`;

S.LoadingWrapper = styled.SafeAreaView`
  align-items: center;
  justify-content: flex-end;
`;

S.LoadingText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.g2};
`;

S.LoadingProgressText = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colors.g2};
  margin-top: 10px;
`;
