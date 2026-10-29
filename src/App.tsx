import { useEffect, useState, type ReactNode } from 'react';

import { CelebrationOverlay } from './components/CelebrationOverlay';
import { TIMING } from './constants';
import { getDebugDate } from './lib/date';
import { useGame } from './state/GameContext';
import { isNamed } from './state/gameReducer';
import { isDayFinished } from './state/selectors';
import { CommuteScreen } from './screens/CommuteScreen';
import { DressScreen } from './screens/DressScreen';
import { GroomScreen } from './screens/GroomScreen';
import { HomeScreen, type HomeTarget } from './screens/HomeScreen';
import { HospitalScreen } from './screens/HospitalScreen';
import { HouseScreen } from './screens/HouseScreen';
import { LessonScreen } from './screens/LessonScreen';
import { LoadingScreen } from './screens/LoadingScreen';
import { NamingScreen } from './screens/NamingScreen';
import { NightScreen } from './screens/NightScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ShopScreen } from './screens/ShopScreen';
import { SleepScreen } from './screens/SleepScreen';
import { WalkScreen } from './screens/WalkScreen';
import { WashScreen } from './screens/WashScreen';

/** 옷가게는 홈이 아니라 옷 입히기 화면에서 들어갑니다 (옷을 보다가 사러 가게). */
type Screen = 'home' | HomeTarget | 'shop';

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
  } else if (screen === 'settings') {
    // 보호자 설정은 하루가 끝난 뒤에도 열 수 있어야 합니다 (기록 확인·초기화).
    content = <SettingsScreen onBack={() => setScreen('home')} />;
  } else if (!namingAcked || !isNamed(save)) {
    // 초기화하면 이름이 비므로 이름 짓기로 돌아갑니다.
    content = <NamingScreen onDone={() => setNamingAcked(true)} />;
  } else if (isDayFinished(save)) {
    // 하루가 끝났으면 자는 강아지 화면만 보입니다 (메뉴·보상 모두 잠김).
    content = <NightScreen justFinished={justFinished} />;
  } else if (screen === 'dress') {
    content = <DressScreen onBack={() => setScreen('home')} onShop={() => setScreen('shop')} />;
  } else if (screen === 'shop') {
    content = <ShopScreen onBack={() => setScreen('dress')} />;
  } else if (screen === 'commute') {
    // 도착하면 곧바로 교실(또는 소풍)로 이어집니다 — 집에 다시 들렀다 가지 않게.
    content = (
      <CommuteScreen onBack={() => setScreen('home')} onArrive={() => setScreen('lesson')} />
    );
  } else if (screen === 'lesson') {
    content = <LessonScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'walk') {
    content = <WalkScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'groom') {
    content = <GroomScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'hospital') {
    content = <HospitalScreen onBack={() => setScreen('home')} />;
  } else if (screen === 'house') {
    content = <HouseScreen onBack={() => setScreen('home')} />;
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

      {/* 호감도 단계 축하 — 어느 화면에서 넘겨도 보이도록 가장 위에 그립니다 */}
      {!booting && namingAcked && <CelebrationOverlay />}

      {/* 세로 전용: 가로로 돌리면 안내를 띄웁니다 */}
      <div className="rotate-notice" aria-hidden="true">
        <span>폰을 세워주세요 📱</span>
      </div>

      {/* 개발 모드에서 ?debugDate 를 쓸 때만 보이는 표시 */}
      {debugDate && <div className="debug-chip">🛠 {debugDate}</div>}
    </div>
  );
}
