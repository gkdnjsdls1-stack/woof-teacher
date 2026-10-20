/** 강아지 말풍선 — "월월" 계열 소리와 이모지만 들어갑니다. */
export function SpeechBubble({ text }: { text: string }) {
  return (
    <div className="speech-bubble" role="status">
      {text}
    </div>
  );
}
