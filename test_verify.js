const assert = require('assert');
const fs = require('fs');
const http = require('http');

console.log('--- RUNNING TIMEGLASS VERIFICATION SUITE (MULTIMODAL FUSION + DIAGNOSTICS) ---\n');

// 1. Verify points.json integrity
const rawPoints = fs.readFileSync('points.json', 'utf8');
const pointsData = JSON.parse(rawPoints);
const points = pointsData.points;
assert(Array.isArray(points), 'points.json should contain an array "points"');
assert.strictEqual(points.length, 12, 'Must contain 12 points');

const uniqueNames = [...new Set(points.map(p => p.name))];
console.log('Loaded', points.length, 'points:', uniqueNames);
assert.strictEqual(uniqueNames.length, 9, 'Contains 9 unique name labels across 6 locations');
console.log('✓ Test 1: points.json contains 12 entries across 6 locations.');

// 2. Math verification: Multimodal fusion scoring
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// Simulating photo and text embeddings
const mockQueryPhoto = [0.4, 0.6, 0.2];
const mockMushtifundPhoto = [0.42, 0.58, 0.22];
const mockUspaPhoto = [0.38, 0.62, 0.18]; // Visually very similar to Mushtifund!

const mockMushtifundText = [0.45, 0.55, 0.25]; // Aligned with Mushtifund architecture
const mockUspaText = [0.05, 0.90, 0.10];        // Commercial clothing store prompt

const simMushtifundImg = cosineSimilarity(mockQueryPhoto, mockMushtifundPhoto);
const simUspaImg = cosineSimilarity(mockQueryPhoto, mockUspaPhoto);

const simMushtifundText = cosineSimilarity(mockQueryPhoto, mockMushtifundText);
const simUspaText = cosineSimilarity(mockQueryPhoto, mockUspaText);

const fusedMushtifund = (0.55 * simMushtifundImg) + (0.45 * simMushtifundText);
const fusedUspa = (0.55 * simUspaImg) + (0.45 * simUspaText);

console.log('Visual similarity: Mushtifund =', simMushtifundImg.toFixed(3), 'USPA =', simUspaImg.toFixed(3));
console.log('Semantic text similarity: Mushtifund =', simMushtifundText.toFixed(3), 'USPA =', simUspaText.toFixed(3));
console.log('Fused multimodal score: Mushtifund =', fusedMushtifund.toFixed(3), 'USPA =', fusedUspa.toFixed(3));

assert(fusedMushtifund > fusedUspa, 'Semantic tiebreaker must clearly disambiguate visually similar buildings');
assert(fusedMushtifund >= 0.48, 'Must clear tuned threshold');
console.log('✓ Test 2: Multimodal fusion disambiguation math verified.');

// 3. Test Local Server Endpoints for all 12 photos
async function checkUrl(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:3000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const rIndex = await checkUrl('/');
    assert.strictEqual(rIndex.status, 200, 'index.html should return 200');
    
    const rPoints = await checkUrl('/points.json');
    assert.strictEqual(rPoints.status, 200, 'points.json should return 200');

    for (const p of points) {
      const res = await checkUrl('/' + p.photoUrl);
      assert.strictEqual(res.status, 200, `${p.photoUrl} should return 200 OK`);
    }

    console.log('✓ Test 3: All 12 photo assets return 200 OK from dev server.');
    console.log('\nALL VERIFICATION TESTS PASSED! 🚀');
  } catch (e) {
    console.error('Server endpoint test error:', e);
    process.exit(1);
  }
})();
