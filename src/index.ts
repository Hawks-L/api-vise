// src/index.ts
import './telemetry';                // <-- ¡Agregar esta línea primero!
import dotenv from 'dotenv';
import app from './app';
import express from 'express';

dotenv.config();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API VISE escuchando en puerto ${PORT}`);
});


import appInsights from "applicationinsights";

appInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .start();

// Opcional: etiqueta de rol/servicio
const client = appInsights.defaultClient;
client.context.tags[client.context.keys.cloudRole] = "api-vise";
client.trackEvent({ name: "server_started", properties: { environment: "production" } });


// import dotenv from 'dotenv';
// import app from './app';


// dotenv.config();


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
// console.log(`API VISE escuchando en puerto ${PORT}`);
// });