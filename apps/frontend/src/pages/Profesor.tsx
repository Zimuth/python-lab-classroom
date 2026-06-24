import React, { useState } from 'react';
import { envConfig } from './../../envconfig';

export default function Profesor() {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaPublicacion, setFechaPublicacion] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`${envConfig.API_URL}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descripcion,
          fechaPublicacion,
          fechaEntrega,
          solucionProfesor: '',
          testCases: [],
        }),
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      setSaved(true);
      setTitulo('');
      setDescripcion('');
      setFechaPublicacion('');
      setFechaEntrega('');
    } catch (err) {
      console.error(err);
      setError('No se pudo crear la tarea. Verifica el backend.');
    }
  };

  return (
    <div className="page-card">
      <div className="page-header">
        <h1>Nueva Tarea</h1>
        <p>Publica una nueva tarea para que los estudiantes la resuelvan.</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Información General</h3>
          <label>
            Título
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Suma de dos números"
              required
            />
          </label>

          <label>
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe qué debe hacer el estudiante..."
              required
            />
          </label>
        </div>

        <div className="form-section">
          <h3>Fechas</h3>
          <div className="form-row">
            <label>
              Fecha de publicación
              <input
                type="date"
                value={fechaPublicacion}
                onChange={(e) => setFechaPublicacion(e.target.value)}
                required
              />
            </label>
            <label>
              Fecha de entrega
              <input
                type="date"
                value={fechaEntrega}
                onChange={(e) => setFechaEntrega(e.target.value)}
                required
              />
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">Publicar tarea</button>
          {saved && <p className="success">✓ Tarea publicada correctamente</p>}
          {error && <p className="error">✗ {error}</p>}
        </div>
      </form>
    </div>
  );
}
