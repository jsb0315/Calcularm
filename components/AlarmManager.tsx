import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

class AlarmManager {
  private static instance: AlarmManager;
  private notificationPermission: boolean = false;

  private constructor() {
    this.requestPermissions();
    console.log("AlarmManager constructor called");
  }

  // Singleton 패턴으로 인스턴스 생성
  public static getInstance(): AlarmManager {
    if (!AlarmManager.instance) {
      AlarmManager.instance = new AlarmManager();
    }
    console.log("AlarmManager instance created");
    return AlarmManager.instance;
  }

  // 알림 권한 요청
  private async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("알림 권한 필요", "설정에서 알림 권한을 활성화해주세요.");
      this.notificationPermission = false;
      return;
    }
    this.notificationPermission = true;
    console.log("Notification permission granted");
  }

  // 즉시 알람 보내기
  public async sendInstantNotification() {
    console.log("sendInstantNotification called");
    if (!this.notificationPermission) {
      Alert.alert("알림이 허용되지 않았습니다.");
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚀 즉시 알람!",
        body: "이 알람은 즉시 실행됩니다.",
        // sound: "default",
      },
      trigger: null, // 즉시 실행
    });
  }

// 특정 시간에 알람 예약 (string 또는 hour, minute 객체를 허용)
  public async scheduleNotification(time: string | { hour: number; minute: number }) {
    if (!this.notificationPermission) {
      Alert.alert("알림이 허용되지 않았습니다.");
      return;
    }

    const now = new Date();
    const alarmTime = new Date();

    if (typeof time === "string") {
      // time이 string인 경우 (HH:mm 형식)
      const [hour, minute] = [parseInt(time.slice(0, 2), 10), parseInt(time.slice(2), 10)];
      alarmTime.setHours(hour);
      alarmTime.setMinutes(minute);
      Alert.alert("알람 예약", `예약된 알람: ${hour}시 ${minute}분`+ time);
    } else {
      // time이 객체인 경우
      alarmTime.setHours(time.hour);
      alarmTime.setMinutes(time.minute);
    }

    alarmTime.setSeconds(0);

    // if (alarmTime <= now) {
    //   alarmTime.setDate(alarmTime.getDate() + 1); // 이미 지난 시간이면 다음 날로 설정
    // }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⏰ 알람!",
        body: `${alarmTime.getHours()}시 ${alarmTime.getMinutes()}분에 설정된 알람입니다.`,
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE, // 🔹 이 부분 추가!
        date: alarmTime,
      },
    });
  }

  // 모든 알람 취소
  public async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    Alert.alert("모든 알람이 취소되었습니다.");
  }
}

export default AlarmManager;