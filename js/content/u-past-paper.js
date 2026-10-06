const r = String.raw;

export const pastPaper2024 = {
  id: 'past-2024',
  title: '2024-25 Mid-term Test (50 marks)',
  intro: 'The Education University of Hong Kong — MTH2168 Introduction to Sets, Logic and Discrete Mathematics (2024-25). Time allowed: 1 hour. Full mark: 50.',
  questions: [
    {
      id: 'past2024-q1',
      unitId: 'sets',
      familyId: 'past2024-q1',
      kind: 'proof',
      difficulty: 2,
      marks: 12,
      choices: null,
      answer: null,
      accept: [],
      prompt: r`Given $A=\{a,b,c\}$, $B=\{b,c,d\}$ and $C=\{a,e\}$, evaluate the following set operations. Show your working.

(a) $A \cup B$ [2 marks]

(b) $(A \cup C)-B$ [2 marks]

(c) $(A \cap B) \times (A \cap C)$ [2 marks]

(d) $|\mathcal{P}(A \cap B)|+|\mathcal{P}(A \cap C)|$ [3 marks]

(e) $\mathcal{P}(A) \cup \mathcal{P}(C)$ [3 marks]`,
      solutionSteps: [
        r`(a) $A \cup B=\{a,b,c,d\}$.`,
        r`(b) $A \cup C=\{a,b,c,e\}$. Removing the elements of $B=\{b,c,d\}$ leaves $\{a,e\}$.`,
        r`(c) $A \cap B=\{b,c\}$ and $A \cap C=\{a\}$, so $(A \cap B) \times (A \cap C)=\{(b,a),(c,a)\}$.`,
        r`(d) $|\mathcal{P}(\{b,c\})|=2^2=4$ and $|\mathcal{P}(\{a\})|=2^1=2$, so the sum is $6$.`,
        r`(e) $\mathcal{P}(A)=\{\varnothing,\{a\},\{b\},\{c\},\{a,b\},\{a,c\},\{b,c\},\{a,b,c\}\}$ and $\mathcal{P}(C)=\{\varnothing,\{a\},\{e\},\{a,e\}\}$. Their union is $\{\varnothing,\{a\},\{b\},\{c\},\{e\},\{a,b\},\{a,c\},\{b,c\},\{a,e\},\{a,b,c\}\}$.`
      ],
      rubric: [
        { point: '(a) correct union', marks: 2 },
        { point: '(b) correct difference', marks: 2 },
        { point: '(c) correct intersections and Cartesian product', marks: 2 },
        { point: '(d) correct power-set cardinalities and sum', marks: 3 },
        { point: '(e) complete union of power sets', marks: 3 }
      ]
    },
    {
      id: 'past2024-q2',
      unitId: 'logic',
      familyId: 'past2024-q2',
      kind: 'proof',
      difficulty: 2,
      marks: 10,
      choices: null,
      answer: null,
      accept: [],
      prompt: r`(a) Complete the following truth table, where $P$ and $Q$ are logical statements. [8 marks]

$$\begin{array}{cc|c|c|c|c} P & Q & \sim Q & P \Rightarrow Q & P \lor \sim Q & P \land (P \lor \sim Q) \\ \hline T & T & ? & ? & ? & ? \\ T & F & ? & ? & ? & ? \\ F & T & ? & ? & ? & ? \\ F & F & ? & ? & ? & ? \end{array}$$

(b) Is $P \Rightarrow Q$ logically equivalent to $P \land (P \lor \sim Q)$? Explain your answer briefly. [2 marks]`,
      solutionSteps: [
        r`(a) $\sim Q$ is F, T, F, T.`,
        r`$P \Rightarrow Q$ is T, F, T, T.`,
        r`$P \lor \sim Q$ is T, T, F, T.`,
        r`$P \land (P \lor \sim Q)$ is T, T, F, F.`,
        r`(b) No. In the second row, $P \Rightarrow Q$ is false while $P \land (P \lor \sim Q)$ is true. Since the truth values differ, the statements are not logically equivalent.`
      ],
      rubric: [
        { point: '(a) all four rows of the helper columns correct', marks: 6 },
        { point: '(a) final column correct', marks: 2 },
        { point: '(b) correct answer No', marks: 1 },
        { point: '(b) identifies a row where the truth values differ', marks: 1 }
      ]
    },
    {
      id: 'past2024-q3',
      unitId: 'contrapositive',
      familyId: 'past2024-q3',
      kind: 'proof',
      difficulty: 2,
      marks: 8,
      choices: null,
      answer: null,
      accept: [],
      prompt: r`Give a contrapositive proof for the following statement: "If $m^2+12$ is odd, then $m$ is odd, where $m$ is an integer." [8 marks]`,
      solutionSteps: [
        r`The contrapositive is: if $m$ is even, then $m^2+12$ is even.`,
        r`Suppose $m$ is even, so $m=2a$ for some $a \in \mathbb{Z}$.`,
        r`Then $m^2+12=(2a)^2+12=4a^2+12=2(2a^2+6)$.`,
        r`Since $2a^2+6 \in \mathbb{Z}$, the number $m^2+12$ is even.`,
        r`Therefore, if $m^2+12$ is odd, then $m$ is odd.`
      ],
      rubric: [
        { point: 'states the contrapositive correctly', marks: 2 },
        { point: 'assumes m is even and writes m = 2a', marks: 2 },
        { point: 'correct expansion', marks: 2 },
        { point: 'identifies the expression as even and concludes', marks: 2 }
      ]
    },
    {
      id: 'past2024-q4',
      unitId: 'direct-proof',
      familyId: 'past2024-q4',
      kind: 'proof',
      difficulty: 2,
      marks: 8,
      choices: null,
      answer: null,
      accept: [],
      prompt: r`Give a direct proof for the following statement: "If $a$ is an integer, then $(a-2)^3 \equiv a^3-8 \pmod 6$." [8 marks]`,
      solutionSteps: [
        r`Compute the difference: $(a-2)^3-(a^3-8)$.`,
        r`Expand: $(a-2)^3=a^3-6a^2+12a-8$.`,
        r`Subtract $a^3-8$: the difference is $a^3-6a^2+12a-8-a^3+8=-6a^2+12a$.`,
        r`Factor: $-6a^2+12a=6(2a-a^2)$.`,
        r`Since $2a-a^2 \in \mathbb{Z}$, the difference is divisible by $6$.`,
        r`Therefore $(a-2)^3 \equiv a^3-8 \pmod 6$.`
      ],
      rubric: [
        { point: 'sets up the difference of the two expressions', marks: 2 },
        { point: 'correct expansion', marks: 2 },
        { point: 'correct simplification', marks: 2 },
        { point: 'factors out 6 and concludes the congruence', marks: 2 }
      ]
    },
    {
      id: 'past2024-q5',
      unitId: 'contradiction',
      familyId: 'past2024-q5',
      kind: 'proof',
      difficulty: 3,
      marks: 12,
      choices: null,
      answer: null,
      accept: [],
      prompt: r`Prove the following statement by contradiction: "If $a,b$ are integers, then $a^2+8b-14 \neq 0$." [12 marks]`,
      solutionSteps: [
        r`Suppose, for contradiction, that $a^2+8b-14=0$ for some $a,b \in \mathbb{Z}$.`,
        r`Case 1: $a$ is even, say $a=2x$. Then $(2x)^2+8b-14=0$, so $4x^2+8b=14$ and hence $2x^2+4b=7$.`,
        r`Thus $2(x^2+2b)=7$, which says $2 \mid 7$, a contradiction.`,
        r`Case 2: $a$ is odd, say $a=2x+1$. Then $(2x+1)^2+8b-14=0$, so $4x^2+4x+1+8b=14$.`,
        r`Thus $4x^2+4x+8b=13$, so $4(x^2+x+2b)=13$, which says $4 \mid 13$, a contradiction.`,
        r`Both cases are impossible, so $a^2+8b-14 \neq 0$ for all integers $a,b$.`
      ],
      rubric: [
        { point: 'correct contradiction assumption', marks: 2 },
        { point: 'even case algebra correct', marks: 3 },
        { point: 'even case identifies 2 divides 7 contradiction', marks: 2 },
        { point: 'odd case algebra correct', marks: 3 },
        { point: 'odd case identifies 4 divides 13 contradiction', marks: 1 },
        { point: 'concludes the original statement', marks: 1 }
      ]
    }
  ]
};
