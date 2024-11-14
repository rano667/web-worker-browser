// public/worker.js

self.onmessage = async function (e) {
    const { urls, concurrencyLimit } = e.data;
  
    let currentIndex = 0;
    const totalRequests = urls.length;
    let activeRequests = 0;
    const responses = [];
  
    const makeRequest = async (url, index) => {
      try {
        const res = await fetch(url);
        const data = await res.json();
        responses[index] = { status: "fulfilled", data };
      } catch (error) {
        responses[index] = { status: "rejected", reason: error.message };
      } finally {
        activeRequests--;
        postProgress();
        processQueue();
      }
    };
  
    const processQueue = () => {
      while (activeRequests < concurrencyLimit && currentIndex < totalRequests) {
        activeRequests++;
        makeRequest(urls[currentIndex], currentIndex);
        currentIndex++;
      }
    };
  
    const postProgress = () => {
      self.postMessage({
        type: "progress",
        responses,
        currentIndex,
        totalRequests,
      });
    };
  
    processQueue();
  };
  