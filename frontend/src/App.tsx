import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MatchInput from './pages/MatchInput';
import DecisionOutput from './pages/DecisionOutput';
import Architecture from './pages/Architecture';
import WarRoom from './pages/WarRoom';
import IntroSplash from './components/IntroSplash';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    return !sessionStorage.getItem('hasSeenSplash');
  });

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  return (
    <>
      {showSplash && <IntroSplash onComplete={handleSplashComplete} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MatchInput />} />
          <Route path="/decision" element={<DecisionOutput />} />
          <Route path="/architecture" element={<Architecture />} />
          <Route path="/war-room" element={<WarRoom />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
