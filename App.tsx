import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Vibration, SafeAreaView, Text, View } from 'react-native';
import ButtonCustom from "./components/ButtonCustom";
import styles from "./styles"; // styles.ts 파일에서 가져오기
import * as Notifications from 'expo-notifications';

/* 
ToDo 
[] 알람 분할 기능
[] 알람 반복 기능
[] Operator 있으면: +N분 반복
[] Operator 없으면: 다음날 같은시간 반복
[] 12시간 이내로 자동변경 기능 (토글)
[] . 버튼: 초단위 표기
[] 히스토리
[] 사용법
[O] 12Format용 키패드 로직
[x] 알람 당기기 -> 나중에
[x] 알람 미루기 -> 나중에
*/

import * as calculate from "./utils/calculate"; // 계산 함수 가져오기

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
      }
      console.log(`알람 설정 * 10: ${alarmTime} ~ +30s`);
    }
  
  const [textCurrent, setTextCurrent] = useState(""); // 현재시간
  const [textPrev, setTextPrev] = useState(""); // 남은시간
  const [textNext, setTextNext] = useState(""); // 설정한 알람시간
  const [Operator, setOperator] = useState("");
  const [is12Format , setIs12Format] = useState(false);
  const [isIterSetting, setIsIterSetting] = useState<"Mul" | "Div" | "">("");
  const [Iterate, setIterate] = useState({Mul: 1, Div: 1});
  const [Running, setisRunning] = useState(false); // 계산 중인지 여부
  const [AlarmTriggered, setAlarmTriggered] = useState(false); // 알람이 울렸는지 여부

  // 현재 시간과 남은 시간을 갱신하는 함수
  const updateTimes = () => {
    const currentTime = calculate.getCurrentTimeAsString(); // 현재 시간 가져오기
    setTextCurrent(currentTime.string); // 현재 시간 갱신

    if (textNext) {
      const textTime = calculate.handleFixTimeValue(textNext); // textNext를 시간으로 변환
      const currentDate = new Date();
      const timeDifference = calculate.calculateTimeDifference(currentDate, textTime); // 남은 시간 계산
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
        updateTimes(); // 1초마다 실행
      }, 1000);
    } else if (interval) {
      clearInterval(interval); // Running이 false가 되면 타이머 정리
      setAlarmTriggered(false);
    }

    // if (is12Format) {
    //   if (textNext.length === 3 && Number(textNext.slice(0,2)) > 24) 
    //     setTextNext((prev) => '0'+prev);
    //   else if (textNext.length === 4 && Number(textNext.slice(-2)) > 59) 
    //     setTextNext('');
    // }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
    };
  }, [Running, textNext, is12Format]); // Running 또는 textNext가 변경될 때 실행

  

  // 함수 선언
  const handleACOrBack = () => {
    let test: string;
    if ((textPrev && textNext) || !textNext.length) {   // 'AC' 동작
      setAlarmTriggered(false); // 알람 상태 초기화
      setTextPrev("");
      setTextCurrent("");
      setOperator(""); // 연산자 초기화
      test = "";
    } 
    else if (textNext.length > 1) {  // 'back' 동작
      if (is12Format && textNext.length === 4) {
        if (/^(10|11|12|22|23|00)/.test(textNext)) { // 레전드 예외처리 하드코딩
          /**
           * AM 1000 -> AM 0100 = 10nn -> 01nn
           * PM 1000 -> PM 0100 = 22nn -> 13nn
           * AM 1100 -> AM 0110 = 11nn -> 011n
           * PM 1100 -> PM 0110 = 23nn -> 131n
           * AM 1200 -> AM 0120 = 00nn -> 012n
           * PM 1200 -> PM 0120 = 12nn -> 132n
           */
          const prefix = textNext.slice(0, 2);
          const suffix = textNext.slice(2);

          const mapping: { [key: string]: string } = {
            '10': '01',
            '22': '13',
            '11': '011',
            '23': '131',
            '00': '012',
            '12': '132',
          };

          const transformed = mapping[prefix] || "";

          test = transformed + suffix;
          test = test.length === 5 ? test.slice(0, -1) : test;
        }
        else 
          test = textNext.startsWith("0") ? textNext.slice(1, -1) : calculate.flipAMPM(textNext).slice(1, -1);
      } else {
        test = textNext.slice(0, -1);
      }
    } else {
      test = "";
    }
    setTextNext(test);
    if (Running) {
      setisRunning(false); // 계산 중지
      cancelAllNotifications(); // 알람 취소yy
    }
  };

  const handleNumberPress = (num: string) => {
    if (isIterSetting) {
      if (num==="0" || num==="1") {
        setIterate((prev) => ({ ...prev, [isIterSetting]: 1 })); // Iterate 상태 초기화
        setIsIterSetting(""); // isIterSetting 초기화
        return;
      }
      setIterate((prev) => {
        // 이미 해당 key의 value가 존재하면 초기화
        if (prev[isIterSetting] > 1) {
          return { ...prev, [isIterSetting]: 1 }; // 초기화
        }
        return { ...prev, [isIterSetting]: Number(num) }; // 새로운 값 설정
      });
      setIsIterSetting(""); // isIterSetting 초기화
      return;
    }
    if (!Running) {
      if (textPrev && textNext) {
        setTextPrev(""); // textPrev 초기화
        setTextCurrent("");
        setTextNext(num); // textNext에 숫자 설정
      } else if (textNext.length < 4) {
        let test = textNext + num;
        if (is12Format && Operator === "") {
          if (test.length === 3 && Number(test.slice(0,2)) > 24) {
            test = "0"+test;
          }
          else if (test.length === 4 && Number(test.slice(-2)) > 59) {
            test = "";
          }
          test = calculate.isDifferent12up(test) ? calculate.flipAMPM(test) : test;
          setTextNext(test); return;
        } 
        setTextNext((prev) => prev + num);
      } else {
        setTextNext(num); // 최대 4자리까지 입력 가능
      }
    }
  };

  const handleEqualPress = () => {
    if (!Running) {
      const currentTime = new Date();
      const currentTimeString = calculate.getCurrentTimeAsString(); // '0000' 형태의 현재 시간
      let textTime: {hours: number, minutes: number} = {hours: 0, minutes: 0};
      let timeDifference: string;

      if (!textNext.length) { // 아무것도 없을때
        setTextPrev(textNext); // textNext 값을 textPrev로 복사
        setTextNext(currentTimeString.string); // textNext를 'result'로 설정
        return
      }
      else if (Operator === "") { // 일반설정
        // 현재부터 textTime까지 남은 시간 계산
        let fixedTime = textNext.length < 3 ? calculate.fixTextTime((Number(textNext) > currentTime.getMinutes() ? currentTimeString.hour : (currentTimeString.hour + 1)) + (textNext.length === 1 ? '0' : '') + textNext)
         : calculate.fixTextTime(textNext);
        textTime = calculate.handleFixTimeValue(fixedTime); // textNext를 시간으로 변환한 값
        timeDifference = calculate.calculateTimeDifference(currentTime, textTime);
        const timeDifferenceValue = calculate.handleFixTimeValue(timeDifference); // 남은 시간 계산
        const is12up = timeDifferenceValue.hours+(timeDifferenceValue.minutes*0.01) > 12;
        if ((textNext.length < 4 || textNext.startsWith("12")) && is12up ) { // 12시간 이상 남은 경우
          fixedTime = calculate.flipAMPM(fixedTime);
          timeDifference = calculate.flipAMPM(timeDifference);
        } 
      
        // textPrev에 현재 시간과 남은 시간 저장
        setTextCurrent(currentTimeString.string);
        setTextPrev(`+ ${timeDifference == '0000' ? '2400' : timeDifference}`);
        setTextNext(fixedTime);

      } else if (Operator === "+") {  // n분 후
        // 현재 시간에 textTime을 더한 시간 계산
        textTime = calculate.addTime(currentTime, calculate.handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.string);
        setTextPrev(`+ ${calculate.fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(calculate.timeValueTotext(textTime));

      } else if (Operator === "-") {  // n분 전
        // 현재 시간에서 textTime만큼을 뺀 시간 계산
        textTime = calculate.subtractTime(currentTime, calculate.handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.string);
        setTextPrev(`- ${calculate.fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(calculate.timeValueTotext(textTime));
      }

      console.log(`${calculate.timeValueTotext(textTime)} 알람이 설정됐습니다`);
      scheduleNotification(calculate.timeValueTotext(textTime)); // 알람 예약
      setisRunning(true); // Running 상태를 true로 설정
    }
  };

  /**
   * 알림을 다음 조건에 맞춰 예약하고싶어. 조건에 맞게 코드를 작성해줘
[변수]
Iterate = {Mul: Number, Div: Number} 형태 (useState)
시간 객체 = {hours: Number, minutes: Number}
textTime = 알람 설정 시각 객체
timeDifferenceValue = 알람까지 남은시간
textTime = 더하거나 뺀  시간 객체
currentTime = 현재 시간 Date() 객체
[조건]
timeDifferenceValue의 시간을 Iterate.Div만큼 균일하게 나눠 알람 설정(timeDifferenceValue = 1시간, Iterate.Div = 6일때 1시간동안 1/6시간동안 6번 울림)
Operator === "": 
   textTime으로부터 [Iterate.Mul]일 동안 textTime 시간에 알람 설정(textTime = 오전 7시,  Iterate.Mul = 3일 때 오전 7시, 1일 후 오전 7시, 2일 후 오전 7시에 3번 울림)
Operator === "+": 
   currentTime부터 [Iterate.Mul]일 동안 textTime 시간에 알람 설정(textTime = 오전 7시,  Iterate.Mul = 3일 때 오전 7시, 1일 후 오전 7시, 2일 후 오전 7시에 3번 울림)
Operator === "-": 
   */
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
      setTextNext(calculate.flipAMPM(calculate.fixTextTime(textNext))); // textNext를 flipAMPM으로 변환
    }
  };

  const handleFixTime = () => {
    if (!Running){}
      setTextNext((prev) => calculate.fixTextTime(prev)); // textNext를 fixTextTime으로 변환
  };

  const handleIteratePress = (key: "Mul" | "Div") => {
    console.log(Iterate.Div, Iterate.Mul);
    if (Running) {
      console.log("Iter info View");
      return; // Running 상태일 때는 아무 작업도 하지 않음
    }
    if (Iterate[key] > 1) {
      // 이미 값이 존재하면 초기화
      setIterate((prev) => ({ ...prev, [key]: 1 }));
      setIsIterSetting("");
    } else if (isIterSetting === key) {
      // 현재 설정 중인 키를 다시 누르면 초기화
      setIsIterSetting("");
    } else {
      // 새로운 키를 설정
      setIsIterSetting(key);
    }
  };

  const showtextCurrent = calculate.convertTo12HourFormat(is12Format, textCurrent);
  const showtextNext = calculate.convertTo12HourFormat(is12Format,textNext);

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
            <View style={styles.rowView}>
              <Text style={[styles.text_format_prev, styles.textTypo]}>
                {textCurrent && ('현재시간⠀'+showtextCurrent.format)}
              </Text>
              <Text style={[styles.text_prev, styles.textTypo]}>
                {calculate.formatTime((showtextCurrent.time), is12Format)}
              </Text>
            </View>
            <Text style={[styles.text_prev, styles.textTypo]}>
              {textPrev.length > 2
                ? calculate.formatTime(textPrev)
                : textPrev}
            </Text>

            <View style={styles.rowView}>
              <Text style={[styles.text_format_next, styles.textTypo]}>
                {(Running || !Operator.length) && textNext.length > 2 && showtextNext.format}
              </Text>
              <Text style={[styles.text_next, styles.textTypo]}>
                {!Running && textNext && Operator}{textNext.length > 2
                  ? calculate.formatTime(!Running && Operator ? textNext : showtextNext.time, is12Format)
                  : textNext.length ? textNext : "0"}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <View style={styles.row2}>
              <ButtonCustom
                element={(textPrev && textNext) || !textNext.length ? "text" : "back"}
                text={(textPrev && textNext) || !textNext.length ? "AC" : "back"}
                btncolor="gray"
                onPress={handleACOrBack}
                onLongPress={Running ? undefined : () => setTextNext("")}
                bgColor={Running ? ["#FF1616", "#fe6d65"] : undefined}
              />
              <ButtonCustom
                element="sign" text="±" btncolor="gray"
                onPress={() => handleFlipAMPM()}
              />
              <ButtonCustom
                element="perc" text="%" btncolor="gray"
                onPress={() => {setIs12Format(!is12Format); setTextNext((prev) => calculate.isDifferent12up(prev) ? calculate.flipAMPM(prev) : prev)}}
              />
              <ButtonCustom
                element={Iterate.Div > 1 ? "text" : "div"}
                text={`÷${Iterate.Div > 1 ? Iterate.Div : ""}`}
                btncolor="orange"
                onPress={() => handleIteratePress("Div")}
                bgColor={isIterSetting === "Div" ? ["#fb7103", "#FCC78E"] : undefined}
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
                element={Iterate.Mul > 1 ? "text" : "mul"}
                text={`×${Iterate.Mul > 1 ? Iterate.Mul : ""}`}
                btncolor="orange"
                onPress={() => handleIteratePress("Mul")}
                bgColor={isIterSetting === "Mul" ? ["#fb7103", "#FCC78E"] : undefined}
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
                bgColor={Operator === "-" ? ["#fb7103", "#FCC78E"] : undefined}
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
                bgColor={Operator === "+" ? ["#fb7103", "#FCC78E"] : undefined}
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