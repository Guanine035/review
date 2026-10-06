import { randInt, pick } from '../rng.js';
import { longQ, mcqQ, shortQ, tfQ } from './util.js';

const unitId = 'direct-proof';
const r = String.raw;

const notes = [
  {
    heading: '定理与定义 | Theorems and definitions',
    body: [
      r`A **theorem** is a true statement that has been proved. A **proposition** is a true but less significant statement.`,
      r`A **lemma** is a theorem whose main purpose is to help prove another theorem. A **corollary** is an immediate consequence of a theorem or proposition.`,
      r`An integer $n$ is **even** if $n=2a$ for some $a \in \mathbb{Z}$, and **odd** if $n=2a+1$ for some $a \in \mathbb{Z}$.`,
      r`Two integers have the **same parity** if both are even or both are odd; otherwise they have **opposite parity**.`
    ]
  },
  {
    heading: '整除与素数 | Divisibility and primes',
    body: [
      r`For $a,b \in \mathbb{Z}$, we say $a$ **divides** $b$, written $a \mid b$, if $b=ac$ for some $c \in \mathbb{Z}$.`,
      r`A natural number $n$ is **prime** if it has exactly two positive divisors, $1$ and $n$.`,
      r`$\gcd(a,b)$ is the greatest common divisor of $a$ and $b$; $\operatorname{lcm}(a,b)$ is the least common multiple of non-zero integers $a,b$.`
    ]
  },
  {
    heading: '整数运算封闭性 | Closure of integer arithmetic',
    body: [
      r`If $a,b \in \mathbb{Z}$, then $a+b \in \mathbb{Z}$, $a-b \in \mathbb{Z}$ and $ab \in \mathbb{Z}$.`,
      r`This closure is what lets us write expressions such as $2a^2+2a$ as $2k$ with $k \in \mathbb{Z}$.`
    ]
  },
  {
    heading: '除法算法 | The Division Algorithm',
    body: [
      r`Given integers $a$ and $b$ with $b>0$, there exist unique integers $q,r$ such that $a=bq+r$ and $0 \leq r<b$.`,
      r`The number $q$ is the quotient and $r$ is the remainder.`
    ]
  },
  {
    heading: '直接证明 | Direct proof',
    body: [
      r`To prove $P \Rightarrow Q$ directly, assume $P$ is true and deduce $Q$.`,
      r`A conditional is automatically true when $P$ is false, so the only case that needs work is when $P$ is true.`,
      r`Outline: **Suppose $P$**; translate definitions; use algebra or known facts; **therefore $Q$**.`
    ]
  },
  {
    heading: '分情况证明 | Proof by cases',
    body: [
      r`If a statement divides naturally into several exhaustive cases, prove each case separately.`,
      r`For parity questions, the cases are usually "even" and "odd".`,
      r`Cases must cover every possibility, and each case must end with the required conclusion.`
    ]
  },
  {
    heading: '不失一般性 | Without loss of generality',
    body: [
      r`If two cases are identical except for the names of the variables, we may write "without loss of generality" (WLOG) and prove only one.`,
      r`Example: to prove that integers of opposite parity have an odd sum, it is enough to assume $m$ is even and $n$ is odd; the other case is the same with the symbols swapped.`
    ]
  }
];

const methods = [
  {
    name: 'Direct proof of P implies Q',
    when: 'The statement has the form "If P, then Q", and the definitions can be translated algebraically.',
    steps: [
      r`Write "Suppose $P$."`,
      r`Translate every definition. For example, replace "even" by $2a$ and "odd" by $2a+1$.`,
      r`Use algebra, closure of $\mathbb{Z}$, or previously proved facts.`,
      r`Arrange the result into the exact form required by $Q$.`,
      r`End with "Therefore $Q$."`
    ],
    watch: r`Do not assume $Q$; start from $P$ only.`
  },
  {
    name: 'Proof by cases',
    when: 'The hypothesis naturally splits into cases, especially even/odd or positive/zero/negative.',
    steps: [
      r`State the cases and explain why they cover every possibility.`,
      r`Prove the conclusion in each case.`,
      r`Do not reuse symbols with different meanings across cases without saying so.`,
      r`Conclude that the result holds in all cases.`
    ],
    watch: r`Missing a case invalidates the proof.`
  },
  {
    name: 'Prove a divisibility statement',
    when: r`The conclusion contains $a \mid b$, or an expression must be shown to be a multiple of something.`,
    steps: [
      r`Translate $a \mid b$ as $b=ac$ for some $c \in \mathbb{Z}$.`,
      r`Substitute the definition into the expression.`,
      r`Factor out the divisor and verify the remaining factor is an integer.`,
      r`Translate back to divisibility or to "even/multiple of".`
    ],
    watch: r`Always name the integer factor explicitly, for example $c=de \in \mathbb{Z}$.`
  }
];

const examples = [
  {
    title: 'An odd square is odd',
    prompt: r`Prove: if $x$ is odd, then $x^2$ is odd.`,
    steps: [
      r`Suppose $x$ is odd. Then $x=2a+1$ for some $a \in \mathbb{Z}$.`,
      r`$x^2=(2a+1)^2=4a^2+4a+1=2(2a^2+2a)+1$.`,
      r`Let $b=2a^2+2a$. Since $a \in \mathbb{Z}$, $b \in \mathbb{Z}$.`,
      r`Thus $x^2=2b+1$ for an integer $b$, so $x^2$ is odd.`
    ],
    answer: r`$x^2=2b+1$ with $b \in \mathbb{Z}$, so $x^2$ is odd.`
  },
  {
    title: 'Transitivity of divisibility',
    prompt: r`Prove: if $a \mid b$ and $b \mid c$, then $a \mid c$.`,
    steps: [
      r`Suppose $a \mid b$ and $b \mid c$.`,
      r`By definition, there are integers $d,e$ with $b=ad$ and $c=be$.`,
      r`Substitute: $c=be=(ad)e=a(de)$.`,
      r`Since $de \in \mathbb{Z}$, the definition gives $a \mid c$.`
    ],
    answer: r`$c=a(de)$ with $de \in \mathbb{Z}$, so $a \mid c$.`
  },
  {
    title: 'Proof by cases with powers of minus one',
    prompt: r`Prove: for every $n \in \mathbb{N}$, $1+(-1)^n(2n-1)$ is a multiple of $4$.`,
    steps: [
      r`Case 1: $n$ is even, say $n=2k$. Then $(-1)^n=1$ and $1+(-1)^n(2n-1)=1+(4k-1)=4k$, a multiple of $4$.`,
      r`Case 2: $n$ is odd, say $n=2k+1$. Then $(-1)^n=-1$ and $1+(-1)^n(2n-1)=1-(4k+1)=-4k$, also a multiple of $4$.`,
      r`The two cases cover all natural numbers, so the result holds for every $n$.`
    ],
    answer: r`In both cases the expression equals $4k$ or $-4k$, hence is a multiple of $4$.`
  },
  {
    title: 'Opposite parity and WLOG',
    prompt: r`Prove: if two integers have opposite parity, then their sum is odd.`,
    steps: [
      r`Suppose $m$ and $n$ have opposite parity.`,
      r`Without loss of generality, assume $m$ is even and $n$ is odd.`,
      r`Write $m=2a$ and $n=2b+1$ for integers $a,b$.`,
      r`Then $m+n=2a+2b+1=2(a+b)+1$, which is odd.`,
      r`The other case is the same with the names swapped, so the result holds.`
    ],
    answer: r`$m+n=2(a+b)+1$ is odd.`
  }
];

const longGenerators = [
  {
    id: 'direct-long-odd-square',
    title: 'Odd square',
    make(rng, level) {
      const offset = randInt(rng, 1, 5);
      const expression = offset === 1 ? 'n' : `n+${offset}`;
      return longQ(
        unitId,
        'direct-long-odd-square',
        rng,
        r`Prove by direct proof: if $${expression}$ is odd, then $(${expression})^2$ is odd. [8 marks]`,
        [
          r`Suppose $${expression}$ is odd. Then there is an integer $a$ such that $${expression}=2a+1$.`,
          r`Square both sides: $(${expression})^2=(2a+1)^2=4a^2+4a+1$.`,
          r`Factor the even part: $4a^2+4a+1=2(2a^2+2a)+1$.`,
          r`Since $2a^2+2a \in \mathbb{Z}$, the expression has the form $2k+1$.`,
          r`Therefore $(${expression})^2$ is odd.`
        ],
        [
          { point: 'correctly assumes the hypothesis and writes the odd form', marks: 2 },
          { point: 'expands the square correctly', marks: 3 },
          { point: 'groups the expression as 2 times an integer plus 1', marks: 2 },
          { point: 'concludes odd with definition cited', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'direct-long-divisibility',
    title: 'Transitivity of divisibility',
    make(rng, level) {
      return longQ(
        unitId,
        'direct-long-divisibility',
        rng,
        r`Prove by direct proof: if $a \mid b$ and $b \mid c$, then $a \mid c$. [8 marks]`,
        [
          r`Suppose $a \mid b$ and $b \mid c$.`,
          r`By definition there are integers $d,e$ such that $b=ad$ and $c=be$.`,
          r`Substitute the first equation into the second: $c=be=(ad)e=a(de)$.`,
          r`Since $d,e \in \mathbb{Z}$, their product $de \in \mathbb{Z}$.`,
          r`Therefore $c=a(de)$ for an integer $de$, so $a \mid c$.`
        ],
        [
          { point: 'translates both divisibility assumptions correctly', marks: 2 },
          { point: 'valid substitution', marks: 3 },
          { point: 'names the integer factor and applies the definition', marks: 2 },
          { point: 'clear conclusion', marks: 1 }
        ],
        8,
        level
      );
    }
  },
  {
    id: 'direct-long-congruence',
    title: 'Direct proof with congruences',
    make(rng, level) {
      const k = randInt(rng, 2, 5);
      const modulus = 3 * k;
      return longQ(
        unitId,
        'direct-long-congruence',
        rng,
        r`Prove by direct proof that if $a$ is an integer, then $(a-${k})^3 \equiv a^3-${k ** 3} \pmod{${modulus}}$. [10 marks]`,
        [
          r`Compute the difference: $(a-${k})^3-(a^3-${k ** 3})$.`,
          r`Expand: $(a-${k})^3=a^3-${3 * k}a^2+${3 * k * k}a-${k ** 3}$.`,
          r`Subtract $a^3-${k ** 3}$: the difference is $-${3 * k}a^2+${3 * k * k}a$.`,
          r`Factor: $-${3 * k}a^2+${3 * k * k}a=${3 * k}\\,a(${k}-a)$.`,
          r`Since $a(${k}-a) \in \mathbb{Z}$, the difference is divisible by ${modulus}.`,
          r`By definition of congruence, $(a-${k})^3 \equiv a^3-${k ** 3} \pmod{${modulus}}$.`
        ],
        [
          { point: 'sets up the difference of the two expressions', marks: 2 },
          { point: 'correct binomial expansion', marks: 3 },
          { point: 'correct simplification', marks: 2 },
          { point: 'factors out the modulus and identifies an integer factor', marks: 2 },
          { point: 'concludes congruence with definition', marks: 1 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'direct-long-cases',
    title: 'Proof by cases',
    make(rng, level) {
      return longQ(
        unitId,
        'direct-long-cases',
        rng,
        r`Prove by cases: for every $n \in \mathbb{N}$, the number $1+(-1)^n(2n-1)$ is a multiple of $4$. [10 marks]`,
        [
          r`Case 1: $n$ is even, so $n=2k$ for some integer $k$. Then $(-1)^n=1$.`,
          r`It follows that $1+(-1)^n(2n-1)=1+(4k-1)=4k$, which is a multiple of $4$.`,
          r`Case 2: $n$ is odd, so $n=2k+1$ for some integer $k$. Then $(-1)^n=-1$.`,
          r`It follows that $1+(-1)^n(2n-1)=1-(4k+1)=-4k$, which is also a multiple of $4$.`,
          r`Every natural number is either even or odd, so the statement holds in all cases.`
        ],
        [
          { point: 'identifies the two exhaustive cases', marks: 2 },
          { point: 'correct even case', marks: 3 },
          { point: 'correct odd case', marks: 3 },
          { point: 'clear conclusion covering both cases', marks: 2 }
        ],
        10,
        level
      );
    }
  },
  {
    id: 'direct-long-divisibility-sum',
    title: 'Divisibility of a sum and product',
    make(rng, level) {
      return longQ(
        unitId,
        'direct-long-divisibility-sum',
        rng,
        r`Prove by direct proof: if $a \mid b$ and $a \mid c$, then $a \mid (b+c)$ and $a \mid bc$. [8 marks]`,
        [
          r`Suppose $a \mid b$ and $a \mid c$. Then $b=ad$ and $c=ae$ for some integers $d,e$.`,
          r`For the sum: $b+c=ad+ae=a(d+e)$, and $d+e \in \mathbb{Z}$, so $a \mid (b+c)$.`,
          r`For the product: $bc=(ad)(ae)=a(ade)$. Since $de \in \mathbb{Z}$, also $ade \in \mathbb{Z}$.`,
          r`Therefore $a \mid bc$.`
        ],
        [
          { point: 'correctly translates both divisibility assumptions', marks: 2 },
          { point: 'proves the sum statement', marks: 3 },
          { point: 'proves the product statement with an integer factor', marks: 3 }
        ],
        8,
        level
      );
    }
  }
];

const objectiveGenerators = [
  {
    id: 'direct-obj-parity-sum',
    title: 'Parity of a sum',
    make(rng, level) {
      const even = 2 * randInt(rng, 1, 9);
      const odd = 2 * randInt(rng, 1, 9) + 1;
      return tfQ(
        unitId,
        'direct-obj-parity-sum',
        rng,
        r`Is the sum of an even integer and an odd integer always odd?`,
        true,
        [r`Write the numbers as $2a$ and $2b+1$. Their sum is $2(a+b)+1$, which is odd.`],
        2,
        level
      );
    }
  },
  {
    id: 'direct-obj-odd-form',
    title: 'Odd integer form',
    make(rng, level) {
      const k = randInt(rng, 2, 9);
      return shortQ(
        unitId,
        'direct-obj-odd-form',
        rng,
        r`Write the odd integer $${2 * k + 1}$ in the form $2a+1$ by stating $a$.`,
        String(k),
        [String(k)],
        [r`$2a+1=${2 * k + 1}$ gives $a=${k}$.`],
        2,
        level
      );
    }
  },
  {
    id: 'direct-obj-divides-definition',
    title: 'Definition of divides',
    make(rng, level) {
      return mcqQ(
        unitId,
        'direct-obj-divides-definition',
        rng,
        r`Which statement is the definition of $a \mid b$?`,
        r`There exists $c \in \mathbb{Z}$ such that $b=ac$.`,
        [r`There exists $c \in \mathbb{Z}$ such that $a=bc$.`, r`$a<b$`, r`$a$ and $b$ are both prime`],
        [r`$a \mid b$ means $b$ is an integer multiple of $a$: $b=ac$ for some integer $c$.`],
        2,
        level
      );
    }
  },
  {
    id: 'direct-obj-parity-product',
    title: 'Parity of a product',
    make(rng, level) {
      return tfQ(
        unitId,
        'direct-obj-parity-product',
        rng,
        r`If one of two integers is even, is their product always even?`,
        true,
        [r`If $m=2a$, then $mn=(2a)n=2(an)$ with $an \in \mathbb{Z}$, so the product is even.`],
        2,
        level
      );
    }
  },
  {
    id: 'direct-obj-prime',
    title: 'Prime number fact',
    make(rng, level) {
      return tfQ(
        unitId,
        'direct-obj-prime',
        rng,
        r`Is $1$ a prime number?`,
        false,
        [r`A prime has exactly two positive divisors. The number $1$ has only one positive divisor, so it is not prime.`],
        2,
        level
      );
    }
  },
  {
    id: 'direct-obj-gcd-lcm',
    title: 'GCD and LCM',
    make(rng, level) {
      const a = pick(rng, [4, 6, 8, 9, 10]);
      const b = pick(rng, [6, 10, 12, 15, 18]);
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(a, b);
      const l = (a * b) / g;
      return shortQ(
        unitId,
        'direct-obj-gcd-lcm',
        rng,
        r`Find $\gcd(${a},${b})$ and $\operatorname{lcm}(${a},${b})$. Enter your answer as "gcd, lcm".`,
        `${g}, ${l}`,
        [`${g},${l}`, `${g} ${l}`],
        [r`$\gcd(${a},${b})=${g}$ and $\operatorname{lcm}(${a},${b})=${l}$.`],
        2,
        level
      );
    }
  }
];

export const unit = {
  id: unitId,
  order: 3,
  title: 'Direct Proof',
  titleZh: '直接证明',
  summary: '定义翻译、整除、奇偶性、分情况与 WLOG',
  notes,
  methods,
  examples,
  generators: { long: longGenerators, objective: objectiveGenerators }
};
