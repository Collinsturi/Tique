const initializeApp = () => {
    const app = express();
    app.use(express.json());

    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', ],
        credentials: true
    }));

    //Application Routes
    app.use("/api", eventRoutes);

    return app;
}

const app = initializeApp();
export default app;


