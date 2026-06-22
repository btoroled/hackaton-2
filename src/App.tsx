import { Navigate, Route, Routes } from "react-router-dom";
import SectorsPage from "./features/story/SectorsPage.tsx";
import SectorStoryPage from "./features/story/SectorStoryPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sectors" replace />} />
      <Route path="/sectors" element={<SectorsPage />} />
      <Route path="/sectors/:id/story" element={<SectorStoryPage />} />
      <Route path="*" element={<Navigate to="/sectors" replace />} />
    </Routes>
  );
}
