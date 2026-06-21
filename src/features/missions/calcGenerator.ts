// Générateur de problèmes pour la mission "Calcul mental".

export interface CalcProblem {
  a: number;
  b: number;
  op: '+' | '-' | '×';
  answer: number;
  prompt: string;
}

export function generateCalcProblem(digits: 1 | 2 | 3): CalcProblem {
  const max = digits === 1 ? 9 : digits === 2 ? 40 : 99;
  const ops: CalcProblem['op'][] = digits >= 2 ? ['+', '-', '×'] : ['+', '-'];
  const op = ops[Math.floor(Math.random() * ops.length)]!;

  let a = rand(2, max);
  let b = rand(2, op === '×' ? Math.min(12, max) : max);
  if (op === '-' && b > a) [a, b] = [b, a];

  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  return { a, b, op, answer, prompt: `${a} ${op} ${b}` };
}

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
