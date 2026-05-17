export default function handler(req: any, res: any) {
  // CORS Headers for cross-origin testing from the A2A platform
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
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
      },
      {
        name: "execute_erc8004_action",
        description: "Execute a delegated agent action on Base.",
        inputSchema: {
          type: "object",
          properties: {
            agentId: { type: "string" },
            action: { type: "string" }
          },
          required: ["agentId", "action"]
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
}
