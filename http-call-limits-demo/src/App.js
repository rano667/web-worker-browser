// src/App.js
import { useState } from 'react';

function App() {
  const [workerResults, setWorkerResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const totalWorkers = 2; // Number of workers
  const concurrencyLimit = 8; // Number of API calls per worker
  const urls = new Array(36).fill('http://localhost:4000/delayed-response'); // Example API calls

  const handleWorkerMessage = (workerId, e) => {
    const { responses, done } = e.data;

    setWorkerResults((prevResults) => ({
      ...prevResults,
      [workerId]: (prevResults[workerId] || []).concat(responses),
    }));

    if (done) {
      setLoading(false);
    }
  };

  const makeConcurrentCalls = async () => {
    setLoading(true);
    setError(null);
    setWorkerResults({}); // Clear previous results

    const workers = [];
    const requestsPerWorker = Math.ceil(urls.length / totalWorkers);

    for (let i = 0; i < totalWorkers; i++) {
      const worker = new Worker(new URL('./worker.js', import.meta.url));

      // Assign a subset of URLs to each worker
      const workerUrls = urls.slice(i * requestsPerWorker, (i + 1) * requestsPerWorker);

      worker.postMessage({
        urls: workerUrls,
        concurrencyLimit,
      });

      worker.onmessage = (e) => handleWorkerMessage(i, e);
      worker.onerror = (err) => {
        setError(`Worker ${i} Error: ${err.message}`);
        setLoading(false);
      };

      workers.push(worker);
    }
  };

  return (
    <div>
      <h1>Multi-Worker API Calls Example</h1>
      <button onClick={makeConcurrentCalls} disabled={loading}>
        {loading ? 'Loading...' : 'Make Concurrent Calls'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <div>
        {Object.keys(workerResults).map((workerId) => (
          <div key={workerId}>
            <h2>Worker {parseInt(workerId) + 1}</h2>
            {workerResults[workerId].map((res, i) => (
              <p key={i}>{res.message || res.error || 'Error'}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
