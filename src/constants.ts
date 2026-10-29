/**
 * ★ 모든 수치는 이 파일 한 곳에 모읍니다 (호감도 / 코인 / 가격 / 확률 / 연출 시간).
 * 밸런스를 바꾸고 싶으면 여기만 고치면 됩니다.
 */

import type { DogId, OutfitDef, RewardAction } from './types';

/* ──────────────────────────── 저장 ──────────────────────────── */

export const SAVE_KEY = 'dogapp:save:v1';
export const SAVE_VERSION = 1 as const;
/** 보호자 설정의 플레이 시간 기록 보관 일수 (4단계) */
export const PLAYTIME_LOG_DAYS = 14;

/* ──────────────────────── 공개 단계 ────────────────────────
 * 지금 아이에게 열려 있는 단계. 아직 만들지 않은 기능은
 * 체크판 자물쇠·가격표·코인 표시를 이 값으로 함께 숨깁니다.
 * (없는 기능을 예고하지 않는다 — SPEC 1번)
 */
export const CURRENT_STAGE: 1 | 2 | 3 | 4 = 4;
/** 코인을 벌 수 있는 단계(수업)가 열렸는지 */
export const COINS_ENABLED = CURRENT_STAGE >= 2;
/** 코인을 **쓸 수 있는** 곳(옷가게·집 업그레이드)이 열렸는지.
 *  코인은 2단계부터 모이지만 쓸 곳은 3단계에 생깁니다 — 가격표를 미리 보여주면
 *  "사면 되겠네" 하고 기대하게 되므로, 그때까지는 가격을 숨깁니다. */
export const SHOP_ENABLED = CURRENT_STAGE >= 3;
/** 강아지집을 홈 화면에 그릴지. 집 업그레이드를 살 수 있을 때부터 보여줍니다 —
 *  그 전에는 손댈 수 없는 장식일 뿐이고, 강아지 그림과 자리를 다퉈 겹칩니다. */
export const HOUSE_ENABLED = CURRENT_STAGE >= 3;

/* ───────────────────── 보호자 설정 (4단계) ─────────────────────
 * 숨겨진 화면입니다. 아이가 실수로 들어가지 않도록 톱니바퀴를 **길게** 누른 뒤
 * 덧셈 문제를 풀어야 열립니다 (SPEC 9번). 제한 기능은 넣지 않습니다.
 */
export const GUARDIAN_LONG_PRESS_MS = 3000;
/** 관문 덧셈 문제의 두 수 범위 (초2가 암산으로 풀기 어려운 두 자리) */
export const GUARDIAN_GATE_MIN = 11;
export const GUARDIAN_GATE_MAX = 49;

/* ─────────────────────── 호감도 (하트) ─────────────────────── */

export const HEARTS_MIN = 0;
export const HEARTS_MAX = 100;
/** 시작값 */
export const HEARTS_START = 30;

/** 행동별 상승량. 모든 행동은 하루 1회만 보상됩니다. */
export const HEART_GAIN: Record<RewardAction | 'pet', number> = {
  feed: 5, // 사료
  water: 3, // 물
  dress: 3, // 옷 입히기 (갈아입기는 자유, 보상은 첫 1회)
  commute: 3, // 출근 (오픈카) — 2단계
  lesson: 0, // 수업은 코인으로 보상 — 2단계
  walk: 5, // 산책 — 3단계
  wash: 5, // 씻기기
  sleep: 2, // 재우기
  groom: 10, // 미용실 — 3단계
  hospital: 5, // 병원 치료 — 4단계
  pet: 0, // 쓰다듬기: 반응만, 보상 없음 (무제한 허용)
};

/** 안 들어온 날 하루당 하락량 */
export const HEARTS_DECAY_PER_MISSED_DAY = 2;
/** 하락은 이 값 아래로 내려가지 않습니다 */
export const HEARTS_DECAY_FLOOR = 20;
/** 이 일수 이상 비었으면 "보고 싶었어" 반김 연출 */
export const WELCOME_BACK_MISSED_DAYS = 1;

/** 호감도 단계 이벤트 (50: 꼬리 흔들기 / 80: 뽀뽀+선물 / 100: 왕관) */
export const MILESTONE_TAIL_WAG = 50;
export const MILESTONE_KISS = 80;
export const MILESTONE_CROWN = 100;
export const MILESTONES = [MILESTONE_TAIL_WAG, MILESTONE_KISS, MILESTONE_CROWN];

/** 단계 축하 연출 문구 (강아지는 말하지 않습니다 — 설명은 사람 말, 말풍선은 월월) */
export const MILESTONE_TEXT: Record<number, { title: string; note: string }> = {
  [MILESTONE_TAIL_WAG]: { title: '{name}가 꼬리를 흔들어요!', note: '이제 많이 친해졌어요 🐾' },
  [MILESTONE_KISS]: { title: '{name}가 뽀뽀해줬어요!', note: '선물로 특별한 옷을 받았어요 🎁' },
  [MILESTONE_CROWN]: { title: '{name}가 왕관을 썼어요!', note: '최고로 친한 사이가 됐어요 👑' },
};

/* ──────────────────── 코인 (🦴 뼈다귀 코인) ──────────────────── */

export const COINS_START = 0;
/** 평일 수업: 문제당 첫 정답에만 지급 */
export const COIN_PER_LESSON_QUESTION = 10;
export const LESSON_QUESTIONS_PER_DAY = 3;
/** 하루 최대 코인 (평일) = 10 × 3 */
export const COINS_MAX_PER_WEEKDAY = COIN_PER_LESSON_QUESTION * LESSON_QUESTIONS_PER_DAY;
/** 주말 소풍 */
export const COINS_WEEKEND_PICNIC = 15;

/* ─────────────────────── 집 업그레이드 ─────────────────────── */

export const HOUSE_LEVEL_NAMES = ['박스집', '나무집', '2층 집', '성'] as const;
/** 집 1채당 각 단계로 올리는 비용 (0단계는 시작) */
export const HOUSE_UPGRADE_COSTS = [0, 60, 120, 200] as const;
/** 마지막 단계 (성) */
export const HOUSE_MAX_LEVEL = 3;

/* ───────────────────── 아픔 / 병원 (4단계) ───────────────────── */

/** 시작 후 이 일수 동안은 아프지 않습니다 */
export const SICK_GRACE_DAYS = 3;
/** 하루 시작 시 강아지마다 아플 확률 */
export const SICK_DAILY_CHANCE = 0.1;
/** 같은 강아지는 이 일수에 최대 1번만 아픕니다 */
export const SICK_COOLDOWN_DAYS = 7;

/** 치료 순서. 주사·피·수술은 넣지 않습니다 (SPEC 6-8). */
export const HOSPITAL_STEPS = [
  { key: 'check', emoji: '🩺', title: '어디가 아픈지 볼까요?', hint: '청진기를 콕 눌러요' },
  { key: 'medicine', emoji: '🍬', title: '약 젤리를 먹여요', hint: '젤리를 콕 눌러요' },
  { key: 'bandage', emoji: '🩹', title: '반창고를 붙여요', hint: '반창고를 콕 눌러요' },
] as const;

/* ───────────────────────── 연출 시간 ───────────────────────── */

export const TIMING = {
  /** 로딩(발자국) 화면 */
  loading: 900,
  /** 밥·물 먹는 애니메이션 */
  eating: 2200,
  /** 쓰다듬기 말풍선 유지 시간 */
  speechBubble: 1600,
  /** 불 끄기 → 밤 화면 전환 */
  lightsOut: 2600,
  /** 반짝 효과 */
  sparkle: 1400,
  /** 새 하루 확인 간격 (자정을 넘겨 켜둔 경우 대비) */
  dayCheckInterval: 30_000,
  /** 오픈카 드라이브 (SPEC 12번 2단계: 10~15초) */
  drive: 12_000,
  /** 정답 박수 연출 */
  clap: 1200,
  /** 오답 "다시 해볼까?" 안내 */
  retry: 1100,
  /** 미용실 커튼이 열리는 시간 */
  groomCurtain: 1200,
};

/* ───────────────────────── 씻기기 ───────────────────────── */

/** 거품 문지르기 목표 (드래그 이동 횟수) */
export const WASH_SCRUB_TARGET = 14;
/** 헹구기 목표 (샤워기 탭 횟수) */
export const WASH_RINSE_TARGET = 3;
/** 수건으로 닦기 목표 (드래그 이동 횟수) */
export const WASH_TOWEL_TARGET = 10;

/* ───────────────────────── 산책 (3단계) ─────────────────────────
 * 공원 배경이 흐르다가 꽃·나비·공 앞에서 멈추고, 탭하면 다시 걷습니다.
 * 탭거리는 주말 소풍과 같은 것을 씁니다 (`PICNIC_TAPS`).
 * 아이가 기다리는 시간은 한 구간당 이 값뿐이고, 전체 길이는 아이 손에 달려 있습니다.
 */
export const WALK_SEGMENT_MS = 7_000;

/* ───────────────────────── 미용실 (3단계) ─────────────────────────
 * 하루 1번, 학교에 다녀온 뒤 열립니다. 무료이고 체크판 밖의 보너스입니다.
 */
/** 가위로 다듬기 (탭 횟수) */
export const GROOM_SNIP_TARGET = 8;
/** 드라이어 (탭 횟수) */
export const GROOM_DRY_TARGET = 5;

/* ───────────────────────── 이름 짓기 ───────────────────────── */

export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 6;
/** 추천 이름 버튼 4개 */
export const SUGGESTED_NAMES: Record<DogId, string[]> = {
  dachshund: ['초코', '몽이', '구름이', '별이'],
  poodle: ['하양이', '방울이', '솜이', '코코'],
};

/* ───────────────────────── 강아지 설정 ───────────────────────── */

export const DOG_ORDER: DogId[] = ['dachshund', 'poodle'];

export const DOG_PROFILE: Record<
  DogId,
  { breedLabel: string; gender: '남자' | '여자'; styleLabel: string; emoji: string }
> = {
  dachshund: { breedLabel: '닥스훈트', gender: '남자', styleLabel: '멋진 옷', emoji: '🐕' },
  poodle: { breedLabel: '푸들', gender: '여자', styleLabel: '예쁜 옷', emoji: '🐩' },
};

/** 강아지는 말하지 않습니다. "월월" 계열 소리 + 이모지만 사용합니다. */
export const BARKS = {
  happy: ['월월!', '월!', '월월 💕', '월! 🐾'],
  hungry: ['월월 🍖', '월… 🍖', '끼잉 🍖'],
  refuse: ['월월 🙅', '월! 🙅'],
  sleepy: ['음냐… 월', '월… 💤'],
  sleeping: ['음냐… 월', '쿨쿨 💤'],
  sick: ['끼잉… 💧'],
  welcome: ['월월월! 💕', '월월! 🐾💕'],
  wash: ['월월 🫧', '월! 🫧'],
  celebrate: ['월월월!'],
} as const;

/* ───────────────────────── 옷 목록 ─────────────────────────
 * 강아지마다 **머리 2 · 몸 2 · 얼굴 1** 로 맞춥니다. 슬롯 하나가 비면
 * 옷 화면에 영영 못 채우는 칸이 생깁니다.
 * 왕관은 넣지 않습니다 — 호감도 100 왕관과 머리에서 겹칩니다.
 * 가격은 양쪽 다 20 / 20 / 30 / 40 (한 마리당 110코인, 하루 최대 30).
 * source: start = 시작할 때 무료 / shop = 옷가게에서 코인으로 구매(3단계)
 *          gift  = 호감도 80 선물 (코인으로 살 수 없음)
 */
export const OUTFITS: OutfitDef[] = [
  // 닥스훈트 — 멋진 옷 (머리 2 · 몸 2 · 얼굴 1)
  { id: 'dx_bowtie', label: '나비넥타이', dog: 'dachshund', slot: 'body', source: 'start', price: 0 },
  { id: 'dx_sunglasses', label: '선글라스', dog: 'dachshund', slot: 'face', source: 'shop', price: 20 },
  { id: 'dx_cap', label: '야구 모자', dog: 'dachshund', slot: 'head', source: 'shop', price: 20 },
  { id: 'dx_police', label: '경찰 모자', dog: 'dachshund', slot: 'head', source: 'shop', price: 30 },
  { id: 'dx_jacket', label: '라이더 재킷', dog: 'dachshund', slot: 'body', source: 'shop', price: 40 },
  { id: 'dx_hero_cape', label: '영웅 망토', dog: 'dachshund', slot: 'body', source: 'gift', price: 0 },
  // 푸들 — 예쁜 옷 (머리 2 · 몸 2 · 얼굴 1)
  { id: 'pd_ribbon', label: '리본', dog: 'poodle', slot: 'head', source: 'start', price: 0 },
  { id: 'pd_heartglasses', label: '하트 안경', dog: 'poodle', slot: 'face', source: 'shop', price: 20 },
  { id: 'pd_flowerpin', label: '꽃 머리핀', dog: 'poodle', slot: 'head', source: 'shop', price: 20 },
  { id: 'pd_dress', label: '원피스', dog: 'poodle', slot: 'body', source: 'shop', price: 30 },
  { id: 'pd_cape', label: '반짝 망토', dog: 'poodle', slot: 'body', source: 'shop', price: 40 },
  { id: 'pd_fairy_wings', label: '요정 날개', dog: 'poodle', slot: 'body', source: 'gift', price: 0 },
];

/** 시작할 때 각 강아지에게 무료로 주는 옷 */
export const FREE_OUTFITS: Record<DogId, string> = {
  dachshund: 'dx_bowtie',
  poodle: 'pd_ribbon',
};

/** 호감도 80을 넘으면 선물로 받는 특별 옷 (SPEC 6-1 단계 이벤트) */
export const GIFT_OUTFITS: Record<DogId, string> = {
  dachshund: 'dx_hero_cape',
  poodle: 'pd_fairy_wings',
};

export const SLOT_LABEL: Record<'head' | 'body' | 'face', string> = {
  head: '머리',
  body: '몸',
  face: '얼굴',
};

/* ───────────────────── 오늘의 체크판 (8칸) ─────────────────────
 * 3단계까지 밥·물·옷·출근·수업·산책·씻기·재우기가 모두 열려 있습니다.
 * 미용실은 체크판 밖의 보너스라 칸이 없습니다 (SPEC 5-1 ⑥).
 */
export const CHECKBOARD: {
  key: RewardAction;
  label: string;
  emoji: string;
  stage: 1 | 2 | 3;
}[] = [
  { key: 'feed', label: '밥', emoji: '🍖', stage: 1 },
  { key: 'water', label: '물', emoji: '💧', stage: 1 },
  { key: 'dress', label: '옷', emoji: '👕', stage: 1 },
  { key: 'commute', label: '출근', emoji: '🚗', stage: 1 },
  { key: 'lesson', label: '수업', emoji: '🏫', stage: 1 },
  { key: 'walk', label: '산책', emoji: '🌳', stage: 3 },
  { key: 'wash', label: '씻기', emoji: '🛁', stage: 1 },
  { key: 'sleep', label: '재우기', emoji: '🌙', stage: 1 },
];

/** 하루에 실제로 진행하는 순서 (진행 잠금과 "다음에 할 일"의 기준) */
export const DAY_FLOW: RewardAction[] = [
  'feed',
  'water',
  'dress',
  'commute',
  'lesson',
  'walk',
  'wash',
  'sleep',
];

/** "다음에 할 일" 버튼 문구 (짧게, 이모지 먼저) */
export const ACTION_LABEL: Partial<Record<RewardAction, string>> = {
  feed: '🍖 밥 주기',
  water: '💧 물 주기',
  dress: '👕 옷 입히기',
  commute: '🚗 출근 준비',
  lesson: '🏫 수업하기',
  walk: '🌳 산책 가기',
  groom: '✂️ 미용실 가기',
  hospital: '🏥 병원 가기',
  wash: '🛁 씻기기',
  sleep: '🌙 재우기',
};

/** 주말에는 수업 대신 소풍입니다 (`today.lesson.type === 'picnic'`) */
export const PICNIC_ACTION_LABEL = '🧺 소풍 가기';

/* ───────────────────── 출근 준비 (2단계) ─────────────────────
 * 강아지마다 목줄과 입마개를 모두 채워야 출발 버튼이 켜집니다 (SPEC 6-9).
 */

export const COMMUTE_GEAR = [
  { key: 'leash', label: '목줄' },
  { key: 'muzzle', label: '입마개' },
] as const;

export type GearKey = (typeof COMMUTE_GEAR)[number]['key'];

/* ───────────────────── 주말 소풍 (2단계) ─────────────────────
 * 공원에서 탭하는 것들. 고정 개수이고 **보상은 없습니다** (반응만).
 */

export const PICNIC_TAPS = [
  { emoji: '🌸', bark: '월월 🌸' },
  { emoji: '🦋', bark: '월! 🦋' },
  { emoji: '⚽', bark: '월월! ⚽' },
] as const;

/* ───────────────────── 수업 종류 (2단계) ─────────────────────
 * 요일별로 종류가 바뀝니다. 0=일요일 … 6=토요일
 */
export const LESSON_BY_WEEKDAY: string[] = [
  'picnic', // 일 — 소풍
  'counting', // 월 — 숫자 세기
  'words', // 화 — 한글 낱말
  'memory', // 수 — 짝 맞추기
  'math', // 목 — 덧셈·뺄셈
  'clock', // 금 — 시계 보기
  'picnic', // 토 — 소풍
];

export const LESSON_LABEL: Record<string, string> = {
  counting: '숫자 세기',
  words: '한글 낱말',
  memory: '짝 맞추기',
  math: '덧셈·뺄셈',
  clock: '시계 보기',
  picnic: '오픈카 소풍',
};

export const WEEKDAY_LABEL = ['일', '월', '화', '수', '목', '금', '토'];

/* ───────────────── 수업 문제 생성 수치 (2단계) ─────────────────
 * 1학년 수준. 문제는 날짜를 시드로 만들어 하루 안에서는 고정됩니다.
 * 실제 생성 로직은 src/lib/lessons.ts 에 있습니다.
 */

/** 보기 버튼 개수 (정답 1개 + 오답 2개) */
export const CHOICES_PER_QUESTION = 3;

/** 교실 뒤편에 앉아 있는 1학년 학생 수 (SPEC 7번: 4~6명, 고정) */
export const STUDENT_COUNT = 5;

/** 숫자 세기: 그림 개수 범위 */
export const COUNTING_MIN = 1;
export const COUNTING_MAX = 10;
/** 숫자 세기에 쓰는 그림 */
export const COUNTING_EMOJIS = ['🦴', '🐾', '⭐', '🍎', '🎈', '🌸'];

/** 덧셈·뺄셈: 한 자리 수, 결과 0~10 */
export const MATH_OPERAND_MIN = 1;
export const MATH_OPERAND_MAX = 9;
export const MATH_RESULT_MIN = 0;
export const MATH_RESULT_MAX = 10;

/** 시계 보기: 정각만 */
export const CLOCK_HOUR_MIN = 1;
export const CLOCK_HOUR_MAX = 12;

/** 짝 맞추기: 3쌍(카드 6장)을 맞추면 3문제 완료 */
export const MEMORY_PAIRS = 3;

/* ───────────────────── 내일 예고 문구 (1단계) ─────────────────────
 * 아직 만들지 않은 기능은 예고하지 않습니다. {name} 은 강아지 이름으로 바뀝니다.
 */
export const TOMORROW_PREVIEWS: string[] = [
  '내일 아침엔 {name}가 밥을 기다려요 🍖',
  '내일도 물그릇을 깨끗이 채워줄까요? 💧',
  '내일은 어떤 옷을 입혀줄까요? 👕',
  '내일도 {name}를 반짝반짝 씻겨줘요 🛁',
  '내일은 {name}와 산책을 가요 🌳',
  '내일 옷가게에는 어떤 새 옷이 올까요? 🛍',
];

/** 내일이 평일일 때만 쓰는 예고 (주말에는 출근도 수업도 없습니다) */
export const TOMORROW_WEEKDAY_PREVIEWS: string[] = [
  '내일은 오픈카를 타고 학교에 가요 🚗',
  '내일 수업은 어떤 게임일까요? 🏫',
];

/** 내일이 주말일 때만 쓰는 예고 */
export const TOMORROW_WEEKEND_PREVIEWS: string[] = ['내일은 오픈카 타고 소풍 가요 🧺'];
