import { StyleSheet, Platform } from "react-native";
import Constants from "expo-constants";

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
    alignSelf: "stretch",
  },
  textTypo: {
    textAlign: "right",
    fontFamily: "Inter-Regular",
  },
  barIcon: {},
  menuicon: {
    width: 34,
    height: 26,
  },
  menubar: {
    display: "flex",
    paddingLeft: 12,
    justifyContent: "flex-end",
    alignItems: "flex-start",
    position: "absolute",
    paddingTop: Platform.OS === "ios" ? 12 : Constants.statusBarHeight + 20,
  },
  text_prev: {
    fontSize: 30,
    color: "#8d8c93",
  },
  text_next: {
    fontSize: 71,
    color: "#fff",
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
    flex: 1,
  },
});

export default styles;