// 함수 타입들
import { TimeValue, TimeString, TimeDisplay, OperatorType, IterateSettingType } from './alarm';
import React from 'react';

// 이벤트 핸들러 타입들
export type NumberPressHandler = (num: string) => void;
export type OperatorPressHandler = (operator: OperatorType) => void;
export type IteratePressHandler = (key: "Mul" | "Div") => void;
export type VoidHandler = () => void;

// 시간 계산 함수들의 타입
export interface TimeCalculationFunctions {
  getCurrentTimeAsString: () => TimeString;
  handleFixTimeValue: (timeStr: string) => TimeValue;
  calculateTimeDifference: (current: Date, target: TimeValue) => string;
  addTime: (baseTime: Date, addTime: TimeValue) => TimeValue;
  subtractTime: (baseTime: Date, subtractTime: TimeValue) => TimeValue;
  fixTextTime: (text: string) => string;
  flipAMPM: (text: string) => string;
  convertTo12HourFormat: (is12Format: boolean, timeStr: string) => TimeDisplay;
  formatTime: (time: string, is12Format?: boolean) => string;
  timeValueTotext: (time: TimeValue) => string;
  isDifferent12up: (text: string) => boolean;
}

// useState 세터 타입들
export type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;
