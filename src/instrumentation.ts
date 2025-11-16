// src/instrumentation.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

const AXIOM_TOKEN = process.env.AXIOM_TOKEN;
const AXIOM_DATASET = process.env.AXIOM_DATASET || 'vise';
const AXIOM_DOMAIN = process.env.AXIOM_DOMAIN || 'https://api.axiom.co';

const traceExporter = new OTLPTraceExporter({
  url: `${AXIOM_DOMAIN}/v1/traces`,
  headers: {
    Authorization: `Bearer ${AXIOM_TOKEN}`,
    'X-Axiom-Dataset': AXIOM_DATASET,
  },
});

const sdk = new NodeSDK({
  traceExporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'node-express-api',
});

sdk.start(); // ✅ ahora es síncrono
console.log('🟢 OpenTelemetry iniciado y enviando a Axiom');

process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('🟡 OpenTelemetry apagado limpiamente'))
    .catch((err) => console.error('🔴 Error apagando OpenTelemetry', err))
    .finally(() => process.exit(0));
});
