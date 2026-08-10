import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Mercado Pago preference creation API
  app.post("/api/create-preference", async (req, res) => {
    try {
      const { items, accessToken } = req.body;
      const mpToken = accessToken || process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (!mpToken) {
        return res.status(400).json({ error: "No Access Token de Mercado Pago proporcionado" });
      }

      const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${mpToken}`,
        },
        body: JSON.stringify({
          items: (items || []).map((item: any) => ({
            title: item.title || "Producto Azurita 3D",
            quantity: Number(item.quantity) || 1,
            unit_price: Number(item.price) || 0,
            currency_id: "ARS",
          })),
          auto_return: "approved",
          back_urls: {
            success: req.headers.origin || "https://mercadopago.com",
            failure: req.headers.origin || "https://mercadopago.com",
            pending: req.headers.origin || "https://mercadopago.com",
          },
        }),
      });

      const data = await response.json();
      if (data.id) {
        return res.json({
          success: true,
          preferenceId: data.id,
          initPoint: data.init_point,
          sandboxInitPoint: data.sandbox_init_point,
        });
      } else {
        return res.status(400).json({ error: data.message || "Error al procesar con Mercado Pago" });
      }
    } catch (error: any) {
      console.error("Error al generar preferencia en server.ts:", error);
      return res.status(500).json({ error: error.message || "Error del servidor" });
    }
  });

  // Vite middleware for dev or static files serving in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
