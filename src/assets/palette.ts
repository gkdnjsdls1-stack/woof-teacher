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
  // 푸들
  pdBody: '#F7E7D1',
  pdDark: '#E4CEAE',
  pdSnout: '#FDF6EB',
  // 공통 얼굴
  nose: '#3C2B22',
  eye: '#3C2B22',
  tongue: '#F28BA0',
  cheek: '#F9B8C4',
  // 소품
  bowl: '#8FC8E8',
  bowlDark: '#6AA8CC',
  food: '#9A6B3E',
  water: '#7FD4F5',
  soap: '#E8F6FF',
  towel: '#FFD79B',
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
