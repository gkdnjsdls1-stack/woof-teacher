/**
 * 그림 색상 한 곳 모음 (파스텔 톤, 오픈카만 선명한 빨강).
 * 나중에 실제 그림으로 교체할 때도 UI 색은 여기서 맞출 수 있습니다.
 */
export const PALETTE = {
  // 닥스훈트
  dxBody: '#C9854A',
  dxDark: '#A86734',
  dxSnout: '#DFA873',
  dxEar: '#8E5526',
  dxLine: '#7A4A20', // 바깥 윤곽선
  dxShade: '#B5743C', // 뒤쪽 다리·배 그늘
  // 푸들
  pdBody: '#F7E7D1',
  pdDark: '#E4CEAE',
  pdSnout: '#FDF6EB',
  pdLine: '#C2A77F', // 바깥 윤곽선 (너무 진하면 흰 털이 탁해집니다)
  pdShade: '#EADCC4', // 뒤쪽 다리·배 그늘
  // 공통
  shadow: '#C9A98C', // 바닥 그림자
  shine: '#FFFFFF', // 눈 반짝임
  // 공통 얼굴
  nose: '#3C2B22',
  eye: '#3C2B22',
  tongue: '#F28BA0',
  cheek: '#F9B8C4',
  // 소품
  // 밥그릇과 물그릇은 비었을 때도 서로 구분돼야 해서 색을 따로 둡니다.
  bowl: '#F2C79A', // 밥그릇 (따뜻한 색)
  bowlDark: '#CB9A64',
  bowlWater: '#C8E8F7', // 물그릇 (찬 색)
  bowlWaterDark: '#6AA8CC',
  food: '#9A6B3E',
  water: '#7FD4F5',
  soap: '#E8F6FF',
  towel: '#FFD79B',
  // 출근·수업 (2단계)
  car: '#E8453C',
  carDark: '#C2342C',
  carSeat: '#F6D9A8',
  leash: '#7FB7E8',
  muzzle: '#C9BBA8',
  board: '#8FB89A',
  desk: '#E3C79C',
  // 배경
  room: '#FFF4E3',
  night: '#2B2D52',
  grass: '#CFEBC0',
  wood: '#C89A6B',
  woodDark: '#A97C50',
  box: '#D9B98C',
  roof: '#F4A6A6',
  star: '#FFE27A',
} as const;
