import { HttpsProxyAgent } from 'https-proxy-agent';
import fetch from 'node-fetch';

const proxyAgent = new HttpsProxyAgent('http://0.0.0.0:8000');
const fetchOptions = {
  agent: proxyAgent
};

const queue = [];
for (let i = 0; i < 20; i++) {
  queue.push(`https://graph.microsoft.com/v1.0/me?a=${i}`);
}

async function run() {
  let activeRequests = 0;
  let completedRequests = 0;

  while (queue.length > 0) {
    console.log(`activeRequests: ${activeRequests}, queue: ${queue.length}`);

    if (activeRequests >= 10) {
      console.log('sleeping...');
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }

    const url = queue.shift();
    activeRequests++;

    fetch(url, fetchOptions)
      .then(async res => {
        completedRequests++;
        const data = await res.json();
        console.log(JSON.stringify(data));
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        activeRequests--;
        console.log(`completedRequests: ${completedRequests}`);
      });
  }
}

run();