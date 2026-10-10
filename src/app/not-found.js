'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotFoundPcb from './components/not-found-pcb';
import styles from './not-found.module.css';

export default function NotFound() {
  const router = useRouter();
  const navigating = useRef(false);
  const [leaving, setLeaving] = useState(false);
  const goHome = useCallback(() => router.push('/'), [router]);
  const leave = event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (navigating.current) return;
    navigating.current = true;
    router.prefetch('/');
    setLeaving(true);
  };

  return (
    <main className={styles.page} aria-busy={leaving}>
      <NotFoundPcb collapsing={leaving} onCollapsed={goHome} />
      <h1 className="sr-only">404 — Page not found</h1>
      <div className={styles.message} data-leaving={leaving}>
        <p>Page not found.</p>
        <Link href="/" onClick={leave} aria-disabled={leaving}>← Back to zgro.net</Link>
      </div>
    </main>
  );
}
