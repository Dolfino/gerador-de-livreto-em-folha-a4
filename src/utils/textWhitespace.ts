export const TAB_SIZE = 4;
export const TAB_SPACES = ' '.repeat(TAB_SIZE);

// Use the same spacing for typed and pasted tabs in previews and PDF exports.
export function expandTabs(text: string): string {
  return text.replace(/\t/g, TAB_SPACES);
}
