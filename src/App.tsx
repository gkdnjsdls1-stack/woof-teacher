import { useEffect, useState, type ReactNode } from 'react';

import { TIMING } from './constants';
import { getDebugDate } from './lib/date';
import { useGame } from './state/GameContext';
import { isNamed } from './state/gameReducer';
import { isDayFinished } from './state/selectors';
import { DressScreen } from './screens/DressScreen';
import { HomeScreen, type HomeTarget } from './screens/HomeScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { NamingScreen } from './screens/NamingScreen';
import { NightScreen } from './screens/NightScreen';
import { SleepScreen } from './screens/SleepScreen';
import { WashScreen } from './screens/WashScreen';

type Screen = 'home' | HomeTarget;

export function App() {
  const { state } = useGame();
  const save = state.save;

  const [booting, setBooting] = useState(true);
  const [screen, setScreen] = useState<Screen>('home');
  // 이름 짓기 인사 화면을 끝까지 보여주기 위한 플래그
  const [namingAcked, setNamingAcked] = useState(() => isNamed(state.save));
  // 이번에 막 하루를 끝냈는지 (내일 예고 카드를 보여줄지)
  const [justFinished, setJustFinished] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), TIMING.loading);
    return () => window.clearTimeout(timer);
  }, []);

  // 새 하루가 되면 무조건 홈으로 돌아갑니다.
  useEffect(() => {
    setScreen('home');
    setJustFinished(false);
  }, [save.today.date]);

  const debugDate = getDebugDate();

  let content: ReactNode;
  if (booting) {
    content = <LoadingScreen />;
  } else if (!namingAcked) {
    content = <NamingScreen onDone={() => setNamingAcked(true)} />;
  } else if (isDayFinished(save)) {
    // 하루가 끝났으면 자는 강아지 화면만 보입니다 (메뉴·보상 모두 잠김).
    content = <NightScreen justFinished={justFinished} />;
  } else if (screen === 'dress') {
    content = <DressScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'wash') {
    content = <WashScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'sleep') {
    content = (
      <SleepScreen onFinished={() => setJustFinished(true)} onBack={() => setScreen('home')} />
    );
  } else {
    content = <HomeScreen onNavigate={(target) => setScreen(target)} />;
  }

  return (
    <div className="app">
      {content}

      {/* 세로 전용: 가로로 돌리면 안내를 띄웁니다 */}
      <div className="rotate-notice" aria-hidden="true">
        <span>폰을 세워주세요 📱</span>
      </div>

      {/* 개발 모드에서 ?debugDate 를 쓸 때만 보이는 표시 */}
      {debugDate && <div className="debug-chip">🛠 {debugDate}</div>}
    </div>
  );
}
