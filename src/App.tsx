import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import DecksPage from "./routes/DecksPage";
import DeckPage from "./routes/DeckPage";
import StudyPage from "./routes/StudyPage";
import NotFoundPage from "./routes/NotFoundPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/decks" replace />} />
        <Route path="/decks" element={<DecksPage />} />
        <Route path="/decks/:deckId" element={<DeckPage />} />
        <Route path="/decks/:deckId/study" element={<StudyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
