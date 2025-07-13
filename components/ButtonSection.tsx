import React from 'react';
import { View, StyleSheet } from 'react-native';
import ButtonCustom from './ButtonCustom';
import {
  OperatorType,
  IterateSettingType,
  IterateSettings,
  NumberPressHandler,
  OperatorPressHandler,
  IteratePressHandler,
  VoidHandler,
  StateSetter,
} from '../types';
import * as calculate from '../utils/calculate';

export interface ButtonSectionProps {
  // State values
  textPrev: string;
  textNext: string;
  Operator: OperatorType;
  is12Format: boolean;
  isIterSetting: IterateSettingType;
  Iterate: IterateSettings;
  Running: boolean;
  
  // State setters
  setIs12Format: StateSetter<boolean>;
  setTextNext: StateSetter<string>;
  setTextPrev: StateSetter<string>;
  setTextCurrent: StateSetter<string>;
  setOperator: StateSetter<OperatorType>;
  setIsIterSetting: StateSetter<IterateSettingType>;
  setIterate: StateSetter<IterateSettings>;
  setisRunning: StateSetter<boolean>;
  setAlarmTriggered: StateSetter<boolean>;
  
  // Event handlers for parent-level actions
  handleEqualPress: VoidHandler;
  
  // Alarm service ref for canceling notifications
  alarmServiceRef: React.RefObject<any>;
}

const ButtonSection: React.FC<ButtonSectionProps> = ({
  textPrev,
  textNext,
  Operator,
  is12Format,
  isIterSetting,
  Iterate,
  Running,
  setIs12Format,
  setTextNext,
  setTextPrev,
  setTextCurrent,
  setOperator,
  setIsIterSetting,
  setIterate,
  setisRunning,
  setAlarmTriggered,
  handleEqualPress,
  alarmServiceRef,
}) => {
  // ButtonSection 레벨 함수들
  const handleACOrBack: VoidHandler = () => {
    let test: string;
    if ((textPrev && textNext) || !textNext.length) {
      // 'AC' 동작
      setAlarmTriggered(false); // 알람 상태 초기화
      setTextPrev("");
      setTextCurrent("");
      setOperator(""); // 연산자 초기화
      test = "";
    } else if (textNext.length > 1) {
      // 'back' 동작
      if (is12Format && textNext.length === 4) {
        if (/^(10|11|12|22|23|00)/.test(textNext)) {
          // 레전드 예외처리 하드코딩
          /**
           * AM 1000 -> AM 0100 = 10nn -> 01nn
           * PM 1000 -> PM 0100 = 22nn -> 13nn
           * AM 1100 -> AM 0110 = 11nn -> 011n
           * PM 1100 -> PM 0110 = 23nn -> 131n
           * AM 1200 -> AM 0120 = 00nn -> 012n
           * PM 1200 -> PM 0120 = 12nn -> 132n
           */
          const prefix: string = textNext.slice(0, 2);
          const suffix: string = textNext.slice(2);

          const mapping: { [key: string]: string } = {
            "10": "01",
            "22": "13",
            "11": "011",
            "23": "131",
            "00": "012",
            "12": "132",
          };

          const transformed: string = mapping[prefix] || "";

          test = transformed + suffix;
          test = test.length === 5 ? test.slice(0, -1) : test;
        } else
          test = textNext.startsWith("0")
            ? textNext.slice(1, -1)
            : calculate.flipAMPM(textNext).slice(1, -1);
      } else {
        test = textNext.slice(0, -1);
      }
    } else {
      test = "";
    }
    setTextNext(test);
    if (Running) {
      setisRunning(false); // 계산 중지
      alarmServiceRef.current?.cancelAllNotifications(); // 알람 취소
    }
  };

  const handleNumberPress: NumberPressHandler = (num: string) => {
    if (isIterSetting) {
      if (num === "0" || num === "1") {
        setIterate((prev: IterateSettings) => ({
          ...prev,
          [isIterSetting]: 1,
        })); // Iterate 상태 초기화
        setIsIterSetting(""); // isIterSetting 초기화
        return;
      }
      setIterate((prev: IterateSettings) => {
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
        let test: string = textNext + num;
        if (is12Format && Operator === "") {
          if (test.length === 3 && Number(test.slice(0, 2)) > 24) {
            test = "0" + test;
          } else if (test.length === 4 && Number(test.slice(-2)) > 59) {
            test = "";
          }
          test = calculate.isDifferent12up(test)
            ? calculate.flipAMPM(test)
            : test;
          setTextNext(test);
          return;
        }
        setTextNext((prev: string) => prev + num);
      } else {
        setTextNext(num); // 최대 4자리까지 입력 가능
      }
    }
  };

  const handleDotPress: VoidHandler = () => {
    if (!Running) {
      setTextNext((prev: string) => (prev.includes(".") ? prev : prev + "."));
    }
  };

  const handleOperatorPress: OperatorPressHandler = (
    operator: OperatorType
  ) => {
    if (!Running) {
      setOperator(Operator !== operator ? operator : ""); // operator가 비어있지 않으면 빈 문자열로 설정
    }
    console.log("Operator Pressed:", operator.length, operator, Operator);
  };

  const handleFlipAMPM: VoidHandler = () => {
    if (!Running) {
      setTextNext(calculate.flipAMPM(calculate.fixTextTime(textNext))); // textNext를 flipAMPM으로 변환
    }
  };

  const handleIteratePress: IteratePressHandler = (key: "Mul" | "Div") => {
    console.log(Iterate.Div, Iterate.Mul);
    if (Running) {
      console.log("Iter info View");
      return; // Running 상태일 때는 아무 작업도 하지 않음
    }
    if (Iterate[key] > 1) {
      // 이미 값이 존재하면 초기화
      setIterate((prev: IterateSettings) => ({ ...prev, [key]: 1 }));
      setIsIterSetting("");
    } else if (isIterSetting === key) {
      // 현재 설정 중인 키를 다시 누르면 초기화
      setIsIterSetting("");
    } else {
      // 새로운 키를 설정
      setIsIterSetting(key);
    }
  };
  return (
    <>
      <View style={styles.row2}>
        <ButtonCustom
          element={
            (textPrev && textNext) || !textNext.length ? "text" : "back"
          }
          text={
            (textPrev && textNext) || !textNext.length ? "AC" : "back"
          }
          btncolor="gray"
          onPress={handleACOrBack}
          onLongPress={Running ? undefined : () => setTextNext("")}
          bgColor={Running ? ["#FF1616", "#fe6d65"] : undefined}
        />
        <ButtonCustom
          element="sign"
          text="±"
          btncolor="gray"
          onPress={() => handleFlipAMPM()}
        />
        <ButtonCustom
          element="perc"
          text="%"
          btncolor="gray"
          onPress={() => {
            setIs12Format(!is12Format);
            setTextNext(prev =>
              calculate.isDifferent12up(prev)
                ? calculate.flipAMPM(prev)
                : prev
            );
          }}
        />
        <ButtonCustom
          element={Iterate.Div > 1 ? "text" : "div"}
          text={`÷${Iterate.Div > 1 ? Iterate.Div : ""}`}
          btncolor="orange"
          onPress={() => handleIteratePress("Div")}
          bgColor={
            isIterSetting === "Div" ? ["#fb7103", "#FCC78E"] : undefined
          }
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
          />
        ))}
        <ButtonCustom
          element={Iterate.Mul > 1 ? "text" : "mul"}
          text={`×${Iterate.Mul > 1 ? Iterate.Mul : ""}`}
          btncolor="orange"
          onPress={() => handleIteratePress("Mul")}
          bgColor={
            isIterSetting === "Mul" ? ["#fb7103", "#FCC78E"] : undefined
          }
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
          />
        ))}
        <ButtonCustom
          element="sub"
          text="-"
          btncolor="orange"
          onPress={() => handleOperatorPress("-")}
          bgColor={Operator === "-" ? ["#fb7103", "#FCC78E"] : undefined}
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
          />
        ))}
        <ButtonCustom
          element="add"
          text="+"
          btncolor="orange"
          onPress={() => handleOperatorPress("+")}
          bgColor={Operator === "+" ? ["#fb7103", "#FCC78E"] : undefined}
        />
      </View>
      <View style={styles.row2}>
        <ButtonCustom
          element="calc"
          text="="
          btncolor="black"
          onPress={handleEqualPress}
        />
        <ButtonCustom
          element="text"
          text="0"
          btncolor="black"
          onPress={() => handleNumberPress("0")}
        />
        <ButtonCustom
          element="text"
          text="."
          btncolor="black"
          onPress={handleDotPress}
        />
        <ButtonCustom
          element="equal"
          text="="
          btncolor="orange"
          onPress={handleEqualPress}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
    row2: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        alignSelf: "stretch",
        flexDirection: "row",
        minHeight: 83,
    },
});

export default ButtonSection;