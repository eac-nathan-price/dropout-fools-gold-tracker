import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateViewsFile(verbose = false) {
  try {
    // Read the views.json file
    const viewsPath = path.join(__dirname, 'src', 'views.json');
    const viewsData = JSON.parse(fs.readFileSync(viewsPath, 'utf8'));
    
    const timesLength = viewsData.times.length;
    console.log(`📊 Times array length: ${timesLength}`);
    if (verbose) {
      console.log(`📅 Date range: ${viewsData.times[0]} to ${viewsData.times[timesLength - 1]}`);
    }
    console.log('');
    
    const videoNames = Object.keys(viewsData.videos);
    const platformNames = ['youtube', 'tiktok', 'instagram'];
    
    let allValid = true;
    const issues = [];
    const arrayDetails = [];
    const decreasingViews = [];
    
    // Check each video's platform arrays
    for (const videoName of videoNames) {
      const video = viewsData.videos[videoName];
      
      for (const platform of platformNames) {
        const array = video[platform];
        const arrayLength = array.length;
        
        // Check for decreasing views
        for (let i = 1; i < array.length; i++) {
          if (array[i] < array[i - 1]) {
            decreasingViews.push({
              video: videoName,
              platform: platform,
              date: viewsData.times[i],
              previousValue: array[i - 1],
              currentValue: array[i],
              decrease: array[i - 1] - array[i]
            });
          }
        }
        
        if (verbose) {
          // Calculate some statistics
          const maxValue = Math.max(...array);
          const minValue = Math.min(...array);
          const lastValue = array[arrayLength - 1];
          arrayDetails.push({
            video: videoName,
            platform: platform,
            length: arrayLength,
            maxValue: maxValue,
            minValue: minValue,
            lastValue: lastValue,
            totalGrowth: lastValue - minValue
          });
        }
        
        if (arrayLength !== timesLength) {
          allValid = false;
          const status = arrayLength < timesLength ? '❌ TOO SHORT' : '❌ TOO LONG';
          issues.push({
            video: videoName,
            platform: platform,
            length: arrayLength,
            expected: timesLength,
            difference: Math.abs(arrayLength - timesLength),
            status: status
          });
        }
      }
    }
    
    // Report results
    if (allValid) {
      console.log('✅ All arrays have consistent lengths!');
      console.log(`   Expected length: ${timesLength}`);
      console.log(`   Videos checked: ${videoNames.length}`);
      console.log(`   Platforms per video: ${platformNames.length}`);
      console.log(`   Total arrays validated: ${videoNames.length * platformNames.length + 1}`);
      if (verbose) {
        console.log('');
        // Show detailed breakdown
        console.log('📈 Detailed Array Information:');
        console.log('='.repeat(80));
        // Group by video
        for (const videoName of videoNames) {
          console.log(`\n📹 ${videoName}:`);
          const videoDetails = arrayDetails.filter(d => d.video === videoName);
          videoDetails.forEach(detail => {
            console.log(`   ${detail.platform.padEnd(10)}: ${detail.length.toString().padStart(2)} items | ` +
                        `Range: ${detail.minValue.toLocaleString()} - ${detail.maxValue.toLocaleString()} | ` +
                        `Final: ${detail.lastValue.toLocaleString()} | ` +
                        `Growth: +${detail.totalGrowth.toLocaleString()}`);
          });
        }
        // Show platform comparisons
        console.log('\n📊 Platform Comparison:');
        console.log('='.repeat(80));
        for (const platform of platformNames) {
          const platformDetails = arrayDetails.filter(d => d.platform === platform);
          const avgMaxValue = platformDetails.reduce((sum, d) => sum + d.maxValue, 0) / platformDetails.length;
          const avgGrowth = platformDetails.reduce((sum, d) => sum + d.totalGrowth, 0) / platformDetails.length;
          console.log(`\n${platform.toUpperCase()}:`);
          console.log(`   Average max value: ${Math.round(avgMaxValue).toLocaleString()}`);
          console.log(`   Average growth: +${Math.round(avgGrowth).toLocaleString()}`);
          // Show top performers
          const topByMax = platformDetails.sort((a, b) => b.maxValue - a.maxValue).slice(0, 3);
          console.log(`   Top performers by max value:`);
          topByMax.forEach((detail, index) => {
            console.log(`     ${index + 1}. ${detail.video}: ${detail.maxValue.toLocaleString()}`);
          });
        }
      }
    } else {
      console.log('❌ Found arrays with inconsistent lengths:');
      console.log('');
      // Group issues by video for better readability
      const issuesByVideo = {};
      issues.forEach(issue => {
        if (!issuesByVideo[issue.video]) {
          issuesByVideo[issue.video] = [];
        }
        issuesByVideo[issue.video].push(issue);
      });
      for (const [videoName, videoIssues] of Object.entries(issuesByVideo)) {
        console.log(`📹 ${videoName}:`);
        videoIssues.forEach(issue => {
          console.log(`   ${issue.platform}: ${issue.length} items (expected ${issue.expected}) ${issue.status}`);
        });
        console.log('');
      }
      console.log(`📈 Summary:`);
      console.log(`   Expected length: ${timesLength}`);
      console.log(`   Issues found: ${issues.length}`);
      console.log(`   Videos with issues: ${Object.keys(issuesByVideo).length}`);
    }
    
    // Report decreasing views (both normal and verbose modes)
    if (decreasingViews.length > 0) {
      console.log('');
      console.log('📉 Decreasing Views Detected:');
      console.log('='.repeat(80));
      
      // Group by video for better readability
      const decreasingByVideo = {};
      decreasingViews.forEach(item => {
        if (!decreasingByVideo[item.video]) {
          decreasingByVideo[item.video] = [];
        }
        decreasingByVideo[item.video].push(item);
      });
      
      for (const [videoName, videoDecreases] of Object.entries(decreasingByVideo)) {
        console.log(`\n📹 ${videoName}:`);
        videoDecreases.forEach(item => {
          console.log(`   ${item.platform.padEnd(10)} | ${item.date} | ${item.previousValue.toLocaleString()} → ${item.currentValue.toLocaleString()} (${item.decrease > 0 ? '-' : '+'}${Math.abs(item.decrease).toLocaleString()})`);
        });
      }
      
      console.log(`\n📊 Summary:`);
      console.log(`   Total decreases: ${decreasingViews.length}`);
      console.log(`   Videos affected: ${Object.keys(decreasingByVideo).length}`);
      console.log(`   Average decrease: ${Math.round(decreasingViews.reduce((sum, item) => sum + item.decrease, 0) / decreasingViews.length).toLocaleString()}`);
    } else {
      console.log('');
      console.log('✅ No decreasing views detected - all data shows consistent growth!');
    }
  } catch (error) {
    console.error('❌ Error reading or parsing views.json:', error.message);
    process.exit(1);
  }
}

// Parse --verbose argument
const verbose = process.argv.includes('--verbose');

// Run the validation
validateViewsFile(verbose); 