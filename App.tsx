import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Vibration, SafeAreaView, StyleSheet, Text, View, Platform, PermissionsAndroid } from 'react-native';
import ButtonCustom from "./components/ButtonCustom";
import Constants from 'expo-constants';
import styles from "./styles"; // styles.ts 파일에서 가져오기
import * as Notifications from 'expo-notifications';

import {
  getCurrentTimeAsString,
  handleFixTimeValue,
  calculateTimeDifference,
  addTime,
  subtractTime,
  fixTextTime,
  timeValueTotext
} from "./utils/calculate"; // 계산 함수 가져오기

import Bar from "./assets/bar.svg";

export default function App() {
  // ✅ 알림 권한 설정
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      Vibration.vibrate(500); // 0.5초 동안 진동
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      };
    },
  });

  const sendInstantNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '알림 제목 테스트',
        body: '알림 내용 테스트',
      },
      trigger: null, // 즉시 보내려면 'trigger'에 'null'을 설정
    });
  };

  const cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log("모든 알람이 취소되었습니다.");
  };

  const scheduleNotification = async (time: string | { hour: number; minute: number }) => {
      const now = new Date();
      const alarmTime = new Date();
  
      if (typeof time === "string") {
        // time이 string인 경우 (HH:mm 형식)
        const [hour, minute] = [parseInt(time.slice(0, 2), 10), parseInt(time.slice(2), 10)];
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
        console.log("알람 시간이 현재와 같아 1초 후로 설정되었습니다:", alarmTime);
      }
      
      // if (alarmTime <= now) {
      //   alarmTime.setDate(alarmTime.getDate() + 1); // 이미 지난 시간이면 다음 날로 설정
      // }
      // i초 후마다 알람 설정
      for (let i = 0; i < 10; i++) {
        const repeatedAlarmTime = new Date(alarmTime.getTime() + i * 3000); // i초 후 추가
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "⏰ 반복 알람!",
            body: `${i}번 알람: ${repeatedAlarmTime.getHours()}시 ${repeatedAlarmTime.getMinutes()}분 ${repeatedAlarmTime.getSeconds()}초`,
            sound: "default",

          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE, // 🔹 이 부분 추가!
            date: repeatedAlarmTime,
          },
        });
        console.log(`알람 ${i} 설정: ${repeatedAlarmTime}`);
      }
    }
  
  const [textCurrent, setTextCurrent] = useState(""); // 현재시간
  const [textPrev, setTextPrev] = useState(""); // 남은시간
  const [textNext, setTextNext] = useState(""); // 설정한 알람시간
  const [Operator, setOperator] = useState("");
  const [Running, setisRunning] = useState(false); // 계산 중인지 여부
  const [AlarmTriggered, setAlarmTriggered] = useState(false); // 알람이 울렸는지 여부

  // 현재 시간과 남은 시간을 갱신하는 함수
  const updateTimes = () => {
    const currentTime = getCurrentTimeAsString(); // 현재 시간 가져오기
    setTextCurrent(currentTime.format); // 현재 시간 갱신

    if (textNext) {
      const textTime = handleFixTimeValue(textNext); // textNext를 시간으로 변환
      const currentDate = new Date();
      const timeDifference = calculateTimeDifference(currentDate, textTime); // 남은 시간 계산
      setTextPrev(timeDifference === "0000" ? "+ 2400" : '+ '+timeDifference); // 남은 시간 갱신
  
      // 알람 체크: 현재 시간이 textNext와 같아지면 알람 트리거
      if (currentTime.string === textNext && !AlarmTriggered) {
        setAlarmTriggered(true); // 알람 상태를 true로 설정
        console.log("알람이 링링링"); // 알람 메시지 출력
        // 추가적인 알람 동작 (예: 소리 재생, 진동 등)
        // Vibration.vibrate(); // 진동 시작
      }
    }
  };

  // Running 상태가 true일 동안 10초마다 갱신
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('알림 권한이 거부되었습니다!');
      }
    })();

    let interval: NodeJS.Timeout | null = null;

    if (Running) {
      interval = setInterval(() => {
        updateTimes(); // 2초마다 실행
      }, 2000);
    } else if (interval) {
      clearInterval(interval); // Running이 false가 되면 타이머 정리
      setAlarmTriggered(false);
    }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
    };
  }, [Running, textNext]); // Running 또는 textNext가 변경될 때 실행

  // 함수 선언
  const handleACOrBack = () => {
    if ((textPrev && textNext) || !textNext.length) {
      // 'AC' 동작
      setAlarmTriggered(false); // 알람 상태 초기화
      setTextPrev("");
      setTextCurrent("");
      setTextNext("");
      setOperator(""); // 연산자 초기화
    } else if (textNext.length > 1) {
      // 'back' 동작
      setTextNext(textNext.slice(0, -1));
    } else {
      setTextNext("");
      setOperator("");
    }
    if (Running) {
      setisRunning(false); // 계산 중지
      cancelAllNotifications(); // 알람 취소yy
    }
  };

  const handleNumberPress = (num: string) => {
    if (!Running) {
      if (textPrev && textNext) {
        setTextPrev(""); // textPrev 초기화
        setTextCurrent("");
        setTextNext(num); // textNext에 숫자 설정
      } else if (textNext.length < 4) {
        setTextNext((prev) => prev + num);
      } else {
        setTextNext(num); // 최대 4자리까지 입력 가능
      }
    }
  };

  const handleEqualPress = () => {
    if (!Running) {
      const currentTime = new Date();
      const currentTimeString = getCurrentTimeAsString(); // '0000' 형태의 현재 시간
      let textTime: {hours: number, minutes: number} = {hours: 0, minutes: 0};

      if (!textNext.length) { // 아무것도 없을때
        setTextPrev(textNext); // textNext 값을 textPrev로 복사
        setTextNext(currentTimeString.string); // textNext를 'result'로 설정
        return
      }
      else if (Operator === "") { // 일반설정
        // 현재부터 textTime까지 남은 시간 계산
        const fixedTime = textNext.length < 3 ? fixTextTime((Number(textNext) > currentTime.getMinutes() ? currentTimeString.hour : (currentTimeString.hour + 1)) + (textNext.length === 1 ? '0' : '') + textNext)
         : fixTextTime(textNext);
        textTime = handleFixTimeValue(fixedTime); // textNext를 시간으로 변환한 값
        const timeDifference = calculateTimeDifference(currentTime, textTime);
        console.log(timeDifference)
        // textPrev에 현재 시간과 남은 시간 저장
        setTextCurrent(currentTimeString.format);
        setTextPrev(`+ ${timeDifference == '0000' ? '2400' : timeDifference}`);
        setTextNext(fixedTime);

      } else if (Operator === "+") {  // n분 후
        // 현재 시간에 textTime을 더한 시간 계산
        textTime = addTime(currentTime, handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.format);
        setTextPrev(`+ ${fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(timeValueTotext(textTime));

      } else if (Operator === "-") {  // n분 전
        // 현재 시간에서 textTime만큼을 뺀 시간 계산
        textTime = subtractTime(currentTime, handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.format);
        setTextPrev(`- ${fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(timeValueTotext(textTime));
      }

      console.log(`${timeValueTotext(textTime)} 알람이 설정됐습니다`);
      scheduleNotification(timeValueTotext(textTime)); // 알람 예약
      setisRunning(true); // Running 상태를 true로 설정
    }
  };

  const handleDotPress = () => {
    if (!Running) {
      setTextNext((prev) => (prev.includes(".") ? prev : prev + "."));
    }
  };

  const handleOperatorPress = (operator: string) => {
    if (!Running) {
      setOperator(Operator !== operator ? operator : ""); // operator가 비어있지 않으면 빈 문자열로 설정
    }
    console.log("Operator Pressed:", operator.length, operator, Operator);
  };

  const handleFlipAMPM = () => {
    if (!Running) {
      setTextNext(flipAMPM(fixTextTime(textNext))); // textNext를 flipAMPM으로 변환
    }
  };

  const flipAMPM = (text: string) => {
      if (text.length === 3) {
        text = `0${text}`; // 3자리일 경우 가장 앞에 '0' 추가
      }

      if (text.length !== 4 || isNaN(Number(text))) {
        return text; // 유효하지 않은 값은 그대로 반환
      }

      // 1. '2000'을 '20:00'으로 변환
      const hours = parseInt(text.slice(0, 2), 10);
      const minutes = text.slice(2);

      // 2. 12시간 추가
      const newHours = (hours + 12) % 24; // 24시간 형식으로 계산
      const formattedHours = newHours < 10 ? `0${newHours}` : `${newHours}`;

      // 3. '800' 형식으로 변환
      return `${formattedHours}${minutes}`;
    }

  const handleFixTime = () => {
    if (!Running){}
      setTextNext((prev) => fixTextTime(prev)); // textNext를 fixTextTime으로 변환
  };

  

  return (
    <SafeAreaView style={[styles.iphone1315, styles.containerLayout]}>
      <StatusBar style="light" backgroundColor="black" />
      <View style={styles.container}>
        <View style={styles.calc}>
          <View style={styles.menubar}>
            <View style={[styles.menuicon, styles.calcFlexBox]}>
              <Bar
                style={styles.barIcon}
                width={22}
                height={22}
                stroke="#fb9d04"
                strokeWidth={0.5}
              />
            </View>
          </View>

          <View style={styles.indicator}>
            <Text style={[styles.text_prev, styles.textTypo]}>
              {textCurrent && '현재시간  '}{textCurrent}
            </Text>
            <Text style={[styles.text_prev, styles.textTypo]}>
              {textPrev.length > 2
                ? `${textPrev.slice(0, -2)}:${textPrev.slice(-2)}`
                : textPrev}
            </Text>
            <Text style={[styles.text_next, styles.textTypo]}>
              {!Running && textNext && Operator}{textNext.length > 2
                ? `${textNext.slice(0, -2)}:${textNext.slice(-2)}`
                : textNext.length ? textNext : "0"}
            </Text>
          </View>

          <View style={styles.buttons}>
            <View style={styles.row2}>
              <ButtonCustom
                element={(textPrev && textNext) || !textNext.length ? "text" : "back"}
                text={(textPrev && textNext) || !textNext.length ? "AC" : "back"}
                btncolor="gray"
                onPress={handleACOrBack}
                onLongPress={() => setTextNext("")}
                bgColor={Running ? ["#FF1616", "#fe6d65"] : undefined}
              />
              <ButtonCustom
                element="sign" text="±" btncolor="gray"
                onPress={() => handleFlipAMPM()}
              />
              <ButtonCustom
                element="perc" text="%" btncolor="gray"
                onPress={() => handleFixTime()}
              />
              <ButtonCustom
                element="div" text="÷" btncolor="orange"
                onPress={() => handleFixTime()}
              />
            </View>
            <View style={styles.row2}>
              {["7", "8", "9"].map((num) => (
                <ButtonCustom
                  key={num}
                  element="text" text={num} btncolor="black"
                  onPress={() => handleNumberPress(num)}
                />
              ))}
              <ButtonCustom
                element="mul" text="×" btncolor="orange"
                onPress={() => handleOperatorPress("×")}
              />
            </View>
            <View style={styles.row2}>
              {["4", "5", "6"].map((num) => (
                <ButtonCustom
                  key={num}
                  element="text" text={num} btncolor="black"
                  onPress={() => handleNumberPress(num)}
                />
              ))}
              <ButtonCustom
                element="sub" text="-" btncolor="orange"
                onPress={() => handleOperatorPress("-")}
                bgColor={!Running && Operator === "-" ? ["#fb7103", "#FCC78E"] : undefined}
              />
            </View>
            <View style={styles.row2}>
              {["1", "2", "3"].map((num) => (
                <ButtonCustom
                  key={num}
                  element="text" text={num} btncolor="black"
                  onPress={() => handleNumberPress(num)}
                />
              ))}
              <ButtonCustom
                element="add" text="+" btncolor="orange"
                onPress={() => handleOperatorPress("+")}
                bgColor={!Running && Operator === "+" ? ["#fb7103", "#FCC78E"] : undefined}
              />
            </View>
            <View style={styles.row2}>
              <ButtonCustom
                element="calc" text="=" btncolor="black"
                onPress={handleEqualPress}
              />
              <ButtonCustom
                element="text" text="0" btncolor="black"
                onPress={() => handleNumberPress("0")}
              />
              <ButtonCustom
                element="text" text="." btncolor="black"
                onPress={handleDotPress}
              />
              <ButtonCustom
                element="equal" text="=" btncolor="orange"
                onPress={handleEqualPress}
              />
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}