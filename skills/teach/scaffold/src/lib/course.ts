/**
 * THE COURSE MANIFEST — the one source of truth for identity, lesson order,
 * titles and blurbs.
 *
 * The index page, every lesson header and every prev/next footer read from
 * here, so adding a lesson means editing one array and nothing else. Never
 * hand-write navigation in a lesson page.
 */

export type Track = {
  /** Shown on the code tab and the header pill. */
  label: string;
  /** Shiki language id: go · ts · js · py · rust · kotlin · swift · sql … */
  lang: string;
};

export const course = {
  /** Prefix for localStorage keys. Keep it stable — changing it resets preferences. */
  id: 'course',

  /** Full title, shown on the index hero and in <title>. */
  title: 'A Course Title',

  /** The line above the title on the index page. */
  kicker: 'A course · subject · languages',

  /** Short name for the lesson-header kicker: "Lesson 3 of 9 · <short>". */
  short: 'Course Fundamentals',

  /** Index-page standfirst: what the course is and how deep it goes. */
  tagline:
    'Deep, unhurried lessons that assume nothing beyond the stated baseline. Every lesson: a ~30-minute read, checkpoint quizzes with instant feedback, and exercises at a real keyboard.',

  /**
   * The code tracks this course teaches side by side.
   *
   * Two entries → <CodeTabs> renders a toggle whose choice is remembered
   * across the whole course. One entry → no toggle, code blocks stand alone.
   * Empty → the course has no code at all (fine; the diagram library and
   * everything else still works).
   */
  tracks: [] as Track[],

  /** Links in every lesson's breadcrumb bar, after "Course home". */
  headerLinks: [] as { href: string; label: string }[]
};

export type Lesson = {
  /** Zero-padded number + slug; also the route: /lessons/0003-linked-lists */
  slug: string;
  n: number;
  title: string;
  /** Shown on the index card — a `·`-separated tour of what the lesson covers. */
  blurb: string;
  /** READING time only. Never fold exercise time into this. */
  minutes: string;
  /** What the exercises are: "4 exercises incl. a ring buffer + a rate limiter". */
  exercises: string;
  /**
   * How long the exercises actually take, stated separately and conservatively.
   * In-page checkpoints are not exercises and their time never counts here.
   */
  exerciseTime?: string;
  /** Which lesson numbers this one assumes. "Nothing — this is the start" for lesson 1. */
  builds: string;
};

export const lessons: Lesson[] = [
  // {
  //   slug: '0001-first-lesson',
  //   n: 1,
  //   title: 'First Lesson',
  //   blurb: 'What it covers · and what else · and the third thing.',
  //   minutes: '~30 min',
  //   exercises: '4 exercises incl. the thing they will actually build',
  //   exerciseTime: '~90 min',
  //   builds: 'Nothing — this is the start'
  // }
];

/** Lessons that are planned but not written. Shown on the index as the roadmap. */
export const roadmap: { n: string; text: string }[] = [
  // { n: '02', text: 'Second Lesson — the thing it earns' }
];

export type Reference = { slug: string; title: string; blurb: string };

/** Print-friendly compressed sheets: /reference/<slug>. */
export const references: Reference[] = [];

export const lessonHref = (slug: string) => `/lessons/${slug}`;
export const referenceHref = (slug: string) => `/reference/${slug}`;

export function lessonByNumber(n: number): Lesson | undefined {
  return lessons.find((l) => l.n === n);
}

export function neighbours(n: number) {
  return { prev: lessonByNumber(n - 1), next: lessonByNumber(n + 1) };
}
