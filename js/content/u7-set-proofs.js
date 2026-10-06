import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'set-proofs';
const r = String.raw;

const notes = [
  {
    heading: '基本定义 | Basic definitions',
    body: [
      r`$A \times B=\{(x,y):x \in A,\ y \in B\}$, $A \cup B=\{x:x \in A \lor x \in B\}$, $A \cap B=\{x:x \in A \land x \in B\}$.`,
      r`$A-B=\{x:x \in A \land x \notin B\}$, $\overline{A}=U-A$ for a universal set $U$, and $A \subseteq B$ means $\forall a \in A,\ a \in B$.`
    ]
  },
  {
    heading: '证明元素属于集合 | Proving membership',
    body: [
      r`To prove $a \in \{x:P(x)\}$, show that $P(a)$ is true.`,
      r`To prove $a \in \{x \in S:P(x)\}$, first verify $a \in S$, then show $P(a)$.`,
      r`Example: for $A=\{x \in \mathbb{N}:7 \mid x\}$, $21 \in A$ because $21 \in \mathbb{N}$ and $7 \mid 21$.`
    ]
  },
  {
    heading: '证明包含关系 | Proving A is a subset of B',
    body: [
      r`Direct approach: suppose $a \in A$, use the definition of $A$, and derive $a \in B$.`,
      r`Contrapositive approach: suppose $a \notin B$, and derive $a \notin A$.`,
      r`End with the sentence "$a \in A$ implies $a \in B$, so $A \subseteq B$."`
    ]
  },
  {
    heading: '证明集合相等 | Proving A equals B',
    body: [
      r`$A=B$ if and only if $A \subseteq B$ and $B \subseteq A$.`,
      r`For each inclusion, take an arbitrary element of one side and show it belongs to the other.`,
      r`Label the two directions "($\subseteq$)" and "($\supseteq$)" to keep the proof readable.`
    ]
  },
  {
    heading: '元素追踪 | Element chasing',
    body: [
      r`Most set identities are proved by rewriting membership statements: $x \in A \cup B$ becomes $x \in A \lor x \in B$, and so on.`,
      r`Useful logical laws inside element chasing include distributivity, associativity, commutativity, and $P \equiv P \land P$.`
    ]
  },
  {
    heading: '幂集包含 | Power sets',
    body: [
      r`$X \in \mathcal{P}(A)$ means $X \subseteq A$.`,
      r`Therefore a statement about power sets can be translated into a statement about subsets.`,
      r`Example: $X \in \mathcal{P}(A) \cup \mathcal{P}(B)$ means $X \subseteq A$ or $X \subseteq B$.`
    ]
  },
  {
    heading: '笛卡尔积恒等式 | Cartesian product identities',
    body: [
      r`$A \times (B \cap C)=(A \times B) \cap (A \times C)$.`,
      r`To prove such an identity, take an arbitrary ordered pair $(a,b)$ and chase the definitions of $\times$ and $\cap$.`,
      r`If $A \times C=B \times C$ and $C \neq \varnothing$, then $A=B$; the condition $C \neq \varnothing$ is essential.`
    ]
  }
];

const methods = [
  {
    name: 'Prove a subset statement',
    when: r`The conclusion has the form $A \subseteq B$.`,
    steps: [
      r`Write "Suppose $a \in A$."`,
      r`Translate $a \in A$ using the definition of $A$.`,
      r`Use algebra or logic to derive the condition that defines membership in $B$.`,
      r`Conclude $a \in B$, and therefore $A \subseteq B$.`
    ],
    watch: r`Use an arbitrary element $a$, not a specific number.`
  },
  {
    name: 'Prove a set equality',
    when: r`The conclusion has the form $A=B$.`,
    steps: [
      r`Prove $A \subseteq B$ first.`,
      r`Prove $B \subseteq A$ second.`,
      r`Label the two parts and use a fresh arbitrary element in each.`,
      r`Conclude that both inclusions give $A=B$.`
    ],
    watch: r`One inclusion alone does not prove equality.`
  },
  {
    name: 'Prove a membership statement',
    when: r`The conclusion has the form $a \in A$ where $A$ is defined by set-builder notation.`,
    steps: [
      r`Identify the ambient set and the property $P(x)$ in $A=\{x \in S:P(x)\}$.`,
      r`Verify $a \in S$.`,
      r`Verify $P(a)$ using definitions or computation.`,
      r`Conclude $a \in A$.`
    ],
    watch: r`Both conditions in a set-builder definition must be checked.`
  }
];

const examples = [
  {
    title: 'Subset by divisibility',
    prompt: r`Prove that $\{x \in \mathbb{Z}:18 \mid x\} \subseteq \{x \in \mathbb{Z}:6 \mid x\}$.`,
    steps: [
      r`Suppose $a \in \{x \in \mathbb{Z}:18 \mid x\}$. Then $a \in \mathbb{Z}$ and $18 \mid a$.`,
      r`By definition, $a=18c$ for some $c \in \mathbb{Z}$.`,
      r`Then $a=18c=6(3c)$, and $3c \in \mathbb{Z}$.`,
      r`Therefore $6 \mid a$, so $a \in \{x \in \mathbb{Z}:6 \mid x\}$.`,
      r`Hence the first set is a subset of the second.`
    ],
    answer: r`$a=6(3c)$ shows $6 \mid a$.`
  },
  {
    title: 'Subset of an intersection',
    prompt: r`Prove that $\{x \in \mathbb{Z}:2 \mid x\} \cap \{x \in \mathbb{Z}:9 \mid x\} \subseteq \{x \in \mathbb{Z}:6 \mid x\}$.`,
    steps: [
      r`Suppose $a$ belongs to the intersection. Then $2 \mid a$ and $9 \mid a$.`,
      r`So $a=2c$ and $a=9d$ for some integers $c,d$.`,
      r`Since $a$ is even and $a=9d$, the integer $d$ must be even; write $d=2e$.`,
      r`Then $a=9d=9(2e)=6(3e)$, so $6 \mid a$.`,
      r`Therefore the intersection is contained in $\{x \in \mathbb{Z}:6 \mid x\}$.`
    ],
    answer: r`$a=6(3e)$ shows $6 \mid a$.`
  },
  {
    title: 'Power set inclusion',
    prompt: r`Prove that $\mathcal{P}(A) \cup \mathcal{P}(B) \subseteq \mathcal{P}(A \cup B)$.`,
    steps: [
      r`Suppose $X \in \mathcal{P}(A) \cup \mathcal{P}(B)$.`,
      r`Then $X \in \mathcal{P}(A)$ or $X \in \mathcal{P}(B)$, so $X \subseteq A$ or $X \subseteq B$.`,
      r`Without loss of generality, suppose $X \subseteq A$.`,
      r`Since $A \subseteq A \cup B$, we get $X \subseteq A \cup B$.`,
      r`Therefore $X \in \mathcal{P}(A \cup B)$, proving the inclusion.`
    ],
    answer: r`$X \subseteq A$ or $X \subseteq B$ each imply $X \subseteq A \cup B$.`
  },
  {
    title: 'Power set containment implies subset',
    prompt: r`Prove that if $\mathcal{P}(A) \subseteq \mathcal{P}(B)$, then $A \subseteq B$.`,
    steps: [
      r`Since $A \subseteq A$, we have $A \in \mathcal{P}(A)$.`,
      r`By the assumption $\mathcal{P}(A) \subseteq \mathcal{P}(B)$, it follows that $A \in \mathcal{P}(B)$.`,
      r`By definition of the power set, $A \subseteq B$.`
    ],
    answer: r`$A \in \mathcal{P}(A) \subseteq \mathcal{P}(B)$ gives $A \subseteq B$.`
  },
  {
    title: 'Cartesian product and equality',
    prompt: r`Prove that if $A \times C=B \times C$ and $C \neq \varnothing$, then $A=B$.`,
    steps: [
      r`Since $C \neq \varnothing$, choose $c \in C$.`,
      r`Take an arbitrary $a \in A$. Then $(a,c) \in A \times C=B \times C$.`,
      r`So $a \in B$, which proves $A \subseteq B$.`,
      r`The reverse inclusion is identical with the roles of $A$ and $B$ swapped.`,
      r`Therefore $A=B$.`
    ],
    answer: r`Both inclusions hold, so $A=B$.`
  }
];

const longGenerators = [
  {
    id: 'setproof-long-subset',
    title: 'Subset proof by divisibility',
    make(rng, level) {
      const m = pick(rng, [2, 3, 4, 5, 6]);
      const n = pick(rng, [2, 3, 5, 7, 9]);
      return longQ(
        unitId,
        'setproof-long-subset',
        rng,
        r`Prove that $\{x \in \mathbb{Z}:${m * n} \mid x\} \subseteq \{x \in \mathbb{Z}:${m} \mid x\}$. [8 marks]`,
        [
          r`Suppose $a \in \{x \in \mathbb{Z}:${m * n} \mid x\}$. Then $a \in \mathbb{Z}$ and ${m * n} \mid a$.`,
          r`By definition, $a=${m * n}c$ for some $c \in \mathbb{Z}$.`,
          r`Factor: $a=${m}(${n}c)$, and ${n}c \in \mathbb{Z}$.`,
          r`Therefore ${m} \mid a$, so $a \in \{x \in \mathbb{Z}:${m} \mid x\}$.`,
          r`Hence the first set is a subset of the second.`
        ],
        [
          { point: 'uses an arbitrary element of the first set', marks: 2 },
          { point: 'translates divisibility correctly', marks: 3 },
          { point: 'factors out the required divisor with an integer factor', marks: 2 },
          { point: 'concludes the subset relation', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'setproof-long-equality',
    title: 'Set equality by two inclusions',
    make(rng, level) {
      return longQ(
        unitId,
        'setproof-long-equality',
        rng,
        r`Prove that $A-(A-B)=A \cap B$ for all sets $A$ and $B$. [10 marks]`,
        [
          r`($\subseteq$) Suppose $x \in A-(A-B)$. Then $x \in A$ and $x \notin A-B$.`,
          r`If $x \notin B$, then $x \in A$ and $x \notin B$ would give $x \in A-B$, a contradiction.`,
          r`Hence $x \in B$, so $x \in A \cap B$. This proves $A-(A-B) \subseteq A \cap B$.`,
          r`($\supseteq$) Suppose $x \in A \cap B$. Then $x \in A$ and $x \in B$.`,
          r`Since $x \in B$, it is not true that $x \in A$ and $x \notin B$, so $x \notin A-B$.`,
          r`Therefore $x \in A-(A-B)$, proving the reverse inclusion.`,
          r`Both inclusions hold, so $A-(A-B)=A \cap B$.`
        ],
        [
          { point: 'sets up the first inclusion correctly', marks: 2 },
          { point: 'uses the definition of difference and contradiction correctly', marks: 3 },
          { point: 'sets up the reverse inclusion correctly', marks: 2 },
          { point: 'completes the reverse inclusion', marks: 2 },
          { point: 'concludes equality from two inclusions', marks: 1 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'setproof-long-cartesian-cancellation',
    title: 'Cartesian product cancellation',
    make(rng, level) {
      return longQ(
        unitId,
        'setproof-long-cartesian-cancellation',
        rng,
        r`Prove that if $A \times C=B \times C$ and $C \neq \varnothing$, then $A=B$. [10 marks]`,
        [
          r`Since $C \neq \varnothing$, choose some $c \in C$.`,
          r`Take an arbitrary $a \in A$. Then $(a,c) \in A \times C=B \times C$.`,
          r`By definition of the Cartesian product, $a \in B$. Hence $A \subseteq B$.`,
          r`Similarly, take $b \in B$. Then $(b,c) \in B \times C=A \times C$, so $b \in A$. Hence $B \subseteq A$.`,
          r`From the two inclusions, $A=B$.`
        ],
        [
          { point: 'uses C non-empty to choose an element', marks: 2 },
          { point: 'proves A is contained in B', marks: 3 },
          { point: 'proves B is contained in A', marks: 3 },
          { point: 'concludes equality', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'setproof-long-distributive',
    title: 'Cartesian product distributive law',
    make(rng, level) {
      return longQ(
        unitId,
        'setproof-long-distributive',
        rng,
        r`Prove that $A \times (B \cap C)=(A \times B) \cap (A \times C)$ for all sets $A,B,C$. [12 marks]`,
        [
          r`($\subseteq$) Suppose $(x,y) \in A \times (B \cap C)$. Then $x \in A$ and $y \in B \cap C$.`,
          r`So $x \in A$, $y \in B$ and $y \in C$. Hence $(x,y) \in A \times B$ and $(x,y) \in A \times C$.`,
          r`Therefore $(x,y) \in (A \times B) \cap (A \times C)$, proving the first inclusion.`,
          r`($\supseteq$) Suppose $(x,y) \in (A \times B) \cap (A \times C)$.`,
          r`Then $(x,y) \in A \times B$ and $(x,y) \in A \times C$, so $x \in A$, $y \in B$ and $y \in C$.`,
          r`Thus $y \in B \cap C$, and hence $(x,y) \in A \times (B \cap C)$.`,
          r`Both inclusions hold, so the two sets are equal.`
        ],
        [
          { point: 'first inclusion set up correctly', marks: 2 },
          { point: 'first inclusion element chase complete', marks: 4 },
          { point: 'second inclusion set up correctly', marks: 2 },
          { point: 'second inclusion element chase complete', marks: 3 },
          { point: 'concludes equality', marks: 1 }
        ],
        12,
        level
      );
    }
  },
  {
    id: 'setproof-long-power-set',
    title: 'Power set containment',
    make(rng, level) {
      return longQ(
        unitId,
        'setproof-long-power-set',
        rng,
        r`Prove that if $\mathcal{P}(A) \subseteq \mathcal{P}(B)$, then $A \subseteq B$. [10 marks]`,
        [
          r`Since every set is a subset of itself, $A \subseteq A$.`,
          r`By definition of the power set, this means $A \in \mathcal{P}(A)$.`,
          r`By the assumption $\mathcal{P}(A) \subseteq \mathcal{P}(B)$, it follows that $A \in \mathcal{P}(B)$.`,
          r`Again by definition of the power set, $A \subseteq B$.`,
          r`Therefore the condition on the power sets implies the subset relation.`
        ],
        [
          { point: 'observes that A is a subset of itself', marks: 2 },
          { point: 'translates to A in P(A)', marks: 2 },
          { point: 'uses the power set containment', marks: 3 },
          { point: 'translates back to A subset B', marks: 3 }
        ],
        10,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'setproof-obj-membership',
    title: 'Set-builder membership',
    make(rng, level) {
      const d = pick(rng, [3, 4, 5, 6, 7]);
      const multiple = d * randInt(rng, 2, 9);
      return tfQ(
        unitId,
        'setproof-obj-membership',
        rng,
        r`Let $A=\{x \in \mathbb{N}:${d} \mid x\}$. Is $${multiple} \in A$ true or false?`,
        true,
        [r`$${multiple} \in \mathbb{N}$ and $${d} \mid ${multiple}$, so it belongs to $A$.`],
        2,
        level
      );
    }
  },
  {
    id: 'setproof-obj-empty',
    title: 'Empty set subset',
    make(rng, level) {
      return tfQ(
        unitId,
        'setproof-obj-empty',
        rng,
        r`Is $\varnothing \subseteq A$ true for every set $A$?`,
        true,
        [r`The empty set has no elements, so there is no element that could fail to be in $A$.`],
        2,
        level
      );
    }
  },
  {
    id: 'setproof-obj-element',
    title: 'Element of a set-builder set',
    make(rng, level) {
      const k = randInt(rng, 2, 8);
      const value = 3 * k + 2;
      return shortQ(
        unitId,
        'setproof-obj-element',
        rng,
        r`Let $C=\{3x+2:x \in \mathbb{Z}\}$. Find an integer $x$ such that $${value} \in C$.`,
        String(k),
        [String(k)],
        [r`$3(${k})+2=${value}$, so $x=${k}$ works.`],
        2,
        level
      );
    }
  },
  {
    id: 'setproof-obj-subset-definition',
    title: 'Meaning of subset',
    make(rng, level) {
      return mcqQ(
        unitId,
        'setproof-obj-subset-definition',
        rng,
        r`Which statement means $A \subseteq B$?`,
        r`For every $a \in A$, we have $a \in B$.`,
        [r`There exists $a \in A$ with $a \in B$.`, r`For every $b \in B$, we have $b \in A$.`, r`$A \cap B=\varnothing$`],
        [r`A subset relation requires every element of the first set to be an element of the second.`],
        2,
        level
      );
    }
  },
  {
    id: 'setproof-obj-power-union',
    title: 'Power set union subset',
    make(rng, level) {
      return tfQ(
        unitId,
        'setproof-obj-power-union',
        rng,
        r`Is it true that $\mathcal{P}(A) \cup \mathcal{P}(B) \subseteq \mathcal{P}(A \cup B)$?`,
        true,
        [r`If $X \subseteq A$ or $X \subseteq B$, then $X \subseteq A \cup B$.`],
        2,
        level
      );
    }
  },
  {
    id: 'setproof-obj-difference',
    title: 'Difference is not symmetric',
    make(rng, level) {
      return mcqQ(
        unitId,
        'setproof-obj-difference',
        rng,
        r`Which statement is true in general?`,
        r`$A-B \neq B-A$ is possible.`,
        [r`$A-B=B-A$ always`, r`$A-B=A \cup B$ always`, r`$A-B=B$ always`],
        [r`For example with $A=\{1\}$ and $B=\{2\}$, $A-B=\{1\}$ while $B-A=\{2\}$, so the two are not equal in general.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 7,
  title: 'Proofs Involving Sets',
  titleZh: '集合证明',
  summary: '元素追踪、包含与相等证明、笛卡尔积恒等式',
  notes,
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
