import { randInt, pick, shuffle } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'logic';
const r = String.raw;

function truthRow(vars, values) {
  return vars.map((name) => (values[name] ? 'T' : 'F')).join(' & ');
}

function tableLatex(vars, columns) {
  const header = [...vars, ...columns.map((c) => c.label)].join(' & ');
  const rows = [];
  const total = 2 ** vars.length;
  for (let i = 0; i < total; i += 1) {
    const values = {};
    vars.forEach((name, index) => {
      values[name] = Boolean(i & (1 << (vars.length - 1 - index)));
    });
    const cells = [truthRow(vars, values), ...columns.map((c) => (c.fn(values) ? 'T' : 'F'))];
    rows.push(cells.join(' & '));
  }
  const align = ['c'.repeat(vars.length), ...columns.map(() => 'c')].join('|');
  return r`\begin{array}{${align}} ${header} \\ \hline ${rows.join(r` \\ `)} \end{array}`;
}

function blankTableLatex(vars, columns) {
  const header = [...vars, ...columns.map((c) => c.label)].join(' & ');
  const rows = [];
  const total = 2 ** vars.length;
  for (let i = 0; i < total; i += 1) {
    const values = {};
    vars.forEach((name, index) => {
      values[name] = Boolean(i & (1 << (vars.length - 1 - index)));
    });
    rows.push([truthRow(vars, values), ...columns.map(() => '?')].join(' & '));
  }
  const align = ['c'.repeat(vars.length), ...columns.map(() => 'c')].join('|');
  return r`\begin{array}{${align}} ${header} \\ \hline ${rows.join(r` \\ `)} \end{array}`;
}

function pushIf(arr, value, condition) {
  if (condition) arr.push(value);
}

const notes = [
  {
    heading: '命题与开语句 | Statements and open sentences',
    body: [
      r`A **statement** is a sentence or mathematical expression that is definitely true or definitely false.`,
      r`Commands, questions and expressions without a truth value are not statements: "Get out.", "How old are you?", $\pi r^2$.`,
      r`An **open sentence** contains one or more variables, so its truth value depends on the values chosen, for example $Q(x,y): x^2+y^2>10$.`
    ]
  },
  {
    heading: '与、或、非 | And, or, not',
    body: [
      r`The **conjunction** $P \land Q$ is true only when both $P$ and $Q$ are true.`,
      r`The **disjunction** $P \lor Q$ is false only when both $P$ and $Q$ are false. In mathematics, "or" is inclusive unless stated otherwise.`,
      r`The **negation** $\sim P$ reverses the truth value of $P$.`,
      r`Exclusive or is written $P \oplus Q$ or $(P \lor Q) \land \sim(P \land Q)$: true when exactly one of $P,Q$ is true.`
    ]
  },
  {
    heading: '条件命题 | Conditional statements',
    body: [
      r`$P \Rightarrow Q$ means "if $P$, then $Q$". It is false only when $P$ is true and $Q$ is false.`,
      r`The **promise test**: a conditional is a promise; it is broken only when the condition happens and the result does not.`,
      r`$P$ is a **sufficient condition** for $Q$, and $Q$ is a **necessary condition** for $P$.`
    ]
  },
  {
    heading: '逆、否、逆否 | Converse, inverse, contrapositive',
    body: [
      r`Statement: $P \Rightarrow Q$. Converse: $Q \Rightarrow P$. Inverse: $\sim P \Rightarrow \sim Q$. Contrapositive: $\sim Q \Rightarrow \sim P$.`,
      r`The contrapositive is logically equivalent to the original conditional: $P \Rightarrow Q \equiv \sim Q \Rightarrow \sim P$.`,
      r`The converse and inverse are equivalent to each other, but neither is equivalent to the original conditional in general.`
    ]
  },
  {
    heading: '双条件命题 | Biconditional',
    body: [
      r`$P \Leftrightarrow Q$ means "$P$ if and only if $Q$", and is defined by $(P \Rightarrow Q) \land (Q \Rightarrow P)$.`,
      r`It is true exactly when $P$ and $Q$ have the same truth value.`
    ]
  },
  {
    heading: '真值表 | Truth tables',
    body: [
      r`A truth table lists every possible combination of truth values of the component statements and computes the compound statement.`,
      r`With $n$ component statements there are $2^n$ rows. Helper columns can be added for intermediate expressions.`,
      r`Two statements are **logically equivalent**, written $S \equiv T$, when their truth values match in every row.`
    ]
  },
  {
    heading: "德摩根律 | De Morgan's laws",
    body: [
      r`$\sim(P \land Q) \equiv \sim P \lor \sim Q$: "not both" means at least one is false.`,
      r`$\sim(P \lor Q) \equiv \sim P \land \sim Q$: "neither" means both are false.`,
      r`Negation moves inside the bracket and swaps $\land$ with $\lor$.`
    ]
  },
  {
    heading: '运算优先级 | Operator precedence',
    body: [
      r`Precedence from highest to lowest: $\sim$, then $\land$ and $\lor$, then $\Rightarrow$ and $\Leftrightarrow$.`,
      r`Parentheses are essential when mixing $\land$ with $\lor$, or $\Rightarrow$ with $\Leftrightarrow$.`,
      r`For example $\sim P \land Q$ means $(\sim P) \land Q$, not $\sim(P \land Q)$.`
    ]
  },
  {
    heading: '量词 | Quantifiers',
    body: [
      r`$\forall$ is the **universal quantifier**: "for every", "for all". $\exists$ is the **existential quantifier**: "there exists", "for some".`,
      r`Order matters: $\forall x \in X,\ \exists y \in Y,\ P(x,y)$ means every $x$ has some possibly different $y$.`,
      r`$\exists y \in Y,\ \forall x \in X,\ P(x,y)$ means one fixed $y$ works for every $x$. These are different statements.`
    ]
  },
  {
    heading: '否定量词与条件句 | Negating quantifiers and conditionals',
    body: [
      r`$\sim(\forall x \in S,\ P(x)) \equiv \exists x \in S,\ \sim P(x)$.`,
      r`$\sim(\exists x \in S,\ P(x)) \equiv \forall x \in S,\ \sim P(x)$.`,
      r`$\sim(P \Rightarrow Q) \equiv P \land \sim Q$: the only way a conditional fails is that the condition holds but the conclusion fails.`,
      r`For a variable statement, negate the whole quantified statement: $\sim(\forall x,\ P(x) \Rightarrow Q(x)) \equiv \exists x,\ P(x) \land \sim Q(x)$.`
    ]
  },
  {
    heading: '逻辑推理 | Logical inference',
    body: [
      r`Modus ponens: from $P \Rightarrow Q$ and $P$, infer $Q$.`,
      r`Modus tollens: from $P \Rightarrow Q$ and $\sim Q$, infer $\sim P$.`,
      r`Disjunctive syllogism: from $P \lor Q$ and $\sim P$, infer $Q$.`,
      r`Simplification: from $P \land Q$, infer $P$. Addition: from $P$, infer $P \lor Q$.`
    ]
  },
  {
    heading: '英文转符号 | Translating English to symbols',
    body: [
      r`"Every even integer greater than 2 is the sum of two primes" becomes $\forall n \in S,\ \exists p,q \in P,\ n=p+q$, where $S$ is the set of even integers greater than 2 and $P$ is the set of primes.`,
      r`$\forall x \in X,\ Q(x)$ and $x \in X \Rightarrow Q(x)$ mean the same thing.`
    ]
  }
];

const methods = [
  {
    name: 'Build a truth table',
    when: 'The question asks to complete a truth table, test equivalence, or classify a compound statement.',
    steps: [
      r`List all $2^n$ combinations of truth values for the component statements.`,
      r`Add helper columns for negations and brackets, working from the inside out.`,
      r`Compute the final column using the truth table for $\land$, $\lor$, $\Rightarrow$ or $\Leftrightarrow$.`,
      r`Compare final columns line by line to decide logical equivalence.`
    ],
    watch: r`A conditional is false only in the row where the antecedent is T and the consequent is F.`
  },
  {
    name: 'Negate a statement',
    when: 'The question asks for the negation in symbols and/or in words.',
    steps: [
      r`Replace $\forall$ with $\exists$ (and $\exists$ with $\forall$).`,
      r`Negate the inside statement.`,
      r`Use De Morgan's laws for $\land$ and $\lor$.`,
      r`Replace $\sim(P \Rightarrow Q)$ by $P \land \sim Q$.`,
      r`Translate the symbolic negation back into a clear English sentence.`
    ],
    watch: r`Do not simply put "not" at the front; push the negation through the quantifiers and connectives.`
  },
  {
    name: 'Analyse a conditional',
    when: 'The question asks for the converse, inverse or contrapositive, or asks whether a conditional is true.',
    steps: [
      r`Label the antecedent $P$ and the consequent $Q$.`,
      r`Write the three related statements using the definitions.`,
      r`To prove false, give one example with $P$ true and $Q$ false.`,
      r`Remember the original and the contrapositive share the same truth value.`
    ],
    watch: r`The converse is not equivalent to the original statement.`
  }
];

const examples = [
  {
    title: 'Truth table for exclusive or',
    prompt: r`Construct the truth table for $(P \lor Q) \land \sim(P \land Q)$.`,
    steps: [
      r`Rows: $(T,T),(T,F),(F,T),(F,F)$.`,
      r`Helper columns: $P \lor Q$ is T,T,T,F; $P \land Q$ is T,F,F,F; $\sim(P \land Q)$ is F,T,T,T.`,
      r`Combining with $\land$: the final column is F,T,T,F.`,
      r`The statement is true exactly when exactly one of $P,Q$ is true, so it represents exclusive or.`
    ],
    answer: r`The final column is $F,T,T,F$.`
  },
  {
    title: 'Biconditional truth table',
    prompt: r`Show that $xy=0$ is equivalent to $x=0 \lor y=0$.`,
    steps: [
      r`Let $P: xy=0$, $Q: x=0$ and $R: y=0$. The statement is $P \Leftrightarrow (Q \lor R)$.`,
      r`The expression $Q \lor R$ is false only when both $x \neq 0$ and $y \neq 0$; in that row $xy \neq 0$ as well.`,
      r`In every other row at least one of $x,y$ is 0, so $xy=0$ is true.`,
      r`The two sides agree in all $8$ rows, so they are logically equivalent.`
    ],
    answer: r`$P \Leftrightarrow (Q \lor R)$ is a true mathematical statement.`
  },
  {
    title: 'Negating a nested quantifier',
    prompt: r`Negate $S: \forall x \in \mathbb{R},\ \exists y \in \mathbb{R},\ y^3=x$.`,
    steps: [
      r`$\sim S \equiv \exists x \in \mathbb{R},\ \sim(\exists y \in \mathbb{R},\ y^3=x)$.`,
      r`$\equiv \exists x \in \mathbb{R},\ \forall y \in \mathbb{R},\ \sim(y^3=x)$.`,
      r`$\equiv \exists x \in \mathbb{R},\ \forall y \in \mathbb{R},\ y^3 \neq x$.`,
      r`In words: there is a real number $x$ such that $y^3 \neq x$ for every real number $y$.`
    ],
    answer: r`$\exists x \in \mathbb{R},\ \forall y \in \mathbb{R},\ y^3 \neq x$.`
  },
  {
    title: 'Negating a conditional statement',
    prompt: r`Negate $R: \forall x \in \mathbb{Z},\ (x \text{ is odd} \Rightarrow x^2 \text{ is odd})$.`,
    steps: [
      r`$\sim R \equiv \exists x \in \mathbb{Z},\ \sim(x \text{ is odd} \Rightarrow x^2 \text{ is odd})$.`,
      r`Use $\sim(P \Rightarrow Q) \equiv P \land \sim Q$.`,
      r`So $\sim R \equiv \exists x \in \mathbb{Z},\ (x \text{ is odd} \land x^2 \text{ is not odd})$.`,
      r`In words: there is an odd integer whose square is not odd.`
    ],
    answer: r`There exists an odd integer $x$ such that $x^2$ is even.`
  },
  {
    title: 'Past-paper style truth table and equivalence check',
    prompt: r`(a) Complete the truth table with columns $P$, $Q$, $\sim Q$, $P \Rightarrow Q$, $P \lor \sim Q$ and $P \land (P \lor \sim Q)$. (b) Is $P \Rightarrow Q$ logically equivalent to $P \land (P \lor \sim Q)$? Explain briefly.`,
    steps: [
      r`(a) $\sim Q$ is F,T,F,T.`,
      r`$P \Rightarrow Q$ is T,F,T,T.`,
      r`$P \lor \sim Q$ is T,T,F,T.`,
      r`$P \land (P \lor \sim Q)$ is T,T,F,F.`,
      r`(b) Compare the columns: in the second row $P \Rightarrow Q$ is F while $P \land (P \lor \sim Q)$ is T.`,
      r`Since the truth values differ in at least one row, the statements are not logically equivalent.`
    ],
    answer: r`(a) The final column is T,T,F,F. (b) No; the columns differ, for example when $P$ is T and $Q$ is F.`
  }
];

const longGenerators = [
  {
    id: 'logic-long-truth-table',
    title: 'Complete a truth table and test equivalence',
    make(rng, level) {
      const schemas = [
        {
          vars: ['P', 'Q'],
          columns: [
            { label: r`\sim Q`, fn: (v) => !v.Q },
            { label: r`P \Rightarrow Q`, fn: (v) => !v.P || v.Q },
            { label: r`P \lor \sim Q`, fn: (v) => v.P || !v.Q },
            { label: r`P \land (P \lor \sim Q)`, fn: (v) => v.P && (v.P || !v.Q) }
          ],
          question: r`$P \Rightarrow Q$ and $P \land (P \lor \sim Q)$`,
          equivalent: false,
          reason: r`They differ when $P$ is true and $Q$ is false.`
        },
        {
          vars: ['P', 'Q'],
          columns: [
            { label: r`\sim P`, fn: (v) => !v.P },
            { label: r`P \lor Q`, fn: (v) => v.P || v.Q },
            { label: r`\sim P \lor Q`, fn: (v) => !v.P || v.Q },
            { label: r`(P \lor Q) \land \sim P`, fn: (v) => (v.P || v.Q) && !v.P }
          ],
          question: r`$P \Rightarrow Q$ and $\sim P \lor Q$`,
          equivalent: true,
          reason: r`Their final columns are identical: T,F,T,T.`
        },
        {
          vars: ['P', 'Q'],
          columns: [
            { label: r`P \land Q`, fn: (v) => v.P && v.Q },
            { label: r`\sim(P \land Q)`, fn: (v) => !(v.P && v.Q) },
            { label: r`\sim P \lor \sim Q`, fn: (v) => !v.P || !v.Q },
            { label: r`\sim P \land \sim Q`, fn: (v) => !v.P && !v.Q }
          ],
          question: r`$\sim(P \land Q)$ and $\sim P \lor \sim Q$`,
          equivalent: true,
          reason: r`This is De Morgan's law; the columns match in all four rows.`
        },
        {
          vars: ['P', 'Q', 'R'],
          columns: [
            { label: r`Q \lor R`, fn: (v) => v.Q || v.R },
            { label: r`P \Leftrightarrow (Q \lor R)`, fn: (v) => v.P === (v.Q || v.R) },
            { label: r`\sim P \land \sim Q`, fn: (v) => !v.P && !v.Q }
          ],
          question: r`$P \Leftrightarrow (Q \lor R)$ and $\sim P \land \sim Q$`,
          equivalent: false,
          reason: r`They differ in several rows, for example $P=F,Q=F,R=T$.`
        }
      ];
      const schema = level === 1 ? schemas[0] : pick(rng, schemas);
      const table = tableLatex(schema.vars, schema.columns);
      const blank = blankTableLatex(schema.vars, schema.columns);
      return longQ(
        unitId,
        'logic-long-truth-table',
        rng,
        r`(a) Complete the following truth table, using one column per expression.

$$${blank}$$

(b) Decide whether ${schema.question} are logically equivalent, and explain briefly. [10 marks]`,
        [
          r`The completed truth table is: $$${table}$$.`,
          r`(b) ${schema.reason}`
        ],
        [
          { point: 'lists all truth-value rows correctly', marks: 3 },
          { point: 'computes helper columns correctly', marks: 3 },
          { point: 'computes the final column correctly', marks: 2 },
          { point: 'correct equivalence decision with reason', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'logic-long-negation',
    title: 'Negate a quantified statement',
    make(rng, level) {
      const items = [
        {
          statement: r`$\forall x \in \mathbb{R},\ x^2 \ge 0$`,
          negation: r`$\exists x \in \mathbb{R},\ x^2 < 0$`,
          words: r`There exists a real number whose square is negative.`
        },
        {
          statement: r`$\exists x \in \mathbb{Z},\ x^2=2$`,
          negation: r`$\forall x \in \mathbb{Z},\ x^2 \neq 2$`,
          words: r`For every integer $x$, $x^2 \neq 2$.`
        },
        {
          statement: r`$\forall x \in \mathbb{R},\ \exists y \in \mathbb{R},\ y^3=x$`,
          negation: r`$\exists x \in \mathbb{R},\ \forall y \in \mathbb{R},\ y^3 \neq x$`,
          words: r`There is a real number $x$ such that $y^3 \neq x$ for every real number $y$.`
        },
        {
          statement: r`$\forall n \in \mathbb{Z},\ (n \text{ is odd} \Rightarrow n^2 \text{ is odd})$`,
          negation: r`$\exists n \in \mathbb{Z},\ (n \text{ is odd} \land n^2 \text{ is even})$`,
          words: r`There exists an odd integer whose square is even.`
        },
        {
          statement: r`$\exists n \in \mathbb{N},\ (n \text{ is prime} \land n \text{ is even} \land n>2)$`,
          negation: r`$\forall n \in \mathbb{N},\ (n \text{ is not prime} \lor n \text{ is odd} \lor n \leq 2)$`,
          words: r`Every natural number is either not prime, odd, or at most $2$.`
        }
      ];
      const item = pick(rng, items);
      return longQ(
        unitId,
        'logic-long-negation',
        rng,
        r`Write the negation of ${item.statement} (a) in symbols and (b) in words. Do not simply put "not" at the front. [8 marks]`,
        [
          r`(a) ${item.negation}`,
          r`(b) ${item.words}`,
          r`The quantifiers swap, and the inside statement is negated using De Morgan's laws or $\sim(P \Rightarrow Q) \equiv P \land \sim Q$.`
        ],
        [
          { point: 'swaps quantifiers correctly', marks: 2 },
          { point: 'correct symbolic negation', marks: 3 },
          { point: 'correct English meaning', marks: 3 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'logic-long-conditional',
    title: 'Converse, inverse and contrapositive',
    make(rng, level) {
      const items = [
        {
          statement: r`If $n$ is a multiple of $4$, then $n$ is even.`,
          converse: r`If $n$ is even, then $n$ is a multiple of $4$.`,
          inverse: r`If $n$ is not a multiple of $4$, then $n$ is not even.`,
          contrapositive: r`If $n$ is not even, then $n$ is not a multiple of $4$.`,
          truth: r`The original and contrapositive are true. The converse is false: $n=2$ is even but not a multiple of $4$.`
        },
        {
          statement: r`If $x$ is odd, then $x^2$ is odd.`,
          converse: r`If $x^2$ is odd, then $x$ is odd.`,
          inverse: r`If $x$ is even, then $x^2$ is even.`,
          contrapositive: r`If $x^2$ is even, then $x$ is even.`,
          truth: r`All four statements are true for integers, but this still does not make the converse logically equivalent to the original in general.`
        },
        {
          statement: r`If a number is prime, then it is odd.`,
          converse: r`If a number is odd, then it is prime.`,
          inverse: r`If a number is not prime, then it is not odd.`,
          contrapositive: r`If a number is not odd, then it is not prime.`,
          truth: r`The original is false: $2$ is prime and even. The contrapositive is also false, while the converse is false because $9$ is odd but not prime.`
        },
        {
          statement: r`If $a$ and $b$ are both even, then $a+b$ is even.`,
          converse: r`If $a+b$ is even, then $a$ and $b$ are both even.`,
          inverse: r`If $a$ and $b$ are not both even, then $a+b$ is not even.`,
          contrapositive: r`If $a+b$ is not even, then $a$ and $b$ are not both even.`,
          truth: r`The original and contrapositive are true. The converse is false: $a=1,b=3$ gives $a+b=4$ even though both are odd.`
        }
      ];
      const item = pick(rng, items);
      return longQ(
        unitId,
        'logic-long-conditional',
        rng,
        r`Consider the statement: ${item.statement} (a) Write its converse. (b) Write its inverse. (c) Write its contrapositive. (d) State which of these statements are true, giving a counterexample where appropriate. [10 marks]`,
        [
          r`(a) Converse: ${item.converse}`,
          r`(b) Inverse: ${item.inverse}`,
          r`(c) Contrapositive: ${item.contrapositive}`,
          r`(d) ${item.truth}`,
          r`Remember that the original statement and its contrapositive always have the same truth value.`
        ],
        [
          { point: 'correct converse', marks: 2 },
          { point: 'correct inverse', marks: 2 },
          { point: 'correct contrapositive', marks: 2 },
          { point: 'correct truth values with valid justification or counterexample', marks: 4 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'logic-long-inference',
    title: 'Logical inference',
    make(rng, level) {
      const items = [
        {
          premises: r`$P \Rightarrow Q$ and $P$`,
          conclusion: r`$Q$`,
          valid: true,
          rule: 'Modus ponens'
        },
        {
          premises: r`$P \Rightarrow Q$ and $\sim Q$`,
          conclusion: r`$\sim P$`,
          valid: true,
          rule: 'Modus tollens'
        },
        {
          premises: r`$P \lor Q$ and $\sim P$`,
          conclusion: r`$Q$`,
          valid: true,
          rule: 'Disjunctive syllogism'
        },
        {
          premises: r`$P \Rightarrow Q$ and $Q$`,
          conclusion: r`$P$`,
          valid: false,
          rule: 'This is affirming the consequent; it is invalid.'
        },
        {
          premises: r`$P \Rightarrow Q$ and $\sim P$`,
          conclusion: r`$\sim Q$`,
          valid: false,
          rule: 'This is denying the antecedent; it is invalid.'
        }
      ];
      const item = pick(rng, items);
      return longQ(
        unitId,
        'logic-long-inference',
        rng,
        r`Given the true premises ${item.premises}, decide whether the conclusion ${item.conclusion} follows. If it does, name the inference rule; if not, explain why the argument is invalid. [8 marks]`,
        [
          item.valid
            ? r`The argument is valid by ${item.rule}: the premises force the conclusion to be true.`
            : r`The argument is invalid. ${item.rule}`,
          r`Check the relevant truth table: an argument is valid when there is no row in which all premises are true and the conclusion is false.`
        ],
        [
          { point: 'correct validity decision', marks: 3 },
          { point: 'correct rule name or clear explanation of invalidity', marks: 3 },
          { point: 'truth-table or logical justification', marks: 2 }
        ],
        8,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'logic-obj-statement',
    title: 'Statement or not',
    make(rng, level) {
      const correct = r`$2+3=5$`;
      return mcqQ(
        unitId,
        'logic-obj-statement',
        rng,
        r`Which of the following is a statement (a sentence with a definite truth value)?`,
        correct,
        [r`How old are you?`, r`Please turn down the music.`, r`$\pi r^2$`],
        [r`$2+3=5$ is definitely true, so it is a statement. Questions, commands and expressions have no truth value.`],
        2,
        level
      );
    }
  },
  {
    id: 'logic-obj-connective',
    title: 'Truth value of a conjunction',
    make(rng, level) {
      const p = rng() > 0.5;
      const q = rng() > 0.5;
      return tfQ(
        unitId,
        'logic-obj-connective',
        rng,
        r`Suppose $P$ is ${p ? 'true' : 'false'} and $Q$ is ${q ? 'true' : 'false'}. Is $P \land Q$ true or false?`,
        p && q,
        [r`$P \land Q$ is true only when both $P$ and $Q$ are true.`],
        2,
        level
      );
    }
  },
  {
    id: 'logic-obj-negation-conditional',
    title: 'Negation of a conditional',
    make(rng, level) {
      return mcqQ(
        unitId,
        'logic-obj-negation-conditional',
        rng,
        r`Which statement is logically equivalent to $\sim(P \Rightarrow Q)$?`,
        r`$P \land \sim Q$`,
        [r`$\sim P \land Q$`, r`$\sim P \lor Q$`, r`$Q \Rightarrow P$`],
        [r`The only way $P \Rightarrow Q$ fails is when $P$ is true and $Q$ is false, so the negation is $P \land \sim Q$.`],
        2,
        level
      );
    }
  },
  {
    id: 'logic-obj-quantifier-order',
    title: 'Order of quantifiers',
    make(rng, level) {
      return mcqQ(
        unitId,
        'logic-obj-quantifier-order',
        rng,
        r`Which statement says that one fixed $y$ works for every $x$?`,
        r`$\exists y \in Y,\ \forall x \in X,\ P(x,y)$`,
        [r`$\forall x \in X,\ \exists y \in Y,\ P(x,y)$`, r`$\forall y \in Y,\ \exists x \in X,\ P(x,y)$`, r`$\exists x \in X,\ \exists y \in Y,\ P(x,y)$`],
        [r`Writing $\exists y$ first means there is a single $y$ chosen before $x$ varies, so the same $y$ works for all $x$.`],
        2,
        level
      );
    }
  },
  {
    id: 'logic-obj-demorgan',
    title: "De Morgan's law",
    make(rng, level) {
      return mcqQ(
        unitId,
        'logic-obj-demorgan',
        rng,
        r`Which statement is equivalent to $\sim(P \land Q)$?`,
        r`$\sim P \lor \sim Q$`,
        [r`$\sim P \land \sim Q$`, r`$P \lor Q$`, r`$\sim(P \lor Q)$`],
        [r`De Morgan's law: the negation of a conjunction is the disjunction of the negations.`],
        2,
        level
      );
    }
  },
  {
    id: 'logic-obj-contrapositive',
    title: 'Identify the contrapositive',
    make(rng, level) {
      return shortQ(
        unitId,
        'logic-obj-contrapositive',
        rng,
        r`Write the contrapositive of $P \Rightarrow Q$ in symbols.`,
        r`$\sim Q \Rightarrow \sim P$`,
        [r`~Q => ~P`, r`\sim Q \Rightarrow \sim P`],
        [r`The contrapositive reverses the implication and negates both parts: $\sim Q \Rightarrow \sim P$.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 2,
  title: 'Logic',
  titleZh: '逻辑',
  summary: '真值表、逻辑等价、量词、否定与推理',
  notes,
  textbook: {
    source: '教材 Main.pdf §2.1–2.12 Logic',
    sections: [
      {
        heading: '§2.1 命题与开语句 | Statements',
        body: [
          r`**Statement**（命题）是有确定真假值的陈述句；**open sentence** 含变量，需代入具体值后才成为命题，例如 $P(x):x^2>0$。`,
          r`数学中常用 $P,Q,R$ 表示命题，"not" 用 $\sim$ 或 $\neg$；命题的真假与我们知道与否无关。`
        ]
      },
      {
        heading: '§2.2 与、或、非 | And, Or, Not',
        body: [
          r`$P\land Q$ 为真当且仅当两者都真；$P\lor Q$ 为假当且仅当两者都假（这里的 "or" 是 inclusive or，至少一个为真）。`,
          r`$\sim P$ 真值相反；真值表是定义联结词的唯一依据，不要凭语感。`,
          r`层级：先 $\sim$，再 $\land$，最后 $\lor$；必要时加括号，例如 $P\lor Q\land R$ 表示 $P\lor(Q\land R)$。`
        ]
      },
      {
        heading: '§2.3 条件命题 | Conditional Statements',
        body: [
          r`$P\Rightarrow Q$ 只在 $P$ 真 $Q$ 假时为假，其余为真；因此 $F\Rightarrow F$、$F\Rightarrow T$ 都是真命题。`,
          r`等价说法：if $P$ then $Q$；$Q$ if $P$；$P$ only if $Q$；$Q$ whenever $P$；$P$ is sufficient for $Q$；$Q$ is necessary for $P$。`,
          r`$P$ 是 hypothesis（前件/充分条件），$Q$ 是 conclusion（后件/必要条件）；"only if" 提醒你把必要条件方向搞对。`
        ]
      },
      {
        heading: '§2.4–2.5 双条件与真值表 | Biconditional and Truth Tables',
        body: [
          r`$P\Leftrightarrow Q$ 在两者真值相同时为真，即 $(P\Rightarrow Q)\land(Q\Rightarrow P)$。`,
          r`含 $n$ 个变量的真值表有 $2^n$ 行；把每个子公式的列都写出来，最后比较目标列。`,
          r`两列完全相同 $\Rightarrow$ 逻辑等价；恒真称 **tautology**，恒假称 **contradiction**，例如 $P\lor\sim P$ 与 $P\land\sim P$。`
        ]
      },
      {
        heading: '§2.6 逻辑等价 | Logical Equivalence',
        body: [
          r`$P\Rightarrow Q\equiv\sim P\lor Q$；由此得逆否等价 $P\Rightarrow Q\equiv\sim Q\Rightarrow\sim P$。`,
          r`De Morgan：$\sim(P\land Q)\equiv\sim P\lor\sim Q$，$\sim(P\lor Q)\equiv\sim P\land\sim Q$。`,
          r`分配律：$P\land(Q\lor R)\equiv(P\land Q)\lor(P\land R)$，$P\lor(Q\land R)\equiv(P\lor Q)\land(P\lor R)$；$P\Leftrightarrow Q\equiv(P\land Q)\lor(\sim P\land\sim Q)$。`,
          r`条件命题的否定：$\sim(P\Rightarrow Q)\equiv P\land\sim Q$，这是反证与反例的核心。`
        ]
      },
      {
        heading: '§2.7–2.8 量词 | Quantifiers',
        body: [
          r`$\forall x\,P(x)$：对所有 $x$ 成立；$\exists x\,P(x)$：存在至少一个 $x$ 使 $P(x)$ 成立。用 $x\in S$ 限定论域，如 $\forall x\in\mathbb{R},\ x^2\ge 0$。`,
          r`嵌套量词顺序不能换：$\forall x\exists y\,(y>x)$ 在实数上为真，而 $\exists y\forall x\,(y>x)$ 为假。`,
          r`$\exists!$ 表示"存在且唯一"；条件命题是"对所有取值成立"的全称命题，即 $\forall x,(P(x)\Rightarrow Q(x))$。`
        ]
      },
      {
        heading: '§2.9–2.10 翻译与否 | Translating and Negating',
        body: [
          r`否定规则：$\sim(\forall x\,P(x))\equiv\exists x\,\sim P(x)$，$\sim(\exists x\,P(x))\equiv\forall x\,\sim P(x)$。`,
          r`否定时要"逐个翻转"：$\sim(\forall x\exists y\,P(x,y))\equiv\exists x\forall y\,\sim P(x,y)$。`,
          r`英文句式对应：All $P$ are $Q$ $\to$ $\forall x,(P(x)\Rightarrow Q(x))$；Some $P$ are $Q$ $\to$ $\exists x,(P(x)\land Q(x))$；No $P$ is $Q$ $\to$ $\forall x,(P(x)\Rightarrow\sim Q(x))$。`,
          r`"Some" 在逻辑里永远是"至少一个"，不是"某些但非全部"。`
        ]
      },
      {
        heading: '§2.11–2.12 逻辑推理 | Logical Inference',
        body: [
          r`Modus ponens：由 $P$ 与 $P\Rightarrow Q$ 推出 $Q$；Modus tollens：由 $\sim Q$ 与 $P\Rightarrow Q$ 推出 $\sim P$。`,
          r`常见错误：由 $P\Rightarrow Q$ 与 $Q$ 推 $P$（肯定后件）；由 $P\Rightarrow Q$ 与 $\sim P$ 推 $\sim Q$（否定前件）。这两种推理都无效。`,
          r`其他有效式：假言三段论 $P\Rightarrow Q,\ Q\Rightarrow R\vdash P\Rightarrow R$；析取三段论 $P\lor Q,\ \sim P\vdash Q$。`,
          r`$\Rightarrow$ 是命题内部的联结词；$\vdash$ 表示推理关系，两者不要混用。`
        ]
      }
    ]
  },
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
