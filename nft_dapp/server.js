import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configure CORS with specific origin
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Cache for config data
let configCache = null;
let lastRead = 0;
const CACHE_TTL = 5000; // 5 seconds cache

async function readConfig() {
  const now = Date.now();
  if (configCache && (now - lastRead) < CACHE_TTL) {
    return configCache;
  }

  const configPath = path.join(__dirname, 'app.node.json');
  const configData = await fs.readFile(configPath, 'utf8');
  configCache = JSON.parse(configData);
  lastRead = now;
  return configCache;
}

// API endpoint to write to app.node.json
app.post('/api/writeConfig', async (req, res) => {
  try {
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No update data provided' 
      });
    }

    const configPath = path.join(__dirname, 'app.node.json');
    
    // Read existing config
    let existingConfig;
    try {
      existingConfig = await readConfig();
    } catch (error) {
      console.error('Error reading config file:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Failed to read configuration file' 
      });
    }
    
    // Merge updates with existing config
    const newConfig = { ...existingConfig, ...updates };
    
    // Write back to file
    try {
      await fs.writeFile(configPath, JSON.stringify(newConfig, null, 4));
      // Update cache
      configCache = newConfig;
      lastRead = Date.now();
      
      console.log('Configuration updated successfully:', updates);
      res.json({ success: true });
    } catch (error) {
      console.error('Error writing to config file:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to write configuration' 
      });
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    });
  }
});

// API endpoint to read the current config
app.get('/api/config', async (req, res) => {
  try {
    const config = await readConfig();
    res.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to read configuration' 
    });
  }
});

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accepting requests from: http://localhost:5173`);
});
