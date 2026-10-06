import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'disproof';
const r = String.raw;

const notes = [
  {
    heading: '反证与举反例 | Disproof and counterexamples',
    body: [
      r`To **disprove** a statement $P$ is to prove its negation $\sim P$.`,
      r`To disprove a universal statement $\forall x \in S,\ P(x)$, exhibit one counterexample $x \in S$ for which $P(x)$ is false.`,
      r`A single counterexample is enough to disprove a universal statement.`
    ]
  },
  {
    heading: '反证条件句 | Disproving a conditional',
    body: [
      r`A conditional $P \Rightarrow Q$ is false exactly when $P$ is true and $Q$ is false.`,
      r`So to disprove it, find one example where the hypothesis holds but the conclusion fails.`,
      r`This uses $\sim(P \Rightarrow Q) \equiv P \land \sim Q$.`
    ]
  },
  {
    heading: '反证存在句 | Disproving an existence statement',
    body: [
      r`The negation of $\exists x \in S,\ P(x)$ is $\forall x \in S,\ \sim P(x)$.`,
      r`So disproving an existence statement requires a general argument that no object can satisfy the property, not just a search through examples.`,
      r`A common method is to suppose such an object exists and derive a contradiction.`
    ]
  },
  {
    heading: '反证法反证 | Disproof by contradiction',
    body: [
      r`To disprove $P$ by contradiction, assume $P$ is true and derive a contradiction.`,
      r`This is often combined with a counterexample: assume the universal claim is true, then show it fails for a particular value.`
    ]
  },
  {
    heading: '常见陷阱 | Common traps',
    body: [
      r`One counterexample disproves a universal statement, but one example never proves a universal statement.`,
      r`Failing to find a counterexample does not prove that none exists.`,
      r`Check the domain: the counterexample must lie in the set specified by the quantifier.`
    ]
  }
];

const methods = [
  {
    name: 'Disprove a universal statement',
    when: r`The statement has the form "for every ..." or "for all ...".`,
    steps: [
      r`Write the negation: there exists an element for which the statement fails.`,
      r`Search for a specific element of the domain that makes the property false.`,
      r`Verify that the element really belongs to the domain.`,
      r`Show the property fails at that element.`
    ],
    watch: r`A counterexample outside the domain does not count.`
  },
  {
    name: 'Disprove an existence statement',
    when: r`The statement claims that some object exists.`,
    steps: [
      r`Negate the statement to get a universal statement: every object fails the property.`,
      r`Assume an arbitrary object satisfies the property.`,
      r`Derive a contradiction.`,
      r`Conclude that no such object exists.`
    ],
    watch: r`You must rule out every possible object, not merely show that your first attempt fails.`
  },
  {
    name: 'Disprove a conditional',
    when: r`The statement has the form "If P, then Q".`,
    steps: [
      r`Search for an example where $P$ is true.`,
      r`Check whether $Q$ is false for that example.`,
      r`If so, the example is a counterexample and the conditional is false.`,
      r`State both facts explicitly: $P$ holds, but $Q$ does not.`
    ],
    watch: r`An example with $P$ false says nothing about the conditional.`
  }
];

const examples = [
  {
    title: 'Counterexample to a prime conjecture',
    prompt: r`Disprove: for every $n \in \mathbb{Z}$, the number $n^2-n+11$ is prime.`,
    steps: [
      r`Test a few values: $n=0$ gives $11$, $n=1$ gives $11$, $n=2$ gives $13$, and so on.`,
      r`Try $n=11$: $11^2-11+11=121=11^2$.`,
      r`$121$ is not prime because it has a divisor other than $1$ and itself.`,
      r`So $n=11$ is a counterexample, and the conjecture is false.`
    ],
    answer: r`$n=11$ gives $121=11^2$, which is not prime.`
  },
  {
    title: 'Counterexample to a set identity',
    prompt: r`Disprove: for all sets $A,B,C$, $A-(B \cap C)=(A-B) \cap (A-C)$.`,
    steps: [
      r`Take $A=\{1,2\}$, $B=\{1\}$ and $C=\{2\}$.`,
      r`Then $B \cap C=\varnothing$, so $A-(B \cap C)=\{1,2\}$.`,
      r`Meanwhile $A-B=\{2\}$ and $A-C=\{1\}$, so $(A-B) \cap (A-C)=\varnothing$.`,
      r`Since $\{1,2\} \neq \varnothing$, the claimed identity is false.`
    ],
    answer: r`$A=\{1,2\},B=\{1\},C=\{2\}$ gives left side $\{1,2\}$ and right side $\varnothing$.`
  },
  {
    title: 'Disproving an existence statement',
    prompt: r`Disprove: there is a real number $x$ such that $x^4<x<x^2$.`,
    steps: [
      r`Suppose such a real number $x$ exists.`,
      r`Since $0 \leq x^4<x$, we have $x>0$.`,
      r`From $x^4<x$, divide by $x>0$: $x^3<1$, so $x<1$.`,
      r`From $x<x^2$, divide by $x>0$: $1<x$.`,
      r`The inequalities $x<1$ and $x>1$ contradict each other.`,
      r`Therefore no such real number exists.`
    ],
    answer: r`The assumptions force both $x<1$ and $x>1$.`
  },
  {
    title: 'Disproof by contradiction',
    prompt: r`Disprove: if $x,y \in \mathbb{R}$, then $|x+y|=|x|+|y|$.`,
    steps: [
      r`Suppose the statement is true for all real numbers $x,y$.`,
      r`Then it must hold in particular for $x=1$ and $y=-1$.`,
      r`But $|1+(-1)|=|0|=0$, while $|1|+|-1|=1+1=2$.`,
      r`Since $0 \neq 2$, the supposed universal statement has a counterexample and is false.`
    ],
    answer: r`$x=1,y=-1$ gives $0 \neq 2$.`
  }
];

const longGenerators = [
  {
    id: 'disproof-long-counterexample',
    title: 'Counterexample to a prime conjecture',
    make(rng, level) {
      const k = pick(rng, [5, 7, 11, 13, 17]);
      return longQ(
        unitId,
        'disproof-long-counterexample',
        rng,
        r`Prove or disprove the conjecture: for every $n \in \mathbb{Z}$, the integer $n^2-n+${k}$ is prime. [8 marks]`,
        [
          r`The conjecture is false.`,
          r`Take the counterexample $n=${k}$ (which lies in $\mathbb{Z}$).`,
          r`Then $n^2-n+${k}=${k}^2-${k}+${k}=${k ** 2}$.`,
          r`But ${k ** 2}=${k} \cdot ${k}$ is not prime, since it has a divisor other than $1$ and itself.`,
          r`Therefore the universal statement is false.`
        ],
        [
          { point: 'states the correct verdict (false)', marks: 2 },
          { point: 'gives a valid counterexample in the domain', marks: 2 },
          { point: 'computes the value correctly', marks: 2 },
          { point: 'explains why the value is not prime', marks: 2 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'disproof-long-set-identity',
    title: 'Counterexample to a set identity',
    make(rng, level) {
      return longQ(
        unitId,
        'disproof-long-set-identity',
        rng,
        r`Prove or disprove: for all sets $A,B,C$, $A-(B \cap C)=(A-B) \cap (A-C)$. [10 marks]`,
        [
          r`The statement is false.`,
          r`Take $A=\{1,2\}$, $B=\{1\}$ and $C=\{2\}$.`,
          r`Then $B \cap C=\varnothing$, so $A-(B \cap C)=\{1,2\}- \varnothing=\{1,2\}$.`,
          r`But $A-B=\{2\}$ and $A-C=\{1\}$, so $(A-B) \cap (A-C)=\{2\} \cap \{1\}=\varnothing$.`,
          r`Since $\{1,2\} \neq \varnothing$, the claimed identity fails for this choice.`,
          r`A single counterexample is enough to disprove a universal statement.`
        ],
        [
          { point: 'states the correct verdict (false)', marks: 2 },
          { point: 'chooses concrete sets', marks: 2 },
          { point: 'computes the left-hand side correctly', marks: 2 },
          { point: 'computes the right-hand side correctly', marks: 2 },
          { point: 'compares the two sides and concludes', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'disproof-long-existence',
    title: 'Disproving an existence statement',
    make(rng, level) {
      return longQ(
        unitId,
        'disproof-long-existence',
        rng,
        r`Disprove: there is a real number $x$ such that $x^4<x<x^2$. [10 marks]`,
        [
          r`Suppose, for contradiction, that such a real number $x$ exists.`,
          r`Since $0 \leq x^4<x$, we must have $x>0$.`,
          r`From $x^4<x$, divide by $x>0$: $x^3<1$, so $x<1$.`,
          r`From $x<x^2$, divide by $x>0$: $1<x$, so $x>1$.`,
          r`The conclusions $x<1$ and $x>1$ contradict each other.`,
          r`Therefore no real number satisfies $x^4<x<x^2$.`
        ],
        [
          { point: 'sets up a contradiction proof', marks: 2 },
          { point: 'deduces x > 0 correctly', marks: 2 },
          { point: 'deduces x < 1 from x^4 < x', marks: 2 },
          { point: 'deduces x > 1 from x < x^2', marks: 2 },
          { point: 'states the contradiction and conclusion', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'disproof-long-absolute',
    title: 'Disproof by contradiction',
    make(rng, level) {
      return longQ(
        unitId,
        'disproof-long-absolute',
        rng,
        r`Disprove: if $x,y \in \mathbb{R}$, then $|x+y|=|x|+|y|$. [8 marks]`,
        [
          r`Suppose the statement is true for all real numbers $x,y$.`,
          r`Then it must hold in particular for $x=1$ and $y=-1$.`,
          r`But $|1+(-1)|=|0|=0$, while $|1|+|-1|=1+1=2$.`,
          r`Since $0 \neq 2$, the universal statement is false.`,
          r`Therefore the original claim is disproved.`
        ],
        [
          { point: 'assumes the statement is true and chooses a test case', marks: 2 },
          { point: 'computes the left-hand side correctly', marks: 1 },
          { point: 'computes the right-hand side correctly', marks: 1 },
          { point: 'identifies the contradiction and states the disproof', marks: 4 }
        ],
        8,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'disproof-obj-negate-forall',
    title: 'Negating a universal statement',
    make(rng, level) {
      return mcqQ(
        unitId,
        'disproof-obj-negate-forall',
        rng,
        r`What is the negation of $\forall x \in S,\ P(x)$?`,
        r`$\exists x \in S,\ \sim P(x)$`,
        [r`$\forall x \in S,\ \sim P(x)$`, r`$\exists x \in S,\ P(x)$`, r`$\sim P(x)$`],
        [r`Negating "for all" gives "there exists at least one" with the inside statement negated.`],
        2,
        level
      );
    }
  },
  {
    id: 'disproof-obj-negate-exists',
    title: 'Negating an existential statement',
    make(rng, level) {
      return mcqQ(
        unitId,
        'disproof-obj-negate-exists',
        rng,
        r`What is the negation of $\exists x \in S,\ P(x)$?`,
        r`$\forall x \in S,\ \sim P(x)$`,
        [r`$\exists x \in S,\ \sim P(x)$`, r`$\forall x \in S,\ P(x)$`, r`$\sim P(x)$`],
        [r`Negating "there exists" gives "for every" with the inside statement negated.`],
        2,
        level
      );
    }
  },
  {
    id: 'disproof-obj-counterexample',
    title: 'Counterexample fact',
    make(rng, level) {
      return tfQ(
        unitId,
        'disproof-obj-counterexample',
        rng,
        r`Is one counterexample enough to disprove a universal statement?`,
        true,
        [r`A universal statement claims every element satisfies the property; one failure makes it false.`],
        2,
        level
      );
    }
  },
  {
    id: 'disproof-obj-find',
    title: 'Find a counterexample',
    make(rng, level) {
      const k = pick(rng, [2, 3, 4, 5, 6]);
      return shortQ(
        unitId,
        'disproof-obj-find',
        rng,
        r`The statement "every integer is a multiple of $${k}$" is false. Give a positive integer counterexample.`,
        String(k + 1),
        [String(k + 1)],
        [r`$${k + 1}$ is not a multiple of $${k}$; if $${k + 1}=${k}a$ for an integer $a$, then $1=${k}(a-1)$, impossible for integer $a$ unless $${k}=1$.`],
        2,
        level
      );
    }
  },
  {
    id: 'disproof-obj-conditional',
    title: 'Disproving a conditional',
    make(rng, level) {
      return mcqQ(
        unitId,
        'disproof-obj-conditional',
        rng,
        r`What must you exhibit to disprove "If $P$, then $Q$"?`,
        r`An example where $P$ is true and $Q$ is false`,
        [r`An example where $P$ is false and $Q$ is true`, r`An example where both are false`, r`Two examples where $P$ is false`],
        [r`$\sim(P \Rightarrow Q) \equiv P \land \sim Q$, so the counterexample must satisfy the hypothesis but fail the conclusion.`],
        2,
        level
      );
    }
  },
  {
    id: 'disproof-obj-strategy',
    title: 'Disproof strategy',
    make(rng, level) {
      return tfQ(
        unitId,
        'disproof-obj-strategy',
        rng,
        r`Is "I could not find a counterexample" a valid disproof of a universal statement?`,
        false,
        [r`Failing to find a counterexample proves nothing; a disproof must exhibit one or produce a general argument.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 8,
  title: 'Disproof',
  titleZh: '反证与举反例',
  summary: '举反例、反证存在句、反证条件句与矛盾法',
  notes,
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
