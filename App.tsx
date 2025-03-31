import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import ButtonCustom from "./components/ButtonCustom";

import Bar from "./assets/bar.svg";

export default function App() {
  const [boxWidth, setBoxWidth] = useState(120); // 초기 width 값
  const [boxHeight, setBoxHeight] = useState(120); // 초기 height 값
  const [selectedElemIndex, setSelectedElemIndex] = useState(0); // 선택된 요소의 인덱스
  const [selectedColorIndex, setSelectedColorIndex] = useState(0); // 초기 색상 배열

  return (
    <SafeAreaView style={[styles.iphone1315, styles.containerLayout]}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.calc}>

          <View style={styles.menubar}>
            <View style={[styles.menuicon, styles.calcFlexBox]}>
              <Bar style={styles.barIcon} width={22} height={22} stroke="#fb9d04" strokeWidth={0.5}/>
            </View>
          </View>

          <View style={styles.indicator}>
            <Text style={[styles.text, styles.textTypo]}>{`0+0`}</Text>
            <Text style={[styles.text1, styles.textTypo]}>0</Text>
          </View>

          <View style={styles.buttons}>
            <View style={styles.row2}>
              <ButtonCustom element='text' text='AC' btncolor='gray' />
              <ButtonCustom element='sign' btncolor='gray' />
              <ButtonCustom element='perc' btncolor='gray' />
              <ButtonCustom element='div' btncolor='orange' />
            </View>
            <View style={styles.row2} >
              <ButtonCustom element='text' text='7' btncolor='black' />
              <ButtonCustom element='text' text='8' btncolor='black' />
              <ButtonCustom element='text' text='9' btncolor='black' />
              <ButtonCustom element='mul' btncolor='orange' />
            </View>
            <View style={styles.row2} >
              <ButtonCustom element='text' text='4' btncolor='black' />
              <ButtonCustom element='text' text='5' btncolor='black' />
              <ButtonCustom element='text' text='6' btncolor='black' />
              <ButtonCustom element='sub' btncolor='orange' />
            </View>
            <View style={styles.row2} >
              <ButtonCustom element='text' text='1' btncolor='black' />
              <ButtonCustom element='text' text='2' btncolor='black' />
              <ButtonCustom element='text' text='3' btncolor='black' />
              <ButtonCustom element='add' btncolor='orange' />
            </View>
            <View style={styles.row2} >
              <ButtonCustom element='calc' btncolor='black' />
              <ButtonCustom element='text' text='0'  btncolor='black' />
              <ButtonCustom element='text' text='.'  btncolor='black' />
              <ButtonCustom element='equal' btncolor='orange' />
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
    overflow: "hidden"
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
  menubarFlexBox: {
    justifyContent: "flex-end",
    overflow: "hidden"
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
    paddingTop: 12,
    paddingLeft: 12,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    position: "absolute",
  },
  text: {
    fontSize: 30,
    color: "#8d8c93"
  },
  text1: {
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
    paddingBottom: 30,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
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