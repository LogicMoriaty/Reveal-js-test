import React from 'react';
import SlideDeck from './components/SlideDeck';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-navy-900">
      <SlideDeck />
    </div>
  );
};

export default App;