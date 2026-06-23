import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="page-card">
      <h1>Bienvenido a la plataforma de tareas</h1>
      <p>Selecciona tu rol para ir a la pantalla correspondiente.</p>
      <div className="home-actions">
        <Link className="home-button" to="/profesor">
          Soy Profesor
        </Link>
        <Link className="home-button secondary" to="/estudiante">
          Soy Estudiante
        </Link>
      </div>
    </div>
  );
}
