import { Outlet } from 'react-router-dom';
import { CopilotFab } from '../copilot/CopilotFab';

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <main>
        <Outlet />
      </main>
      <CopilotFab />
    </div>
  );
}
