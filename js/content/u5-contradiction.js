import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'contradiction';
const r = String.raw;

const notes = [
  {
    heading: '矛盾 | Contradiction',
    body: [
      r`A statement of the form $C \land \sim C$ is a **contradiction**; it cannot be true.`,
      r`If assuming $\sim P$ leads to $C \land \sim C$, then $\sim P$ must be false, so $P$ is true.`,
      r`The contradiction can be any pair of statements that cannot both hold, for example "$a^2$ is even and $a^2$ is odd".`
    ]
  },
  {
    heading: '两种结构 | Two structures',
    body: [
      r`To prove a proposition $P$ by contradiction: suppose $\sim P$, then derive $C \land \sim C$.`,
      r`To prove a conditional $P \Rightarrow Q$ by contradiction: suppose $P \land \sim Q$, then derive $C \land \sim C$.`,
      r`The second structure uses $\sim(P \Rightarrow Q) \equiv P \land \sim Q$.`
    ]
  },
  {
    heading: '无理数 | Irrational numbers',
    body: [
      r`A real number $x$ is **rational** if $x=\frac{a}{b}$ for some $a,b \in \mathbb{Z}$ with $b \neq 0$.`,
      r`Otherwise $x$ is **irrational**.`,
      r`The classic template proves $\sqrt{p}$ irrational for a prime $p$ by assuming $\sqrt{p}=\frac{a}{b}$ in lowest terms and showing both $a$ and $b$ are divisible by $p$.`
    ]
  },
  {
    heading: '素数无限性 | Infinitely many primes',
    body: [
      r`To prove there are infinitely many primes, suppose there are only finitely many: $p_1,p_2,\dots,p_n$.`,
      r`Consider $a=p_1p_2\cdots p_n+1$. It has a prime factor $p_k$, but dividing $a$ by $p_k$ leaves remainder $1$, producing a contradiction.`
    ]
  },
  {
    heading: '奇偶矛盾 | Parity contradictions',
    body: [
      r`Many past-paper questions reduce to a parity contradiction: an even number is shown to equal an odd number, or a multiple of $4$ is shown to equal a number not divisible by $4$.`,
      r`Split on the parity of the main variable when the equation behaves differently for even and odd values.`
    ]
  },
  {
    heading: '组合技巧 | Combining techniques',
    body: [
      r`Contradiction is often combined with direct proof, cases, or a previously proved result.`,
      r`If a sub-claim is needed, such as "$p \mid a^2$ implies $p \mid a$ for prime $p$", prove it or cite it before using it.`
    ]
  }
];

const methods = [
  {
    name: 'Prove P by contradiction',
    when: 'The statement does not have an obvious direct proof, or assuming the negation gives a strong equation.',
    steps: [
      r`Write "Suppose, for contradiction, that $\sim P$."`,
      r`Unpack $\sim P$ carefully, including quantifiers if present.`,
      r`Use definitions and algebra to derive consequences.`,
      r`Show two consequences cannot both be true.`,
      r`Conclude that the assumption was false, so $P$ is true.`
    ],
    watch: r`Merely failing to find a contradiction is not a proof; the contradiction must be explicit.`
  },
  {
    name: 'Prove P implies Q by contradiction',
    when: 'The conditional is difficult to prove directly or by contrapositive.',
    steps: [
      r`Assume $P$ and $\sim Q$.`,
      r`Translate both assumptions into equations.`,
      r`Derive a statement and its negation.`,
      r`Conclude $P \Rightarrow Q$.`
    ],
    watch: r`$\sim(P \Rightarrow Q)$ is $P \land \sim Q$, not $\sim P \land Q$.`
  },
  {
    name: 'Prove a statement about divisibility by contradiction',
    when: r`The statement has the form $x \neq 0$, $a \nmid b$, or an equation that is impossible.`,
    steps: [
      r`Assume the opposite equation or divisibility.`,
      r`Write the divisibility as a product, for example $b=ac$.`,
      r`Use parity or divisibility by a fixed integer to force a contradiction.`,
      r`State clearly which two facts contradict each other.`
    ],
    watch: r`When you divide an equation by a number, keep track of whether the result is still an integer statement.`
  }
];

const examples = [
  {
    title: 'A parity contradiction',
    prompt: r`Prove: if $a,b \in \mathbb{Z}$, then $a^2-4b \neq 2$.`,
    steps: [
      r`Suppose the statement is false: there are integers $a,b$ with $a^2-4b=2$.`,
      r`Then $a^2=4b+2=2(2b+1)$, so $a^2$ is even. Hence $a$ is even, say $a=2c$.`,
      r`Substitute: $2(2b+1)=(2c)^2=4c^2$.`,
      r`Divide by $2$: $2b+1=2c^2$.`,
      r`The left side is odd and the right side is even, a contradiction.`,
      r`Therefore $a^2-4b \neq 2$.`
    ],
    answer: r`The assumption forces an odd number to equal an even number.`
  },
  {
    title: 'Square root of two is irrational',
    prompt: r`Prove that $\sqrt{2}$ is irrational.`,
    steps: [
      r`Suppose $\sqrt{2}$ is rational. Write $\sqrt{2}=\frac{a}{b}$ with $a,b \in \mathbb{Z}$ having no common factor other than $1$.`,
      r`Squaring gives $2b^2=a^2$, so $a^2$ is even and therefore $a$ is even.`,
      r`Write $a=2c$. Then $2b^2=4c^2$, so $b^2=2c^2$.`,
      r`Hence $b^2$ is even and therefore $b$ is even.`,
      r`Now both $a$ and $b$ are even, contradicting the choice that they have no common factor $2$.`,
      r`Therefore $\sqrt{2}$ is irrational.`
    ],
    answer: r`Both $a$ and $b$ must be even, contradicting lowest terms.`
  },
  {
    title: 'Infinitely many primes',
    prompt: r`Prove that there are infinitely many prime numbers.`,
    steps: [
      r`Suppose there are only finitely many primes $p_1,p_2,\dots,p_n$.`,
      r`Consider $a=p_1p_2\cdots p_n+1$.`,
      r`The integer $a$ has a prime factor, say $p_k$.`,
      r`Then $p_k$ divides both $p_1p_2\cdots p_n$ and $a$, so it divides their difference $1$.`,
      r`But no prime divides $1$, a contradiction.`,
      r`Therefore there are infinitely many primes.`
    ],
    answer: r`A prime would have to divide $1$, which is impossible.`
  },
  {
    title: 'Past-paper style contradiction with cases',
    prompt: r`Prove by contradiction: if $a,b$ are integers, then $a^2+8b-14 \neq 0$.`,
    steps: [
      r`Suppose $a^2+8b-14=0$ for some $a,b \in \mathbb{Z}$.`,
      r`Case 1: $a$ is even, $a=2x$. Then $4x^2+8b-14=0$, so $2x^2+4b=7$, that is $2(x^2+2b)=7$. This says $2 \mid 7$, a contradiction.`,
      r`Case 2: $a$ is odd, $a=2x+1$. Then $4x^2+4x+1+8b-14=0$, so $4x^2+4x+8b=13$, that is $4(x^2+x+2b)=13$. This says $4 \mid 13$, a contradiction.`,
      r`Both cases are impossible, so $a^2+8b-14 \neq 0$.`
    ],
    answer: r`The even case forces $2 \mid 7$, and the odd case forces $4 \mid 13$.`
  }
];

const longGenerators = [
  {
    id: 'contra-long-parity-divisibility',
    title: 'Parity contradiction with divisibility',
    make(rng, level) {
      const m = randInt(rng, 1, 4);
      const coefficient = 4 * m;
      const constant = 4 * m + 6;
      return longQ(
        unitId,
        'contra-long-parity-divisibility',
        rng,
        r`Prove by contradiction: if $a,b$ are integers, then $a^2+${coefficient}b-${constant} \neq 0$. [12 marks]`,
        [
          r`Suppose, for contradiction, that $a^2+${coefficient}b-${constant}=0$ for some $a,b \in \mathbb{Z}$. Then $a^2=${constant}-${coefficient}b$.`,
          r`Case 1: $a$ is even, say $a=2x$. Then $4x^2+${coefficient}b-${constant}=0$.`,
          r`Dividing by $2$ gives $2x^2+${coefficient / 2}b=${constant / 2}$, so $2(x^2+${coefficient / 4}b)=${constant / 2}$.`,
          r`The left side is even while the right side is odd, a contradiction.`,
          r`Case 2: $a$ is odd, say $a=2x+1$. Then $4x^2+4x+1+${coefficient}b-${constant}=0$, so $4(x^2+x+${coefficient / 4}b)=${constant - 1}$.`,
          r`The left side is divisible by $4$ while ${constant - 1}$ is not, a contradiction.`,
          r`Both parities are impossible, so no integers $a,b$ satisfy the equation; hence $a^2+${coefficient}b-${constant} \neq 0$.`
        ],
        [
          { point: 'correct contradiction assumption', marks: 2 },
          { point: 'even case set up and simplified correctly', marks: 3 },
          { point: 'even case identifies the parity contradiction', marks: 2 },
          { point: 'odd case set up and simplified correctly', marks: 3 },
          { point: 'odd case identifies the divisibility contradiction', marks: 1 },
          { point: 'concludes the original statement', marks: 1 }
        ],
        12,
        level
      );
    }
  },
  {
    id: 'contra-long-irrational',
    title: 'Irrational square root',
    make(rng, level) {
      const p = pick(rng, [2, 3, 5, 7]);
      return longQ(
        unitId,
        'contra-long-irrational',
        rng,
        r`Prove by contradiction that $\sqrt{${p}}$ is irrational. [12 marks]`,
        [
          r`Suppose $\sqrt{${p}}$ is rational. Write $\sqrt{${p}}=\frac{a}{b}$ with $a,b \in \mathbb{Z}$, $b \neq 0$, and no common factor other than $1$.`,
          r`Squaring gives ${p}b^2=a^2$, so ${p} \mid a^2$. Since ${p} is prime, ${p} \mid a$.`,
          r`Write $a=${p}c$ for some integer $c$. Then ${p}b^2=${p ** 2}c^2$, so $b^2=${p}c^2$.`,
          r`Thus ${p} \mid b^2$, and again ${p} \mid b$.`,
          r`Now ${p} divides both $a$ and $b$, contradicting the assumption that they have no common factor.`,
          r`Therefore $\sqrt{${p}}$ is irrational.`
        ],
        [
          { point: 'sets up lowest terms correctly', marks: 2 },
          { point: 'squares and rearranges correctly', marks: 2 },
          { point: 'uses primality to deduce p divides a', marks: 2 },
          { point: 'repeats the argument for b', marks: 3 },
          { point: 'states the common-factor contradiction', marks: 2 },
          { point: 'concludes irrationality', marks: 1 }
        ],
        12,
        level
      );
    }
  },
  {
    id: 'contra-long-even-square',
    title: 'Even square implies even',
    make(rng, level) {
      return longQ(
        unitId,
        'contra-long-even-square',
        rng,
        r`Prove by contradiction: if $a^2$ is even, then $a$ is even. [8 marks]`,
        [
          r`Suppose $a^2$ is even but $a$ is not even.`,
          r`Since $a$ is an integer, $a$ is odd, so $a=2c+1$ for some $c \in \mathbb{Z}$.`,
          r`Then $a^2=(2c+1)^2=4c^2+4c+1=2(2c^2+2c)+1$, which is odd.`,
          r`This contradicts the assumption that $a^2$ is even.`,
          r`Therefore $a$ must be even.`
        ],
        [
          { point: 'negates the conclusion correctly (a is odd)', marks: 2 },
          { point: 'expands (2c+1)^2 correctly', marks: 3 },
          { point: 'shows the square is odd', marks: 2 },
          { point: 'states the contradiction and conclusion', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'contra-long-divide-neighbours',
    title: 'Cannot divide consecutive integers',
    make(rng, level) {
      return longQ(
        unitId,
        'contra-long-divide-neighbours',
        rng,
        r`Prove by contradiction: if $a,b \in \mathbb{Z}$ and $a \geq 2$, then $a \nmid b$ or $a \nmid b+1$. [10 marks]`,
        [
          r`Suppose the statement is false: there exist integers $a,b$ with $a \geq 2$ such that $a \mid b$ and $a \mid (b+1)$.`,
          r`Then $b=ac$ and $b+1=ad$ for some integers $c,d$.`,
          r`Subtract: $(b+1)-b=ad-ac=a(d-c)$, so $1=a(d-c)$.`,
          r`Since $a \geq 2$ and $d-c$ is an integer, the product $a(d-c)$ cannot equal $1$.`,
          r`This contradiction shows that $a \nmid b$ or $a \nmid b+1$.`
        ],
        [
          { point: 'correct negation using De Morgan', marks: 2 },
          { point: 'expresses both divisibilities as equations', marks: 3 },
          { point: 'subtracts to obtain 1 = a(d-c)', marks: 3 },
          { point: 'explains why this is impossible and concludes', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'contra-long-infinite-primes',
    title: 'Infinitely many primes',
    make(rng, level) {
      return longQ(
        unitId,
        'contra-long-infinite-primes',
        rng,
        r`Prove by contradiction that there are infinitely many prime numbers. [12 marks]`,
        [
          r`Suppose there are only finitely many primes, say $p_1,p_2,\dots,p_n$.`,
          r`Consider $a=p_1p_2\cdots p_n+1$.`,
          r`Every integer greater than $1$ has a prime factor, so $a$ has a prime factor; by assumption it is one of the $p_k$.`,
          r`Then $p_k \mid p_1p_2\cdots p_n$ and $p_k \mid a$.`,
          r`Hence $p_k$ divides $a-p_1p_2\cdots p_n=1$, which is impossible because no prime divides $1$.`,
          r`This contradiction shows that there are infinitely many primes.`
        ],
        [
          { point: 'assumes a finite list of primes', marks: 2 },
          { point: 'constructs the number a correctly', marks: 2 },
          { point: 'uses existence of a prime factor', marks: 3 },
          { point: 'derives that a prime divides 1', marks: 3 },
          { point: 'states the contradiction and conclusion', marks: 2 }
        ],
        12,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'contra-obj-assumption',
    title: 'Assumption for proving P',
    make(rng, level) {
      return mcqQ(
        unitId,
        'contra-obj-assumption',
        rng,
        r`To prove a proposition $P$ by contradiction, what should you assume first?`,
        r`$\sim P$`,
        [r`$P$`, r`$\sim P \land P$`, r`$P \lor \sim P$`],
        [r`A proof by contradiction begins by assuming the negation of the proposition.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-conditional-assumption',
    title: 'Assumption for a conditional contradiction',
    make(rng, level) {
      return mcqQ(
        unitId,
        'contra-obj-conditional-assumption',
        rng,
        r`To prove "If $P$, then $Q$" by contradiction, what should you assume?`,
        r`$P \land \sim Q$`,
        [r`$\sim P \land Q$`, r`$\sim P \land \sim Q$`, r`$P \land Q$`],
        [r`$\sim(P \Rightarrow Q) \equiv P \land \sim Q$.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-fact',
    title: 'Contradiction fact',
    make(rng, level) {
      return tfQ(
        unitId,
        'contra-obj-fact',
        rng,
        r`Is it true that a statement of the form $C \land \sim C$ cannot be true?`,
        true,
        [r`$C$ and $\sim C$ cannot both hold, so their conjunction is always false.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-negation',
    title: 'Negation of a conditional',
    make(rng, level) {
      return mcqQ(
        unitId,
        'contra-obj-negation',
        rng,
        r`Which statement is the negation of $P \Rightarrow Q$?`,
        r`$P \land \sim Q$`,
        [r`$\sim P \land Q$`, r`$\sim P \lor Q$`, r`$P \lor \sim Q$`],
        [r`A conditional fails exactly when $P$ is true and $Q$ is false, so the negation is $P \land \sim Q$.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-parity',
    title: 'Parity of a square',
    make(rng, level) {
      const a = randInt(rng, 2, 12);
      return shortQ(
        unitId,
        'contra-obj-parity',
        rng,
        r`If $a^2$ is even, what parity must $a$ have? Enter "even" or "odd".`,
        'even',
        ['even'],
        [r`Even square implies the base is even; an odd base would produce an odd square.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-rational',
    title: 'Rational or irrational',
    make(rng, level) {
      return tfQ(
        unitId,
        'contra-obj-rational',
        rng,
        r`Is every real number either rational or irrational?`,
        true,
        [r`Irrational simply means not rational, so the two categories exhaust the real numbers.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 5,
  title: 'Proof by Contradiction',
  titleZh: '反证法',
  summary: '矛盾结构、奇偶矛盾、无理数与素数无限性',
  notes,
  textbook: {
    source: '教材 Main.pdf §6.1–6.4 Proof by Contradiction',
    sections: [
      {
        heading: '§6.1 用矛盾证明 | Proving Statements with Contradiction',
        body: [
          r`思路：命题 $S$ 为假 $\Rightarrow$ 推出矛盾 $\Rightarrow$ $S$ 为真。结构：**Proof. Suppose $\sim S$.** ... contradiction。`,
          r`经典例：$\sqrt{2}$ 是无理数。假设 $\sqrt{2}=\frac{a}{b}$ 为最简分数，则 $a^2=2b^2$，故 $a$ 为偶数，$a=2c$，代回得 $b^2=2c^2$，于是 $b$ 也为偶数，与 $\frac{a}{b}$ 最简矛盾。`,
          r`矛盾的形式可以是：$R\land\sim R$、$0=1$、$n$ 既奇又偶、同时 $n\mid a$ 与 $n\nmid a$。`,
          r`反证可以证明任意命题（不限条件句），但难度通常更高；先试直接证明与逆否。`
        ]
      },
      {
        heading: '§6.2 条件句的反证 | Conditional Statements by Contradiction',
        body: [
          r`证 $P\Rightarrow Q$ 用反证：假设 $P$ 真且 $Q$ 假（即 $P\land\sim Q$），推出矛盾。`,
          r`注意与逆否的区别：逆否是假设 $\sim Q$ 推出 $\sim P$；反证是假设 $P\land\sim Q$ 导出矛盾。两者都能用，但假设不同。`,
          r`例：若 $a,b\in\mathbb{Z}$ 且 $a\ge 2$，则 $a\nmid b$ 或 $a\nmid(b+1)$。假设 $a\mid b$ 且 $a\mid(b+1)$，则 $a\mid 1$，与 $a\ge 2$ 矛盾。`
        ]
      },
      {
        heading: '§6.3–6.4 技巧与建议 | Combining Techniques',
        body: [
          r`反证常与直接证明混用：在外层反证里，内部用直接证明或分类讨论。`,
          r`例：证明 $\sqrt{2}+\sqrt{3}$ 是无理数。假设它是有理数 $r$，则 $\sqrt{3}=r-\sqrt{2}$，平方后得 $\sqrt{2}=\frac{r^2-1}{2r}$ 为有理数，与 $\sqrt{2}$ 无理矛盾。`,
          r`矛盾点通常藏在"最简/最大/最小/唯一"这类极端性里：先问哪一步能立刻得到矛盾。`,
          r`反证不是万能钥匙——能用直接证明时优先直接证明，结构更清晰、失分更少。`
        ]
      }
    ]
  },
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
