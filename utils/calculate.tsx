// 현재 시간을 문자열로 반환
export const getCurrentTimeAsString = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return {
    string: `${formattedHours}${formattedMinutes}`, // '0000' 형태
    format: `${formattedHours}:${formattedMinutes}`, // '00:00' 형태
    hour: hours,
    minute: minutes,
  };
};

// 시간 문자열을 객체로 변환
export const handleFixTimeValue = (timeString: string) => {
  timeString = `${'0'.repeat(4 - timeString.length)}${timeString}`;

  const hours = parseInt(timeString.slice(0, 2), 10);
  const minutes = parseInt(timeString.slice(2), 10);

  return { hours, minutes };
};

// 현재 시간과 목표 시간의 차이를 계산
export const calculateTimeDifference = (
  currentTime: Date,
  textTime: { hours: number; minutes: number }
) => {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const targetMinutes = textTime.hours * 60 + textTime.minutes;

  let difference = targetMinutes - currentMinutes;

  if (difference < 0) {
    difference += 24 * 60; // 하루(1440분)를 더함
  }

  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  return `${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`;
};

// 현재 시간에 특정 시간을 더함
export const addTime = (
  currentTime: Date,
  textTime: { hours: number; minutes: number }
) => {
  let totalMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes() +
    textTime.hours * 60 +
    textTime.minutes;

  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return { hours, minutes };
};

// 현재 시간에서 특정 시간을 뺌
export const subtractTime = (
  currentTime: Date,
  textTime: { hours: number; minutes: number }
) => {
  let totalMinutes =
    currentTime.getHours() * 60 +
    currentTime.getMinutes() -
    (textTime.hours * 60 + textTime.minutes);

  if (totalMinutes < 0) {
    totalMinutes += 24 * 60; // 음수일 경우 하루를 더함
  }

  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;

  return { hours, minutes };
};

export const fixTextTime = (text: string) => {
  if (text.length === 3) {
    text = `0${text}`; // 3자리일 경우 가장 앞에 '0' 추가
  } else if (text.length === 2) {
    text = `${text}00`; // 2자리일 경우 앞에 '00' 추가
  }
  else if (text.length === 1) {
    text = `0${text}00`; // 1자리일 경우 앞에 '000' 추가
  }

  if (text.length !== 4 || isNaN(Number(text))) {
    return text; // 유효하지 않은 값은 그대로 반환
  }

  // 1. 시간과 분 분리
  let hours = parseInt(text.slice(0, 2), 10); // 앞 두 자리는 시간
  let minutes = parseInt(text.slice(2), 10); // 뒤 두 자리는 분

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
  // console.log(Number(calculateTimeDifference(new Date(), { hours, minutes }).slice(0, 2)) > 12 ? handleFlipAMPM(`${formattedHours}${formattedMinutes}`) : `${formattedHours}${formattedMinutes}`);
  return `${formattedHours}${formattedMinutes}`;
}

export const timeValueTotext = ({ hours, minutes }: { hours: number; minutes: number }) => {
  return `${hours < 10 ? `0${hours}` : hours}${minutes < 10 ? `0${minutes}` : minutes}`;
};