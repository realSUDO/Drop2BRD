import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import { extractText, detectFileType } from "./extractors/index.js";
import { processExtractedTexts } from "./extractors/processor.js";
import { generateBRDFromChunks } from "./llm/generateBRD.js";
import * as firebase from "./firebase.js";

const app = express();
const PORT = 3001;

app.use(cors({
  origin: true, // Allow all origins
  credentials: true
}));
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// In-memory storage for temporary project data
const projectsCache = new Map();
let projectCounter = 1;

// Auth middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const userId = await firebase.verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    console.error('Authentication failed:', error.message);
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Test Firebase connection on startup
(async () => {
  try {
    const connected = await firebase.testConnection();
    if (connected) {
      console.log('🎉 Firebase is ready to use!\n');
    } else {
      console.log('⚠️  Firebase connection test failed. Check your configuration.\n');
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    console.log('⚠️  Server will continue but Firebase features may not work.\n');
  }
})();

// Test Firebase connection on startup
(async () => {
  try {
    const connected = await firebase.testConnection();
    if (connected) {
      console.log('🎉 Firebase is ready to use!\n');
    } else {
      console.log('⚠️  Firebase connection test failed. Check your configuration.\n');
    }
  } catch (error) {
    console.error('❌ Firebase connection error:', error.message);
    console.log('⚠️  Server will continue but Firebase features may not work.\n');
  }
})();

// Upload file and process
app.post("/api/projects/:id/upload", authenticate, upload.single('file'), async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;
    const file = req.file;
    const projectName = req.body.projectName || `Project ${projectCounter++}`;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📤 FILE UPLOAD REQUEST");
    console.log("=".repeat(60));
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`📁 Filename: ${file.originalname}`);
    console.log(`📊 Size: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`📝 Project Name: ${projectName}`);
    console.log("");

    // Detect file type
    const fileType = detectFileType(file.originalname);
    
    // Extract text based on file type
    const texts = await extractText(file.path, fileType);

    // Process extracted texts
    const processedChunks = processExtractedTexts(texts, projectId, fileType);

    // Store chunks in memory (temporary)
    const cacheKey = `${userId}:${projectId}`;
    
    // Check if project already exists in cache
    let existingProject = projectsCache.get(cacheKey);
    
    if (existingProject) {
      // Append chunks to existing project
      existingProject.chunks.push(...processedChunks);
    } else {
      // Create new project
      const projectData = {
        id: projectId,
        userId,
        name: projectName,
        chunks: processedChunks,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };
      projectsCache.set(cacheKey, projectData);

      // Create project metadata in Firestore
      await firebase.saveProjectMetadata(userId, projectId, {
        id: projectId,
        name: projectName,
        uploadedAt: projectData.uploadedAt,
        status: 'uploaded'
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(file.path);

    console.log("\n✅ FILE PROCESSING COMPLETE");
    console.log("=".repeat(60) + "\n");

    res.json({
      projectId,
      chunksCount: processedChunks.length,
      message: "File processed successfully"
    });
  } catch (error) {
    console.error("\n❌ ERROR DURING FILE UPLOAD");
    console.error("=".repeat(60));
    console.error(error);
    console.error("=".repeat(60) + "\n");
    
    // Clean up file on error
    if (req.file) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Generate BRD from uploaded data
app.post("/api/projects/:id/generate-brd", authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;
    
    console.log("\n" + "=".repeat(60));
    console.log("🚀 BRD GENERATION REQUEST");
    console.log("=".repeat(60));
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`👤 User ID: ${userId}`);
    console.log("");

    // Get project data from memory
    const cacheKey = `${userId}:${projectId}`;
    const project = projectsCache.get(cacheKey);
    
    if (!project) {
      return res.status(404).json({ error: "Project not found. Please upload a file first." });
    }

    console.log(`⏳ Generating BRD from ${project.chunks.length} chunks...`);
    const brd = await generateBRDFromChunks(project.chunks);
    console.log(`   ✓ Generated BRD (${brd.length} characters)`);

    // Save only the BRD to Firebase (with project metadata)
    await firebase.saveBRD(userId, projectId, brd);
    await firebase.saveProjectMetadata(userId, projectId, {
      status: 'completed',
      updatedAt: new Date().toISOString()
    });
    
    // Clear chunks from memory after BRD is generated
    projectsCache.delete(cacheKey);

    console.log("\n✅ BRD GENERATION COMPLETE");
    console.log("=".repeat(60) + "\n");

    res.json({
      projectId,
      brd,
      generatedAt: new Date().toISOString(),
      stats: {
        totalChunks: project.chunks.length
      }
    });
  } catch (error) {
    console.error("\n❌ ERROR DURING BRD GENERATION");
    console.error("=".repeat(60));
    console.error(error);
    console.error("=".repeat(60) + "\n");
    res.status(500).json({ error: error.message });
  }
});

// Get all projects
app.get("/api/projects", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const projects = await firebase.getAllProjectMetadata(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// Rename project
app.patch("/api/projects/:id/rename", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { name } = req.body;
    
    // Update in memory if exists
    const cacheKey = `${userId}:${req.params.id}`;
    const cachedProject = projectsCache.get(cacheKey);
    if (cachedProject) {
      cachedProject.name = name;
      projectsCache.set(cacheKey, cachedProject);
    }
    
    // Update in Firestore
    await firebase.updateProjectMetadata(userId, req.params.id, { name });
    res.json({ success: true, name });
  } catch (error) {
    console.error('Error renaming project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project
app.delete("/api/projects/:id", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;
    
    // Delete from memory
    const cacheKey = `${userId}:${projectId}`;
    projectsCache.delete(cacheKey);
    
    // Delete from Firestore
    await firebase.deleteProject(userId, projectId);
    console.log(`🗑️  Deleted project: ${projectId}`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get generated BRD
app.get("/api/projects/:id/brd", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const brdData = await firebase.getBRD(userId, req.params.id);
    if (!brdData) {
      return res.status(404).json({ error: "BRD not found. Generate it first." });
    }
    res.json({ projectId: req.params.id, brd: brdData.content });
  } catch (error) {
    console.error('Error fetching BRD:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update BRD directly (manual edit)
app.put("/api/projects/:id/brd", authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { content } = req.body;
    
    await firebase.updateBRD(userId, req.params.id, content);
    console.log(`✅ BRD manually updated: ${req.params.id}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating BRD:', error);
    res.status(500).json({ error: error.message });
  }
});

// Edit BRD with AI
app.post("/api/projects/:id/edit-brd", authenticate, async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;
    const { changeDescription } = req.body;
    
    const brdData = await firebase.getBRD(userId, projectId);
    if (!brdData) {
      return res.status(404).json({ error: "BRD not found" });
    }

    const currentBRD = brdData.content;

    console.log("\n" + "=".repeat(60));
    console.log("✏️  BRD EDIT REQUEST");
    console.log("=".repeat(60));
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`📝 Change: ${changeDescription}`);
    console.log("");

    const prompt = `You are editing a Business Requirements Document (BRD).

Current BRD:
${currentBRD}

Requested Change:
${changeDescription}

Instructions:
- Apply the requested change to the BRD
- Maintain the same structure and formatting
- Keep all other sections unchanged unless the change affects them
- Output the complete updated BRD in Markdown format
- Do NOT add explanations or comments, just return the updated BRD`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 16000,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || "Gemini API error");
    }

    const updatedBRD = data.candidates[0].content.parts[0].text
      .replace(/```markdown\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Update BRD in Firebase
    await firebase.updateBRD(userId, projectId, updatedBRD);

    console.log("✅ BRD UPDATED");
    console.log("=".repeat(60) + "\n");

    res.json({
      projectId,
      brd: updatedBRD,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("\n❌ ERROR DURING BRD EDIT");
    console.error("=".repeat(60));
    console.error(error);
    console.error("=".repeat(60) + "\n");
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🚀 BRD GENERATOR BACKEND");
  console.log("=".repeat(60));
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`📊 Status: Ready`);
  console.log("");
  console.log("💡 Mode: Direct LLM BRD Generation");
  console.log("   • Processes filtered chunks");
  console.log("   • Generates BRD in one LLM call");
  console.log("   • No pre-classification needed");
  console.log("=".repeat(60) + "\n");
});
