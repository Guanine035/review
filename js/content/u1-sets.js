import { randInt, pick, shuffle } from '../rng.js';
import {
  cartesian,
  difference,
  intersection,
  latexSet,
  letterSet,
  longQ,
  mcqQ,
  numberSet,
  pairsLatex,
  powerSetInfo,
  powerSetLatex,
  shortQ,
  tfQ,
  union
} from './util.js';

const unitId = 'sets';
const r = String.raw;

function subsetKey(items) {
  return items.slice().sort().join('|');
}

function powerSetUnionLatex(a, b) {
  const map = new Map();
  for (const subset of [...powerSetInfo(a), ...powerSetInfo(b)]) {
    map.set(subsetKey(subset), subset);
  }
  const list = [...map.values()].sort((x, y) => x.length - y.length || x.join(',').localeCompare(y.join(',')));
  return `\\{${list.map((s) => (s.length ? latexSet(s) : '\\varnothing')).join(',')}\\}`;
}

const notes = [
  {
    heading: '集合与元素 | Set and element',
    body: [
      r`A **set** is a collection of objects called its **elements**. We write $x \in A$ when $x$ is an element of $A$, and $x \notin A$ when it is not.`,
      r`Sets are usually named with capital letters and listed with braces, for example $A = \{2,4,6,8\}$. A **finite set** has finitely many elements; an **infinite set** does not.`,
      r`Two sets are equal exactly when they contain the same elements. Order and repetition do not matter: $\{2,4,6,8\} = \{8,6,4,2\}$ and $\{a,b,c\}=\{a,b,b,c,c,c\}$.`
    ]
  },
  {
    heading: '常见数系 | Number systems',
    body: [
      r`$\mathbb{N} = \{1,2,3,\dots\}$ is the set of natural numbers.`,
      r`$\mathbb{Z} = \{\dots,-3,-2,-1,0,1,2,3,\dots\}$ is the set of integers.`,
      r`$\mathbb{Q} = \{x : x = \frac{m}{n},\ m,n \in \mathbb{Z},\ n \neq 0\}$ is the set of rational numbers.`,
      r`$\mathbb{R}$ is the set of real numbers.`
    ]
  },
  {
    heading: '基数与空集 | Cardinality and empty set',
    body: [
      r`The **cardinality** $|X|$ of a finite set $X$ is the number of elements it contains. For $A=\{2,4,6,8\}$, $|A|=4$.`,
      r`The **empty set** is $\varnothing = \{\}$, the set with no elements. It satisfies $|\varnothing|=0$.`
    ]
  },
  {
    heading: '描述法 | Set-builder notation',
    body: [
      r`A set too large to list can be written as $X=\{ \text{expression} : \text{rule} \}$.`,
      r`For example the even integers can be written as $E=\{2n : n \in \mathbb{Z}\}$ or $E=\{n \in \mathbb{Z} : n \text{ is even}\}$.`,
      r`To show $a \in \{x \in S : P(x)\}$, verify both $a \in S$ and that $P(a)$ is true.`
    ]
  },
  {
    heading: '有序对与笛卡尔积 | Ordered pairs and Cartesian product',
    body: [
      r`An **ordered pair** is a list $(x,y)$ where order matters: $(2,4) \neq (4,2)$ unless $x=y$.`,
      r`The **Cartesian product** of $A$ and $B$ is $A \times B = \{(a,b) : a \in A,\ b \in B\}$.`,
      r`If $A$ and $B$ are finite, then $|A \times B| = |A|\,|B|$.`,
      r`An ordered triple is written $(x,y,z)$; an ordered $n$-tuple is $(x_1,x_2,\dots,x_n)$. Cartesian powers are $A^n = A \times A \times \cdots \times A$ ($n$ factors).`
    ]
  },
  {
    heading: '子集 | Subsets',
    body: [
      r`$A$ is a **subset** of $B$, written $A \subseteq B$, if every element of $A$ is also an element of $B$.`,
      r`$A \nsubseteq B$ means there is at least one element of $A$ that is not in $B$.`,
      r`For every set $B$, $\varnothing \subseteq B$.`,
      r`If $|B|=n$, then $B$ has exactly $2^n$ subsets.`
    ]
  },
  {
    heading: '幂集 | Power set',
    body: [
      r`The **power set** of $A$, written $\mathcal{P}(A)$, is the set of all subsets of $A$: $\mathcal{P}(A)=\{X : X \subseteq A\}$.`,
      r`If $A=\{1,2,3\}$, then $\mathcal{P}(A)=\{\varnothing,\{1\},\{2\},\{3\},\{1,2\},\{1,3\},\{2,3\},\{1,2,3\}\}$.`,
      r`If $A$ is finite, then $|\mathcal{P}(A)| = 2^{|A|}$.`,
      r`Notice $\mathcal{P}(A)$ contains sets, not elements: $\{1\} \in \mathcal{P}(A)$, but $1 \notin \mathcal{P}(A)$ if $1$ is not itself a subset.`
    ]
  },
  {
    heading: '并、交、差与补 | Union, intersection, difference, complement',
    body: [
      r`$A \cup B = \{x : x \in A \text{ or } x \in B\}$ is the **union**.`,
      r`$A \cap B = \{x : x \in A \text{ and } x \in B\}$ is the **intersection**.`,
      r`$A - B = \{x : x \in A \text{ and } x \notin B\}$ is the **difference**. In general $A-B \neq B-A$.`,
      r`If $A \subseteq U$, then $U$ is a **universal set** for $A$, and the **complement** of $A$ is $\overline{A} = U - A$.`
    ]
  },
  {
    heading: '索引集 | Indexed sets',
    body: [
      r`If sets are labelled $A_1,A_2,\dots,A_n$, then the index set is $I=\{1,2,\dots,n\}$.`,
      r`$\bigcup_{i=1}^{n} A_i = \{x : x \in A_i \text{ for at least one } i\}$ and $\bigcap_{i=1}^{n} A_i = \{x : x \in A_i \text{ for every } i\}$.`,
      r`The same notation extends to infinite index sets such as $I=\mathbb{N}$: $\bigcup_{i \in I} A_i$ and $\bigcap_{i \in I} A_i$.`
    ]
  },
  {
    heading: '高频易错点 | Common pitfalls',
    body: [
      r`$\subseteq$ compares sets; $\in$ compares an element with a set. Both $\{1\} \subseteq \{1,2\}$ and $1 \in \{1,2\}$ are true, but $1 \subseteq \{1,2\}$ is not a valid set statement.`,
      r`$\varnothing$ and $\{\varnothing\}$ are different: the first has no elements, the second has one element.`,
      r`When listing $\mathcal{P}(A)$, include $\varnothing$ and $A$ itself, and list systematically by subset size to avoid missing one.`,
      r`In $A \times B$, order matters, and repeated pairs are not allowed.`
    ]
  }
];

const methods = [
  {
    name: 'Evaluate a set expression',
    when: r`Questions such as $A \cup B$, $(A \cup C)-B$, $A \cap B$ or $\mathcal{P}(A)$ in a multi-part question.`,
    steps: [
      r`Rewrite each given set clearly.`,
      r`Process brackets first, then $\cup$, $\cap$, $-$.`,
      r`Write the result in roster notation, with no repeated elements.`,
      r`For cardinality or power-set parts, use $|A \cap B|$ and $|\mathcal{P}(X)|=2^{|X|}$ rather than listing every subset unless asked.`
    ],
    watch: r`Do not confuse $A-B$ with $B-A$, and do not forget $\varnothing$ when listing a power set.`
  },
  {
    name: 'List a power set systematically',
    when: r`The question asks for all elements of $\mathcal{P}(A)$.`,
    steps: [
      r`List the subsets with $0$ elements: $\varnothing$.`,
      r`List all subsets with $1$ element, then $2$ elements, and continue until $A$ itself.`,
      r`Check the count: a set with $n$ elements has $2^n$ subsets.`,
      r`Present the final answer inside one pair of outer braces.`
    ],
    watch: r`A subset is a set, so singletons need braces: write $\{a\}$, not $a$.`
  },
  {
    name: 'Compute a Cartesian product',
    when: r`The question asks for $A \times B$, its cardinality, or membership of a pair.`,
    steps: [
      r`Fix each element of $A$ in turn.`,
      r`Pair it with every element of $B$ in order.`,
      r`Collect the pairs as a set of ordered pairs.`,
      r`Check the count with $|A \times B| = |A|\,|B|$.`
    ],
    watch: r`$(a,b)$ and $(b,a)$ are different unless $a=b$.`
  }
];

const examples = [
  {
    title: 'Evaluate basic set operations',
    prompt: r`Let $A=\{1,2\}$, $B=\{2,3,4\}$ and $C=\{4\}$. Find $A \cup B$, $A \cap B$, $A-B$ and $B-A$.`,
    steps: [
      r`Union collects every element in either set: $A \cup B = \{1,2,3,4\}$.`,
      r`Intersection keeps elements in both sets: $A \cap B = \{2\}$.`,
      r`Difference $A-B$ keeps elements of $A$ that are not in $B$: $A-B=\{1\}$.`,
      r`Reversing the order changes the answer: $B-A=\{3,4\}$.`
    ],
    answer: r`$A \cup B=\{1,2,3,4\}$, $A \cap B=\{2\}$, $A-B=\{1\}$, $B-A=\{3,4\}$.`
  },
  {
    title: 'List a power set and its cardinality',
    prompt: r`Let $A=\{1,2,3\}$. List all elements of $\mathcal{P}(A)$ and state $|\mathcal{P}(A)|$.`,
    steps: [
      r`Subsets with no elements: $\varnothing$.`,
      r`Subsets with one element: $\{1\},\{2\},\{3\}$.`,
      r`Subsets with two elements: $\{1,2\},\{1,3\},\{2,3\}$.`,
      r`Subset with three elements: $A=\{1,2,3\}$.`,
      r`Therefore $\mathcal{P}(A)=\{\varnothing,\{1\},\{2\},\{3\},\{1,2\},\{1,3\},\{2,3\},A\}$ and $|\mathcal{P}(A)|=2^3=8$.`
    ],
    answer: r`$\mathcal{P}(A)$ has $8$ elements; the list is above.`
  },
  {
    title: 'Cartesian product',
    prompt: r`Let $A=\{1,2,3\}$ and $B=\{a,b\}$. Find $A \times B$ and $|A \times B|$.`,
    steps: [
      r`Pair $1$ with $a,b$: $(1,a),(1,b)$.`,
      r`Pair $2$ with $a,b$: $(2,a),(2,b)$.`,
      r`Pair $3$ with $a,b$: $(3,a),(3,b)$.`,
      r`Hence $A \times B=\{(1,a),(1,b),(2,a),(2,b),(3,a),(3,b)\}$.`,
      r`Check: $|A \times B|=|A|\,|B|=3 \cdot 2=6$.`
    ],
    answer: r`$A \times B$ has the six ordered pairs listed above.`
  },
  {
    title: 'Past-paper style multi-part set question',
    prompt: r`Given $A=\{a,b,c\}$, $B=\{b,c,d\}$ and $C=\{a,e\}$, evaluate (a) $A \cup B$; (b) $(A \cup C)-B$; (c) $(A \cap B) \times (A \cap C)$; (d) $|\mathcal{P}(A \cap B)|+|\mathcal{P}(A \cap C)|$; (e) $\mathcal{P}(A) \cup \mathcal{P}(C)$.`,
    steps: [
      r`(a) $A \cup B=\{a,b,c,d\}$.`,
      r`(b) $A \cup C=\{a,b,c,e\}$, so removing elements of $B=\{b,c,d\}$ gives $\{a,e\}$.`,
      r`(c) $A \cap B=\{b,c\}$ and $A \cap C=\{a\}$, so the product is $\{(b,a),(c,a)\}$.`,
      r`(d) $|\mathcal{P}(\{b,c\})|=2^2=4$ and $|\mathcal{P}(\{a\})|=2^1=2$, so the sum is $6$.`,
      r`(e) $\mathcal{P}(A)=\{\varnothing,\{a\},\{b\},\{c\},\{a,b\},\{a,c\},\{b,c\},\{a,b,c\}\}$ and $\mathcal{P}(C)=\{\varnothing,\{a\},\{e\},\{a,e\}\}$. Their union is $\{\varnothing,\{a\},\{b\},\{c\},\{e\},\{a,b\},\{a,c\},\{b,c\},\{a,e\},\{a,b,c\}\}$.`
    ],
    answer: r`The five answers are listed in the steps.`
  }
];

const longGenerators = [
  {
    id: 'sets-long-multipart',
    title: 'Multi-part set operations',
    make(rng, level) {
      const pool = shuffle(rng, ['a', 'b', 'c', 'd', 'e', 'f']);
      const A = pool.slice(0, 3).sort();
      const B = [pool[1], pool[2], pool[3]].sort();
      const C = [pool[0], pool[4]].sort();
      const ab = union(A, B);
      const ac = union(A, C);
      const bc = difference(ac, B);
      const aintb = intersection(A, B);
      const aintc = intersection(A, C);
      const product = cartesian(aintb, aintc);
      const cardinalitySum = 2 ** aintb.length + 2 ** aintc.length;
      const pUnion = powerSetUnionLatex(A, C);
      const marks = 12;
      return longQ(
        unitId,
        'sets-long-multipart',
        rng,
        r`Given $A=${latexSet(A)}$, $B=${latexSet(B)}$ and $C=${latexSet(C)}$, evaluate the following set operations. Show your working.

(a) $A \cup B$ [2 marks]

(b) $(A \cup C)-B$ [2 marks]

(c) $(A \cap B) \times (A \cap C)$ [2 marks]

(d) $|\mathcal{P}(A \cap B)|+|\mathcal{P}(A \cap C)|$ [3 marks]

(e) $\mathcal{P}(A) \cup \mathcal{P}(C)$ [3 marks]`,
        [
          r`(a) $A \cup B = ${latexSet(ab)}$.`,
          r`(b) $A \cup C = ${latexSet(ac)}$, so $(A \cup C)-B = ${latexSet(bc)}$.`,
          r`(c) $A \cap B = ${latexSet(aintb)}$ and $A \cap C = ${latexSet(aintc)}$, so $(A \cap B) \times (A \cap C) = ${pairsLatex(product)}$.`,
          r`(d) $|\mathcal{P}(A \cap B)| = 2^{${aintb.length}} = ${2 ** aintb.length}$ and $|\mathcal{P}(A \cap C)| = 2^{${aintc.length}} = ${2 ** aintc.length}$; the sum is $${cardinalitySum}$.`,
          r`(e) $\mathcal{P}(A) \cup \mathcal{P}(C) = ${pUnion}$.`
        ],
        [
          { point: '(a) correct union', marks: 2 },
          { point: '(b) correct bracket evaluation and difference', marks: 2 },
          { point: '(c) correct intersections and ordered-pair product', marks: 2 },
          { point: '(d) correct power-set cardinalities and sum', marks: 3 },
          { point: '(e) complete and correct union of power sets', marks: 3 }
        ],
        marks,
        level
      );
    }
  },
  {
    id: 'sets-long-power-set',
    title: 'List a power set',
    make(rng, level) {
      const A = letterSet(rng, level === 1 ? 2 : 3);
      return longQ(
        unitId,
        'sets-long-power-set',
        rng,
        r`Let $A=${latexSet(A)}$. (a) List all elements of $\mathcal{P}(A)$ by subset size. (b) State $|\mathcal{P}(A)|$. [8 marks]`,
        [
          r`Subsets with no elements: $\varnothing$.`,
          r`Subsets with one element: ${powerSetInfo(A).filter((s) => s.length === 1).map((s) => `$${latexSet(s)}$`).join(', ')}.`,
          r`Subsets with two or more elements: ${powerSetInfo(A).filter((s) => s.length >= 2).map((s) => `$${latexSet(s)}$`).join(', ')}.`,
          r`Therefore $\mathcal{P}(A)=${powerSetLatex(A)}$.`,
          r`Since $|A|=${A.length}$, $|\mathcal{P}(A)|=2^{${A.length}}=${2 ** A.length}$.`
        ],
        [
          { point: 'includes the empty set and all singletons', marks: 3 },
          { point: 'includes all larger subsets and A itself', marks: 3 },
          { point: 'correct cardinality', marks: 2 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'sets-long-cartesian',
    title: 'Cartesian product and membership',
    make(rng, level) {
      const A = numberSet(rng, randInt(rng, 2, 3), 1, 8);
      const B = letterSet(rng, randInt(rng, 2, 3));
      const product = cartesian(A, B);
      const inside = pick(rng, product);
      const outside = [randInt(rng, 9, 12), pick(rng, ['x', 'y', 'z'])];
      return longQ(
        unitId,
        'sets-long-cartesian',
        rng,
        r`Let $A=${latexSet(A)}$ and $B=${latexSet(B)}$. (a) List all elements of $A \times B$. (b) State $|A \times B|$. (c) Decide whether $(${inside[0]},${inside[1]}) \in A \times B$ and whether $(${outside[0]},${outside[1]}) \in A \times B$, with a brief reason. [8 marks]`,
        [
          r`(a) $A \times B=${pairsLatex(product)}$.`,
          r`(b) $|A \times B|=|A|\,|B|=${A.length} \cdot ${B.length}=${A.length * B.length}$.`,
          r`(c) $(${inside[0]},${inside[1]}) \in A \times B$ because ${inside[0]} \in A$ and ${inside[1]} \in B$.`,
          r`However $(${outside[0]},${outside[1]}) \notin A \times B$ because ${outside[0]} \notin A$ (or ${outside[1]} \notin B$).`
        ],
        [
          { point: '(a) complete ordered-pair list', marks: 4 },
          { point: '(b) correct cardinality', marks: 2 },
          { point: '(c) correct membership decisions with reasons', marks: 2 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'sets-long-identity',
    title: 'Prove or disprove a set identity',
    make(rng, level) {
      const identities = [
        {
          text: r`$A-(B \cup C)=(A-B) \cap (A-C)$`,
          true: true,
          proof: [
            r`Take $x \in A-(B \cup C)$. Then $x \in A$ and $x \notin B \cup C$.`,
            r`So $x \notin B$ and $x \notin C$, hence $x \in A-B$ and $x \in A-C$.`,
            r`Thus $x \in (A-B) \cap (A-C)$, which proves $A-(B \cup C) \subseteq (A-B) \cap (A-C)$.`,
            r`Conversely, take $x \in (A-B) \cap (A-C)$. Then $x \in A$, $x \notin B$ and $x \notin C$, so $x \notin B \cup C$.`,
            r`Hence $x \in A-(B \cup C)$, proving the reverse inclusion and therefore equality.`
          ]
        },
        {
          text: r`$A-(B \cap C)=(A-B) \cap (A-C)$`,
          true: false,
          proof: [
            r`The identity is false. Take $A=\{1,2\}$, $B=\{1\}$ and $C=\{2\}$.`,
            r`Then $B \cap C=\varnothing$, so $A-(B \cap C)=\{1,2\}$.`,
            r`But $(A-B) \cap (A-C)=\{2\} \cap \{1\}=\varnothing$.`,
            r`Since $\{1,2\} \neq \varnothing$, this is a counterexample and the identity is false.`
          ]
        },
        {
          text: r`$A \cap (B \cup C)=(A \cap B) \cup (A \cap C)$`,
          true: true,
          proof: [
            r`Take $x \in A \cap (B \cup C)$. Then $x \in A$, and $x \in B$ or $x \in C$.`,
            r`If $x \in B$, then $x \in A \cap B$; if $x \in C$, then $x \in A \cap C$.`,
            r`In either case $x \in (A \cap B) \cup (A \cap C)$, so $A \cap (B \cup C) \subseteq (A \cap B) \cup (A \cap C)$.`,
            r`Conversely, take $x \in (A \cap B) \cup (A \cap C)$. Then $x \in A$, and $x \in B$ or $x \in C$.`,
            r`So $x \in A \cap (B \cup C)$, giving the reverse inclusion and hence equality.`
          ]
        },
        {
          text: r`$A \cup (B \cap C)=(A \cup B) \cap C$`,
          true: false,
          proof: [
            r`The identity is false. Take $A=\{1\}$, $B=\{2\}$ and $C=\{3\}$.`,
            r`Then $B \cap C=\varnothing$, so $A \cup (B \cap C)=\{1\}$.`,
            r`But $(A \cup B) \cap C=\{1,2\} \cap \{3\}=\varnothing$.`,
            r`Since $\{1\} \neq \varnothing$, the identity fails.`
          ]
        }
      ];
      const chosen = pick(rng, identities);
      return longQ(
        unitId,
        'sets-long-identity',
        rng,
        r`Prove or disprove the following statement for all sets $A,B,C$: ${chosen.text}. Justify your answer fully. [10 marks]`,
        chosen.proof,
        [
          { point: 'states the correct verdict (true or false)', marks: 2 },
          { point: 'sets up a proof or counterexample correctly', marks: 2 },
          { point: 'complete valid argument or valid counterexample', marks: 4 },
          { point: 'clear conclusion linking back to the statement', marks: 2 }
        ],
        10,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'sets-obj-union-membership',
    title: 'Union membership',
    make(rng, level) {
      const A = numberSet(rng, 3, 1, 6);
      const B = numberSet(rng, 3, 4, 9);
      const inUnion = pick(rng, union(A, B));
      const outside = randInt(rng, 10, 15);
      const answer = true;
      return tfQ(
        unitId,
        'sets-obj-union-membership',
        rng,
        r`Let $A=${latexSet(A)}$ and $B=${latexSet(B)}$. Is the statement $${inUnion} \in A \cup B$ true or false?`,
        answer,
        [r`$A \cup B=${latexSet(union(A, B))}$, and $${inUnion}$ belongs to this union.`],
        2,
        level
      );
    }
  },
  {
    id: 'sets-obj-power-size',
    title: 'Power set cardinality',
    make(rng, level) {
      const A = numberSet(rng, randInt(rng, 2, 4), 1, 9);
      return shortQ(
        unitId,
        'sets-obj-power-size',
        rng,
        r`Let $A=${latexSet(A)}$. Find $|\mathcal{P}(A)|$.`,
        String(2 ** A.length),
        [`2^${A.length}`, String(2 ** A.length)],
        [r`$|\mathcal{P}(A)|=2^{|A|}=2^{${A.length}}=${2 ** A.length}$.`],
        2,
        level
      );
    }
  },
  {
    id: 'sets-obj-subset',
    title: 'Subset decision',
    make(rng, level) {
      const A = numberSet(rng, 3, 1, 6);
      const extra = randInt(rng, 7, 9);
      const B = [...A, extra].sort((a, b) => a - b);
      const correct = r`$A \subseteq B$`;
      return mcqQ(
        unitId,
        'sets-obj-subset',
        rng,
        r`Let $A=${latexSet(A)}$ and $B=${latexSet(B)}$. Which statement is true?`,
        correct,
        [r`$B \subseteq A$`, r`$A \in B$`, r`$A \cap B=\varnothing$`],
        [r`Every element of $A$ is in $B$, so $A \subseteq B$.`],
        2,
        level
      );
    }
  },
  {
    id: 'sets-obj-cartesian-size',
    title: 'Cartesian product size',
    make(rng, level) {
      const m = randInt(rng, 2, 5);
      const n = randInt(rng, 2, 5);
      return shortQ(
        unitId,
        'sets-obj-cartesian-size',
        rng,
        r`Suppose $|A|=${m}$ and $|B|=${n}$. Find $|A \times B|$.`,
        String(m * n),
        [String(m * n)],
        [r`$|A \times B|=|A|\,|B|=${m} \cdot ${n}=${m * n}$.`],
        2,
        level
      );
    }
  },
  {
    id: 'sets-obj-empty',
    title: 'Empty set fact',
    make(rng, level) {
      const A = numberSet(rng, 3, 1, 9);
      return tfQ(
        unitId,
        'sets-obj-empty',
        rng,
        r`Let $A=${latexSet(A)}$. Is the statement $\varnothing \subseteq A$ true or false?`,
        true,
        [r`The empty set has no elements, so it is automatically a subset of every set.`],
        2,
        level
      );
    }
  },
  {
    id: 'sets-obj-difference',
    title: 'Set difference',
    make(rng, level) {
      const A = numberSet(rng, 4, 1, 6);
      const B = numberSet(rng, 3, 3, 9);
      const correct = difference(A, B);
      const wrong1 = difference(B, A);
      const wrong2 = intersection(A, B);
      const wrong3 = union(A, B);
      const fmt = (list) => latexSet(list.sort((a, b) => a - b));
      return mcqQ(
        unitId,
        'sets-obj-difference',
        rng,
        r`Let $A=${latexSet(A)}$ and $B=${latexSet(B)}$. Which set equals $A-B$?`,
        r`$${fmt(correct)}$`,
        [r`$${fmt(wrong1)}$`, r`$${fmt(wrong2)}$`, r`$${fmt(wrong3)}$`],
        [r`$A-B$ keeps the elements of $A$ that are not in $B$, namely $${fmt(correct)}$.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 1,
  title: 'Sets',
  titleZh: '集合',
  summary: '集合记号、幂集、笛卡尔积与集合运算',
  notes,
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
