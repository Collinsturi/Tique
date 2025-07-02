import jwt, { decode } from "jsonwebtoken"
import "dotenv/config"
import { Request, Response, NextFunction } from "express";

export const checkRoles = (requiredRole: "admin" | "customer" | "check_in_staff") => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = authHeader.split(" ")[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            (req as any).user = decoded;

            // check for roles
            if (
                typeof decoded === "object" &&
                decoded !== null &&
                "role" in decoded
            ) {
                if (decoded.role === "admin" || decoded.role === "customer" || decoded.role === "check_in_staff") {
                    next();
                    return;
                } else if (decoded.role === requiredRole) {
                    next();
                    return;
                }
                res.status(401).json({ message: "Unauthorized" });
                return;
            } else {
                res.status(401).json({ message: "Invalid Token Payload" })
                return
            }

        } catch (error) {
            res.status(401).json({ message: "Invalid Token" });
            return
        }

    }
}

export const adminRoleAuth = checkRoles("admin")
export const userRoleAuth = checkRoles("customer")
export const checkInStaffRoleAuth = checkRoles("check_in_staff")