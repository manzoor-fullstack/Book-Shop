/**
 * Tiny className combiner — filters falsy values and joins with spaces.
 * Keeps components readable without pulling in a dependency.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}
