import React from 'react';
import { GardenProvider } from './context/GardenContext';
import { MainLayout } from './components/layout/MainLayout';

function App() {
  return (
    <GardenProvider>
      <MainLayout />
    </GardenProvider>
  );
}

export default App;
