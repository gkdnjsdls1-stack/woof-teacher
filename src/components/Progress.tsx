/** 진행 막대. 목욕·산책·미용실이 같은 모양을 씁니다. */
export function Progress({ value, target }: { value: number; target: number }) {
  const percent = Math.min(100, (value / target) * 100);
  return (
    <div
      className="progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={target}
      aria-valuenow={value}
    >
      <div className="progress__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
