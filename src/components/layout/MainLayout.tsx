import React from 'react';
import { Sidebar } from './Sidebar';
import { GardenCanvas } from '../garden/GardenCanvas';
import { StatusPanel } from './StatusPanel';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Panel: Configuration */}
      <Sidebar />

      {/* Center Panel: Garden Canvas */}
      <main className="flex-1 h-full overflow-hidden relative p-6">
        <div className="h-full w-full rounded-3xl overflow-hidden shadow-soft bg-white/50 backdrop-blur-sm border border-white/80">
          <GardenCanvas />
        </div>
      </main>

      {/* Right Panel: Status */}
      <StatusPanel />
    </div>
  );
};
