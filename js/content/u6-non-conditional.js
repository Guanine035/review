import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'non-conditional';
const r = String.raw;

const notes = [
  {
    heading: '当且仅当 | If and only if',
    body: [
      r`$P \Leftrightarrow Q$ is equivalent to $(P \Rightarrow Q) \land (Q \Rightarrow P)$.`,
      r`To prove an iff statement, prove both directions: first $P \Rightarrow Q$, then $Q \Rightarrow P$.`,
      r`Label the two directions clearly, for example "($\Rightarrow$)" and "($\Leftarrow$)".`
    ]
  },
  {
    heading: '等价命题链 | Equivalent statements',
    body: [
      r`To prove that statements (a), (b), (c), (d) are equivalent, it is enough to prove a cycle such as (a) $\Rightarrow$ (b) $\Rightarrow$ (c) $\Rightarrow$ (d) $\Rightarrow$ (a).`,
      r`A cycle gives every implication by following the chain around; you do not need to prove all $4 \times 3$ ordered pairs.`
    ]
  },
  {
    heading: '存在性证明 | Existence proofs',
    body: [
      r`To prove $\exists x \in S,\ P(x)$, exhibit a specific $x \in S$ and verify $P(x)$.`,
      r`A single example proves an existence statement.`,
      r`Warning: a single example does **not** prove a universal statement $\forall x \in S,\ P(x)$.`
    ]
  },
  {
    heading: '构造与非构造 | Constructive and non-constructive',
    body: [
      r`A **constructive** existence proof gives an explicit example.`,
      r`A **non-constructive** existence proof shows that an example must exist without producing a concrete one.`,
      r`For example, one can show that some irrational pair $x,y$ has $x^y$ rational by splitting into the cases $x=\sqrt{2}^{\sqrt{2}}$ and $x=\sqrt{2}$ without deciding which case actually occurs.`
    ]
  },
  {
    heading: '存在且唯一 | Existence and uniqueness',
    body: [
      r`An existence and uniqueness proof has two parts: show at least one object exists, then show any two such objects are equal.`,
      r`For uniqueness, suppose $x$ and $x'$ both satisfy the condition and prove $x=x'$.`
    ]
  },
  {
    heading: '除法算法 | Division Algorithm',
    body: [
      r`Let $a,b \in \mathbb{Z}$ with $b \neq 0$. Then there exist unique $q,r \in \mathbb{Z}$ such that $a=bq+r$ and $0 \leq r<|b|$.`,
      r`Existence comes from the usual quotient and remainder; uniqueness follows because two remainders differ by less than $|b|$ yet their difference is a multiple of $b$.`
    ]
  }
];

const methods = [
  {
    name: 'Prove P if and only if Q',
    when: 'The statement contains "if and only if", "iff", or "is equivalent to".',
    steps: [
      r`Write two separate proof obligations: $P \Rightarrow Q$ and $Q \Rightarrow P$.`,
      r`Prove each direction using the appropriate hypothesis.`,
      r`Do not use the conclusion of one direction as an assumption in the other.`,
      r`Conclude that $P \Leftrightarrow Q$.`
    ],
    watch: r`Proving only one direction proves only one implication, not the iff statement.`
  },
  {
    name: 'Prove existence and uniqueness',
    when: r`The statement says "there exists a unique ..." or "exactly one ...".`,
    steps: [
      r`Existence: give a candidate and verify all required properties.`,
      r`Uniqueness: suppose two candidates satisfy the properties.`,
      r`Subtract or compare the two sets of equations.`,
      r`Use bounds or divisibility to force the candidates to be equal.`
    ],
    watch: r`Uniqueness is not "the example looks like the only one"; it needs an argument.`
  },
  {
    name: 'Prove a chain of equivalent statements',
    when: 'Several statements are listed and must be shown equivalent.',
    steps: [
      r`Choose a cycle that visits every statement once.`,
      r`Prove each implication in the cycle.`,
      r`Explain that any implication follows by composing arrows around the cycle.`
    ],
    watch: r`Make sure the arrows really form a cycle; a broken chain does not prove equivalence.`
  }
];

const examples = [
  {
    title: 'Existence proof',
    prompt: r`Prove that there exists an even prime number.`,
    steps: [
      r`We need an explicit example of a number that is both even and prime.`,
      r`The number $2$ is even because $2=2 \cdot 1$.`,
      r`The positive divisors of $2$ are exactly $1$ and $2$, so $2$ is prime.`,
      r`Therefore an even prime number exists.`
    ],
    answer: r`The number $2$ is both even and prime.`
  },
  {
    title: 'Existence with two representations',
    prompt: r`Prove that there exists an integer expressible as a sum of two positive cubes in two different ways.`,
    steps: [
      r`Consider $1729$.`,
      r`$1^3+12^3=1+1728=1729$.`,
      r`$9^3+10^3=729+1000=1729$.`,
      r`The two representations use different pairs of positive integers, so such an integer exists.`
    ],
    answer: r`$1729=1^3+12^3=9^3+10^3$.`
  },
  {
    title: 'Existence and uniqueness in the Division Algorithm',
    prompt: r`Prove that there exist unique integers $q,r$ with $a=47$, $b=6$, $a=6q+r$ and $0 \leq r<6$.`,
    steps: [
      r`Existence: $47=6 \cdot 7+5$, so $q=7$ and $r=5$ work, with $0 \leq 5<6$.`,
      r`Uniqueness: suppose $47=6q+r=6q'+r'$ with $0 \leq r,r'<6$.`,
      r`Subtract: $6(q-q')=r'-r$, so $6 \mid (r'-r)$.`,
      r`But $-5<r'-r<5$, so the only multiple of $6$ in this range is $0$.`,
      r`Hence $r'=r$, and then $6(q-q')=0$ gives $q=q'$.`
    ],
    answer: r`$q=7$ and $r=5$ are the unique integers.`
  },
  {
    title: 'Equivalent statements',
    prompt: r`Prove that the following are equivalent for an integer $n$: (a) $3 \mid n$; (b) $3 \mid n^2$; (c) $n \equiv 0 \pmod 3$.`,
    steps: [
      r`(a) $\Rightarrow$ (b): if $n=3k$, then $n^2=9k^2=3(3k^2)$, so $3 \mid n^2$.`,
      r`(b) $\Rightarrow$ (c): if $3 \mid n^2$, then $n^2 \equiv 0 \pmod 3$. We use the fact that if $3 \mid n^2$ then $3 \mid n$; hence $n \equiv 0 \pmod 3$.`,
      r`(c) $\Rightarrow$ (a): $n \equiv 0 \pmod 3$ means $3 \mid (n-0)=n$.`,
      r`The cycle (a) $\Rightarrow$ (b) $\Rightarrow$ (c) $\Rightarrow$ (a) proves that all three statements are equivalent.`
    ],
    answer: r`The three statements are equivalent by the cycle of implications.`
  }
];

const longGenerators = [
  {
    id: 'noncond-long-iff',
    title: 'If and only if proof',
    make(rng, level) {
      const k = pick(rng, [2, 3, 5, 7]);
      return longQ(
        unitId,
        'noncond-long-iff',
        rng,
        r`Prove: an integer $n$ is a multiple of $${k}$ if and only if $n^2$ is a multiple of $${k ** 2}$. [10 marks]`,
        [
          r`($\Rightarrow$) Suppose $n$ is a multiple of $${k}$. Then $n=${k}a$ for some $a \in \mathbb{Z}$.`,
          r`Then $n^2=(${k}a)^2=${k ** 2}a^2$, so $n^2$ is a multiple of $${k ** 2}$.`,
          r`($\Leftarrow$) Suppose $n^2$ is a multiple of $${k ** 2}$. Since $${k} \mid ${k ** 2}$, it follows that $${k} \mid n^2$.`,
          r`Because $${k}$ is prime, $${k} \mid n^2$ implies $${k} \mid n$. Hence $n$ is a multiple of $${k}$.`,
          r`Hence $n$ is a multiple of $${k}$, completing both directions.`
        ],
        [
          { point: 'clearly separates the two directions', marks: 2 },
          { point: 'forward direction correct', marks: 4 },
          { point: 'reverse direction set up correctly', marks: 2 },
          { point: 'reverse direction justified and concluded', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'noncond-long-existence',
    title: 'Constructive existence proof',
    make(rng, level) {
      const items = [
        {
          statement: r`there exists an even prime number`,
          witness: r`$2$ is even and prime, since its only positive divisors are $1$ and $2$.`
        },
        {
          statement: r`there exist integers $x,y$ such that $x^2-y^2=5$`,
          witness: r`Take $x=3$ and $y=2$. Then $x^2-y^2=9-4=5$.`
        },
        {
          statement: r`there exists an integer expressible as a sum of two positive cubes in two different ways`,
          witness: r`$1729=1^3+12^3=9^3+10^3$, so $1729$ is such an integer.`
        },
        {
          statement: r`there exists a natural number $n$ such that $n^2+n$ is even`,
          witness: r`Take $n=2$. Then $n^2+n=4+2=6$, which is even.`
        }
      ];
      const item = pick(rng, items);
      return longQ(
        unitId,
        'noncond-long-existence',
        rng,
        r`Give a constructive existence proof that ${item.statement}. [8 marks]`,
        [
          r`To prove an existence statement it is enough to exhibit one valid example.`,
          item.witness,
          r`The example satisfies all the required conditions, so the existence statement is proved.`
        ],
        [
          { point: 'identifies a concrete candidate', marks: 3 },
          { point: 'verifies every required property', marks: 4 },
          { point: 'states the existence conclusion', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'noncond-long-unique',
    title: 'Existence and uniqueness',
    make(rng, level) {
      const b = pick(rng, [4, 5, 6, 7]);
      const a = b * randInt(rng, 3, 9) + randInt(rng, 1, b - 1);
      const q = Math.floor(a / b);
      const rem = a % b;
      return longQ(
        unitId,
        'noncond-long-unique',
        rng,
        r`Prove that there exist unique integers $q,r$ such that $${a}=${b}q+r$ and $0 \leq r<${b}$. [12 marks]`,
        [
          r`Existence: $${a}=${b} \cdot ${q}+${rem}$, and $0 \leq ${rem}<${b}$, so $q=${q}$ and $r=${rem}$ work.`,
          r`Uniqueness: suppose $${a}=${b}q+r=${b}q'+r'$ with $0 \leq r,r'<${b}$.`,
          r`Subtract: ${b}(q-q')=r'-r$, so ${b} \mid (r'-r)$.`,
          r`Since $0 \leq r,r'<${b}$, we have $-(${b}-1) \leq r'-r \leq ${b}-1$.`,
          r`The only multiple of $${b}$ in this range is $0$, so $r'=r$.`,
          r`Then ${b}(q-q')=0$, and since ${b} \neq 0$, $q=q'$.`,
          r`Therefore $q$ and $r$ are unique.`
        ],
        [
          { point: 'gives a valid explicit q and r', marks: 2 },
          { point: 'verifies the bound 0 <= r < b', marks: 2 },
          { point: 'sets up uniqueness with two representations', marks: 3 },
          { point: 'uses the bound to force r = r prime', marks: 3 },
          { point: 'concludes q = q prime and uniqueness', marks: 2 }
        ],
        12,
        level
      );
    }
  },
  {
    id: 'noncond-long-chain',
    title: 'Chain of equivalent statements',
    make(rng, level) {
      const k = pick(rng, [2, 3, 5]);
      return longQ(
        unitId,
        'noncond-long-chain',
        rng,
        r`For an integer $n$, prove that the following statements are equivalent: (a) $${k} \mid n$; (b) $${k} \mid n^2$; (c) $n \equiv 0 \pmod{${k}}$. [12 marks]`,
        [
          r`(a) $\Rightarrow$ (b): if $n=${k}a$, then $n^2=${k ** 2}a^2=${k}(${k}a^2)$, so ${k} \mid n^2$.`,
          r`(b) $\Rightarrow$ (c): if ${k} \mid n^2$, then $n^2 \equiv 0 \pmod{${k}}$.`,
          r`(c) $\Rightarrow$ (a): $n \equiv 0 \pmod{${k}}$ means ${k} \mid (n-0)=n$.`,
          r`The cycle (a) $\Rightarrow$ (b) $\Rightarrow$ (c) $\Rightarrow$ (a) proves that all three statements are equivalent.`
        ],
        [
          { point: 'proves (a) implies (b)', marks: 4 },
          { point: 'proves (b) implies (c)', marks: 4 },
          { point: 'proves (c) implies (a)', marks: 3 },
          { point: 'explains why the cycle proves full equivalence', marks: 1 }
        ],
        12,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'noncond-obj-lemma',
    title: 'Definition recall',
    make(rng, level) {
      return mcqQ(
        unitId,
        'noncond-obj-lemma',
        rng,
        r`Which term describes a theorem whose main purpose is to help prove another theorem?`,
        r`Lemma`,
        [r`Proposition`, r`Corollary`, r`Definition`],
        [r`A lemma is an auxiliary theorem used to prove a larger result.`],
        2,
        level
      );
    }
  },
  {
    id: 'noncond-obj-example',
    title: 'Universal versus existence',
    make(rng, level) {
      return tfQ(
        unitId,
        'noncond-obj-example',
        rng,
        r`Can a single example prove a universal statement $\forall x \in S,\ P(x)$?`,
        false,
        [r`One example can prove an existence statement, but a universal statement requires a general argument.`],
        2,
        level
      );
    }
  },
  {
    id: 'noncond-obj-witness',
    title: 'Find a witness',
    make(rng, level) {
      const k = randInt(rng, 2, 9);
      return shortQ(
        unitId,
        'noncond-obj-witness',
        rng,
        r`Find a positive integer $n$ such that $n^2+n$ is even.`,
        String(k),
        [String(k)],
        [r`For every integer $n$, $n(n+1)$ is a product of consecutive integers, so one factor is even; for example $n=${k}$ works.`],
        2,
        level
      );
    }
  },
  {
    id: 'noncond-obj-constructive',
    title: 'Constructive versus non-constructive',
    make(rng, level) {
      return mcqQ(
        unitId,
        'noncond-obj-constructive',
        rng,
        r`Which proof gives an explicit example of the object whose existence is claimed?`,
        r`A constructive existence proof`,
        [r`A non-constructive existence proof`, r`A proof by contradiction of a universal statement`, r`A proof by cases`],
        [r`A constructive proof exhibits a concrete witness; a non-constructive proof only shows that one must exist.`],
        2,
        level
      );
    }
  },
  {
    id: 'noncond-obj-iff',
    title: 'Proving an iff statement',
    make(rng, level) {
      return tfQ(
        unitId,
        'noncond-obj-iff',
        rng,
        r`To prove $P \Leftrightarrow Q$, is it enough to prove only $P \Rightarrow Q$?`,
        false,
        [r`An iff statement is $(P \Rightarrow Q) \land (Q \Rightarrow P)$, so both directions are needed.`],
        2,
        level
      );
    }
  },
  {
    id: 'noncond-obj-unique',
    title: 'Uniqueness strategy',
    make(rng, level) {
      return mcqQ(
        unitId,
        'noncond-obj-unique',
        rng,
        r`What is the standard way to prove that an object satisfying a property is unique?`,
        r`Suppose two objects satisfy the property and prove they are equal.`,
        [r`Exhibit two different examples`, r`Check one example carefully`, r`Assume no object exists`],
        [r`Uniqueness is proved by taking two arbitrary objects with the property and showing they must be the same.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 6,
  title: 'Non-Conditional Statements',
  titleZh: '非条件命题',
  summary: 'iff 证明、存在性与唯一性、构造与非构造',
  notes,
  textbook: {
    source: '教材 Main.pdf §7.1–7.4 Proving Non-Conditional Statements',
    sections: [
      {
        heading: '§7.1 当且仅当 | If-and-Only-If Proof',
        body: [
          r`$P\Leftrightarrow Q$ 的证明分两部分：($\Rightarrow$) 假设 $P$ 证 $Q$；($\Leftarrow$) 假设 $Q$ 证 $P$。两个方向都要写清楚。`,
          r`例：$n$ 为奇数 $\iff$ $n^2$ 为奇数。($\Rightarrow$) 直接证明；($\Leftarrow$) 用逆否：$n$ 为偶数 $\Rightarrow$ $n^2$ 为偶数。`,
          r`若两方向证明过程可逆，不要简单写"反之亦然"，要说明每一步确实可逆，或分别写出。`,
          r`证明中要标注方向，例如 **($\Rightarrow$)** 与 **($\Leftarrow$)**，方便评分。`
        ]
      },
      {
        heading: '§7.2 等价命题链 | Equivalent Statements',
        body: [
          r`要证 $P_1\Leftrightarrow P_2\Leftrightarrow\cdots\Leftrightarrow P_n$，只需证链 $P_1\Rightarrow P_2\Rightarrow\cdots\Rightarrow P_n\Rightarrow P_1$，不必做 $n(n-1)$ 个方向。`,
          r`例：对 $n\in\mathbb{Z}$，以下等价：$n$ 为偶数；$n+1$ 为奇数；$n^2$ 为偶数。证 $P_1\Rightarrow P_2\Rightarrow P_3\Rightarrow P_1$。`,
          r`每条箭头都要写成完整证明；链式结构只为减少重复，不是省略理由的借口。`
        ]
      },
      {
        heading: '§7.3 存在性与唯一性 | Existence and Uniqueness',
        body: [
          r`证 $\exists x,P(x)$：给出具体 witness（构造），再验证 $P$ 成立。例：证明存在偶素数——取 $x=2$。`,
          r`证存在且唯一 $\exists!x,P(x)$：分两步。**Existence**：找出至少一个 $x$；**Uniqueness**：假设 $P(x)$ 与 $P(y)$，推出 $x=y$。`,
          r`例：若 $a,b\in\mathbb{R}$ 且 $a\neq 0$，方程 $ax+b=0$ 有唯一解 $x=-\frac{b}{a}$。存在性给解；唯一性设 $ax+b=0$ 与 $ay+b=0$ 相减得 $a(x-y)=0$，故 $x=y$。`,
          r`唯一性不要写成"只有一个"，要写成 $P(x)\land P(y)\Rightarrow x=y$。`
        ]
      },
      {
        heading: '§7.4 构造与非构造 | Constructive vs Non-Constructive',
        body: [
          r`**Constructive proof**：明确给出 witness。**Non-constructive proof**：只证明存在，不指出具体是谁。`,
          r`经典非构造例：存在无理数 $x,y$ 使 $x^y$ 为有理数。考虑 $x=y=\sqrt{2}$：若 $\sqrt{2}^{\sqrt{2}}$ 有理，则取之；否则取 $x=\sqrt{2}^{\sqrt{2}}$、$y=\sqrt{2}$，则 $x^y=\sqrt{2}^{2}=2$ 有理。两种情况必有一种成立。`,
          r`非构造证明同样有效，但考试要看清题目是否要求"找出/给出"（则必须构造）。`
        ]
      }
    ]
  },
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
