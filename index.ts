import venueRoutes from "./src/components/venue/venue.routes";
import eventRoutes from "./src/components/event/event.routes"
import ticketRoutes from "./src/components/ticket/ticket.routes";
import ticketTypeRoutes from "./src/components/ticketTypes/ticketType.routes";
import orderRoutes  from "./src/components/order/order.routes";
import customerSupportRoutes from "src/components/customerSupport/customer.routes"

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
    app.use("/api", venueRoutes);
    app.use("/api", ticketRoutes);
    app.use("/api", ticketTypeRoutes);
    app.use("/api", orderRoutes);
    app.use("/api", customerSupportRoutes);

    return app;
}

const app = initializeApp();
export default app;


