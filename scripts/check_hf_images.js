// Script to check which Hugging Face image URLs return 404
const fetch = require('node-fetch');
const fs = require('fs');

// Paste your list of image URLs here (from the API response)
const urls = [
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773096876593_images__8_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773239201321_cow.png",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773336048794_images__8_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773336435574_dry-skin-crack9-400x284.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773337498104_dry-skin-crack9-400x284.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773094554798_images__7_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773337088179_images__8_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/api/uploads/1773166951465_images__7_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/1773092643337_images__8_.jpg",
  "https://huggingface.co/datasets/NickMuhigi/livestock-disease-detector/resolve/main/images/1773093303902_images__7_.jpg"
];

(async () => {
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      if (res.status === 404) {
        console.log('MISSING:', url);
      } else {
        console.log('OK:', url);
      }
    } catch (e) {
      console.log('ERROR:', url, e.message);
    }
  }
})();
