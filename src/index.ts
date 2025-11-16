// src/index.ts
import dotenv from 'dotenv';
dotenv.config();  // ⚠️ esto debe ir antes de leer variables

import './instrumentation';  // ✅ este es el archivo OTEL que creamos antes
import app from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 API VISE escuchando en puerto ${PORT}`);
});


// import dotenv from 'dotenv';
// import app from './app';


// dotenv.config();


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
// console.log(`API VISE escuchando en puerto ${PORT}`);
// });