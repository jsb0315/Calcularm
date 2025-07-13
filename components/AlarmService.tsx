import React, { useEffect } from 'react';
import { useAlarmNotifications } from '../hooks/useAlarmNotifications';
import { useAlarmPermissions } from '../hooks/useAlarmPermissions';
import { TimeValue, IterateSettings, OperatorType, AlarmTimeInput } from '../types';

export interface AlarmServiceProps {
  onAlarmTriggered: (triggered: boolean) => void;
  children?: React.ReactNode;
}

export interface AlarmServiceRef {
  sendInstantNotification: () => Promise<void>;
  cancelAllNotifications: () => Promise<void>;
  scheduleNotification: (time: AlarmTimeInput) => Promise<void>;
  scheduleAdvancedAlarm: (
    textTime: TimeValue,
    timeDifferenceValue: TimeValue,
    Iterate: IterateSettings,
    Operator: OperatorType
  ) => Promise<void>;
}

export const AlarmService = React.forwardRef<AlarmServiceRef, AlarmServiceProps>(
  ({ onAlarmTriggered, children }, ref) => {
    const alarmNotifications = useAlarmNotifications();
    const alarmPermissions = useAlarmPermissions();

    // 컴포넌트 마운트 시 권한 요청 및 알림 핸들러 설정
    useEffect(() => {
      const initializeAlarms = async () => {
        await alarmPermissions.requestPermissions();
        alarmNotifications.setupNotificationHandler();
      };

      initializeAlarms();

      // 알림 수신 리스너 설정
      const removeListener = alarmPermissions.setupNotificationListener((notification) => {
        onAlarmTriggered(true);
      });

      return removeListener;
    }, [alarmNotifications, alarmPermissions, onAlarmTriggered]);

    // ref를 통해 외부에서 알람 기능들에 접근할 수 있도록 설정
    React.useImperativeHandle(ref, () => ({
      sendInstantNotification: alarmNotifications.sendInstantNotification,
      cancelAllNotifications: alarmNotifications.cancelAllNotifications,
      scheduleNotification: alarmNotifications.scheduleNotification,
      scheduleAdvancedAlarm: alarmNotifications.scheduleAdvancedAlarm,
    }), [alarmNotifications]);

    return <>{children}</>;
  }
);
