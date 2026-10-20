import { PawPrint } from '../assets';

/** S0 — 로딩: 발자국 애니메이션 */
export function LoadingScreen() {
  return (
    <div className="screen screen--center loading">
      <h1 className="loading__title">월월 선생님 🐶</h1>
      <div className="loading__paws">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="loading__paw" style={{ animationDelay: `${i * 160}ms` }}>
            <PawPrint size={38} />
          </span>
        ))}
      </div>
    </div>
  );
}
