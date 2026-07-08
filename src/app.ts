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


const app: Application = express();
const corsOptions = {
    origing : ['http://localhost: 3000', 'http://localhost:3003', 'http://localhost:3005',
        'http://192.168.18.4:5050',   // Flutter running via IP (Mobile/Web)
        'http://127.0.0.1:5050'
    ], 
    optionsSuccessStatus : 200, 
    credentials  : true
};
app.use(cors(corsOptions));



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