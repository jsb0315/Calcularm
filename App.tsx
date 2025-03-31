import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, Platform } from 'react-native';
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

  // '0000' 형태로 반환
  return `${formattedHours}${formattedMinutes}`;
};

export default function App() {
  const [textPrev, setTextPrev] = useState(""); // 이전 값
  const [textNext, setTextNext] = useState(""); // 현재 값
  const [Operator, setOperator] = useState("");
  const [Running, setisRunning] = useState(false); // 계산 중인지 여부

  console.log(textNext)

  // 함수 선언
  const handleACOrBack = () => {
    if ((textPrev && textNext) || !textNext.length) {
      // 'AC' 동작
      setTextPrev("");
      setTextNext("");
      setOperator(""); // 연산자 초기화
    } else {
      // 'back' 동작
      setTextNext((prev) => (prev.length > 1 ? prev.slice(0, -1) : ""));
    }
    if (Running) {
      setisRunning(false); // 계산 중지
    }
  };

  const handleNumberPress = (num: string) => {
    if (!Running) {
      if (textPrev && textNext) {
        setTextPrev(""); // textPrev 초기화
        setTextNext(num); // textNext에 숫자 설정
      } else if (textNext.length < 4) {
        setTextNext((prev) => (prev + num));
      }
    }
  };

  const handleEqualPress = () => {
    if (!Running) {
      setTextPrev(textNext); // textNext 값을 textPrev로 복사
      setTextNext(textNext.length ? () => { setisRunning(true); return "result" } : getCurrentTimeAsString()); // textNext를 'result'로 설정
    }
  };

  const handleDotPress = () => {
    if (!Running) {
      setTextNext((prev) => (prev.includes(".") ? prev : prev + "."));
    }
  };

  const handleOperatorPress = (operator: string) => {
    if (/^0+$/.test(textNext) || !textNext.length || textPrev.length) {
      setOperator("")
    }
    else {
      setOperator(Operator !== operator ? operator : ""); // operator가 비어있지 않으면 빈 문자열로 설정
    }
    console.log("Operator Pressed:", operator.length, operator, Operator);
  };

  const handleFlipAMPM = () => {
    if (!Running) {
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
    if (!Running) {
      setTextNext((prev) => {
        if (prev.length === 3) {
          prev = `0${prev}`; // 3자리일 경우 가장 앞에 '0' 추가
        }

        if (prev.length !== 4 || isNaN(Number(prev))) {
          return prev; // 유효하지 않은 값은 그대로 반환
        }

        // 1. 시간과 분 분리
        let hours = parseInt(prev.slice(0, 2), 10); // 앞 두 자리는 시간
        let minutes = parseInt(prev.slice(2), 10); // 뒤 두 자리는 분

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
      });
    }
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
              {textPrev.length > 2
                ? `${textPrev.slice(0, -2)}:${textPrev.slice(-2)}`
                : textPrev}
            </Text>
            <Text style={[styles.text_next, styles.textTypo]}>
              {Operator}{textNext.length > 2
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
    color: "#8d8c93"
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