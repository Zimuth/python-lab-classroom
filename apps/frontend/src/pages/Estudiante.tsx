import React, { useEffect, useRef, useState } from 'react';
import { envConfig } from './../../envconfig';

type Assignment = {
  id?: number;
  titulo: string;
  descripcion: string;
  fechaPublicacion: string;
  fechaEntrega: string;
};

export default function Estudiante() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${envConfig.API_URL}/assignments`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setAssignments(data);
      } catch (err) {
        console.error(err);
        setError(
          'No se pudieron cargar las tareas. Asegúrate de que el backend está corriendo.',
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const handleRunCode = () => {
    setOutput('');
    setIsRunning(true);

    // Close any existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://${envConfig.SANDBOX_API_URL}/sandbox/execute`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        event: 'execute',
        data: { code },
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.event === 'execution_result') {
        // Stream stdout/stderr output in real-time
        setOutput((prev) => prev + (msg.data.output || ''));
      } else if (msg.event === 'execution_complete') {
        setIsRunning(false);
        ws.close();
      } else if (msg.event === 'execution_error') {
        setOutput((prev) => prev + `\nError: ${msg.data.message}`);
        setIsRunning(false);
        ws.close();
      }
    };

    ws.onerror = () => {
      setOutput((prev) => prev + '\nError: No se pudo conectar al servidor de ejecución.');
      setIsRunning(false);
    };

    ws.onclose = () => {
      setIsRunning(false);
    };
  };

  if (selectedTask) {
    return (
      <div className="page-card">
        <button
          className="back-btn"
          onClick={() => {
            setSelectedTask(null);
            setCode('');
            setOutput('');
          }}
        >
          ← Volver
        </button>

        <div className="task-detail">
          <h1>{selectedTask.titulo}</h1>
          <p className="task-description">{selectedTask.descripcion}</p>
          <div className="task-meta">
            <span>
              📅 Publicado: {new Date(selectedTask.fechaPublicacion).toLocaleDateString()}
            </span>
            <span>
              ⏱️ Entrega: {new Date(selectedTask.fechaEntrega).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="editor-section">
          <h2>Editor de Código</h2>
          <textarea
            className="code-editor"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Escribe tu código Python aquí..."
          />
          <button className="run-btn" onClick={handleRunCode} disabled={isRunning}>
            {isRunning ? 'Ejecutando...' : 'Ejecutar código'}
          </button>
        </div>

        {(output || isRunning) && (
          <div className="output-section">
            <h2>Salida</h2>
            <pre className="output-box">{output || 'Esperando salida...'}</pre>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="page-header">
        <h1>Mis Tareas</h1>
        <p>Selecciona una tarea para empezar a practicar.</p>
      </div>

      {loading && <p>Cargando tareas...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && assignments.length === 0 && (
        <p>No hay tareas disponibles aún.</p>
      )}

      <div className="task-grid">
        {assignments.map((a) => (
          <article
            key={a.id ?? a.titulo}
            className="task-card"
            onClick={() => setSelectedTask(a)}
            role="button"
            tabIndex={0}
          >
            <h3>{a.titulo}</h3>
            <p>{a.descripcion}</p>
            <div className="task-meta">
              <span>Entrega: {new Date(a.fechaEntrega).toLocaleDateString()}</span>
            </div>
            <div className="card-action">→ Resolver</div>
          </article>
        ))}
      </div>
    </div>
  );
}
