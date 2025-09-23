import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChildSchema, insertPregnancySchema, insertCommunityPostSchema } from "@shared/schema";
import { z } from "zod";
import admin from 'firebase-admin';
import { getKepiSchedule, generateVaccinationSchedule, getNextVaccination } from "./services/kepi-schedule";
import { getAncGuidelines, calculatePregnancyWeeks, generateAncSchedule } from "./services/anc-guidelines";
import { generateHealthTip, analyzeHealthData } from "./services/ai-health";

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

// Middleware to verify Firebase ID token
async function verifyFirebaseToken(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    const idToken = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : req.body.idToken || req.query.idToken;

    if (!idToken) {
      return res.status(401).json({ message: "No authentication token provided" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Invalid authentication token" });
  }
}

// Get or create user from Firebase token
async function getCurrentUser(req: any) {
  let user = await storage.getUserByFirebaseUid(req.user.uid);
  
  if (!user) {
    // Create user if doesn't exist
    const userData = {
      firebaseUid: req.user.uid,
      email: req.user.email,
      firstName: req.user.name?.split(' ')[0] || '',
      lastName: req.user.name?.split(' ').slice(1).join(' ') || '',
    };
    user = await storage.createUser(userData);
  }
  
  return user;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post('/api/users/profile', async (req, res) => {
    try {
      const { firebaseUid, email, firstName, lastName, idToken } = req.body;
      
      if (!idToken) {
        return res.status(401).json({ message: "Authentication token required" });
      }

      // Verify the token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      if (decodedToken.uid !== firebaseUid) {
        return res.status(403).json({ message: "Token mismatch" });
      }

      // Check if user already exists
      let user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        // Create new user
        const userData = insertUserSchema.parse({
          firebaseUid,
          email,
          firstName,
          lastName,
        });
        user = await storage.createUser(userData);
      }

      res.json(user);
    } catch (error: any) {
      console.error("Profile creation error:", error);
      res.status(400).json({ message: error.message || "Failed to create profile" });
    }
  });

  app.get('/api/users/profile', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      res.json(user);
    } catch (error: any) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: error.message || "Failed to get profile" });
    }
  });

  app.patch('/api/users/profile', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const updates = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(user.id, updates);
      res.json(updatedUser);
    } catch (error: any) {
      console.error("Update profile error:", error);
      res.status(400).json({ message: error.message || "Failed to update profile" });
    }
  });

  app.get('/api/users/stats', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const stats = await storage.getUserStats(user.id);
      res.json(stats);
    } catch (error: any) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: error.message || "Failed to get user stats" });
    }
  });

  // Children routes
  app.get('/api/children', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const children = await storage.getChildrenByMother(user.id);
      
      // Add age and next vaccination for each child
      const childrenWithDetails = await Promise.all(children.map(async (child) => {
        const vaccinations = await storage.getVaccinationsByChild(child.id);
        const nextVaccination = getNextVaccination(child.dateOfBirth, vaccinations);
        
        // Calculate age
        const today = new Date();
        const birth = new Date(child.dateOfBirth);
        const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
        
        let age;
        if (ageInMonths < 12) {
          age = `${ageInMonths} months`;
        } else {
          const years = Math.floor(ageInMonths / 12);
          const months = ageInMonths % 12;
          age = months > 0 ? `${years} years, ${months} months` : `${years} years`;
        }

        return {
          ...child,
          age,
          nextVaccination,
        };
      }));

      res.json(childrenWithDetails);
    } catch (error: any) {
      console.error("Get children error:", error);
      res.status(500).json({ message: error.message || "Failed to get children" });
    }
  });

  app.post('/api/children', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const childData = insertChildSchema.parse({
        ...req.body,
        motherId: user.id,
      });
      
      const child = await storage.createChild(childData);
      
      // Generate vaccination schedule based on Kenya EPI
      const schedule = generateVaccinationSchedule(child.dateOfBirth);
      
      // Create vaccination records
      for (const vaccine of schedule) {
        await storage.createVaccination({
          childId: child.id,
          vaccineName: vaccine.name,
          doseNumber: vaccine.dose,
          scheduledDate: vaccine.date,
          status: 'scheduled',
        });
      }

      // Create health reminders for upcoming vaccinations
      const upcomingVaccines = schedule.filter(v => new Date(v.date) > new Date()).slice(0, 3);
      for (const vaccine of upcomingVaccines) {
        await storage.createReminder({
          userId: user.id,
          childId: child.id,
          type: 'vaccination',
          title: `${vaccine.name} Vaccination Due`,
          description: `${child.firstName}'s ${vaccine.name} vaccination (dose ${vaccine.dose}) is due`,
          dueDate: vaccine.date,
          priority: 'normal',
        });
      }

      res.json(child);
    } catch (error: any) {
      console.error("Create child error:", error);
      res.status(400).json({ message: error.message || "Failed to create child" });
    }
  });

  // Pregnancy routes
  app.get('/api/pregnancies/active', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const pregnancy = await storage.getActivePregnancy(user.id);
      
      if (pregnancy) {
        // Update current weeks and days
        const { weeks, days } = calculatePregnancyWeeks(pregnancy.lmpDate);
        const updatedPregnancy = await storage.updatePregnancy(pregnancy.id, {
          currentWeeks: weeks,
          currentDays: days,
        });

        // Get next ANC visit
        const ancVisits = await storage.getAncVisitsByPregnancy(pregnancy.id);
        const nextAncVisit = ancVisits.find(visit => visit.status === 'scheduled');

        res.json({
          ...updatedPregnancy,
          nextAncVisit,
        });
      } else {
        res.json(null);
      }
    } catch (error: any) {
      console.error("Get active pregnancy error:", error);
      res.status(500).json({ message: error.message || "Failed to get active pregnancy" });
    }
  });

  app.post('/api/pregnancies', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const pregnancyData = insertPregnancySchema.parse({
        ...req.body,
        motherId: user.id,
      });
      
      const pregnancy = await storage.createPregnancy(pregnancyData);
      
      // Generate ANC visit schedule
      const ancSchedule = generateAncSchedule(pregnancy.lmpDate);
      
      // Create ANC visit records
      for (const visit of ancSchedule) {
        await storage.createAncVisit({
          pregnancyId: pregnancy.id,
          visitNumber: visit.visitNumber,
          scheduledDate: visit.date,
          gestationalWeeks: visit.gestationalWeeks,
          status: 'scheduled',
        });
      }

      // Create ANC reminders
      for (const visit of ancSchedule.slice(0, 2)) {
        await storage.createReminder({
          userId: user.id,
          pregnancyId: pregnancy.id,
          type: 'anc_visit',
          title: `ANC Visit ${visit.visitNumber}`,
          description: `Your antenatal care visit ${visit.visitNumber} is scheduled`,
          dueDate: visit.date,
          priority: 'normal',
        });
      }

      // Create IFAS reminder
      await storage.createReminder({
        userId: user.id,
        pregnancyId: pregnancy.id,
        type: 'ifas_refill',
        title: 'IFAS Supplements',
        description: 'Remember to take your Iron and Folic Acid supplements daily',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        priority: 'normal',
      });

      res.json(pregnancy);
    } catch (error: any) {
      console.error("Create pregnancy error:", error);
      res.status(400).json({ message: error.message || "Failed to create pregnancy" });
    }
  });

  app.get('/api/pregnancy/guidelines', async (req, res) => {
    try {
      const guidelines = getAncGuidelines();
      res.json(guidelines);
    } catch (error: any) {
      console.error("Get pregnancy guidelines error:", error);
      res.status(500).json({ message: error.message || "Failed to get guidelines" });
    }
  });

  // ANC Visits routes
  app.get('/api/anc-visits', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const pregnancy = await storage.getActivePregnancy(user.id);
      
      if (!pregnancy) {
        return res.json([]);
      }

      const ancVisits = await storage.getAncVisitsByPregnancy(pregnancy.id);
      res.json(ancVisits);
    } catch (error: any) {
      console.error("Get ANC visits error:", error);
      res.status(500).json({ message: error.message || "Failed to get ANC visits" });
    }
  });

  // Reminders routes
  app.get('/api/reminders/upcoming', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const limit = parseInt(req.query.limit as string) || 10;
      const reminders = await storage.getUpcomingReminders(user.id, limit);
      res.json(reminders);
    } catch (error: any) {
      console.error("Get upcoming reminders error:", error);
      res.status(500).json({ message: error.message || "Failed to get reminders" });
    }
  });

  // Health Tips routes
  app.get('/api/health-tips', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      
      // Get user's current pregnancy and children for context
      const pregnancy = await storage.getActivePregnancy(user.id);
      const children = await storage.getChildrenByMother(user.id);
      
      // Generate AI health tips based on user's situation
      const tips = await generateHealthTip(user, pregnancy, children);
      res.json(tips);
    } catch (error: any) {
      console.error("Get health tips error:", error);
      res.status(500).json({ message: error.message || "Failed to get health tips" });
    }
  });

  // Community routes
  app.get('/api/community/posts', verifyFirebaseToken, async (req, res) => {
    try {
      const category = req.query.category as string;
      const search = req.query.search as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const posts = await storage.getCommunityPosts(category, search, limit);
      res.json(posts);
    } catch (error: any) {
      console.error("Get community posts error:", error);
      res.status(500).json({ message: error.message || "Failed to get posts" });
    }
  });

  app.get('/api/community/highlights', verifyFirebaseToken, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 5;
      const highlights = await storage.getCommunityHighlights(limit);
      res.json(highlights);
    } catch (error: any) {
      console.error("Get community highlights error:", error);
      res.status(500).json({ message: error.message || "Failed to get highlights" });
    }
  });

  app.post('/api/community/posts', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const postData = insertCommunityPostSchema.parse({
        ...req.body,
        authorId: user.id,
      });
      
      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error: any) {
      console.error("Create community post error:", error);
      res.status(400).json({ message: error.message || "Failed to create post" });
    }
  });

  app.post('/api/community/posts/:postId/like', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await getCurrentUser(req);
      const postId = req.params.postId;
      
      await storage.likeCommunityPost(postId, user.id);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Like post error:", error);
      res.status(400).json({ message: error.message || "Failed to like post" });
    }
  });

  // Health Facilities routes
  app.get('/api/health-facilities', async (req, res) => {
    try {
      const county = req.query.county as string;
      const type = req.query.type as string;
      
      const facilities = await storage.getHealthFacilities(county, type);
      res.json(facilities);
    } catch (error: any) {
      console.error("Get health facilities error:", error);
      res.status(500).json({ message: error.message || "Failed to get facilities" });
    }
  });

  app.get('/api/health-facilities/nearby', async (req, res) => {
    try {
      const latitude = req.query.lat as string;
      const longitude = req.query.lng as string;
      const radius = parseInt(req.query.radius as string) || 10;
      
      if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const facilities = await storage.getNearbyHealthFacilities(latitude, longitude, radius);
      res.json(facilities);
    } catch (error: any) {
      console.error("Get nearby facilities error:", error);
      res.status(500).json({ message: error.message || "Failed to get nearby facilities" });
    }
  });

  // Kenya EPI Schedule routes
  app.get('/api/kepi/schedule', async (req, res) => {
    try {
      const schedule = getKepiSchedule();
      res.json(schedule);
    } catch (error: any) {
      console.error("Get KEPI schedule error:", error);
      res.status(500).json({ message: error.message || "Failed to get KEPI schedule" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
