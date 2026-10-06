import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'contrapositive';
const r = String.raw;

const notes = [
  {
    heading: '逆否命题 | The contrapositive',
    body: [
      r`A conditional statement $P \Rightarrow Q$ is logically equivalent to its contrapositive $\sim Q \Rightarrow \sim P$.`,
      r`This means proving the contrapositive proves the original statement.`,
      r`Compare the relatives of $P \Rightarrow Q$: converse $Q \Rightarrow P$, inverse $\sim P \Rightarrow \sim Q$, contrapositive $\sim Q \Rightarrow \sim P$.`,
      r`The original and contrapositive always have the same truth value; the converse and inverse are not equivalent to the original in general.`
    ]
  },
  {
    heading: '逆否证明结构 | Contrapositive proof outline',
    body: [
      r`Proposition: If $P$, then $Q$.`,
      r`Proof: Suppose $\sim Q$. ... Therefore $\sim P$.`,
      r`So the first line assumes the negation of the conclusion, not the hypothesis.`
    ]
  },
  {
    heading: '什么时候用逆否 | When to use it',
    body: [
      r`Use a contrapositive proof when assuming $\sim Q$ gives a more useful starting equation or definition than assuming $P$.`,
      r`Typical signals: the conclusion is a negative statement ($x$ is not odd), a "not divides" statement, or a congruence that is hard to rearrange directly.`,
      r`Before writing the proof, state the contrapositive explicitly so the logic is clear.`
    ]
  },
  {
    heading: '同余 | Congruence of integers',
    body: [
      r`For $a,b \in \mathbb{Z}$ and $n \in \mathbb{N}$, we say $a$ and $b$ are **congruent modulo $n$**, written $a \equiv b \pmod{n}$, if $n \mid (a-b)$.`,
      r`If $n \nmid (a-b)$, we write $a \not\equiv b \pmod{n}$.`,
      r`Examples: $9 \equiv 1 \pmod 4$ because $4 \mid 8$; $14 \not\equiv 8 \pmod 4$ because $4 \nmid 6$.`,
      r`Congruence lets you replace a number by any congruent number when simplifying remainders.`
    ]
  },
  {
    heading: '常用结论 | Useful congruence facts',
    body: [
      r`If $a \equiv b \pmod n$, then $a-b=nc$ for some integer $c$.`,
      r`If $a \equiv b \pmod n$, then $a^2 \equiv b^2 \pmod n$, because $a^2-b^2=(a-b)(a+b)$.`,
      r`If $n \mid k$, then $ka \equiv kb \pmod n$ for all integers $a,b$, because $ka-kb=k(a-b)$.`
    ]
  }
];

const methods = [
  {
    name: 'Write a contrapositive proof',
    when: 'The statement has the form "If P, then Q" and assuming not Q is more convenient.',
    steps: [
      r`Write the contrapositive explicitly: "Suppose $\sim Q$."`,
      r`Translate $\sim Q$ by negating the conclusion carefully. For example, "not odd" means even for integers.`,
      r`Use definitions and algebra to derive $\sim P$.`,
      r`Conclude: "Therefore the contrapositive is true, so the original statement is true."`
    ],
    watch: r`Do not accidentally prove the converse. Start from $\sim Q$, end at $\sim P$.`
  },
  {
    name: 'Prove a congruence statement',
    when: r`The statement contains $a \equiv b \pmod n$ or $\not\equiv$.`,
    steps: [
      r`Translate the congruence into divisibility: $n \mid (a-b)$.`,
      r`Write the divisibility as $a-b=nc$ for some $c \in \mathbb{Z}$.`,
      r`Manipulate the equation to reach the required divisibility.`,
      r`Translate back into congruence notation.`
    ],
    watch: r`The modulus $n$ must be positive; the factor you produce must be an integer.`
  },
  {
    name: 'Negate an "and" conclusion',
    when: r`The conclusion is $A \land B$, for example $5 \nmid x$ and $5 \nmid y$.`,
    steps: [
      r`Negate using De Morgan's law: $\sim(A \land B) \equiv \sim A \lor \sim B$.`,
      r`Replace "not not divides" by "divides": $\sim(p \nmid x) \equiv p \mid x$.`,
      r`The contrapositive assumption becomes a disjunction, so either use cases or say without loss of generality.`
    ],
    watch: r`$\sim(A \land B)$ is $A$ false **or** $B$ false, not both false.`
  }
];

const examples = [
  {
    title: 'Direct versus contrapositive',
    prompt: r`Prove: if $7x+9$ is even, then $x$ is odd.`,
    steps: [
      r`Contrapositive: if $x$ is even, then $7x+9$ is even.`,
      r`Suppose $x=2a$ for some integer $a$.`,
      r`Then $7x+9=14a+9=14a+8+1=2(7a+4)+1$, which is odd.`,
      r`Therefore the contrapositive is true, so the original statement is true.`
    ],
    answer: r`$7x+9=2(7a+4)+1$ is odd when $x$ is even.`
  },
  {
    title: 'Contrapositive with divisibility',
    prompt: r`Prove: if $5 \nmid xy$, then $5 \nmid x$ and $5 \nmid y$.`,
    steps: [
      r`Contrapositive: if it is not true that $5 \nmid x$ and $5 \nmid y$, then $5 \mid xy$.`,
      r`By De Morgan's law, this assumption is $5 \mid x$ or $5 \mid y$.`,
      r`Without loss of generality, suppose $5 \mid x$, so $x=5a$.`,
      r`Then $xy=(5a)y=5(ay)$, so $5 \mid xy$.`,
      r`The contrapositive is proved, hence the original statement is true.`
    ],
    answer: r`$xy=5(ay)$ with $ay \in \mathbb{Z}$, so $5 \mid xy$.`
  },
  {
    title: 'Congruence squares',
    prompt: r`Prove: if $a \equiv b \pmod n$, then $a^2 \equiv b^2 \pmod n$.`,
    steps: [
      r`Suppose $a \equiv b \pmod n$. Then $n \mid (a-b)$, so $a-b=nc$ for some $c \in \mathbb{Z}$.`,
      r`Factor: $a^2-b^2=(a-b)(a+b)=nc(a+b)$.`,
      r`Since $c(a+b) \in \mathbb{Z}$, we have $n \mid (a^2-b^2)$.`,
      r`By definition, $a^2 \equiv b^2 \pmod n$.`
    ],
    answer: r`$a^2-b^2=nc(a+b)$, so $n \mid (a^2-b^2)$.`
  },
  {
    title: 'Past-paper style contrapositive proof',
    prompt: r`Give a contrapositive proof: if $m^2+12$ is odd, then $m$ is odd, where $m$ is an integer.`,
    steps: [
      r`Contrapositive: if $m$ is even, then $m^2+12$ is even.`,
      r`Suppose $m=2a$ for some $a \in \mathbb{Z}$.`,
      r`Then $m^2+12=(2a)^2+12=4a^2+12=2(2a^2+6)$.`,
      r`Since $2a^2+6 \in \mathbb{Z}$, the number $m^2+12$ is even.`,
      r`Therefore if $m^2+12$ is odd, $m$ must be odd.`
    ],
    answer: r`$m^2+12=2(2a^2+6)$ is even whenever $m$ is even.`
  }
];

const longGenerators = [
  {
    id: 'contra-long-parity',
    title: 'Contrapositive with odd and even',
    make(rng, level) {
      const k = pick(rng, [3, 5, 7, 9]);
      const c = pick(rng, [2, 4, 6, 8, 10, 12]);
      return longQ(
        unitId,
        'contra-long-parity',
        rng,
        r`Give a contrapositive proof: if $${k}x+${c}$ is odd, then $x$ is odd, where $x$ is an integer. [8 marks]`,
        [
          r`Contrapositive: if $x$ is even, then $${k}x+${c}$ is even.`,
          r`Suppose $x=2a$ for some $a \in \mathbb{Z}$.`,
          r`Then $${k}x+${c}=${k}(2a)+${c}=${2 * k}a+${c}$.`,
          r`Since $${k}$ and $${c}$ are both even, $${2 * k}a+${c}=2(${k}a+${c / 2})$, which is even.`,
          r`Therefore the contrapositive is true, so the original statement is true.`
        ],
        [
          { point: 'states the contrapositive correctly', marks: 2 },
          { point: 'assumes the correct parity and writes x = 2a', marks: 1 },
          { point: 'correct algebraic substitution', marks: 3 },
          { point: 'identifies the expression as 2 times an integer', marks: 1 },
          { point: 'explicitly concludes the original statement', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'contra-long-divisibility',
    title: 'Contrapositive with divisibility',
    make(rng, level) {
      const p = pick(rng, [3, 5, 7]);
      return longQ(
        unitId,
        'contra-long-divisibility',
        rng,
        r`Give a contrapositive proof: if $${p} \nmid xy$, then $${p} \nmid x$ and $${p} \nmid y$. [10 marks]`,
        [
          r`Contrapositive: if it is not true that $${p} \nmid x$ and $${p} \nmid y$, then $${p} \mid xy$.`,
          r`By De Morgan's law, the assumption becomes $${p} \mid x$ or $${p} \mid y$.`,
          r`Without loss of generality, suppose $${p} \mid x$. Then $x=${p}a$ for some $a \in \mathbb{Z}$.`,
          r`Then $xy=(${p}a)y=${p}(ay)$, and $ay \in \mathbb{Z}$.`,
          r`Hence $${p} \mid xy$, so the contrapositive is proved and the original statement is true.`
        ],
        [
          { point: 'states the contrapositive correctly', marks: 2 },
          { point: 'correctly negates the conjunction using De Morgan', marks: 3 },
          { point: 'WLOG/case handling is justified', marks: 2 },
          { point: 'correct divisibility algebra', marks: 2 },
          { point: 'concludes the original', marks: 1 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'contra-long-congruence',
    title: 'Contrapositive with congruence',
    make(rng, level) {
      const n = pick(rng, [4, 5, 6, 7]);
      return longQ(
        unitId,
        'contra-long-congruence',
        rng,
        r`Give a contrapositive proof: if $a^2 \not\equiv b^2 \pmod{${n}}$, then $a \not\equiv b \pmod{${n}}$. [8 marks]`,
        [
          r`Contrapositive: if $a \equiv b \pmod{${n}}$, then $a^2 \equiv b^2 \pmod{${n}}$.`,
          r`Suppose $a \equiv b \pmod{${n}}$. Then ${n} \mid (a-b)$, so $a-b=${n}c$ for some $c \in \mathbb{Z}$.`,
          r`Factor: $a^2-b^2=(a-b)(a+b)=${n}c(a+b)$.`,
          r`Since $c(a+b) \in \mathbb{Z}$, we have ${n} \mid (a^2-b^2)$.`,
          r`Therefore $a^2 \equiv b^2 \pmod{${n}}$, proving the contrapositive.`
        ],
        [
          { point: 'states the contrapositive correctly', marks: 2 },
          { point: 'translates congruence to divisibility', marks: 2 },
          { point: 'correct factorisation of difference of squares', marks: 2 },
          { point: 'concludes the congruence correctly', marks: 2 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'contra-long-mod',
    title: 'Contrapositive with a multiple modulus',
    make(rng, level) {
      const k = pick(rng, [4, 6, 8, 10, 12]);
      const n = pick(rng, [3, 5, 7, 9]);
      return longQ(
        unitId,
        'contra-long-mod',
        rng,
        r`Give a contrapositive proof: if $${k}a \not\equiv ${k}b \pmod{${n}}$, then ${n} \nmid ${k}$. [10 marks]`,
        [
          r`Contrapositive: if ${n} \mid ${k}$, then $${k}a \equiv ${k}b \pmod{${n}}$.`,
          r`Suppose ${n} \mid ${k}$, so ${k}=${n}c$ for some $c \in \mathbb{Z}$.`,
          r`Then $${k}a-${k}b=${k}(a-b)=${n}c(a-b)$.`,
          r`Since $c(a-b) \in \mathbb{Z}$, we have ${n} \mid (${k}a-${k}b)$.`,
          r`By definition, $${k}a \equiv ${k}b \pmod{${n}}$, which proves the contrapositive and hence the original statement.`
        ],
        [
          { point: 'states the contrapositive correctly', marks: 2 },
          { point: 'translates the divisibility assumption', marks: 2 },
          { point: 'correct algebra for ka - kb', marks: 3 },
          { point: 'concludes congruence with definition', marks: 2 },
          { point: 'explicitly links back to the original', marks: 1 }
        ],
        10,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'contra-obj-identify',
    title: 'Identify the contrapositive',
    make(rng, level) {
      return mcqQ(
        unitId,
        'contra-obj-identify',
        rng,
        r`Which statement is the contrapositive of $P \Rightarrow Q$?`,
        r`$\sim Q \Rightarrow \sim P$`,
        [r`$Q \Rightarrow P$`, r`$\sim P \Rightarrow \sim Q$`, r`$P \land \sim Q$`],
        [r`Swap the two parts and negate both: the contrapositive of $P \Rightarrow Q$ is $\sim Q \Rightarrow \sim P$.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-equivalence',
    title: 'Equivalence of a conditional',
    make(rng, level) {
      return tfQ(
        unitId,
        'contra-obj-equivalence',
        rng,
        r`Is a conditional statement logically equivalent to its contrapositive?`,
        true,
        [r`$P \Rightarrow Q \equiv \sim Q \Rightarrow \sim P$ by truth table.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-write',
    title: 'Write a contrapositive',
    make(rng, level) {
      return shortQ(
        unitId,
        'contra-obj-write',
        rng,
        r`Write the contrapositive of: if $n$ is even, then $n^2$ is even. Use the form "if ..., then ...".`,
        'if n^2 is not even, then n is not even',
        ['if n^2 is odd, then n is odd', 'if n^2 is not even, then n is not even'],
        [r`Negate and reverse: the contrapositive is "if $n^2$ is not even, then $n$ is not even", equivalently "if $n^2$ is odd, then $n$ is odd".`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-mod',
    title: 'Evaluate a congruence',
    make(rng, level) {
      const n = pick(rng, [4, 5, 6, 7, 8]);
      const a = randInt(rng, 15, 60);
      return shortQ(
        unitId,
        'contra-obj-mod',
        rng,
        r`Find the least non-negative residue of $${a}$ modulo $${n}$; that is, find $r \in \{0,1,\dots,${n - 1}\}$ with $${a} \equiv r \pmod{${n}}$.`,
        String(a % n),
        [String(a % n)],
        [r`$${a} = ${n} \cdot ${Math.floor(a / n)} + ${a % n}$, so the residue is ${a % n}.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-definition',
    title: 'Definition of congruence',
    make(rng, level) {
      return tfQ(
        unitId,
        'contra-obj-definition',
        rng,
        r`Is it true that $a \equiv b \pmod n$ if and only if $n \mid (a-b)$?`,
        true,
        [r`This is exactly the definition of congruence modulo $n$.`],
        2,
        level
      );
    }
  },
  {
    id: 'contra-obj-assumption',
    title: 'Contrapositive proof assumption',
    make(rng, level) {
      return mcqQ(
        unitId,
        'contra-obj-assumption',
        rng,
        r`To prove "If $P$, then $Q$" by contrapositive, what should you assume?`,
        r`$\sim Q$`,
        [r`$P$`, r`$\sim P$`, r`$P \land \sim Q$`],
        [r`A contrapositive proof of $P \Rightarrow Q$ proves $\sim Q \Rightarrow \sim P$, so it starts by assuming $\sim Q$.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 4,
  title: 'Contrapositive Proof',
  titleZh: '逆否证明',
  summary: '逆否命题、整除与同余的逆否证明',
  notes,
  textbook: {
    source: '教材 Main.pdf §5.1–5.3 Contrapositive Proof',
    sections: [
      {
        heading: '§5.1 逆否证明 | Contrapositive Proof',
        body: [
          r`因为 $P\Rightarrow Q\equiv\sim Q\Rightarrow\sim P$，可以"假设 $\sim Q$，证明 $\sim P$"。`,
          r`结构：**Proof. (Contrapositive) Suppose $\sim Q$.** $\to$ 变形 $\to$ **Therefore $\sim P$. $\blacksquare$**`,
          r`适合时机：$Q$ 含否定词（odd、$\nmid$、irrational），或直接假设 $P$ 信息太少；先比较 $P\Rightarrow Q$ 与 $\sim Q\Rightarrow\sim P$ 哪个更好展开。`,
          r`例：若 $x^2$ 是偶数，则 $x$ 是偶数。取逆否：若 $x$ 是奇数，则 $x=2a+1$，$x^2=2(2a^2+2a)+1$ 为奇数，与 $x^2$ 为偶数矛盾。`,
          r`例：若 $x,y\in\mathbb{Z}$ 且 $xy$ 是奇数，则 $x,y$ 都是奇数。逆否：只要有一个是偶数，乘积就是偶数。`
        ]
      },
      {
        heading: '§5.2 同余 | Congruence of Integers',
        body: [
          r`定义：$a\equiv b\pmod n$ $\iff$ $n\mid(a-b)$（$n\in\mathbb{N}$）；等价地 $a$ 与 $b$ 除以 $n$ 余数相同。`,
          r`自反、对称、传递：$a\equiv a$；$a\equiv b\Rightarrow b\equiv a$；$a\equiv b,b\equiv c\Rightarrow a\equiv c$。`,
          r`同余对 $+,-,\times$ 封闭：若 $a\equiv b$ 且 $c\equiv d$，则 $a+c\equiv b+d$、$a-c\equiv b-d$、$ac\equiv bd$（模 $n$）。`,
          r`例：若 $5\nmid xy$，则 $5\nmid x$ 且 $5\nmid y$。逆否：若 $5\mid x$ 或 $5\mid y$，则 $5\mid xy$。`,
          r`同余的证明常把 $a=b+kn$ 代入；除法一般不保持同余，除非与 $n$ 互素。`
        ]
      },
      {
        heading: '§5.3 数学写作 | Mathematical Writing',
        body: [
          r`把证明写成完整句子：断句与连接词（because、since、hence、therefore、thus）不可省，符号之间要用文字隔开。`,
          r`每个新变量都要先说明来源：写 $b=ac$ **for some integer $c$**，否则读者不知道 $c$ 是什么。`,
          r`例：由 $a\mid b$ 应写 $b=ac$ for some $c\in\mathbb{Z}$；只写 $b=ac$ 会被扣分。`,
          r`避免把"证明"写成"计算"：每一步都要说明为什么成立（定义、代数、已证结论）。`,
          r`结论要明确写出 $Q$（或 $\sim P$）本身，并给出结束符号。`
        ]
      }
    ]
  },
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
