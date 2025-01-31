import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();

// Configuration
const PORT = process.env.PORT;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const TRANSCRIBE_PATH = "/transcribe";

// Validate essential environment variables
if (!DEEPGRAM_API_KEY) {
  console.error("Missing DEEPGRAM_API_KEY environment variable");
  process.exit(1);
}

// Initialize Express app and HTTP server
const app = express();
const server = createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server, path: TRANSCRIBE_PATH });

// Initialize Deepgram client
const deepgram = createClient(DEEPGRAM_API_KEY);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Utility function for logging
const log = (message, ...optionalParams) => {
  console.log(`[${new Date().toISOString()}] ${message}`, ...optionalParams);
};

// Handle new WebSocket connections
wss.on("connection", (ws, req) => {
  const remoteAddress = req.socket.remoteAddress;
  log(`New WebSocket connection from ${remoteAddress}`);

  let dgConnection = null;
  let isDeepgramReady = false;
  const audioBuffer = [];

  // Function to initialize Deepgram connection
  const initializeDeepgram = () => {
    dgConnection = deepgram.listen.live({
      model: "nova-2", // Use "nova" for the latest model
      language: "en-US",
      smart_format: true,
      punctuate: true,
      interim_results: true,
    });

    // Deepgram event listeners
    dgConnection.on(LiveTranscriptionEvents.Open, () => {
      log("Deepgram connection opened");
      isDeepgramReady = true;

      // Notify client that the server is ready to receive audio
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({ type: "ready" }));
        log("Sent 'ready' message to client");
      }

      // Flush any buffered audio chunks
      audioBuffer.forEach((chunk) => {
        dgConnection.send(chunk);
        log(`Flushed buffered audio chunk of size: ${chunk.length}`);
      });
      audioBuffer.length = 0; // Clear buffer
    });

    dgConnection.on(LiveTranscriptionEvents.Transcript, (data) => {
      log("Transcript received:", JSON.stringify(data));
      // Forward data to client
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(data));
      }
    });

    dgConnection.on(LiveTranscriptionEvents.Warning, (warning) => {
      log("Deepgram warning:", warning);
    });

    dgConnection.on(LiveTranscriptionEvents.Metadata, (metadata) => {
      log("Deepgram metadata:", JSON.stringify(metadata, null, 2));
    });

    dgConnection.on(LiveTranscriptionEvents.Error, (err) => {
      log("Deepgram error:", err);
      if (ws.readyState === ws.OPEN) {
        ws.send(
          JSON.stringify({
            error: "Speech recognition error occurred",
            details: err.message || err.toString(),
          })
        );
      }
    });

    dgConnection.on(LiveTranscriptionEvents.Close, () => {
      log("Deepgram connection closed");
      if (ws.readyState === ws.OPEN) {
        ws.close(1000, "Speech recognition ended");
      }
    });

    dgConnection.on(LiveTranscriptionEvents.SpeechStarted, (data) => {
      log("Speech started:", data);
    });
  };

  // Initialize Deepgram connection
  initializeDeepgram();

  // Handle incoming audio chunks from client
  ws.on("message", (chunk) => {
    if (!Buffer.isBuffer(chunk)) {
      log("Received non-binary data. Ignoring.");
      return;
    }

    log("Received audio chunk of size:", chunk.length);

    if (isDeepgramReady && dgConnection.getReadyState() === 1) {
      try {
        dgConnection.send(chunk);
        log("Audio chunk sent to Deepgram");
      } catch (error) {
        log("Error sending audio to Deepgram:", error);
        ws.send(
          JSON.stringify({
            error: "Failed to process audio",
            details: error.message || error.toString(),
          })
        );
      }
    } else {
      log("Deepgram connection is not open. Buffering audio chunk.");
      // Buffer the audio chunk to send later
      audioBuffer.push(chunk);
    }
  });

  // Handle WebSocket closure
  ws.on("close", async (code, reason) => {
    log(`WebSocket closed with code ${code}${reason ? `: ${reason}` : ""}`);
    try {
      if (dgConnection) {
        // Gracefully end the Deepgram connection
        await dgConnection.finish();
        log("Deepgram connection finished gracefully");
      }
    } catch (err) {
      log("Error closing Deepgram connection:", err);
    }
  });

  // Handle WebSocket errors
  ws.on("error", async (error) => {
    log("WebSocket error:", error);
    try {
      if (dgConnection) {
        await dgConnection.finish();
        log("Deepgram connection finished after WebSocket error");
      }
    } catch (dgError) {
      log("Error closing Deepgram connection after WebSocket error:", dgError);
    }
  });
});

// Global error handling for WebSocket server
wss.on("error", (error) => {
  log("WebSocket server error:", error);
});

// Start the HTTP server
server.listen(PORT, () => {
  log(`Server listening on port ${PORT}`);
});
