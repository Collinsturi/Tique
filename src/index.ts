import express from "express";
import venueRoutes from "./components/venue/venue.routes";
import eventRoutes from "./components/event/event.routes"
import ticketRoutes from "./components/ticket/ticket.routes";
import ticketTypeRoutes from "./components/ticketTypes/ticketType.routes";
import orderRoutes  from "./components/order/order.routes";
import customerSupportRoutes from "./components/customerSupport/customerSupport.routes"
import paymentRoutes from "./components/payment/payment.routes"
import authRoutes from "./components/authentication/authentication.router"
import cors from "cors";
import analyticsRoutes from "./components/analytics/analytics.router"

const initializeApp = () => {
    const app = express();
    app.use(express.json());

    app.use(cors({
        origin: ['http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', ],
        credentials: true
    }));

    //Application Routes
    app.use("/api", authRoutes)
    app.use("/api", eventRoutes);
    app.use("/api", venueRoutes);
    app.use("/api", ticketRoutes);
    app.use("/api", ticketTypeRoutes);
    app.use("/api", orderRoutes);
    app.use("/api", customerSupportRoutes);
    app.use("/api", paymentRoutes);
    app.use("/api", analyticsRoutes)

    return app;
}

const app = initializeApp();
export default app;


