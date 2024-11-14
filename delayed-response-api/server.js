const express = require("express");
const cors = require("cors");

const app = express();
const port = 4002;

// Enable CORS for all routes
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// API endpoint that responds after 7 seconds with a structured JSON response
app.get("/delayed-response", (req, res) => {
  console.log("Request received. Waiting for 5 seconds before responding...");

  const requestId = Math.floor(Math.random() * 10000); // Random ID for request
  const startTime = Date.now();

  setTimeout(() => {
    const endTime = Date.now();
    const delay = (endTime - startTime) / 1000; // delay in seconds

    res.json({
      requestId: requestId,
      message: "This response was delayed",
      delayInSeconds: delay,
      timestamp: new Date().toISOString(),
    });
  }, 5000);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
