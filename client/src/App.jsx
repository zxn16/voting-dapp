import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./screens/Home";
import "./index.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  );
}