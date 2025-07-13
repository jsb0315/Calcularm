// 알림 관련 타입들
export interface NotificationTime {
  hour: number;
  minute: number;
}

export type AlarmTimeInput = string | NotificationTime;

export interface AlarmScheduleOptions {
  title: string;
  body: string;
  sound?: string;
  vibration?: boolean;
}

export interface RepeatAlarmConfig {
  baseTime: Date;
  intervalSeconds: number;
  count: number;
}

export interface NotificationContent {
  title: string;
  body: string;
  sound: string;
}

export interface NotificationTrigger {
  type: any; // Notifications.SchedulableTriggerInputTypes.DATE
  date: Date;
}
