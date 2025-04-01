import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { Vibration, SafeAreaView, StyleSheet, Text, View, Platform } from 'react-native';
import ButtonCustom from "./components/ButtonCustom";
import Constants from 'expo-constants';

import Bar from "./assets/bar.svg";

const getCurrentTimeAsString = () => {
  const now = new Date(); // 현재 시간 가져오기
  const hours = now.getHours(); // 현재 시간 (시)
  const minutes = now.getMinutes(); // 현재 시간 (분)

  // 두 자리 형식으로 변환
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return {
    string: `${formattedHours}${formattedMinutes}`, // '0000' 형태
    format: `${formattedHours}:${formattedMinutes}`, // '00:00' 형태
    hour: hours, // 시간만
    minute: minutes, // 분만
  }
};

const handleFixTimeValue = (timeString: string) => {

  timeString = `${'0'.repeat(4 - timeString.length)}${timeString}`; // 앞에 '0' 추가

  const hours = parseInt(timeString.slice(0, 2), 10);
  const minutes = parseInt(timeString.slice(2), 10);

  return { hours, minutes }; // 시간과 분을 객체로 반환
};

const calculateTimeDifference = (currentTime: Date, textTime: { hours: number, minutes: number }) => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const targetMinutes = textTime.hours * 60 + textTime.minutes;

  let difference = targetMinutes - currentMinutes;

  // 음수일 경우 하루(24시간)를 추가
  if (difference < 0) {
    difference += 24 * 60; // 24시간(1440분)을 더함
  }

  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  return `${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`;
};

const addTime = (currentTime: Date, textTime: { hours: number, minutes: number }) => {
  let totalMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes() +
    textTime.hours * 60 +
    textTime.minutes;

  const newHours = Math.floor(totalMinutes / 60) % 24; // 24시간 형식으로 변환
  const newMinutes = totalMinutes % 60;

  return `${newHours < 10 ? `0${newHours}` : newHours}${newMinutes < 10 ? `0${newMinutes}` : newMinutes}`;
};

const subtractTime = (currentTime: Date, textTime: { hours: number, minutes: number }) => {
  let totalMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes() -
    (textTime.hours * 60 + textTime.minutes);

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // 음수일 경우 하루를 더해줌
  }

  const newHours = Math.floor(totalMinutes / 60) % 24; // 24시간 형식으로 변환
  const newMinutes = totalMinutes % 60;

  return `${newHours < 10 ? `0${newHours}` : newHours}${newMinutes < 10 ? `0${newMinutes}` : newMinutes}`;
};

export default function App() {
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
        Vibration.vibrate(); // 진동 시작
      }
    }
  };

  // Running 상태가 true일 동안 10초마다 갱신
  useEffect(() => {
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
    }
  };

  const handleNumberPress = (num: string) => {
    if (!Running) {
      if (textPrev && textNext) {
        setTextPrev(""); // textPrev 초기화
        setTextCurrent("");
        setTextNext(num); // textNext에 숫자 설정
      } else if (textNext.length < 4) {
        setTextNext((prev) => (prev + num));
      } else {
        setTextNext(num); // 최대 4자리까지 입력 가능
      }
    }
  };

  const handleEqualPress = () => {
    if (!Running) {
      const currentTime = new Date();
      const currentTimeString = getCurrentTimeAsString(); // '0000' 형태의 현재 시간

      if (!textNext.length) { // 아무것도 없을때
        setTextPrev(textNext); // textNext 값을 textPrev로 복사
        setTextNext(textNext.length ? () => { setisRunning(true); return "result" } : currentTimeString.string); // textNext를 'result'로 설정
        return
      }
      else if (Operator === "") { // 일반설정
        if (textNext.length === 3) {
          setTextNext('0' + textNext); // 4자리로 맞추기
        } else if (textNext.length < 3) {
          setTextNext((Number(textNext) > currentTime.getMinutes() ? currentTimeString.hour : currentTimeString.hour + 1) + (textNext.length === 1 ? '0' : '') + textNext);
          console.log("textNext:", textNext);
        }
        // 현재부터 textTime까지 남은 시간 계산
        const fixedTime = fixTextTime(textNext);
        const textTime = handleFixTimeValue(fixedTime); // textNext를 시간으로 변환한 값
        const timeDifference = calculateTimeDifference(currentTime, textTime);
        // textPrev에 현재 시간과 남은 시간 저장
        setTextCurrent(currentTimeString.format);
        setTextPrev(`+ ${timeDifference == '0000' ? '2400' : timeDifference}`);
        setTextNext(fixedTime);

      } else if (Operator === "+") {  // n분 후
        // 현재 시간에 textTime을 더한 시간 계산
        const textTime = addTime(currentTime, handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.format);
        setTextPrev(`+ ${fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(textTime);

      } else if (Operator === "-") {  // n분 전
        // 현재 시간에서 textTime만큼을 뺀 시간 계산
        const textTime = subtractTime(currentTime, handleFixTimeValue(textNext));

        // textPrev와 textNext 업데이트
        setTextCurrent(currentTimeString.format);
        setTextPrev(`- ${fixTextTime('0'.repeat(4 - textNext.length) + textNext)}`);
        setTextNext(textTime);
      }

      console.log(`${fixTextTime(textNext)} 알람이 설정됐습니다`);
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
      handleFixTime();
      setTextNext((prev) => {
        if (prev.length === 3) {
          prev = `0${prev}`; // 3자리일 경우 가장 앞에 '0' 추가
        }

        if (prev.length !== 4 || isNaN(Number(prev))) {
          return prev; // 유효하지 않은 값은 그대로 반환
        }

        // 1. '2000'을 '20:00'으로 변환
        const hours = parseInt(prev.slice(0, 2), 10);
        const minutes = prev.slice(2);

        // 2. 12시간 추가
        const newHours = (hours + 12) % 24; // 24시간 형식으로 계산
        const formattedHours = newHours < 10 ? `0${newHours}` : `${newHours}`;

        // 3. '800' 형식으로 변환
        return `${formattedHours}${minutes}`;
      });
    }
  };

  const handleFixTime = () => {
    if (!Running)
      setTextNext((prev) => fixTextTime(prev)); // textNext를 fixTextTime으로 변환
  };

  const fixTextTime = (text: string) => {
    if (text.length === 3) {
      text = `0${text}`; // 3자리일 경우 가장 앞에 '0' 추가
    } else if (text.length === 2) {
      text = `${text}00`; // 2자리일 경우 앞에 '00' 추가
    }
    else if (text.length === 1) {
      text = `0${text}00`; // 1자리일 경우 앞에 '000' 추가
    }

    if (text.length !== 4 || isNaN(Number(text))) {
      return text; // 유효하지 않은 값은 그대로 반환
    }

    // 1. 시간과 분 분리
    let hours = parseInt(text.slice(0, 2), 10); // 앞 두 자리는 시간
    let minutes = parseInt(text.slice(2), 10); // 뒤 두 자리는 분

    // 2. 분이 60 이상일 경우 시간으로 올림
    if (minutes >= 60) {
      hours += Math.floor(minutes / 60); // 초과된 분을 시간으로 올림
      minutes = minutes % 60; // 남은 분
    }

    // 3. 시간이 24 이상일 경우 24로 나눈 나머지 계산
    if (hours >= 24) {
      hours = hours % 24;
    }

    // 4. 시간과 분을 두 자리 형식으로 변환
    const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

    // 5. 결과 반환
    return `${formattedHours}${formattedMinutes}`;
  }

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

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    alignSelf: "stretch",
    backgroundColor: "black",
    overflow: "hidden",
  },
  containerLayout: {
    backgroundColor: "black",
    overflow: "hidden",
  },
  calc: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: 10,
    flex: 1,
    alignSelf: "stretch",
  },
  calcFlexBox: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    alignSelf: "stretch"
  },
  textTypo: {
    textAlign: "right",
    fontFamily: "Inter-Regular"
  },
  barIcon: {},
  menuicon: {
    width: 34,
    height: 26
  },
  menubar: {
    display: "flex",
    paddingLeft: 12,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    position: "absolute",
    paddingTop: Platform.OS === 'ios' ? 12 : Constants.statusBarHeight + 20,
  },
  text_prev: {
    fontSize: 30,
    color: "#8d8c93",
  },
  text_next: {
    fontSize: 71,
    color: "#fff"
  },
  indicator: {
    display: "flex",
    paddingHorizontal: 17,
    paddingVertical: 0,
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    flex: 1,
    alignSelf: "stretch",
  },
  buttons: {
    display: "flex",
    paddingHorizontal: 12,
    paddingTop: 0,
    paddingBottom: 28,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 8.5,
    alignSelf: "stretch",
  },
  row2: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    alignSelf: "stretch",
    flexDirection: "row",
    minHeight: 83,
  },
  iphone1315: {
    width: "100%",
    overflow: "hidden",
    flex: 1
  }
});