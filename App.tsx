import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Text, View, Pressable, ScrollView, Vibration } from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import styles from "./styles"; // styles.ts 파일에서 가져오기
import ButtonCustom from "./components/ButtonCustom";
import type { ActiveField } from "./types/ui";
import { ALARM_CORE_DEFAULTS, createAlarmDraft, type AlarmDraft } from "./types/alarm";

import Bar from "./assets/bar.svg";

const ALARM_HISTORY_STORAGE_KEY = "calcularm:alarm-history:v1";

export default function App() {
  const [hours, setHours] = useState(ALARM_CORE_DEFAULTS.input.hours);
  const [minutes, setMinutes] = useState(ALARM_CORE_DEFAULTS.input.minutes);
  const [activeField, setActiveField] = useState<ActiveField>('hours');
  const [alarmHistory, setAlarmHistory] = useState<AlarmDraft[]>([]);
  const [activeAlarm, setActiveAlarm] = useState<AlarmDraft | null>(null);
  const [isAlarmRunning, setIsAlarmRunning] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [permissionState, setPermissionState] = useState<"unknown" | "granted" | "denied">("unknown");
  const [debugAlarmObject, setDebugAlarmObject] = useState<AlarmDraft | null>(null);

  const activeValue = activeField === 'hours' ? hours : minutes;
  const setActiveValue = activeField === 'hours' ? setHours : setMinutes;
  const maxVal = activeField === 'hours' ? 23 : 59;

  const disabledList: boolean[] = Array(10).fill(false);
  if (activeField === 'hours' && activeValue.length === 1 && activeValue === '2') {
    [4, 5, 6, 7, 8, 9].forEach(i => { disabledList[i] = true; });
  }
  if (activeField === 'minutes' && activeValue.length === 1 && parseInt(activeValue) >= 6) {
    disabledList.fill(true);
  }

  const handleNumberPress = (num: string) => {
    if (isAlarmRunning) {
      return;
    }

    let newVal: string;
    if (activeValue.length >= 2) {
      newVal = num;
    } else {
      newVal = activeValue + num;
      if (parseInt(newVal) > maxVal) {
        newVal = num;
      }
    }
    setActiveValue(newVal);

    if (activeField === 'hours' && newVal.length >= 2) {
      setActiveField('minutes');
    }
  };

  const handleACOrBack = async () => {
    if (isAlarmRunning) {
      if (activeAlarm?.scheduledNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(activeAlarm.scheduledNotificationId);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        console.log("[Alarm Cancelled] active alarm cancelled by AC", {
          alarmId: activeAlarm.id,
          scheduledNotificationId: activeAlarm.scheduledNotificationId,
        });
      }
      setAlarmHistory(prev => prev.map(item =>
        item.id === activeAlarm?.id
          ? { ...item, isEnabled: false, scheduledNotificationId: undefined }
          : item
      ));
      setActiveAlarm(null);
      setIsAlarmRunning(false);
      setHours("");
      setMinutes("");
      setActiveField('hours');
      return;
    }

    if (activeValue.length > 0) {
      setActiveValue(activeValue.slice(0, -1));
    } else {
      setHours("");
      setMinutes("");
      setActiveField('hours');
    }
  };

  const hasValue = activeValue.length > 0;

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const setupChannel = async () => {
      await Notifications.setNotificationChannelAsync("alarm", {
        name: "Alarm",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
      });
    };

    void setupChannel();
  }, []);

  useEffect(() => {
    const loadAlarmHistory = async () => {
      try {
        const stored = await AsyncStorage.getItem(ALARM_HISTORY_STORAGE_KEY);
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as AlarmDraft[];
        if (Array.isArray(parsed)) {
          setAlarmHistory(parsed);
        }
      } catch (error) {
        console.log("Failed to load alarm history", error);
      }
    };

    void loadAlarmHistory();
  }, []);

  useEffect(() => {
    const persistAlarmHistory = async () => {
      try {
        await AsyncStorage.setItem(ALARM_HISTORY_STORAGE_KEY, JSON.stringify(alarmHistory));
      } catch (error) {
        console.log("Failed to persist alarm history", error);
      }
    };

    void persistAlarmHistory();
  }, [alarmHistory]);

  const normalizeValue = (value: string): string =>
    value.length === 0 ? "00" : value.length === 1 ? `0${value}` : value;

  const ensureAlarmPermissions = async (): Promise<boolean> => {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
      setPermissionState("granted");
      return true;
    }

    const legacyResult = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (legacyResult.status === "granted") {
      setPermissionState("granted");
      return true;
    }

    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowBadge: false,
      },
    });

    const granted = requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    setPermissionState(granted ? "granted" : "denied");
    return granted;
  };

  const scheduleAlarmNotification = async (alarmHour: string, alarmMinute: string, label: string): Promise<string> => {
    const hour = Number(alarmHour);
    const minute = Number(alarmMinute);
    const now = new Date();
    const triggerDate = new Date(now);
    triggerDate.setHours(hour, minute, 0, 0);

    if (triggerDate.getTime() <= now.getTime()) {
      triggerDate.setDate(triggerDate.getDate() + 1);
    }

    return Notifications.scheduleNotificationAsync({
      content: {
        title: "Calcularm Alarm",
        body: `${label} 알람입니다.`,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: "alarm",
      },
    });
  };

  const handleCreateAlarmEntity = async () => {
    const normalizedHours = normalizeValue(hours);
    const normalizedMinutes = normalizeValue(minutes);
    const label = `${normalizedHours}:${normalizedMinutes}`;
    const baseDraft = createAlarmDraft(
      { hours: normalizedHours, minutes: normalizedMinutes },
      label
    );

    const granted = await ensureAlarmPermissions();
    let scheduledNotificationId: string | undefined;
    const previousActiveAlarmId = activeAlarm?.id;

    if (granted) {
      if (activeAlarm?.scheduledNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(activeAlarm.scheduledNotificationId);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        console.log("[Alarm Cancelled] previous active alarm replaced", {
          alarmId: activeAlarm.id,
          scheduledNotificationId: activeAlarm.scheduledNotificationId,
        });
      }

      scheduledNotificationId = await scheduleAlarmNotification(
        normalizedHours,
        normalizedMinutes,
        label
      );
    }

    const draft: AlarmDraft = {
      ...baseDraft,
      isEnabled: granted,
      scheduledNotificationId,
    };

    if (granted) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("[Alarm Set] new alarm scheduled", draft);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log("[Alarm Set Failed] permission denied", draft);
    }

    setAlarmHistory(prev => [
      draft,
      ...prev.map(item =>
        item.id === previousActiveAlarmId
          ? { ...item, isEnabled: false, scheduledNotificationId: undefined }
          : item
      ),
    ]);
    setActiveAlarm(granted ? draft : null);
    setIsAlarmRunning(granted);
  };

  const handleApplyHistory = async (item: AlarmDraft) => {
    const granted = await ensureAlarmPermissions();
    let scheduledNotificationId: string | undefined;
    const previousActiveAlarmId = activeAlarm?.id;

    if (activeAlarm?.scheduledNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(activeAlarm.scheduledNotificationId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      console.log("[Alarm Cancelled] active alarm cancelled before applying history", {
        alarmId: activeAlarm.id,
        scheduledNotificationId: activeAlarm.scheduledNotificationId,
      });
    }

    if (granted) {
      scheduledNotificationId = await scheduleAlarmNotification(
        item.time.hours,
        item.time.minutes,
        item.label || `${item.time.hours}:${item.time.minutes}`
      );
    }

    const updatedItem: AlarmDraft = {
      ...item,
      isEnabled: granted,
      scheduledNotificationId,
    };

    if (granted) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log("[Alarm Set] history alarm applied and scheduled", updatedItem);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log("[Alarm Set Failed] history apply blocked by permission", updatedItem);
    }

    setAlarmHistory(prev => {
      const deactivated = prev.map(historyItem =>
        historyItem.id === previousActiveAlarmId
          ? { ...historyItem, isEnabled: false, scheduledNotificationId: undefined }
          : historyItem
      );
      return [updatedItem, ...deactivated.filter(historyItem => historyItem.id !== item.id)];
    });

    setActiveAlarm(granted ? updatedItem : null);
    setIsAlarmRunning(granted);
    setHours(item.time.hours);
    setMinutes(item.time.minutes);
    setActiveField('minutes');
    setIsHistoryOpen(false);
  };

  const handleDeleteHistory = async (id: string) => {
    const target = alarmHistory.find(item => item.id === id);
    if (target?.scheduledNotificationId && target.isEnabled) {
      await Notifications.cancelScheduledNotificationAsync(target.scheduledNotificationId);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      console.log("[Alarm Cancelled] alarm cancelled by history delete", {
        alarmId: target.id,
        scheduledNotificationId: target.scheduledNotificationId,
      });
    }

    if (activeAlarm?.id === id) {
      setActiveAlarm(null);
      setIsAlarmRunning(false);
    }

    setAlarmHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.iphone1315, styles.containerLayout]}>
        <StatusBar style="light" backgroundColor="black" />
        <View style={styles.container}>
          <View style={styles.calc}>
            <View style={styles.menubar}>
              <Pressable onPress={() => setIsHistoryOpen(prev => !prev)}>
                <View style={[styles.menuicon, styles.calcFlexBox]}>
                  <Bar
                    style={styles.barIcon}
                    width={22}
                    height={22}
                    stroke="#fb9d04"
                    strokeWidth={0.5}
                  />
                </View>
              </Pressable>
            </View>

            {isHistoryOpen && (
              <View
                style={{
                  position: "absolute",
                  top: 72,
                  left: 12,
                  right: 12,
                  backgroundColor: "#2A2A2C",
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 10,
                  zIndex: 20,
                }}
              >
                <Text style={{ color: "#fff", fontFamily: "Inter-Regular", fontSize: 16, marginBottom: 8 }}>
                  알람 히스토리
                </Text>
                {alarmHistory.length > 0 && (
                <Pressable
                  style={{ position: "absolute", top: 8, right: 10, padding: 4, zIndex: 30 }}
                  onPress={() => {
                    alarmHistory.forEach(item => handleDeleteHistory(item.id));
                  }}
                >
                  <Text style={{ color: "#FF9F0A", fontFamily: "Inter-Regular", fontSize: 14 }}>
                    모두 삭제
                  </Text>
                </Pressable>)}
                <Text style={{ color: permissionState === "denied" ? "#ff7676" : "#8d8c93", fontFamily: "Inter-Regular", fontSize: 12, marginBottom: 6 }}>
                  권한 상태: {permissionState === "granted" ? "허용" : permissionState === "denied" ? "거부" : "미확인"}
                </Text>
                <ScrollView style={{ maxHeight: 220 }}>
                  {alarmHistory.length === 0 ? (
                    <Text style={{ color: "#8d8c93", fontFamily: "Inter-Regular", fontSize: 14 }}>
                      설정된 알람이 없습니다.
                    </Text>
                  ) : (
                    alarmHistory.map(item => (
                      <View
                        key={item.id}
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: "#5C5C5E",
                        }}
                      >
                        <Text style={{ color: "#fff", fontFamily: "Inter-Regular", fontSize: 18 }}>
                          {item.label || `${item.time.hours}:${item.time.minutes}`}
                        </Text>
                        <View style={{ flexDirection: "row", gap: 14 }}>
                          <Pressable
                            onPress={() => {
                              void handleApplyHistory(item);
                            }}
                          >
                            <Text style={{ color: "#FF9F0A", fontFamily: "Inter-Regular", fontSize: 14 }}>
                              적용
                            </Text>
                          </Pressable>
                          <Pressable onPress={() => handleDeleteHistory(item.id)}>
                            <Text style={{ color: "#8d8c93", fontFamily: "Inter-Regular", fontSize: 14 }}>
                              삭제
                            </Text>
                          </Pressable>
                          <Pressable onPress={() => setDebugAlarmObject(item)}>
                            <Text style={{ color: "#8d8c93", fontFamily: "Inter-Regular", fontSize: 14 }}>
                              [객체]
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </ScrollView>

                {debugAlarmObject && (
                  <View
                    style={{
                      marginTop: 10,
                      borderTopWidth: 1,
                      borderTopColor: "#5C5C5E",
                      paddingTop: 8,
                    }}
                  >
                    <Text style={{ color: "#8d8c93", fontFamily: "Inter-Regular", fontSize: 12, marginBottom: 4 }}>
                      선택된 알람 객체
                    </Text>
                    <Text style={{ color: "#fff", fontFamily: "Inter-Regular", fontSize: 11 }}>
                      {JSON.stringify(debugAlarmObject, null, 2)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.indicator}>
              <View style={styles.rowView}>
                <Text style={[styles.text_format_prev, styles.textTypo]}>
                  현재시간
                </Text>
                <Text style={[styles.text_prev, styles.textTypo]}>
                  00:00
                </Text>
              </View>
              <Text style={[styles.text_prev, styles.textTypo]}>
                + 00:00
              </Text>

              <View style={styles.rowView}>
                <Text style={[styles.text_format_next, styles.textTypo]}>
                  AM
                </Text>
                <Pressable onPress={() => setActiveField('hours')}>
                  <View style={activeField === 'hours' ? { borderBottomWidth: 3, borderBottomColor: '#FF9F0A' } : undefined}>
                    <Text style={[styles.text_next, styles.textTypo]}>
                      {hours || "0"}
                    </Text>
                  </View>
                </Pressable>
                <Text style={[styles.text_next, styles.textTypo, { opacity: 0.4 }]}>:</Text>
                <Pressable onPress={() => setActiveField('minutes')}>
                  <View style={activeField === 'minutes' ? { borderBottomWidth: 3, borderBottomColor: '#FF9F0A' } : undefined}>
                    <Text style={[styles.text_next, styles.textTypo]}>
                      {minutes || "0"}
                    </Text>
                  </View>
                </Pressable>
              </View>
            </View>

            <View style={styles.buttons}>
              <View style={styles.row2}>
                <ButtonCustom
                  element={isAlarmRunning ? "text" : hasValue ? "back" : "text"}
                  text={isAlarmRunning ? "AC" : hasValue ? "back" : "AC"}
                  btncolor="gray"
                  onPress={() => {
                    void handleACOrBack();
                  }}
                  onLongPress={() => { setHours(""); setMinutes(""); setActiveField('hours'); }}
                  bgColor={isAlarmRunning ? ["#FF1616", "#fe6d65"] : undefined}
                />
                <ButtonCustom
                  element="sign"
                  text="±"
                  btncolor="gray"
                />
                <ButtonCustom
                  element="perc"
                  text="%"
                  btncolor="gray"
                />
                <ButtonCustom
                  element="div"
                  text="÷"
                  btncolor="orange"
                />
              </View>
              <View style={styles.row2}>
                {["7", "8", "9"].map(num => (
                  <ButtonCustom
                    key={num}
                    element="text"
                    text={num}
                    btncolor="black"
                    onPress={() => handleNumberPress(num)}
                    disabled={isAlarmRunning || disabledList[Number(num)]}
                  />
                ))}
                <ButtonCustom
                  element="mul"
                  text="×"
                  btncolor="orange"
                />
              </View>
              <View style={styles.row2}>
                {["4", "5", "6"].map(num => (
                  <ButtonCustom
                    key={num}
                    element="text"
                    text={num}
                    btncolor="black"
                    onPress={() => handleNumberPress(num)}
                    disabled={isAlarmRunning || disabledList[Number(num)]}
                  />
                ))}
                <ButtonCustom
                  element="sub"
                  text="-"
                  btncolor="orange"
                />
              </View>
              <View style={styles.row2}>
                {["1", "2", "3"].map(num => (
                  <ButtonCustom
                    key={num}
                    element="text"
                    text={num}
                    btncolor="black"
                    onPress={() => handleNumberPress(num)}
                    disabled={isAlarmRunning || disabledList[Number(num)]}
                  />
                ))}
                <ButtonCustom
                  element="add"
                  text="+"
                  btncolor="orange"
                />
              </View>
              <View style={styles.row2}>
                <ButtonCustom
                  element="calc"
                  text="="
                  btncolor="black"
                  onPress={() => {
                    void handleCreateAlarmEntity();
                  }}
                />
                <ButtonCustom
                  element="text"
                  text="0"
                  btncolor="black"
                  onPress={() => handleNumberPress("0")}
                  disabled={isAlarmRunning || disabledList[0]}
                />
                <ButtonCustom
                  element="text"
                  text="."
                  btncolor="black"
                />
                <ButtonCustom
                  element="equal"
                  text="="
                  btncolor="orange"
                  onPress={() => {
                    void handleCreateAlarmEntity();
                  }}
                />
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
