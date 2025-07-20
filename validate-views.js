import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import process from 'process';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function validateViewsFile() {
  try {
    // Read the views.json file
    const viewsPath = path.join(__dirname, 'src', 'views.json');
    const viewsData = JSON.parse(fs.readFileSync(viewsPath, 'utf8'));
    
    const timesLength = viewsData.times.length;
    console.log(`📊 Times array length: ${timesLength}`);
    console.log('');
    
    const videoNames = Object.keys(viewsData.videos);
    const platformNames = ['youtube', 'tiktok', 'instagram'];
    
    let allValid = true;
    const issues = [];
    
    // Check each video's platform arrays
    for (const videoName of videoNames) {
      const video = viewsData.videos[videoName];
      
      for (const platform of platformNames) {
        const arrayLength = video[platform].length;
        
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
    
  } catch (error) {
    console.error('❌ Error reading or parsing views.json:', error.message);
    process.exit(1);
  }
}

// Run the validation
validateViewsFile(); 