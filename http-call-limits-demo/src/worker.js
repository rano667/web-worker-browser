/* eslint-disable no-restricted-globals */

// worker.js

self.onmessage = async function(e) {
  const { urls, concurrencyLimit } = e.data;
  const responses = [];

  // Function to handle a single API request
  const fetchUrl = async (url) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      return data;
    } catch (err) {
      return { error: err.message };
    }
  };

  // Make concurrent API requests
  const processBatch = async (batch) => {
    const batchResponses = await Promise.all(batch.map(fetchUrl));
    return batchResponses;
  };

  // Split the URLs into smaller batches
  for (let i = 0; i < urls.length; i += concurrencyLimit) {
    const batch = urls.slice(i, i + concurrencyLimit);
    const batchResponses = await processBatch(batch);
    responses.push(...batchResponses);

    // Send responses back to the main thread
    self.postMessage({
      responses: batchResponses,
      currentIndex: i + concurrencyLimit,
      totalRequests: urls.length,
      done: i + concurrencyLimit >= urls.length,
    });
  }
};

