import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

/** The authenticated application frame - sidebar, top bar, and the routed page below them. */
export function AppShell() {
  return (
    <div className="flex h-screen bg-[var(--color-bg-app)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
