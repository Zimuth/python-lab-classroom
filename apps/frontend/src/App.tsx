import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Profesor from './pages/Profesor';
import Estudiante from './pages/Estudiante';

export default function App() {
  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profesor" element={<Profesor />} />
        <Route path="/estudiante" element={<Estudiante />} />
        <Route path="*" element={<div className="page-card"><h2>Ruta no encontrada</h2><p>Usa el menú anterior para volver al inicio.</p></div>} />
      </Routes>
    </div>
  );
}
