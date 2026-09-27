import type { KeyboardEvent } from 'react';
import { TAB_SPACES } from './textWhitespace';

export function handleTextareaTab(
  event: KeyboardEvent<HTMLTextAreaElement>,
  onChange: (value: string) => void
): void {
  // Shift+Tab keeps the normal keyboard route out of the editor.
  if (
    event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey ||
    event.metaKey || event.defaultPrevented || event.nativeEvent.isComposing
  ) return;

  event.preventDefault();
  const textarea = event.currentTarget;
  const caret = textarea.selectionStart + TAB_SPACES.length;
  textarea.setRangeText(TAB_SPACES, textarea.selectionStart, textarea.selectionEnd, 'end');
  onChange(textarea.value);

  // Restore the caret after React updates the controlled textarea.
  requestAnimationFrame(() => {
    if (document.activeElement === textarea) textarea.setSelectionRange(caret, caret);
  });
}
