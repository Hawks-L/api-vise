import 'dotenv/config';

const appInsights = require("applicationinsights");

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
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

  const client = appInsights.defaultClient;
  client.context.tags[client.context.keys.cloudRole] = "api-vise";
  client.trackEvent({
    name: "server_started",
    properties: { environment: "production" },
  });

  console.log("✅ Application Insights inicializado correctamente");
} else {
  console.warn("⚠️ No se encontró APPLICATIONINSIGHTS_CONNECTION_STRING");
}


// // src/telemetry.ts
// import * as dotenv from 'dotenv';
// dotenv.config();

// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
// import { Resource } from '@opentelemetry/resources';
// import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

// const url = process.env.OTLP_TRACES_URL;
// const auth = process.env.OTLP_AUTH_HEADER;

// if (!url) throw new Error('OTLP_TRACES_URL no está definido en .env');
// if (!auth) throw new Error('OTLP_AUTH_HEADER no está definido en .env');

// const exporter = new OTLPTraceExporter({
//   url,
//   headers: { Authorization: auth },
// });

// const resource = new Resource({
//   [SemanticResourceAttributes.SERVICE_NAME]:
//     process.env.OTEL_SERVICE_NAME ?? 'api-vise',
// });

// const sdk = new NodeSDK({
//   resource,
//   traceExporter: exporter,                  // <-- No usamos Batch/SimpleSpanProcessor
//   instrumentations: [getNodeAutoInstrumentations()],
// });

// sdk.start();
// console.log('[OTel] exporting traces to Grafana Cloud');

// process.on('SIGTERM', async () => {
//   await sdk.shutdown();
//   process.exit(0);
// });
