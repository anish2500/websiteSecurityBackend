import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import authRoutes from "./routes/auth.route";
import adminRoutes from "./routes/admin/admin.routes";
import cors from 'cors';
import path from 'path';
import plantRoutes from './routes/plant.route';
import adminPlantRoutes from './routes/admin/plant.route';
import cartRoutes from "./routes/cart.route";
import orderRoutes from "./routes/order.route";
import favoriteRoutes from "./routes/favorite.route";
import { globalApiLimiter } from './middlewares/rate-limit.middleware';
import helmet from "helmet";


const app: Application = express();
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3003',
    'http://localhost:3005',
    'http://192.168.18.4:5050',
    'http://127.0.0.1:5050',
    process.env.CLIENT_URI,
].filter(Boolean);

// In dev, Next.js's own "Network:" URL (LAN/VM adapter IP, e.g. VirtualBox/VMware/WSL)
// varies across machines and restarts - allow any private-range IP on port 3000
// instead of chasing one-off IPs every time it changes. Never applies in production.
const isDevLanOrigin = (origin: string) =>
    process.env.NODE_ENV !== 'production' &&
    /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):3000$/.test(origin);

const corsOptions  = {
    origin: (origin: string | undefined, callback: (err: Error | null , allow?: boolean)=> void )=> {
        if (!origin || allowedOrigins.includes(origin) || isDevLanOrigin(origin)){
            return callback(null, true);

        }
        console.warn(`[cors] BLOCKED origin="${origin}" (allowed: ${JSON.stringify(allowedOrigins)})`);
        return callback (new Error ("Not allowed by CORS"));
    },
    optionsSuccessStatus: 200,
    credentials: true,
};

app.use(helmet());
app.use(cors(corsOptions));
app.use(globalApiLimiter); 



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/auth', authRoutes);
app.use('/api/admin/plants', adminPlantRoutes);
app.use('/api/admin', adminRoutes);
app.use('/profile_pictures', express.static(path.join(process.cwd(), 'public', 'profile_pictures')));
app.use(express.static(path.join(process.cwd(), 'public', 'profile_pictures')));
app.use('/api/plants', plantRoutes);
app.use('/plant_images', express.static(path.join(process.cwd(), 'public', 'plant_images')));
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/', (req: Request, res: Response) => {
    return res.status(200).json({ success: "true", message: "Welcome to the API" });
});

export default app; 