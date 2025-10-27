// src/index.ts
import dotenv from 'dotenv';
import './telemetry';                // <-- ¡Agregar esta línea primero!
import app from './app';
dotenv.config();



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API VISE escuchando en puerto ${PORT}`);
});




// import dotenv from 'dotenv';
// import app from './app';


// dotenv.config();


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
// console.log(`API VISE escuchando en puerto ${PORT}`);
// });