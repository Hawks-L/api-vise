import express from 'express';
import clientRoutes from './routes/client.routes';
import purchaseRoutes from './routes/purchase.routes';
import appInsights from "applicationinsights";

appInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoDependencyCorrelation(true)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true, true)
  .setAutoCollectExceptions(true)
  .setAutoCollectDependencies(true)
  .setAutoCollectConsole(true, true)
  .setUseDiskRetryCaching(true)
  .start();

// Opcional: etiqueta de rol/servicio
const client = appInsights.defaultClient;
client.context.tags[client.context.keys.cloudRole] = "api-vise";
client.trackEvent({ name: "server_started", properties: { environment: "production" } });

const app = express();
app.use(express.json());


app.use('/client', clientRoutes);
app.use('/purchase', purchaseRoutes);


app.get('/health', (_req, res) => res.json({ ok: true }));




export default app;