const QUESTIONS = [
  { n: 1, picked: 1 },
  { n: 2, picked: 3 },
  { n: 3, picked: 0 },
  { n: 4, picked: 2, marked: true },
  { n: 5, picked: 1 },
  { n: 6, picked: 0 },
];
const OPTIONS = ["A", "B", "C", "D"];

/** A decorative OMR answer sheet: the thing this console exists to score. */
export function AnswerSheet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 340 360" role="img" aria-label="An answer sheet with bubbles filled in" className={className}>
      <rect x="6" y="6" width="328" height="348" rx="14" fill="#f7f8fb" />
      <rect x="6" y="6" width="328" height="348" rx="14" fill="none" stroke="#c8d2e4" />

      <text x="28" y="44" fontSize="17" fontWeight="600" fill="#14213d" fontFamily="var(--font-display)">
        Answer sheet
      </text>
      <line x1="28" y1="66" x2="150" y2="66" stroke="#9aa8c0" strokeWidth="1" />
      <line x1="170" y1="66" x2="312" y2="66" stroke="#9aa8c0" strokeWidth="1" />
      <text x="28" y="80" fontSize="10" fill="#67758c">Candidate</text>
      <text x="170" y="80" fontSize="10" fill="#67758c">Date</text>

      {QUESTIONS.map((q, row) => {
        const y = 118 + row * 36;
        return (
          <g key={q.n}>
            <text x="28" y={y + 4} fontSize="12" fontWeight="600" fill="#46556f">
              {q.n}
            </text>
            {OPTIONS.map((letter, col) => {
              const x = 82 + col * 62;
              const filled = q.picked === col;
              const fill = filled ? (q.marked ? "#ffd84d" : "#14213d") : "none";
              return (
                <g key={letter}>
                  <circle cx={x} cy={y} r="11" fill={fill} stroke={filled && !q.marked ? "#14213d" : "#46556f"} strokeWidth="1.4" />
                  <text
                    x={x}
                    y={y + 3.6}
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    fill={filled ? (q.marked ? "#14213d" : "#f7f8fb") : "#46556f"}
                  >
                    {letter}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
      <line x1="28" y1="326" x2="312" y2="326" stroke="#d6dce6" />
    </svg>
  );
}
