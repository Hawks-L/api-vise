import express from 'express';
import clientRoutes from './routes/client.routes';
import purchaseRoutes from './routes/purchase.routes';


const app = express();
app.use(express.json());


app.use('/client', clientRoutes);
app.use('/purchase', purchaseRoutes);


app.get('/health', (_req, res) => res.json({ ok: true }));


export default app;