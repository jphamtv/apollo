import { JwtConfig } from "../types";
import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined.");
}

export const jwtConfig: JwtConfig = {
  secret: process.env.JWT_SECRET,
  expiresIn: "24h",
};