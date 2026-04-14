import express from "express"
import cors from "cors"

import { registerHealthRoutes } from "./routes/health.js"
import { registerPropertyRoutes } from "./routes/properties.js"
import { registerUnlockRoutes } from "./routes/unlocks.js"
import { registerPaymentRoutes } from "./routes/payments.js"

const port = Number(process.env.PORT ?? 4000)

const app = express()

app.use(express.json({ limit: "1mb" }))
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",").map((s) => s.trim()).filter(Boolean) ?? [
      "http://localhost:3000",
    ],
    credentials: false,
  })
)

const api = express.Router()
registerHealthRoutes(api)
registerPropertyRoutes(api)
registerUnlockRoutes(api)
registerPaymentRoutes(api)

app.use("/api", api)

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on http://localhost:${port}`)
})

