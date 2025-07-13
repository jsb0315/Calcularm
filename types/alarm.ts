// 기본 시간 관련 타입들
export interface TimeValue {
  hours: number;
  minutes: number;
}

export interface TimeString {
  string: string;  // "1230" 형태
  hour: number;    // 12
  minute: number;  // 30
}

export interface TimeDisplay {
  time: string;
  format: "AM" | "PM" | "";
}

export interface IterateSettings {
  Mul: number;
  Div: number;
}

export type OperatorType = "+" | "-" | "";
export type ButtonColorType = "black" | "gray" | "orange";
export type ButtonElementType = "text" | "back" | "sign" | "perc" | "div" | "mul" | "sub" | "add" | "calc" | "equal";
export type IterateSettingType = "Mul" | "Div" | "";

// 알람 상태 인터페이스
export interface AlarmState {
  textCurrent: string;
  textPrev: string;
  textNext: string;
  Operator: OperatorType;
  is12Format: boolean;
  isIterSetting: IterateSettingType;
  Iterate: IterateSettings;
  Running: boolean;
  AlarmTriggered: boolean;
}
