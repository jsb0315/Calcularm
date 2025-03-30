import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import ButtonCustom from "./components/ButtonCustom";

import Sign from "./assets/sign.svg";
import Perc from "./assets/perc.svg";
import Div from "./assets/div.svg";
import Mul from "./assets/mul.svg";
import Sub from "./assets/sub.svg";
import Add from "./assets/add.svg";
import Calc from "./assets/calc.svg";
import Equal from "./assets/equal.svg";

export default function App() {
  const [boxWidth, setBoxWidth] = useState(120); // 초기 width 값
  const [boxHeight, setBoxHeight] = useState(120); // 초기 height 값
  const [selectedElemIndex, setSelectedElemIndex] = useState(0); // 선택된 요소의 인덱스
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // 초기 색상 배열

  // SVG 요소 배열
  const elements = [
    <Text style={styles.elem}>AC</Text>,
    <Sign height={27.5} width={27.5} />,
    <Perc height={27.5} width={27.5} />,
    <Div height={27.5} width={27.5} />,
    <Mul height={27.5} width={27.5} />,
    <Sub height={27.5} width={27.5} />,
    <Add height={27.5} width={27.5} />,
    <Calc height={27.5} width={27.5} />,
    <Equal height={27.5} width={27.5} />,
  ];

  // 색상 배열
  const colorOptions = [
    ["#5C5C5E", "#8C8C8C"],
    ["#2A2A2C", "#727272"],
    ["#FF9F0A", "#FCC78E"],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#0000ff" />
      <View style={styles.svgBackground}>
      <Text>Open up App.tsx to start working on your app!</Text>
      </View>
      {/* 크기를 조정할 수 있는 박스 */}
      <View style={[styles.resizableBox, { width: boxWidth, height: boxHeight }]}>
        <ButtonCustom element={elements[selectedElemIndex]} btncolor={colorOptions[selectedColorIndex]} />
      </View>
      {/* 라디오 버튼: 요소 선택 */}
      <View style={styles.radioContainer}>
        {elements.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.radioButton,
              selectedElemIndex === index && styles.radioButtonSelected,
            ]}
            onPress={() => setSelectedElemIndex(index)}
          >
            <Text style={styles.radioText}>{index + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 라디오 버튼: 색상 선택 */}
      <View style={styles.radioContainer}>
        {colorOptions.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.radioButton,
              selectedColorIndex === index && styles.radioButtonSelected,
            ]}
            onPress={() => setSelectedColorIndex(index)}
          >
            <View
              style={{
                width: 20,
                height: 20,
                backgroundColor: color[0],
                borderRadius: 10,
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
      {/* 프로그래스 바: Width 조정 */}
      <View style={styles.sliderContainer}>
        <Text>Width: {boxWidth}</Text>
        <Slider
          style={styles.slider}
          minimumValue={83}
          maximumValue={300}
          step={1}
          value={boxWidth}
          onValueChange={(value) => setBoxWidth(value)}
        />
      </View>
      {/* 프로그래스 바: Height 조정 */}
      <View style={styles.sliderContainer}>
        <Text>Height: {boxHeight}</Text>
        <Slider
          style={styles.slider}
          minimumValue={83}
          maximumValue={300}
          step={1}
          value={boxHeight}
          onValueChange={(value) => setBoxHeight(value)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgBackground: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 12,
  },
  elem: {
    fontSize: 35,
    fontFamily: "Inter-Regular",
    color: "#fff",
    textAlign: "left",
  },
  resizableBox: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginTop: 20,
  },
  sliderContainer: {
    width: '80%',
    marginTop: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radioContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
  },
  radioButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  radioButtonSelected: {
    backgroundColor: '#000',
  },
  radioText: {
    color: '#fff',
    fontSize: 16,
  },
});
