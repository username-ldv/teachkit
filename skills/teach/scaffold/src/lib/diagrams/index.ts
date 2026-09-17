/**
 * The diagram library.
 *
 * Every figure in the course is one of these components with data passed in —
 * there is no hand-drawn SVG in a lesson page, and no ASCII art anywhere.
 * Adding a lesson should mean reaching for a component here first; if the
 * shape genuinely does not exist yet, add it here rather than inlining it,
 * so the next lesson gets it for free.
 *
 * See /dev/diagrams for a live gallery of all of them.
 */

export { default as Figure } from './Figure.svelte';
export { default as Sequence } from './Sequence.svelte';
export { default as ArrowDefs } from './ArrowDefs.svelte';

// Arrays, slices, buckets, ring-buffer storage
export { default as CellRow } from './CellRow.svelte';
export { default as Cells } from './Cells.svelte';
export { default as CellsTrace } from './CellsTrace.svelte';
export { default as ArrayStepper } from './ArrayStepper.svelte';

// Nodes and chains
export { default as NodeBox } from './NodeBox.svelte';
export { default as LinkedList } from './LinkedList.svelte';
export { default as PointerBox } from './PointerBox.svelte';

// Trees
export { default as BinaryTree } from './BinaryTree.svelte';
export { default as BSTLab } from './BSTLab.svelte';
export { default as TraversalLab } from './TraversalLab.svelte';
export { default as HeapLab } from './HeapLab.svelte';

// Structures
export { default as StackFrames } from './StackFrames.svelte';
export { default as RingBuffer } from './RingBuffer.svelte';
export { default as HashTable } from './HashTable.svelte';
export { default as HashLab } from './HashLab.svelte';
export { default as RecursionTree } from './RecursionTree.svelte';
export { default as BinarySearchLab } from './BinarySearchLab.svelte';
export { default as SortLab } from './SortLab.svelte';
export { default as PartitionLab } from './PartitionLab.svelte';
export { default as MergeSortTree } from './MergeSortTree.svelte';

// Explanatory shapes
export { default as Pipeline } from './Pipeline.svelte';
export { default as Timeline } from './Timeline.svelte';
export { default as MemoryRegions } from './MemoryRegions.svelte';
export { default as GrowthChart } from './GrowthChart.svelte';
export { default as DecisionFlow } from './DecisionFlow.svelte';
export { default as TraceTable } from './TraceTable.svelte';
export { default as Derivation } from './Derivation.svelte';
export { default as Math } from './Math.svelte';

export type { Cell } from './CellRow.svelte';
export type { NodeSpec, Field } from './NodeBox.svelte';
export type { Frame, TraceMark } from './CellsTrace.svelte';
export type { Branch } from './DecisionFlow.svelte';
export type { TNode } from './BinaryTree.svelte';
export type { Tone } from './geom';
