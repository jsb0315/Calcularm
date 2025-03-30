import React, { useState, useRef } from "react";
import { StyleSheet, View, TouchableWithoutFeedback, Animated, Easing } from "react-native";

const ButtonCustom = ({ element, btncolor }: { element: React.ReactNode, btncolor: string[] }) => {
  const [isPressed, setIsPressed] = useState(false);const backgroundColor = useRef(new Animated.Value(0)).current; // 애니메이션 값 초기화

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.timing(backgroundColor, {
      toValue: 1, // 목표값
      duration: 150, // 애니메이션 지속 시간 (ms)
      easing: Easing.out(Easing.exp),
      useNativeDriver: false, // 배경색 변경은 Native Driver를 사용할 수 없음
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
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
    outputRange: btncolor, // 시작 색상과 끝 색상
  });

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={[styles.ButtonCustom, styles.buttonColorFlexBox]}>
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
          {element}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
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
  ac: {
  alignSelf: "stretch",
  fontSize: 35,
  fontFamily: "Inter-Regular",
  color: "#fff",
  textAlign: "left",
  flex: 1
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
  gap: 10
  }
  });
  

export default ButtonCustom;