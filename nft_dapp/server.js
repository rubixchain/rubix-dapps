import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import multer from 'multer';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const app = express();

// Configure CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
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

// Mint NFT endpoint
app.post('/api/mint-nft', async (req, res) => {
  try {
    const { nodeUrl, contractHash, userDid, mintData } = req.body;

    console.log('=== Mint NFT Request Details ===');
    console.log('Node URL:', nodeUrl);
    console.log('Contract Hash:', contractHash);
    console.log('User DID:', userDid);
    console.log('Mint Data:', JSON.stringify(mintData, null, 2));

    // Step 1: Execute smart contract
    const executeRequest = {
      comment: `Mint NFT Request - ${Date.now()}`,
      executorAddr: userDid,
      quorumType: 2,
      smartContractData: JSON.stringify(mintData),
      smartContractToken: contractHash
    };

    console.log('Executing smart contract:', executeRequest);

    const executeResponse = await axios.post(
      `${nodeUrl}/api/execute-smart-contract`,
      executeRequest,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Smart contract response:', executeResponse.data);

    if (!executeResponse.data.status) {
      throw new Error(executeResponse.data.message || 'Smart contract execution failed');
    }

    const requestId = executeResponse.data.result.id;

    // Step 2: Submit signature
    console.log('Submitting signature for request:', requestId);

    const signatureRequest = {
      id: requestId,
      mode: 0,
      password: "mypassword"
    };

    const signatureResponse = await axios.post(
      `${nodeUrl}/api/signature-response`,
      signatureRequest,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('Signature response:', signatureResponse.data);

    if (!signatureResponse.data.status) {
      throw new Error(signatureResponse.data.message || 'Signature submission failed');
    }

    res.json({ status: true, message: 'NFT minting initiated successfully' });
  } catch (error) {
    console.error('Error in mint-nft endpoint:', error);
    res.status(500).json({
      status: false,
      message: error.message || 'Failed to mint NFT'
    });
  }
});

// File upload endpoint with error handling
app.post('/api/upload', upload.fields([
  { name: 'artifact', maxCount: 1 },
  { name: 'metadata', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Received file upload request');

    if (!req.files || !req.files['artifact'] || !req.files['metadata']) {
      console.error('Missing required files');
      return res.status(400).json({
        success: false,
        error: 'Both artifact and metadata files are required'
      });
    }

    const artifactFile = req.files['artifact'][0];
    const metadataFile = req.files['metadata'][0];

    console.log('Files received:', {
      artifact: artifactFile.filename,
      metadata: metadataFile.filename
    });

    res.json({
      success: true,
      paths: {
        artifactPath: artifactFile.path,
        metadataPath: metadataFile.path
      }
    });
  } catch (error) {
    console.error('Error handling file upload:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process file upload'
    });
  }
});

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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Accepting requests from: http://localhost:5173`);
  console.log(`File uploads will be stored in: ${path.join(__dirname, 'uploads')}`);
});
