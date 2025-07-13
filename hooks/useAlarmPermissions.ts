import { useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';

export interface UseAlarmPermissionsReturn {
  requestPermissions: () => Promise<boolean>;
  setupNotificationListener: (onNotificationReceived: (notification: any) => void) => () => void;
}

export const useAlarmPermissions = (): UseAlarmPermissionsReturn => {
  
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("알림 권한이 거부되었습니다!");
        return false;
      }
      return true;
    } catch (error) {
      console.error("알림 권한 요청 중 오류:", error);
      return false;
    }
  }, []);

  const setupNotificationListener = useCallback((
    onNotificationReceived: (notification: any) => void
  ): (() => void) => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      onNotificationReceived(notification);
    });

    return () => subscription.remove();
  }, []);

  return {
    requestPermissions,
    setupNotificationListener,
  };
};
