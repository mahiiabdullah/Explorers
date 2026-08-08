import app from "./app";
import { redisService } from "./app/lib/redis";

const bootstrap = async () => {
  // Always start the HTTP server first — Redis is a cache, not a hard dep
  // for the booking flow. If Redis isn't reachable (e.g. expired Upstash URL
  // in dev), the app still serves movies / showtimes / bookings / payments.
  app.listen(process.env.PORT, () => {
    console.log("server is running on port ", process.env.PORT);
  });

  // Try to bring up Redis in the background; never block the server on it.
  redisService
    .connect()
    .then(() => console.log("Redis connected"))
    .catch((err) => console.warn("Redis not available, continuing without cache:", err?.message ?? err));
};

bootstrap();