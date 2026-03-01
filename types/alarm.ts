export interface AlarmTimeInput {
  hours: string;
  minutes: string;
}

export interface AlarmRepeatConfig {
  everyDays: number;
  divideInDay: number;
}

export interface AlarmDraft {
  id: string;
  label: string;
  time: AlarmTimeInput;
  isEnabled: boolean;
  scheduledNotificationId?: string;
  repeat: AlarmRepeatConfig;
  createdAt: number;
}

export interface AlarmCoreState {
  selectedField: "hours" | "minutes";
  currentInput: AlarmTimeInput;
  draft: AlarmDraft;
}

export const ALARM_CORE_DEFAULTS = {
  input: {
    hours: "",
    minutes: "",
  } as AlarmTimeInput,
  repeat: {
    everyDays: 1,
    divideInDay: 1,
  } as AlarmRepeatConfig,
};

export const createAlarmDraft = (
  time: AlarmTimeInput = ALARM_CORE_DEFAULTS.input,
  label = ""
): AlarmDraft => ({
  id: `alarm-${Date.now()}`,
  label,
  time: { ...time },
  isEnabled: true,
  repeat: { ...ALARM_CORE_DEFAULTS.repeat },
  createdAt: Date.now(),
});

export const createAlarmCoreState = (): AlarmCoreState => {
  const currentInput = { ...ALARM_CORE_DEFAULTS.input };

  return {
    selectedField: "hours",
    currentInput,
    draft: createAlarmDraft(currentInput),
  };
};
