import { HashRouter, Route, Routes } from 'react-router-dom';
import HomeScreen from './ui/home/HomeScreen';
import GameScreen from './ui/game/GameScreen';
import ResultScreen from './ui/result/ResultScreen';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/play/:dimension" element={<GameScreen />} />
        <Route
          path="/result/:dimension/:timeMillis/:mistakes/:isNewBest/:stars/:combo"
          element={<ResultScreen />}
        />
      </Routes>
    </HashRouter>
  );
}
