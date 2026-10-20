import { app } from './app';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🎬 CineMatch Backend (PED941 - Fase II)`);
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📡 Endpoints disponibles en: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});
