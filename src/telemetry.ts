import 'dotenv/config';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'api-vise';
const URL = process.env.OTLP_TRACES_URL || '';
const AUTH = process.env.OTLP_AUTH_HEADER || '';

if (!URL) throw new Error('Falta OTLP_TRACES_URL');
if (!AUTH) throw new Error('Falta OTLP_AUTH_HEADER');

const traceExporter = new OTLPTraceExporter({
  url: URL,
  headers: { Authorization: AUTH },
});

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
  }),
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

(async () => {
  try {
    await sdk.start();
    console.log('[OTEL] Tracing iniciado correctamente');
  } catch (err) {
    console.error('[OTEL] Error al iniciar tracing:', err);
  }
})();


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
