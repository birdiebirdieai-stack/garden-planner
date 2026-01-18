import React from 'react';
import { Sidebar } from './Sidebar';
import { GardenCanvas } from '../garden/GardenCanvas';
import { StatusPanel } from './StatusPanel';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-apple-gray-100 text-apple-text-primary font-sans">
      {/* Left Panel: Configuration */}
      <Sidebar />

      {/* Center Panel: Map */}
      <main className="flex-1 h-full overflow-hidden relative apple-canvas-bg">
        <GardenCanvas />
      </main>

      {/* Right Panel: Status & Overflow */}
      <StatusPanel />
    </div>
  );
};
