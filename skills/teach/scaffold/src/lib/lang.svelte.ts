import { browser } from '$app/environment';
import { course } from '$lib/course';

const KEY = `${course.id}-pref-lang`;

/**
 * Which track's code is showing, shared by every code block on every page.
 * Picking "Go" in lesson 2 leaves you in Go for the rest of the course, and
 * the choice survives a reload.
 */
class LanguagePreference {
  current = $state<string>(course.tracks[0]?.label ?? '');

  constructor() {
    if (browser) {
      try {
        const saved = localStorage.getItem(KEY);
        if (saved) this.current = saved;
      } catch {
        /* private mode, blocked storage — the default is fine */
      }
    }
  }

  set(lang: string) {
    this.current = lang;
    if (!browser) return;
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
  }
}

export const lang = new LanguagePreference();
