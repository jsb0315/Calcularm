import React, { useEffect, useRef, useState } from "react";
import { View, Button, Platform, Alert } from "react-native";
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

// 🟢 알림 설정 (백그라운드에서도 알림을 받을 수 있도록 설정)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const AlarmComponent = () => {
  const [notificationPermission, setNotificationPermission] = useState(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  // 🟢 권한 요청 함수 (iOS 필수)
  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("알림 권한 필요", "설정에서 알림 권한을 활성화해주세요.");
      return;
    }
    setNotificationPermission(true);
  };

  // 🟢 즉시 알람 보내기
  const sendInstantNotification = async () => {
    if (!notificationPermission) {
      Alert.alert("알림이 허용되지 않았습니다.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚀 즉시 알람!",
        body: "이 알람은 즉시 실행됩니다.",
        sound: "default",
      },
      trigger: null, // 즉시 실행
    });
  };

  // 🟢 특정 시간에 알람 예약
  const scheduleNotification = async (hour: number, minute: number) => {
    if (!notificationPermission) {
      Alert.alert("알림이 허용되지 않았습니다.");
      return;
    }

    const now = new Date();
    const alarmTime = new Date();
    alarmTime.setHours(hour);
    alarmTime.setMinutes(minute);
    alarmTime.setSeconds(0);

    if (alarmTime <= now) {
      alarmTime.setDate(alarmTime.getDate() + 1); // 이미 지난 시간이면 다음 날로 설정
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ 알람!",
        body: `${hour}시 ${minute}분에 설정된 알람입니다.`,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE, // 🔹 이 부분 추가!
        date: alarmTime,
      },
    });
  };

  // 🟢 알람 취소
  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert("모든 알람이 취소되었습니다.");
  };

  // 🟢 알림 리스너 설정 (앱이 실행 중일 때 알림 감지)
  useEffect(() => {
    requestPermissions();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log("알림 수신:", notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("알림 클릭:", response);
    });

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Button title="즉시 알람 보내기" onPress={sendInstantNotification} />
      <Button title="오전 8시 알람 예약" onPress={() => scheduleNotification(8, 0)} />
      <Button title="모든 알람 취소" onPress={cancelAllNotifications} />
    </View>
  );
};

export default AlarmComponent;
