import React, { useRef } from "react";
import { StyleSheet, View, Text, Pressable, Animated, Easing, Platform } from "react-native";

import Sign from "../assets/sign.svg";
import Perc from "../assets/perc.svg";
import Div from "../assets/div.svg";
import Mul from "../assets/mul.svg";
import Sub from "../assets/sub.svg";
import Add from "../assets/add.svg";
import Calc from "../assets/calc.svg";
import Equal from "../assets/equal.svg";
import Back from "../assets/back.svg";

const colorOptions = {
  gray: ["#5C5C5E", "#8C8C8C"],
  black: ["#2A2A2C", "#727272"],
  orange: ["#FF9F0A", "#FCC78E"],
};

const svgMap = {
  text: <Text />,
  sign: <Sign height={27.5} width={27.5} />,
  perc: <Perc height={27.5} width={27.5} />,
  div: <Div height={27.5} width={27.5} />,
  mul: <Mul height={27.5} width={27.5} />,
  sub: <Sub height={27.5} width={27.5} />,
  add: <Add height={27.5} width={27.5} />,
  calc: <Calc height={27.5} width={27.5} />,
  equal: <Equal height={27.5} width={27.5} />,
  back: <Back height={38} width={38} />,
};

const elements = (
  element: string, text?: string) =>
  element !== 'text' && svgMap[element.toLowerCase() as keyof typeof svgMap] ? svgMap[element.toLowerCase() as keyof typeof svgMap] : <Text style={styles.elem}>{text || "AC"}</Text>;


const ButtonCustom = ({ element, text, btncolor, onPress, onLongPress, bgColor }: {
  element: keyof typeof svgMap,
  text?: string,
  btncolor: keyof typeof colorOptions
  onPress?: () => void;
  onLongPress?: () => void;
  bgColor?: string[]
}) => {
  const backgroundColor = useRef(new Animated.Value(0)).current; // 애니메이션 값 초기화

  const handlePressIn = () => {
    Animated.timing(backgroundColor, {
      toValue: 1, // 목표값
      duration: 150, // 애니메이션 지속 시간 (ms)
      easing: Easing.out(Easing.exp),
      useNativeDriver: false, // 배경색 변경은 Native Driver를 사용할 수 없음
    }).start();
    console.log("Button Pressed:", element, text);
  };

  const handlePressOut = () => {
    Animated.timing(backgroundColor, {
      toValue: 0, // 원래 값으로 복귀
      duration: 300, // 애니메이션 지속 시간 (ms)
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  // 배경색을 애니메이션 값에 따라 설정
  const interpolatedColor = backgroundColor.interpolate({
    inputRange: [0, 1],
    outputRange: bgColor || colorOptions[btncolor], // 시작 색상과 끝 색상
  });

  return (
    <Pressable style={[styles.ButtonCustom, styles.buttonColorFlexBox]}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.buttonGrayColor, styles.buttonColorFlexBox]}>
        <Animated.View
          style={[
            { backgroundColor: interpolatedColor },
            styles.circleFrame,
            styles.frameElemFlexBox,
          ]}
        />
      </View>
      <View style={[styles.frameElem, styles.frameElemFlexBox]}>
        {elements(element, text)}
      </View>
    </Pressable >
  );
};

const styles = StyleSheet.create({
  elem: {
    fontSize: Platform.OS === 'ios' ? 35 : 31,
    fontFamily: "Inter-Regular",
    color: "#fff",
    textAlign: "left",
  },
  buttonColorFlexBox: {
    minHeight: 83,
    minWidth: 83,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    height: 83,
    flex: 1
  },
  frameElemFlexBox: {
    justifyContent: "center",
    alignItems: "center"
  },
  circleFrame: {
    borderRadius: 50,
    alignItems: "center",
    height: 83,
    flex: 1
  },
  buttonGrayColor: {
    zIndex: 0
  },
  frameElem: {
    position: "absolute",
    width: 68,
    padding: 10,
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  ButtonCustom: {
    width: "100%",
    paddingHorizontal: 15,
    paddingVertical: 0,
  }
});

export default ButtonCustom;