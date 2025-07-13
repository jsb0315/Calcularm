import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, Text, View } from "react-native";
import { AlarmService, AlarmServiceRef } from "./components/AlarmService";
import styles from "./styles"; // styles.ts 파일에서 가져오기
import ButtonSection from "./components/ButtonSection";

// 타입 imports
import {
  TimeValue,
  TimeString,
  TimeDisplay,
  OperatorType,
  IterateSettingType,
  IterateSettings,
  NumberPressHandler,
  OperatorPressHandler,
  IteratePressHandler,
  VoidHandler,
  StateSetter,
} from "./types";

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
  // AlarmService에 대한 참조
  const alarmServiceRef = useRef<AlarmServiceRef>(null);

  const [textCurrent, setTextCurrent]: [string, StateSetter<string>] =
    useState<string>(""); // 현재시간
  const [textPrev, setTextPrev]: [string, StateSetter<string>] =
    useState<string>(""); // 남은시간
  const [textNext, setTextNext]: [string, StateSetter<string>] =
    useState<string>(""); // 설정한 알람시간
  const [Operator, setOperator]: [OperatorType, StateSetter<OperatorType>] =
    useState<OperatorType>("");
  const [is12Format, setIs12Format]: [boolean, StateSetter<boolean>] =
    useState<boolean>(false);
  const [isIterSetting, setIsIterSetting]: [
    IterateSettingType,
    StateSetter<IterateSettingType>
  ] = useState<IterateSettingType>("");
  const [Iterate, setIterate]: [IterateSettings, StateSetter<IterateSettings>] =
    useState<IterateSettings>({ Mul: 1, Div: 1 });
  const [Running, setisRunning]: [boolean, StateSetter<boolean>] =
    useState<boolean>(false); // 계산 중인지 여부
  const [AlarmTriggered, setAlarmTriggered]: [boolean, StateSetter<boolean>] =
    useState<boolean>(false); // 알람이 울렸는지 여부

  // 현재 시간과 남은 시간을 갱신하는 함수
  const updateTimes = (): void => {
    const currentTime: TimeString = calculate.getCurrentTimeAsString(); // 현재 시간 가져오기
    setTextCurrent(currentTime.string); // 현재 시간 갱신

    if (textNext) {
      const textTime: TimeValue = calculate.handleFixTimeValue(textNext); // textNext를 시간으로 변환
      const currentDate: Date = new Date();
      const timeDifference: string = calculate.calculateTimeDifference(
        currentDate,
        textTime
      ); // 남은 시간 계산
      setTextPrev(timeDifference === "0000" ? "+ 2400" : "+ " + timeDifference); // 남은 시간 갱신

      // 알람 체크: 현재 시간이 textNext와 같아지면 알람 트리거
      if (currentTime.string === textNext && !AlarmTriggered) {
        setAlarmTriggered(true); // 알람 상태를 true로 설정
        console.log("알람이 링링링"); // 알람 메시지 출력
        // 추가적인 알람 동작 (예: 소리 재생, 진동 등)
        // Vibration.vibrate(); // 진동 시작
      }
    }
  };

  // Running 상태가 true일 동안 1초마다 갱신
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (Running) {
      interval = setInterval(() => {
        updateTimes(); // 1초마다 실행
      }, 1000);
    } else if (interval) {
      clearInterval(interval); // Running이 false가 되면 타이머 정리
      setAlarmTriggered(false);
    }

    return () => {
      if (interval) clearInterval(interval); // 컴포넌트 언마운트 시 타이머 정리
    };
  }, [Running, textNext, is12Format]); // Running 또는 textNext가 변경될 때 실행

  // 함수 선언
  const handleEqualPress: VoidHandler = () => {
    if (!Running) {
      const currentTime: Date = new Date();
      const currentTimeString: TimeString = calculate.getCurrentTimeAsString(); // '0000' 형태의 현재 시간
      let textTime: TimeValue = { hours: 0, minutes: 0 };
      let timeDifference: string;

      if (!textNext.length) {
        // 아무것도 없을때
        setTextPrev(textNext); // textNext 값을 textPrev로 복사
        setTextNext(currentTimeString.string); // textNext를 'result'로 설정
        return;
      } else if (Operator === "") {
        // 일반설정
        // 현재부터 textTime까지 남은 시간 계산
        let fixedTime: string =
          textNext.length < 3
            ? calculate.fixTextTime(
                (Number(textNext) > currentTime.getMinutes()
                  ? currentTimeString.hour
                  : currentTimeString.hour + 1) +
                  (textNext.length === 1 ? "0" : "") +
                  textNext
              )
            : calculate.fixTextTime(textNext);
        textTime = calculate.handleFixTimeValue(fixedTime); // textNext를 시간으로 변환한 값
        timeDifference = calculate.calculateTimeDifference(
          currentTime,
          textTime
        );
        const timeDifferenceValue: TimeValue =
          calculate.handleFixTimeValue(timeDifference); // 남은 시간 계산
        const is12up: boolean =
          timeDifferenceValue.hours + timeDifferenceValue.minutes * 0.01 > 12;
        if ((textNext.length < 4 || textNext.startsWith("12")) && is12up) {
          // 12시간 이상 남은 경우
          fixedTime = calculate.flipAMPM(fixedTime);
          timeDifference = calculate.flipAMPM(timeDifference);
        }

        // textPrev에 현재 시간과 남은 시간 저장
        setTextCurrent(currentTimeString.string);
        setTextPrev(`+ ${timeDifference == "0000" ? "2400" : timeDifference}`);
        setTextNext(fixedTime);
      } else if (Operator === "+") {
        // n분 후
        // 현재 시간에 textTime을 더한 시간 계산
        textTime = calculate.addTime(
          currentTime,
          calculate.handleFixTimeValue(textNext)
        );

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.string);
        setTextPrev(
          `+ ${calculate.fixTextTime(
            "0".repeat(4 - textNext.length) + textNext
          )}`
        );
        setTextNext(calculate.timeValueTotext(textTime));
      } else if (Operator === "-") {
        // n분 전
        // 현재 시간에서 textTime만큼을 뺀 시간 계산
        textTime = calculate.subtractTime(
          currentTime,
          calculate.handleFixTimeValue(textNext)
        );

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.string);
        setTextPrev(
          `- ${calculate.fixTextTime(
            "0".repeat(4 - textNext.length) + textNext
          )}`
        );
        setTextNext(calculate.timeValueTotext(textTime));
      }

      console.log(`${calculate.timeValueTotext(textTime)} 알람이 설정됐습니다`);
      
      // 기본 알람 설정
      alarmServiceRef.current?.scheduleNotification(calculate.timeValueTotext(textTime));
      
      // 고급 알람 설정 (Iterate 기능 사용)
      if (Iterate.Div > 1 || Iterate.Mul > 1) {
        const timeDifferenceValue: TimeValue = calculate.handleFixTimeValue(
          calculate.calculateTimeDifference(currentTime, textTime)
        );
        alarmServiceRef.current?.scheduleAdvancedAlarm(
          textTime,
          timeDifferenceValue,
          Iterate,
          Operator
        );
      }
      
      setisRunning(true); // Running 상태를 true로 설정
    }
  };

  /**
   * 알림을 다음 조건에 맞춰 예약하고싶어. 조건에 맞게 코드를 작성해줘
[변수]
Iterate = {Mul: Number, Div: Number} 형태 (useState)
시간 객체 = {hours: Number, minutes: Number}
textNext = 시간 문자열 temp 값
textTime = 알람 설정 시각 객체
timeDifferenceValue = 알람까지 남은시간
currentTime = 현재 시간 Date() 객체
[조건]
- 알람 설정 1단계, Div 사용)
timeDifferenceValue의 시간을 Iterate.Div만큼 균일하게 나눠 알람 설정(timeDifferenceValue = 1시간, Iterate.Div = 6일때 1시간동안 1/6시간동안 6번 울림)
- 2단계, 조건 Mul 사용)
Operator === "": 
   textTime으로부터 [Iterate.Mul]일 동안 textTime 시간에 알람 설정(textTime = 오전 7시,  Iterate.Mul = 3일 때 오전 7시, 1일 후 오전 7시, 2일 후 오전 7시에 3번 울림)
Operator === "+": 
   currentTime부터 textTime 시간을 추가한 만큼 [Iterate.Mul]번 알람 설정(textTime = 30,  Iterate.Mul = 3일 때 오전 7시, 1일 후 오전 7시, 2일 후 오전 7시에 3번 울림) 
   
   
   */
  
  const showtextCurrent: TimeDisplay = calculate.convertTo12HourFormat(
    is12Format,
    textCurrent
  );
  const showtextNext: TimeDisplay = calculate.convertTo12HourFormat(
    is12Format,
    textNext
  );

  return (
    <AlarmService
      ref={alarmServiceRef}
      onAlarmTriggered={setAlarmTriggered}
    >
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
                {textCurrent && "현재시간⠀" + showtextCurrent.format}
              </Text>
              <Text style={[styles.text_prev, styles.textTypo]}>
                {calculate.formatTime(showtextCurrent.time, is12Format)}
              </Text>
            </View>
            <Text style={[styles.text_prev, styles.textTypo]}>
              {textPrev.length > 2 ? calculate.formatTime(textPrev) : textPrev}
            </Text>

            <View style={styles.rowView}>
              <Text style={[styles.text_format_next, styles.textTypo]}>
                {(Running || !Operator.length) &&
                  textNext.length > 2 &&
                  showtextNext.format}
              </Text>
              <Text style={[styles.text_next, styles.textTypo]}>
                {!Running && textNext && Operator}
                {textNext.length > 2
                  ? calculate.formatTime(
                      !Running && Operator ? textNext : showtextNext.time,
                      is12Format
                    )
                  : textNext.length
                  ? textNext
                  : "0"}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <ButtonSection
              textPrev={textPrev}
              textNext={textNext}
              Operator={Operator}
              is12Format={is12Format}
              isIterSetting={isIterSetting}
              Iterate={Iterate}
              Running={Running}
              setIs12Format={setIs12Format}
              setTextNext={setTextNext}
              setTextPrev={setTextPrev}
              setTextCurrent={setTextCurrent}
              setOperator={setOperator}
              setIsIterSetting={setIsIterSetting}
              setIterate={setIterate}
              setisRunning={setisRunning}
              setAlarmTriggered={setAlarmTriggered}
              handleEqualPress={handleEqualPress}
              alarmServiceRef={alarmServiceRef}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
    </AlarmService>
  );
}
