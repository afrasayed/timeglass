#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple JSON validation without external dependencies
function validatePointsJson() {
  const pointsPath = path.join(__dirname, 'points.json');

  try {
    // Read and parse the JSON file
    const pointsContent = fs.readFileSync(pointsPath, 'utf8');
    const pointsData = JSON.parse(pointsContent);

    // Basic structure validation
    if (!pointsData.points || !Array.isArray(pointsData.points)) {
      throw new Error('points.json must have a "points" array');
    }

    if (pointsData.points.length === 0) {
      throw new Error('points array cannot be empty');
    }

    // Validate each point
    const requiredFields = ['id', 'name', 'lat', 'lon', 'heading', 'year', 'photoUrl', 'caption'];
    const numericFields = ['lat', 'lon', 'heading', 'year'];

    for (let i = 0; i < pointsData.points.length; i++) {
      const point = pointsData.points[i];

      // Check required fields
      for (const field of requiredFields) {
        if (point[field] === undefined || point[field] === null || point[field] === '') {
          throw new Error(`Point at index ${i} is missing required field: ${field}`);
        }
      }

      // Check numeric fields
      for (const field of numericFields) {
        if (typeof point[field] !== 'number') {
          throw new Error(`Point at index ${i} has invalid ${field}: must be a number`);
        }
      }

      // Validate ranges
      if (point.lat < -90 || point.lat > 90) {
        throw new Error(`Point at index ${i} has invalid lat: must be between -90 and 90`);
      }
      if (point.lon < -180 || point.lon > 180) {
        throw new Error(`Point at index ${i} has invalid lon: must be between -180 and 180`);
      }
      if (point.heading < 0 || point.heading > 360) {
        throw new Error(`Point at index ${i} has invalid heading: must be between 0 and 360`);
      }

      // Check for duplicate IDs
      const duplicateIds = pointsData.points.filter((p, idx) => p.id === point.id && idx !== i);
      if (duplicateIds.length > 0) {
        throw new Error(`Duplicate ID found: ${point.id}`);
      }
    }

    console.log('✓ points.json is valid');
    console.log(`✓ Found ${pointsData.points.length} location points`);
    console.log('✓ All required fields present and correctly formatted');

    // List all IDs for verification
    const allIds = pointsData.points.map(p => p.id).sort();
    console.log('\nAll location IDs:');
    allIds.forEach(id => console.log(`  - ${id}`));

    return true;

  } catch (error) {
    console.error('❌ points.json validation failed:');
    console.error(`   ${error.message}`);
    process.exit(1);
  }
}

// Run validation
validatePointsJson();
