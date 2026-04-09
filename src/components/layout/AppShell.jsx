import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import TopBar from './TopBar';

export default function AppShell() {
  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-[240px] pb-24 md:pb-8">
        <TopBar />
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
