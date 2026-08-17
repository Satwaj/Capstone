/**
 * Route configuration.
 */
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./HomePage";
import SandboxPage from "./SandboxPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sandbox/:id" element={<SandboxPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
