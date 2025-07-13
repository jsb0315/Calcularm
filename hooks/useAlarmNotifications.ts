import { useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Vibration } from 'react-native';
import {
  AlarmTimeInput,
  NotificationContent,
  NotificationTrigger,
  TimeValue,
  IterateSettings,
  OperatorType
} from '../types';

export interface UseAlarmNotificationsReturn {
  sendInstantNotification: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  scheduleNotification: (time: AlarmTimeInput) => Promise<void>;
  scheduleAdvancedAlarm: (
    textTime: TimeValue,
    timeDifferenceValue: TimeValue,
    Iterate: IterateSettings,
    Operator: OperatorType
  ) => Promise<void>;
  setupNotificationHandler: () => void;
}

export const useAlarmNotifications = (): UseAlarmNotificationsReturn => {
  
  const setupNotificationHandler = useCallback(() => {
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        Vibration.vibrate(500); // 0.5초 동안 진동
        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
  }, []);

  const sendInstantNotification = useCallback(async (): Promise<void> => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "알림 제목 테스트",
        body: "알림 내용 테스트",
      },
      trigger: null, // 즉시 보내려면 'trigger'에 'null'을 설정
    });
  }, []);

  const cancelAllNotifications = useCallback(async (): Promise<void> => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("모든 알람이 취소되었습니다.");
  }, []);

  const scheduleNotification = useCallback(async (time: AlarmTimeInput): Promise<void> => {
    const now: Date = new Date();
    const alarmTime: Date = new Date();

    if (typeof time === "string") {
      // time이 string인 경우 (HH:mm 형식)
      const [hour, minute] = [
        parseInt(time.slice(0, 2), 10),
        parseInt(time.slice(2), 10),
      ];
      alarmTime.setHours(hour);
      alarmTime.setMinutes(minute);
    } else {
      // time이 객체인 경우
      alarmTime.setHours(time.hour);
      alarmTime.setMinutes(time.minute);
    }

    alarmTime.setSeconds(0);

    // 현재 시간과 알람 시간이 같다면 1초 후로 설정
    if (
      alarmTime.getHours() === now.getHours() &&
      alarmTime.getMinutes() === now.getMinutes()
    ) {
      alarmTime.setSeconds(now.getSeconds() + 1); // 현재 시간으로부터 1초 후
      console.log(
        "알람 시간이 현재와 같아 1초 후로 설정되었습니다:",
        alarmTime
      );
    }

    // 기본 10개의 반복 알람 설정 (3초 간격)
    for (let i: number = 0; i < 10; i++) {
      const repeatedAlarmTime: Date = new Date(alarmTime.getTime() + i * 3000); // i초 후 추가

      const content: NotificationContent = {
        title: "⏰ 반복 알람!",
        body: `${i}번 알람: ${repeatedAlarmTime.getHours()}시 ${repeatedAlarmTime.getMinutes()}분 ${repeatedAlarmTime.getSeconds()}초`,
        sound: "default",
      };

      const trigger: NotificationTrigger = {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: repeatedAlarmTime,
      };

      await Notifications.scheduleNotificationAsync({
        content,
        trigger,
      });
    }
    console.log(`알람 설정 * 10: ${alarmTime} ~ +30s`);
  }, []);

  const scheduleAdvancedAlarm = useCallback(async (
    textTime: TimeValue,
    timeDifferenceValue: TimeValue,
    Iterate: IterateSettings,
    Operator: OperatorType
  ): Promise<void> => {
    const now = new Date();
    
    // 1단계: Div 사용 - timeDifferenceValue를 Iterate.Div만큼 균일하게 나눠 알람 설정
    if (Iterate.Div > 1) {
      const totalMinutes = timeDifferenceValue.hours * 60 + timeDifferenceValue.minutes;
      const intervalMinutes = totalMinutes / Iterate.Div;
      
      for (let i = 0; i < Iterate.Div; i++) {
        const alarmTime = new Date(now.getTime() + i * intervalMinutes * 60 * 1000);
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `⏰ 분할 알람 ${i + 1}/${Iterate.Div}`,
            body: `${Math.round(intervalMinutes)}분 간격 알람`,
            sound: "default",
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: alarmTime,
          },
        });
      }
      console.log(`분할 알람 설정: ${Iterate.Div}개, ${Math.round(intervalMinutes)}분 간격`);
    }

    // 2단계: Mul 사용 - 반복 알람 설정
    if (Iterate.Mul > 1) {
      const baseAlarmTime = new Date();
      baseAlarmTime.setHours(textTime.hours, textTime.minutes, 0, 0);
      
      // 기준 시간이 현재보다 이전이면 다음 날로 설정
      if (baseAlarmTime <= now) {
        baseAlarmTime.setDate(baseAlarmTime.getDate() + 1);
      }

      if (Operator === "") {
        // textTime으로부터 [Iterate.Mul]일 동안 textTime 시간에 알람 설정
        for (let i = 0; i < Iterate.Mul; i++) {
          const alarmTime = new Date(baseAlarmTime);
          alarmTime.setDate(alarmTime.getDate() + i);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ 일일 반복 알람 ${i + 1}/${Iterate.Mul}`,
              body: `${textTime.hours}시 ${textTime.minutes}분 알람`,
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: alarmTime,
            },
          });
        }
        console.log(`일일 반복 알람 설정: ${Iterate.Mul}일간, ${textTime.hours}:${textTime.minutes}`);
        
      } else if (Operator === "+") {
        // currentTime부터 textTime 시간을 추가한 만큼 [Iterate.Mul]번 알람 설정
        const intervalHours = textTime.hours;
        const intervalMinutes = textTime.minutes;
        const totalIntervalMinutes = intervalHours * 60 + intervalMinutes;
        
        for (let i = 0; i < Iterate.Mul; i++) {
          const alarmTime = new Date(now.getTime() + i * totalIntervalMinutes * 60 * 1000);
          
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `⏰ 간격 반복 알람 ${i + 1}/${Iterate.Mul}`,
              body: `${intervalHours}시간 ${intervalMinutes}분 간격 알람`,
              sound: "default",
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: alarmTime,
            },
          });
        }
        console.log(`간격 반복 알람 설정: ${Iterate.Mul}번, ${intervalHours}:${intervalMinutes} 간격`);
      }
    }
  }, []);

  return {
    sendInstantNotification,
    cancelAllNotifications,
    scheduleNotification,
    scheduleAdvancedAlarm,
    setupNotificationHandler,
  };
};
