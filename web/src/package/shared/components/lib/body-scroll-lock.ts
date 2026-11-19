// The page behind an open drawer does not scroll. Several drawers may be open at once, so the body
// is unlocked only when the last one releases its lock, and it gets back the overflow and padding it
// had before. The scrollbar the lock removes is made up for by padding, so the page does not shift.

let locks = 0;
let previous = { overflow: '', paddingRight: '' };

/** Locks the page scroll of `document` and returns the function that releases this lock once. */
export function lockBodyScroll(document: Document): () => void {
  const body = document.body;
  if (locks === 0) {
    previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight };
    const scrollbar = (document.defaultView?.innerWidth ?? 0) - document.documentElement.clientWidth;
    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  }
  locks += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) {
      body.style.overflow = previous.overflow;
      body.style.paddingRight = previous.paddingRight;
    }
  };
}
