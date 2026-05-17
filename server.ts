import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for MCP
  app.get('/api/mcp', (req, res) => {
    // Add simple standard tools, prompts, resources to prevent "no tools/prompts/resources found" error
    res.json({
      tools: [
        {
          name: "verify_timeline",
          description: "Verifies the sequence of events and temporal state to ensure no paradoxes exist before recording on-chain.",
          inputSchema: {
            type: "object",
            properties: {
              runId: { type: "string" }
            },
            required: ["runId"]
          }
        },
        {
          name: "optimize_score",
          description: "Evaluates timeline actions against constraints to determine if rewinds were optimally used.",
          inputSchema: {
            type: "object",
            properties: {
              timelineData: { type: "string" }
            },
            required: ["timelineData"]
          }
        }
      ],
      prompts: [
        {
          name: "timeline_analysis",
          description: "Prompt for the agent to analyze a specific fractured timeline run.",
          arguments: [
            {
               name: "runId",
               description: "The ID of the run to analyze",
               required: true
            }
          ]
        }
      ],
      resources: [
        {
          name: "base_network_state",
          uri: "state://base/network",
          mimeType: "application/json"
        }
      ]
    });
  });

  app.get('/api/agent', (req, res) => {
    res.json({ status: 'active', role: 'Chorono Agent' });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
