import type { ReactNode } from 'react';

/** 초2 눈높이 큰 버튼 (최소 높이 56px 이상). 한 화면에는 행동 하나만. */
export function BigButton({
  children,
  onClick,
  variant = 'primary',
  glow = false,
  disabled = false,
  ariaLabel,
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'soft' | 'ghost';
  glow?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      className={[
        'big-button',
        `big-button--${variant}`,
        glow ? 'big-button--glow' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
