# 🔔 알람 기능 컴포넌트 분리 완료

## 📋 분리 개요

App.tsx에 있던 모든 알람 관련 기능을 독립적인 컴포넌트와 훅으로 분리하여 관심사 분리와 재사용성을 향상시켰습니다.

## 🏗️ 새로운 아키텍처

### 1. **AlarmService 컴포넌트** 
`components/AlarmService.tsx`
- **역할**: 알람 기능의 통합 서비스 제공자
- **특징**: 
  - React.forwardRef를 사용하여 외부에서 메서드 접근 가능
  - 자동으로 권한 요청 및 알림 핸들러 설정
  - 알림 수신 시 콜백 실행
- **제공 메서드**:
  - `sendInstantNotification()`: 즉시 알림 발송
  - `cancelAllNotifications()`: 모든 알림 취소
  - `scheduleNotification()`: 기본 알람 예약
  - `scheduleAdvancedAlarm()`: 고급 반복 알람 예약

### 2. **useAlarmNotifications 훅**
`hooks/useAlarmNotifications.ts`
- **역할**: 알림 스케줄링과 관련된 모든 비즈니스 로직
- **주요 기능**:
  - ✅ 기본 알람 설정 (10회 3초 간격 반복)
  - ✅ **고급 알람 시스템** - Iterate 기능 완전 구현:
    - **Div 모드**: 남은 시간을 균등 분할하여 알람 설정
    - **Mul 모드**: 
      - `Operator === ""`: 매일 같은 시간 반복
      - `Operator === "+"`: 설정된 간격으로 반복
  - ✅ 알림 핸들러 설정
  - ✅ 권한 관리 통합

### 3. **useAlarmPermissions 훅**
`hooks/useAlarmPermissions.ts`
- **역할**: 알림 권한 관리 및 이벤트 리스너 설정
- **기능**:
  - 알림 권한 요청
  - 알림 수신 리스너 설정/해제
  - 에러 처리

## ⚡ **사용법**

### App.tsx에서의 사용:
```tsx
export default function App() {
  const alarmServiceRef = useRef<AlarmServiceRef>(null);
  
  // 기본 알람 설정
  alarmServiceRef.current?.scheduleNotification("1430"); // 14:30에 알람
  
  // 고급 알람 설정 (Iterate 기능)
  alarmServiceRef.current?.scheduleAdvancedAlarm(
    { hours: 14, minutes: 30 },    // 알람 시간
    { hours: 2, minutes: 0 },      // 남은 시간 (2시간)
    { Mul: 3, Div: 4 },           // 3일 반복, 4등분
    "+"                           // 연산자
  );
  
  return (
    <AlarmService ref={alarmServiceRef} onAlarmTriggered={setAlarmTriggered}>
      {/* 앱 컨텐츠 */}
    </AlarmService>
  );
}
```

## 🎯 **고급 알람 시스템 작동 원리**

### **1단계: Div 분할 알람**
```
조건: timeDifferenceValue = 2시간, Iterate.Div = 4
결과: 2시간을 4등분하여 30분 간격으로 4번 알람
⏰ 0분 → ⏰ 30분 → ⏰ 60분 → ⏰ 90분
```

### **2단계: Mul 반복 알람**

#### A) Operator === "" (일일 반복)
```
조건: textTime = 오전 7시, Iterate.Mul = 3
결과: 3일간 매일 오전 7시에 알람
📅 오늘 7:00 → 📅 내일 7:00 → 📅 모레 7:00
```

#### B) Operator === "+" (간격 반복)
```
조건: textTime = 30분, Iterate.Mul = 3
결과: 30분 간격으로 3번 알람
⏰ 지금 → ⏰ +30분 → ⏰ +60분
```

## 📊 **개선 효과**

### ✅ **관심사 분리**
- App.tsx에서 알람 로직 완전 제거
- 각 훅이 단일 책임을 가짐
- 비즈니스 로직과 UI 로직 분리

### ✅ **재사용성 향상**
- AlarmService는 다른 컴포넌트에서도 사용 가능
- 훅들을 독립적으로 사용 가능
- 모듈화된 구조로 테스트 용이

### ✅ **타입 안전성**
- 모든 함수와 인터페이스에 완전한 타입 정의
- AlarmServiceRef 인터페이스로 ref 메서드 타입 보장
- Promise 기반 비동기 작업 타입 안전성

### ✅ **코드 가독성**
- App.tsx: 알람 관련 코드 100줄+ 제거
- 알람 기능이 명확하게 캡슐화됨
- 메서드명이 직관적이고 명확함

### ✅ **확장성**
- 새로운 알람 타입 쉽게 추가 가능
- 알림 스타일 커스터마이징 용이
- 플러그인 형태로 다른 프로젝트에 적용 가능

## 🔧 **기술적 특징**

- **React.forwardRef**: 부모에서 자식 메서드 직접 호출
- **useCallback**: 함수 메모이제이션으로 성능 최적화
- **TypeScript**: 완전한 타입 안전성 보장
- **에러 처리**: try-catch 블록으로 견고한 에러 처리
- **메모리 관리**: useEffect cleanup으로 리스너 정리

## 📁 **최종 파일 구조**

```
h:\venv\Calcularm\
├── components/
│   ├── AlarmService.tsx      # 알람 통합 서비스 컴포넌트
│   └── ...other components
├── hooks/
│   ├── useAlarmNotifications.ts  # 알림 스케줄링 훅
│   ├── useAlarmPermissions.ts    # 권한 관리 훅
│   └── ...other hooks
├── types/
│   ├── notification.ts       # 알림 관련 타입
│   └── ...other types
└── App.tsx                   # 깔끔해진 메인 컴포넌트
```

## 🎉 **완료된 TODO 항목**

- ✅ **알람 분할 기능**: Div를 이용한 시간 균등 분할
- ✅ **알람 반복 기능**: Mul을 이용한 다양한 반복 패턴
- ✅ **Operator별 반복 로직**: "", "+" 연산자에 따른 차별화된 반복
- ✅ **타입 안전성**: 모든 알람 관련 코드에 완전한 타입 적용
- ✅ **컴포넌트 분리**: 관심사 분리와 재사용성 확보

이제 알람 기능이 완전히 모듈화되어 유지보수와 확장이 매우 쉬워졌습니다! 🚀
