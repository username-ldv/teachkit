<script lang="ts">
  import {
    ArrayStepper,
    BinarySearchLab,
    BinaryTree,
    BSTLab,
    HeapLab,
    TraversalLab,
    Cells,
    CellsTrace,
    DecisionFlow,
    Derivation,
    GrowthChart,
    HashLab,
    HashTable,
    LinkedList,
    MemoryRegions,
    MergeSortTree,
    PartitionLab,
    Pipeline,
    PointerBox,
    RecursionTree,
    RingBuffer,
    Sequence,
    SortLab,
    StackFrames,
    Timeline,
    TraceTable
  } from '$lib/diagrams';
  import { CodeBlock, CodeTabs, Quiz, Question, NumericQuestion, Callout } from '$lib/components';
</script>

<svelte:head><title>Diagram gallery — every figure component</title></svelte:head>

<h1>Diagram gallery</h1>
<p>
  Every component in <code>src/lib/diagrams</code> and <code>src/lib/components</code>, with the
  props a lesson would pass. This page is the place to eyeball a change to the visual language
  before it lands in six lessons at once.
</p>

<h2>Cells — one row of boxes</h2>
<Cells
  title="memory as a street of numbered boxes"
  label="value:"
  topLabel="address:"
  cells={[
    { v: 72, top: '100' },
    { v: 105, top: '101' },
    { v: 33, top: '102' },
    { v: 0, top: '103' },
    { v: 0, top: '104' },
    { v: 0, top: '105' },
    { v: 0, top: '106' },
    { v: 42, top: '107' }
  ]}
  gutter={70}
  caption="One byte each — every box reachable in one step."
/>

<Cells
  title="element 3 = 5000 + 3 × 8"
  label="value:"
  topLabel="index:"
  bottomLabel="address:"
  gutter={70}
  cells={[
    { v: 42, top: '0', bottom: '5000' },
    { v: 17, top: '1', bottom: '5008' },
    { v: 96, top: '2', bottom: '5016' },
    { v: 58, top: '3', bottom: '5024', tone: 'accent' },
    { v: 31, top: '4', bottom: '5032' }
  ]}
  marks={[{ at: 3, label: '5000 + 3 × 8 = 5024', tone: 'accent' }]}
/>

<Cells
  title="ring buffer — capacity 8, head 2, size 4"
  topLabel="index:"
  gutter={54}
  cells={[
    { top: '0', empty: true },
    { top: '1', empty: true },
    { v: 'C', top: '2', tone: 'cyan' },
    { v: 'D', top: '3', tone: 'green' },
    { v: 'E', top: '4', tone: 'green' },
    { v: 'F', top: '5', tone: 'green' },
    { top: '6', empty: true },
    { top: '7', empty: true }
  ]}
  marks={[
    { at: 2, label: 'head', tone: 'cyan' },
    { at: 6, label: 'next free slot', tone: 'yellow' },
    { at: [2, 5], label: 'size = 4', tone: 'green', lane: 1 }
  ]}
/>

<h2>CellsTrace — every step at once</h2>
<CellsTrace
  title="insert 99 at index 1 of [42, 17, 96, 58], capacity 5"
  gutter={96}
  frames={[
    {
      label: 'start:',
      cells: [{ v: 42 }, { v: 17 }, { v: 96 }, { v: 58 }, { empty: true }]
    },
    {
      label: 'shift 58 →',
      cells: [{ v: 42 }, { v: 17 }, { v: 96 }, { empty: true }, { v: 58, tone: 'yellow' }]
    },
    {
      label: 'shift 96 →',
      cells: [{ v: 42 }, { v: 17 }, { empty: true }, { v: 96, tone: 'yellow' }, { v: 58 }]
    },
    {
      label: 'shift 17 →',
      cells: [{ v: 42 }, { empty: true }, { v: 17, tone: 'yellow' }, { v: 96 }, { v: 58 }]
    },
    {
      label: 'write 99 →',
      cells: [{ v: 42 }, { v: 99, tone: 'green' }, { v: 17 }, { v: 96 }, { v: 58 }],
      note: '3 shifts + 1 write',
      noteTone: 'green'
    }
  ]}
/>

<h2>ArrayStepper — one step at a time</h2>
<ArrayStepper
  title="reverse [3, 7, 1, 9, 4, 6] in place"
  frames={[
    {
      cells: [{ v: 3 }, { v: 7 }, { v: 1 }, { v: 9 }, { v: 4 }, { v: 6 }],
      marks: [
        { at: 0, label: 'L' },
        { at: 5, label: 'R', tone: 'green' }
      ],
      note: 'swap 3 and 6'
    },
    {
      cells: [{ v: 6 }, { v: 7 }, { v: 1 }, { v: 9 }, { v: 4 }, { v: 3 }],
      marks: [
        { at: 1, label: 'L' },
        { at: 4, label: 'R', tone: 'green' }
      ],
      note: 'swap 7 and 4'
    },
    {
      cells: [{ v: 6 }, { v: 4 }, { v: 1 }, { v: 9 }, { v: 7 }, { v: 3 }],
      marks: [
        { at: 2, label: 'L' },
        { at: 3, label: 'R', tone: 'green' }
      ],
      note: 'swap 1 and 9'
    },
    {
      cells: [{ v: 6 }, { v: 4 }, { v: 9 }, { v: 1 }, { v: 7 }, { v: 3 }],
      marks: [{ at: 2, label: 'L R crossed', tone: 'yellow' }],
      note: 'pointers crossed — done'
    }
  ]}
/>

<h2>LinkedList</h2>
<LinkedList
  title="a singly linked list"
  nodes={[
    { fields: [{ text: 'Val 7' }, { text: 'Next', dim: true, port: true }] },
    { fields: [{ text: 'Val 3' }, { text: 'Next', dim: true, port: true }] },
    { fields: [{ text: 'Val 9' }, { text: 'Next', dim: true, port: true }] }
  ]}
  pointers={[{ at: 0, label: 'head' }]}
  caption="Only the arrows matter — the nodes may live anywhere in memory."
/>

<LinkedList
  title="delete 3 — prev.Next = current.Next"
  nodes={[
    { fields: [{ text: '1' }] },
    { fields: [{ text: '7' }] },
    { fields: [{ text: '3' }], tone: 'red', ghost: true },
    { fields: [{ text: '9' }] }
  ]}
  nodeWidth={54}
  gapX={38}
  cut={[1]}
  links={[{ from: 1, to: 3, tone: 'green', under: true, label: 'prev.Next = current.Next' }]}
  pointers={[
    { at: 1, label: 'prev' },
    { at: 2, label: 'current', tone: 'red' }
  ]}
/>

<LinkedList
  title="doubly linked"
  double
  nodes={[
    { fields: [{ text: 'Prev', dim: true }, { text: '10' }, { text: 'Next', dim: true }] },
    { fields: [{ text: 'Prev', dim: true }, { text: '20' }, { text: 'Next', dim: true }] },
    { fields: [{ text: 'Prev', dim: true }, { text: '30' }, { text: 'Next', dim: true }] }
  ]}
/>

<LinkedList
  title="a cycle"
  circular
  circularNote="the tail points back — no nil, ever"
  terminal=""
  nodeWidth={46}
  gapX={34}
  nodes={[
    { fields: [{ text: '3' }] },
    { fields: [{ text: '2' }] },
    { fields: [{ text: '0' }] },
    { fields: [{ text: '-4' }] },
    { fields: [{ text: '9' }] }
  ]}
  pointers={[{ at: 0, label: 'head' }]}
/>

<h2>PointerBox</h2>
<PointerBox
  title="a pointer is a box with an address in it"
  varName="p"
  fields={[{ label: '5024', port: true }]}
  varNote={'"go to 5024 to find it"'}
  targetTitle="the struct itself"
  targetLines={['Val:  42', 'Next: (another address…)']}
  targetNote="lives at address 5024"
/>

<PointerBox
  title="a slice header, and the array it points into"
  varName="slice header"
  fields={[{ label: 'pointer', port: true }, { label: 'len', value: '4' }, { label: 'cap', value: '6' }]}
  targetTitle="backing array (the real data)"
  cells={[
    { v: 10, tone: 'accent' },
    { v: 20, tone: 'accent' },
    { v: 30, tone: 'accent' },
    { v: 40, tone: 'accent' },
    { empty: true },
    { empty: true }
  ]}
  cellNote="len covers 4 · cap runs to 6"
/>

<h2>StackFrames</h2>
<StackFrames
  title="the call stack"
  frames={[
    { label: 'main' },
    { label: 'loadUser' },
    { label: 'fetchRow', tone: 'accent', note: '← top (running)' }
  ]}
/>

<h2>Sequence — several plain figures as steps</h2>
<Sequence
  title="pushFront, in two steps"
  min="15rem"
  caption="Children are <code>plain</code> figures; each one's <code>title</code> becomes its column heading, and the columns stack on a narrow window."
>
  <StackFrames plain title="before" w={120} bottomNote="" frames={[{ label: '20' }, { label: '30', tone: 'cyan', note: '← top' }]} />
  <StackFrames plain title="after push(40)" w={120} bottomNote="" frames={[{ label: '20' }, { label: '30' }, { label: '40', tone: 'green', note: '← top' }]} />
</Sequence>

<h2>MemoryRegions</h2>
<MemoryRegions
  title="the stack and the heap"
  stackTitle="THE STACK"
  stackSub="one region per goroutine/thread, grown and shrunk at the top"
  frames={[
    { label: 'frame: fetchRow', tone: 'cyan', note: '← top' },
    { label: 'frame: loadUser' },
    { label: 'frame: main' }
  ]}
  heapTitle="THE HEAP"
  heapSub="one big shared pool"
  objects={[
    { label: 'a Node', x: 0, y: 0 },
    { label: 'an array', lines: ['of 8 ints'], x: 1, y: 0.15 },
    { label: 'Order', x: 0.35, y: 0.6 },
    { label: 'a Node', x: 1, y: 1 }
  ]}
  stackNote="automatic: a frame appears on call, vanishes on return"
  heapNote="not automatic: lives until nothing refers to it"
/>

<h2>RingBuffer — interactive</h2>
<RingBuffer
  title="capacity 8 — enqueue past the end and the window wraps"
  caption="head and size are stored; tail is always derived as (head + size) % capacity."
/>

<h2>Pipeline</h2>
<Pipeline
  title="key → bucket index"
  steps={[
    { label: '"fig"', mono: true, tone: 'cyan' },
    { label: 'hash function', sub: 'h("fig")' },
    { label: '3252984341', mono: true },
    { label: '5', mono: true, tone: 'accent', sub: 'bucket index' }
  ]}
  edges={['', '', '% 8']}
/>

<h2>HashTable</h2>
<HashTable
  title="capacity 8, storing cat→9 dog→4 fig→12 pear→7"
  buckets={[
    { entries: [] },
    { entries: [{ k: 'dog', v: 4 }] },
    { entries: [] },
    { entries: [] },
    { entries: [] },
    {
      entries: [
        { k: 'fig', v: 12, tone: 'yellow' },
        { k: 'pear', v: 7, tone: 'yellow' }
      ],
      note: 'the collision, chained',
      tone: 'yellow'
    },
    { entries: [] },
    { entries: [{ k: 'cat', v: 9 }] }
  ]}
/>

<h2>HashLab — interactive</h2>
<HashLab title="FNV-1a, one byte at a time" />

<h2>RecursionTree — interactive</h2>
<RecursionTree title="the fib call tree" n={5} />

<h2>BinarySearchLab — interactive</h2>
<BinarySearchLab
  title="binary search, one probe at a time"
  caption="Toggle to <b>linear</b> and repeat the same search: same data, same answer, wildly different comparison count. Offering the rival strategy on a switch is what turns a demonstration into an argument."
/>

<h2>SortLab — interactive</h2>
<SortLab
  title="three algorithms, four input shapes, real counters"
  caption="The model is <code>$lib/diagrams/sorting.ts</code>, so a lesson can import the same functions and quote numbers that cannot drift from the ones on screen."
/>

<h2>BinaryTree — tidy layout (x is in-order rank)</h2>
<BinaryTree
  title="a binary search tree, with the nil slots drawn"
  caption="The <code>tidy</code> layout places each node at its IN-ORDER rank, so left-to-right on the page is sorted order — which makes an ordering invariant a property of the picture rather than a claim about it."
  root={{
    v: 50,
    nil: true,
    left: {
      v: 30,
      nil: true,
      left: { v: 20, nil: true },
      right: { v: 40, nil: true, tone: 'accent' }
    },
    right: { v: 70, nil: true, left: { v: 60, nil: true }, right: { v: 80, nil: true } }
  }}
/>

<h2>BinaryTree — the degenerate shape</h2>
<BinaryTree
  title="insert 1,2,3,4,5 in order and you get a linked list"
  caption="Tone a whole path to make a failure mode visible. The same layout that draws a balanced tree as a pyramid draws this one as a diagonal."
  root={{
    v: 1,
    tone: 'red',
    right: {
      v: 2,
      tone: 'red',
      right: { v: 3, tone: 'red', right: { v: 4, tone: 'red', right: { v: 5, tone: 'red' } } }
    }
  }}
/>

<h2>BinaryTree — level layout with slot indexes</h2>
<BinaryTree
  layout="level"
  showIndex
  title="the same tree, placed by complete-tree slot"
  caption="<code>layout=&quot;level&quot;</code> places each node by its position in a complete tree, which lines the drawing up with an array index. Pair it with a <code>Cells</code> row to show one structure in two representations."
  root={{
    v: 3,
    left: { v: 8, left: { v: 21, tone: 'faint' }, right: { v: 10, tone: 'faint' } },
    right: { v: 5, left: { v: 17, tone: 'faint' }, right: { v: 9, tone: 'faint' } }
  }}
/>

<h2>BSTLab — interactive</h2>
<BSTLab
  title="the same ten keys, four insertion orders"
  caption="The movement IS the argument: nothing about the data changes between the presets, only the order it arrives in, and the height readout goes from 3 to 9. A static before/after pair would show the endpoints; stepping shows why."
/>

<h2>TraversalLab — interactive</h2>
<TraversalLab
  title="one tree, four orders"
  caption="Four traversals as one walk with the visit moved. The bottom row shows the real auxiliary structure — a stack for the depth-first orders, a queue for level order — which is what makes the space comparison concrete."
/>

<h2>HeapLab — interactive</h2>
<HeapLab
  title="a min-heap, as a tree and as the array that stores it"
  caption="Both views are driven by ONE array, so they cannot disagree — which is the point being taught. Push or pop and step: one element walks one path, lit in both views at once."
/>

<h2>PartitionLab — interactive</h2>
<PartitionLab
  title="two indices moving at different speeds"
  caption="Colour is the invariant, not decoration — paint the regions your invariant names and the figure explains itself."
/>

<h2>MergeSortTree — interactive</h2>
<MergeSortTree
  title="a recursive process drawn as rows, not a tree"
  caption="Every row is the same width, which <em>is</em> the &ldquo;each level costs n, and there are log n levels&rdquo; argument. A tree drawing hides exactly that."
/>

<h2>Timeline</h2>
<Timeline
  title="a window that slides with now"
  from={-800}
  to={1200}
  ticks={[-800, -400, 0, 400, 800, 1200]}
  events={[
    { t: 100, label: '100' },
    { t: 300, label: '300' },
    { t: 1050, label: '1050', rejected: true }
  ]}
  windows={[
    { from: -700, to: 300, label: 'last 1000 ms, when now = 300', tone: 'accent', lane: 0 },
    { from: 50, to: 1050, label: 'last 1000 ms, when now = 1050', tone: 'cyan', lane: 1 }
  ]}
/>

<h2>GrowthChart — interactive</h2>
<GrowthChart title="how the five classes actually diverge" nMax={64} />

<h2>Derivation</h2>
<Derivation
  title="why doubling is cheap"
  steps={[
    { lhs: '1 + 2 + 4 + \\dots + L', rel: '=', rhs: '2L - 1', why: 'a doubling series collapses' },
    { rel: '<', rhs: '2n', why: 'because L < n' },
    { lhs: '\\text{total work}', rel: '=', rhs: 'n + 2n = 3n', why: 'the n writes, plus the copying' }
  ]}
  conclusion={'\\frac{3n}{n} = 3 \\text{ operations per append, on average}'}
  caption="Amortised O(1): a constant, independent of n."
/>

<h2>TraceTable</h2>
<TraceTable
  title="limit 3, windowMs 1000"
  columns={['call', 'queue after expiring', 'len', 'decision']}
  mono={[0, 1, 2]}
  rows={[
    { cells: ['Allow(0)', '[]', 0, '0 < 3 → allow, store 0'], tone: 'green' },
    { cells: ['Allow(100)', '[0]', 1, '1 < 3 → allow, store 100'], tone: 'green' },
    { cells: ['Allow(300)', '[0 100 200]', 3, '3 < 3 is false → REJECT'], tone: 'red' },
    {
      cells: ['Allow(1050)', '[100 200]', 2, '2 < 3 → allow, store 1050'],
      tone: 'green',
      note: '0 had age 1050 ≥ 1000, so it was dropped; 100 has age 950, so expiring stopped there'
    }
  ]}
/>

<h2>DecisionFlow</h2>
<DecisionFlow
  start="What does the code need to DO with the data?"
  branches={[
    {
      q: 'look something up by a KEY (not a position)?',
      children: [
        { q: 'no order needed', answer: 'HASH MAP', note: '(set, if there is no value)' },
        { q: 'order / ranges / "the smallest"', answer: 'TREE', note: 'lesson 10' }
      ]
    },
    { q: 'only ever add and remove at ONE end?', answer: 'STACK' },
    { q: 'add at one end, remove from the OTHER?', answer: 'QUEUE', note: 'ring buffer' },
    { q: 'read by position, iterate a lot, mostly append?', answer: 'ARRAY / SLICE' }
  ]}
  footer="Then ask the second question every time: <strong>what does this cost, and is that cost on my hot path?</strong>"
/>

<h2>Code</h2>
<CodeTabs>
<CodeBlock lang="go">
// Count the nodes. Time O(n) — no shortcut exists.
func (l *LinkedList) Len() int {
    n := 0
    for cur := l.head; cur != nil; cur = cur.Next {
        n++
    }
    return n
}
</CodeBlock>
<CodeBlock lang="ts">
// Count the nodes. Time O(n) — no shortcut exists.
len(): number {
  let n = 0;
  for (let cur = this.head; cur !== null; cur = cur.next) {
    n++;
  }
  return n;
}
</CodeBlock>
</CodeTabs>

<CodeBlock lang="bash" title="run the suite">
npx vitest hash-map    # TypeScript
go test ./dsa/lesson05 # Go
</CodeBlock>

<h2>Quiz</h2>
<Quiz title="Checkpoint — the gallery itself">
  <Question
    q="What replaced the hand-rolled regex highlighter?"
    options={['Shiki, running at build time', 'Prism, running in the browser']}
    answer={0}
  >
    {#snippet explain()}
      <p>Shiki uses the same TextMate grammars as VS Code, and none of it ships to the browser.</p>
    {/snippet}
  </Question>
</Quiz>

<h2>NumericQuestion — a checkpoint with a number for an answer</h2>
<NumericQuestion expected={0.75} tolerance={0.001} hint="Not yet — subtract the start, then divide by the span." correct="Yes — 0.75.">
  <p>Where does 35 sit between 20 and 40, as a value from 0 to 1?</p>
</NumericQuestion>

<Callout kind="tip" title="Callout">
  <p>Callouts come in <code>note</code>, <code>tip</code>, <code>warn</code> and <code>deep</code>.</p>
</Callout>
