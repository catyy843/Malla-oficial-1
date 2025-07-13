document.addEventListener('DOMContentLoaded', () => {
  // Solicitar nombre usuario al cargar (puedes modificar para usar input en HTML)
  let usuario = localStorage.getItem('usuarioActual');
  if (!usuario) {
    usuario = prompt('Ingrese su nombre de usuario para guardar el progreso:');
    if (!usuario) usuario = 'anonimo'; // fallback si no pone nada
    localStorage.setItem('usuarioActual', usuario);
  }

  const keyStorage = `estadoCursos_${usuario}`;
  const cursos = document.querySelectorAll('.curso');
  const estadoGuardado = JSON.parse(localStorage.getItem(keyStorage)) || {};

  // Mapas para relaciones
  const desbloqueaMap = {};
  const desbloqueadoPorMap = {};

  cursos.forEach(curso => {
    const id = curso.id;
    const desbloquea = curso.dataset.desbloquea?.split(',').map(c => c.trim()).filter(Boolean) || [];
    desbloqueaMap[id] = desbloquea;

    desbloquea.forEach(destinoId => {
      if (!desbloqueadoPorMap[destinoId]) desbloqueadoPorMap[destinoId] = [];
      desbloqueadoPorMap[destinoId].push(id);
    });
  });

  // Actualiza bloqueo y estilo de cada curso según estado de prerequisitos
  function actualizarBloqueos() {
    cursos.forEach(curso => {
      const id = curso.id;
      const requisitos = desbloqueadoPorMap[id] || [];

      if (requisitos.length === 0) {
        curso.classList.remove('bloqueado');
        curso.style.pointerEvents = 'auto';
        curso.style.opacity = '1';
        return;
      }

      const requisitosCumplidos = requisitos.every(reqId => estadoGuardado[reqId] === true);

      if (requisitosCumplidos) {
        curso.classList.remove('bloqueado');
        curso.style.pointerEvents = 'auto';
        curso.style.opacity = '1';
      } else {
        curso.classList.add('bloqueado');
        curso.style.pointerEvents = 'none';
        curso.style.opacity = '0.5';

        if (curso.classList.contains('tachado')) {
          curso.classList.remove('tachado');
          estadoGuardado[id] = false;
        }
      }
    });
  }

  // Restaurar estado guardado
  cursos.forEach(curso => {
    const id = curso.id;
    if (estadoGuardado[id]) {
      curso.classList.add('tachado');
    }
  });

  actualizarBloqueos();

  // Evento click para toggle de tachado y actualización
  cursos.forEach(curso => {
    curso.addEventListener('click', () => {
      if (curso.classList.contains('bloqueado')) return;

      curso.classList.toggle('tachado');
      const id = curso.id;
      estadoGuardado[id] = curso.classList.contains('tachado');

      // Guardar estado con usuario
      localStorage.setItem(keyStorage, JSON.stringify(estadoGuardado));
      localStorage.setItem('usuarioActual', usuario);

      actualizarBloqueos();
    });
  });
});
