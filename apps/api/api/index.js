var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/models/user.model.ts
var user_model_exports = {};
__export(user_model_exports, {
  UserModel: () => UserModel
});
import mongoose, { Schema } from "mongoose";
var UserSchema, UserModel;
var init_user_model = __esm({
  "src/models/user.model.ts"() {
    "use strict";
    UserSchema = new Schema(
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        email: {
          type: String,
          lowercase: true,
          trim: true,
          required: true,
          unique: true
        },
        password: {
          type: String,
          select: false
          // Don't return password in queries by default
        },
        role: {
          type: String,
          enum: ["admin", "member"],
          default: "member"
        },
        status: {
          type: String,
          enum: ["invited", "active", "deactivated"],
          default: "active"
        },
        inviteTokenHash: {
          type: String,
          select: false
        },
        avatarUrl: {
          type: String
        },
        avatarColor: {
          type: String,
          required: true,
          default: "#4F46E5"
        },
        theme: {
          type: String,
          enum: ["light", "dark"],
          default: "dark"
        },
        lastActiveAt: {
          type: Date
        },
        jobTitle: {
          type: String,
          trim: true
        }
      },
      {
        timestamps: { createdAt: true, updatedAt: false },
        toJSON: {
          transform: (_doc, ret) => {
            ret._id = ret._id?.toString();
            delete ret.password;
            delete ret.inviteTokenHash;
            return ret;
          }
        }
      }
    );
    UserModel = mongoose.model("User", UserSchema);
  }
});

// src/models/notification.model.ts
import mongoose2, { Schema as Schema2 } from "mongoose";
var NotificationSchema, NotificationModel;
var init_notification_model = __esm({
  "src/models/notification.model.ts"() {
    "use strict";
    NotificationSchema = new Schema2(
      {
        userId: {
          type: Schema2.Types.ObjectId,
          ref: "User",
          required: true,
          index: true
        },
        type: {
          type: String,
          enum: [
            "assigned",
            "assignment_requested",
            "assignment_approved",
            "assignment_rejected",
            "status_changed",
            "mentioned",
            "invite_accepted",
            "project_request",
            "task_created",
            "comment_added",
            "tags_changed",
            "description_changed",
            "assignee_changed"
          ],
          required: true
        },
        taskId: {
          type: Schema2.Types.ObjectId,
          ref: "Task",
          default: null
        },
        actorId: {
          type: Schema2.Types.ObjectId,
          ref: "User",
          default: null
        },
        message: {
          type: String,
          required: true
        },
        read: {
          type: Boolean,
          default: false
        }
      },
      {
        timestamps: true,
        toJSON: {
          transform: (_doc, ret) => {
            ret._id = ret._id?.toString();
            ret.userId = ret.userId?.toString();
            ret.taskId = ret.taskId ? ret.taskId.toString() : null;
            ret.actorId = ret.actorId ? ret.actorId.toString() : null;
            return ret;
          }
        }
      }
    );
    NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
    NotificationModel = mongoose2.model("Notification", NotificationSchema);
  }
});

// src/models/project.model.ts
var project_model_exports = {};
__export(project_model_exports, {
  ProjectModel: () => ProjectModel
});
import mongoose3, { Schema as Schema3 } from "mongoose";
var ProjectSchema, ProjectModel;
var init_project_model = __esm({
  "src/models/project.model.ts"() {
    "use strict";
    ProjectSchema = new Schema3(
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          default: ""
        },
        color: {
          type: String,
          default: "#4F46E5"
        },
        icon: {
          type: String,
          default: "folder"
        },
        owner: {
          type: Schema3.Types.ObjectId,
          ref: "User",
          required: true,
          index: true
        },
        members: [{
          type: Schema3.Types.ObjectId,
          ref: "User"
        }],
        pendingMembers: [{
          type: Schema3.Types.ObjectId,
          ref: "User"
        }]
      },
      {
        timestamps: true,
        toJSON: {
          transform: (_doc, ret) => {
            ret._id = ret._id?.toString();
            ret.owner = ret.owner?.toString();
            ret.memberIds = ret.members?.map((m) => m.toString()) || [];
            ret.pendingMemberIds = ret.pendingMembers?.map((m) => m.toString()) || [];
            delete ret.members;
            delete ret.pendingMembers;
            return ret;
          }
        }
      }
    );
    ProjectModel = mongoose3.model("Project", ProjectSchema);
  }
});

// src/services/notification.service.ts
var notification_service_exports = {};
__export(notification_service_exports, {
  NotificationService: () => NotificationService
});
import mongoose4 from "mongoose";
var toNotification, NotificationService;
var init_notification_service = __esm({
  "src/services/notification.service.ts"() {
    "use strict";
    init_notification_model();
    toNotification = (doc) => {
      const json = doc.toJSON ? doc.toJSON() : doc;
      return {
        _id: json._id.toString(),
        userId: json.userId.toString(),
        type: json.type,
        taskId: json.taskId ? json.taskId.toString() : null,
        actorId: json.actorId ? json.actorId.toString() : null,
        message: json.message,
        read: json.read,
        createdAt: json.createdAt ? new Date(json.createdAt) : /* @__PURE__ */ new Date()
      };
    };
    NotificationService = class {
      static async getNotifications(userId, limit = 20) {
        const notifications = await NotificationModel.find({ userId: new mongoose4.Types.ObjectId(userId) }).sort({ createdAt: -1 }).limit(limit);
        return notifications.map(toNotification);
      }
      static async getUnreadCount(userId) {
        return NotificationModel.countDocuments({
          userId: new mongoose4.Types.ObjectId(userId),
          read: false
        });
      }
      static async markAsRead(userId, notificationId) {
        const notification = await NotificationModel.findOneAndUpdate(
          { _id: new mongoose4.Types.ObjectId(notificationId), userId: new mongoose4.Types.ObjectId(userId) },
          { $set: { read: true } },
          { new: true }
        );
        return notification ? toNotification(notification) : null;
      }
      static async markAllAsRead(userId) {
        await NotificationModel.updateMany(
          { userId: new mongoose4.Types.ObjectId(userId), read: false },
          { $set: { read: true } }
        );
      }
      // Internal helper to create notifications (not exposed directly to HTTP)
      static async createNotification(userId, type, message, actorId, taskId) {
        if (actorId && actorId === userId) return;
        await NotificationModel.create({
          userId: new mongoose4.Types.ObjectId(userId),
          type,
          message,
          actorId: actorId ? new mongoose4.Types.ObjectId(actorId) : void 0,
          taskId: taskId ? new mongoose4.Types.ObjectId(taskId) : void 0
        });
      }
      static async notifyProjectMembers(projectId, actorId, type, message, taskId, assigneeId) {
        if (projectId) {
          const { ProjectModel: ProjectModel2 } = await Promise.resolve().then(() => (init_project_model(), project_model_exports));
          const project = await ProjectModel2.findById(projectId);
          if (project && project.members) {
            for (const memberId of project.members) {
              await this.createNotification(memberId.toString(), type, message, actorId, taskId);
            }
          }
        } else if (assigneeId) {
          await this.createNotification(assigneeId, type, message, actorId, taskId);
        }
      }
      static async notifyProjectAccessRequest(requesterId, projectId, projectName) {
        const { UserModel: UserModel2 } = await Promise.resolve().then(() => (init_user_model(), user_model_exports));
        const admins = await UserModel2.find({ role: "admin" });
        const requester = await UserModel2.findById(requesterId);
        if (!requester) return;
        for (const admin of admins) {
          await this.createNotification(
            admin._id.toString(),
            "project_request",
            `${requester.name} has requested access to the project: ${projectName}`,
            requesterId
          );
        }
      }
    };
  }
});

// src/models/task.model.ts
var task_model_exports = {};
__export(task_model_exports, {
  TaskModel: () => TaskModel
});
import mongoose5, { Schema as Schema4 } from "mongoose";
var SubtaskSchema2, TaskActivitySchema2, TaskSchema2, TaskModel;
var init_task_model = __esm({
  "src/models/task.model.ts"() {
    "use strict";
    SubtaskSchema2 = new Schema4(
      {
        id: { type: String, required: true },
        title: { type: String, required: true, trim: true },
        completed: { type: Boolean, default: false }
      },
      { _id: false }
    );
    TaskActivitySchema2 = new Schema4(
      {
        type: { type: String, enum: ["status_change", "priority_change", "assignee_change", "created"], required: true },
        actorId: { type: String, required: true },
        fromValue: { type: String },
        toValue: { type: String },
        timestamp: { type: Date, required: true, default: Date.now }
      },
      { _id: false }
    );
    TaskSchema2 = new Schema4(
      {
        title: {
          type: String,
          required: true,
          trim: true
        },
        description: {
          type: String,
          default: ""
        },
        status: {
          type: String,
          enum: ["todo", "doing", "completed", "on_hold"],
          default: "todo",
          index: true
        },
        assignmentStatus: {
          type: String,
          enum: ["unassigned", "assigned", "pending_request"],
          default: "unassigned",
          index: true
        },
        priority: {
          type: String,
          enum: ["low", "medium", "high"],
          default: "medium",
          index: true
        },
        dueDate: {
          type: Date,
          default: null
        },
        tags: {
          type: [String],
          default: []
        },
        assignee: {
          type: Schema4.Types.ObjectId,
          ref: "User",
          default: null,
          index: true
        },
        subtasks: {
          type: [SubtaskSchema2],
          default: []
        },
        projectId: {
          type: Schema4.Types.ObjectId,
          ref: "Project",
          default: null,
          index: true
        },
        owner: {
          type: Schema4.Types.ObjectId,
          ref: "User",
          required: true,
          index: true
        },
        order: {
          type: Number,
          default: 0,
          index: true
        },
        activity: {
          type: [TaskActivitySchema2],
          default: []
        }
      },
      {
        timestamps: true,
        toJSON: {
          transform: (_doc, ret) => {
            ret._id = ret._id?.toString();
            ret.owner = ret.owner?.toString();
            ret.projectId = ret.projectId ? ret.projectId.toString() : null;
            if (ret.assignee && typeof ret.assignee !== "object") {
              ret.assignee = { _id: ret.assignee.toString() };
            }
            return ret;
          }
        }
      }
    );
    TaskSchema2.index({ owner: 1, status: 1, order: 1 });
    TaskSchema2.index({ owner: 1, projectId: 1 });
    TaskModel = mongoose5.model("Task", TaskSchema2);
  }
});

// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// src/config/env.ts
import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();
var envSchema = z.object({
  PORT: z.coerce.number().default(5e3),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required and cannot be empty"),
  JWT_SECRET: z.string().min(10).default("default_jwt_secret_change_me_in_prod"),
  OPENROUTER_API_KEY: z.string().optional(),
  FRONTEND_URL: z.string().default("http://localhost:3000")
});
var parseResult = envSchema.safeParse(process.env);
if (!parseResult.success) {
  const errorMsg = "\u274C Invalid environment variables configuration:\n" + JSON.stringify(parseResult.error.format(), null, 2);
  console.error(errorMsg);
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    process.exit(1);
  } else {
    throw new Error(errorMsg);
  }
}
var env = parseResult.data;

// src/routes/index.ts
import { Router as Router9 } from "express";

// src/routes/auth.routes.ts
import { Router } from "express";

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  details;
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
};
var asyncHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// src/services/auth.service.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
init_user_model();
init_notification_service();
var toUser = (doc) => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    name: json.name,
    email: json.email || void 0,
    role: json.role,
    status: json.status,
    avatarColor: json.avatarColor || "#4F46E5",
    avatarUrl: json.avatarUrl || void 0,
    theme: json.theme || "dark",
    lastActiveAt: json.lastActiveAt ? new Date(json.lastActiveAt) : void 0,
    createdAt: json.createdAt ? new Date(json.createdAt) : void 0,
    jobTitle: json.jobTitle || void 0
  };
};
var AuthService = class {
  static createToken(userId) {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: "30d" });
  }
  static async login(input) {
    const email = input.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !user.password) {
      throw new AppError(401, "Invalid email or password. Please check your credentials.");
    }
    if (user.status !== "active") {
      if (user.status === "invited") {
        throw new AppError(403, "Account not activated. Please accept your invite first.");
      }
      throw new AppError(403, "Your account has been deactivated. Contact an administrator.");
    }
    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError(401, "Invalid email or password. Please check your credentials.");
    }
    const token = this.createToken(user._id.toString());
    return {
      user: toUser(user),
      token
    };
  }
  static async acceptInvite(input) {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const user = await UserModel.findOne({
      inviteTokenHash: tokenHash,
      status: "invited"
    }).select("+inviteTokenHash");
    if (!user) {
      throw new AppError(400, "Invalid or expired invite link.");
    }
    if (user.inviteExpiresAt && /* @__PURE__ */ new Date() > user.inviteExpiresAt) {
      throw new AppError(400, "Invite link has expired. Please ask your admin for a new one.");
    }
    const hashedPassword = await bcrypt.hash(input.password, 10);
    user.password = hashedPassword;
    user.status = "active";
    user.inviteTokenHash = void 0;
    user.inviteExpiresAt = void 0;
    await user.save();
    const admins = await UserModel.find({ role: "admin", status: "active" });
    for (const admin of admins) {
      await NotificationService.createNotification(
        admin._id.toString(),
        "invite_accepted",
        `User ${user.name} (${user.email}) has accepted their invite and joined the organization.`,
        user._id.toString()
      );
    }
    const token = this.createToken(user._id.toString());
    return {
      user: toUser(user),
      token
    };
  }
  static async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    return user ? toUser(user) : null;
  }
  static async updateTheme(userId, input) {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { theme: input.theme },
      { new: true }
    );
    return user ? toUser(user) : null;
  }
  static async getActiveUsers() {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1e3);
    const activeUsers = await UserModel.find({
      status: "active",
      lastActiveAt: { $gte: fiveMinutesAgo }
    }).select("_id name avatarColor role jobTitle lastActiveAt").sort({ name: 1 });
    return activeUsers.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      avatarColor: u.avatarColor || "#4F46E5",
      role: u.role,
      jobTitle: u.jobTitle,
      statusText: "Online"
    }));
  }
  static async changePassword(userId, input) {
    const user = await UserModel.findById(userId).select("+password");
    if (!user || !user.password) {
      throw new AppError(404, "User not found or password not set.");
    }
    const isMatch = await bcrypt.compare(input.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(401, "Incorrect current password.");
    }
    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }
};

// src/controllers/auth.controller.ts
var setAuthCookie = (res, token) => {
  const isProduction = env.NODE_ENV === "production";
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    path: "/"
  });
};
var AuthController = class {
  static login = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.login(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ user, token });
  });
  static acceptInvite = asyncHandler(async (req, res) => {
    const { user, token } = await AuthService.acceptInvite(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ user, token });
  });
  static getMe = asyncHandler(async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user._id.toString());
    res.status(200).json({ user });
  });
  static getActiveUsers = asyncHandler(async (req, res) => {
    const activeUsers = await AuthService.getActiveUsers();
    const currentUserId = req.user?._id.toString();
    const mappedUsers = activeUsers.map((u) => ({
      ...u,
      isCurrentUser: u.id === currentUserId
    }));
    res.status(200).json({ activeUsers: mappedUsers });
  });
  static logout = asyncHandler(async (_req, res) => {
    const isProduction = env.NODE_ENV === "production";
    res.cookie("jwt", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      expires: /* @__PURE__ */ new Date(0),
      maxAge: 0,
      path: "/"
    });
    res.status(200).json({ message: "Logged out successfully" });
  });
  static changePassword = asyncHandler(async (req, res) => {
    await AuthService.changePassword(req.user._id.toString(), req.body);
    res.status(200).json({ message: "Password updated successfully" });
  });
};

// src/middleware/validate.middleware.ts
import { ZodError } from "zod";
var validateBody = (schema) => {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        next(new AppError(400, `Validation Error: ${errorMessages}`, error.format()));
      } else {
        next(error);
      }
    }
  };
};
var validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
        next(new AppError(400, `Query Validation Error: ${errorMessages}`, error.format()));
      } else {
        next(error);
      }
    }
  };
};

// src/middleware/auth.middleware.ts
import jwt2 from "jsonwebtoken";
init_user_model();
var requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.jwt;
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      throw new AppError(401, "Authentication required. Please continue as guest or login.");
    }
    const decoded = jwt2.verify(token, env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new AppError(401, "User session not found or expired.");
    }
    if (user.status !== "active") {
      throw new AppError(403, "Your account is not active. Please contact an administrator.");
    }
    const FIVE_MINUTES = 5 * 60 * 1e3;
    if (!user.lastActiveAt || Date.now() - new Date(user.lastActiveAt).getTime() > FIVE_MINUTES) {
      UserModel.updateOne({ _id: user._id }, { lastActiveAt: /* @__PURE__ */ new Date() }).catch(console.error);
    }
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new AppError(401, "Invalid or expired session token."));
    } else {
      next(error);
    }
  }
};

// src/middleware/rate-limit.middleware.ts
import rateLimit from "express-rate-limit";
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 20,
  // Limit each IP to 20 requests per `window` (here, per 15 minutes)
  message: { error: { message: "Too many authentication attempts, please try again later.", statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false
});
var requestAssignmentLimiter = rateLimit({
  windowMs: 60 * 1e3,
  // 1 minute
  max: 10,
  // Limit each IP to 10 requests per minute
  message: { error: { message: "Too many assignment requests, please slow down.", statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false
});
var aiParserLimiter = rateLimit({
  windowMs: 60 * 60 * 1e3,
  // 1 hour
  max: 20,
  // Limit each IP to 20 requests per hour
  message: { error: { message: "AI task parsing limit reached for this hour.", statusCode: 429 } },
  standardHeaders: true,
  legacyHeaders: false
});

// src/_shared-types.ts
import { z as z2 } from "zod";
var ThemeEnum = z2.enum(["light", "dark"]);
var RoleEnum = z2.enum(["admin", "member"]);
var StatusEnum = z2.enum(["invited", "active", "deactivated"]);
var UserSchema2 = z2.object({
  _id: z2.string(),
  name: z2.string().min(1).max(50),
  email: z2.string().email(),
  role: RoleEnum.default("member"),
  status: StatusEnum.default("active"),
  avatarColor: z2.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color"),
  avatarUrl: z2.string().optional(),
  theme: ThemeEnum.default("dark"),
  lastActiveAt: z2.coerce.date().optional(),
  createdAt: z2.coerce.date().optional(),
  jobTitle: z2.string().max(100).optional()
});
var LoginUserSchema = z2.object({
  email: z2.string().email("Please enter a valid email address"),
  password: z2.string().min(1, "Password is required")
});
var AdminInviteSchema = z2.object({
  email: z2.string().email("Please enter a valid email address"),
  name: z2.string().min(1, "Name is required"),
  jobTitle: z2.string().max(100).optional()
});
var AcceptInviteSchema = z2.object({
  token: z2.string().min(1),
  password: z2.string().min(6, "Password must be at least 6 characters long")
});
var UpdateThemeSchema = z2.object({
  theme: ThemeEnum
});
var ChangePasswordSchema = z2.object({
  oldPassword: z2.string().min(1, "Current password is required"),
  newPassword: z2.string().min(6, "New password must be at least 6 characters long")
});
var ProjectSchema2 = z2.object({
  _id: z2.string(),
  name: z2.string().min(1, "Project name is required").max(100),
  description: z2.string().max(1e3).optional(),
  color: z2.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").default("#4F46E5"),
  icon: z2.string().default("folder"),
  owner: z2.string(),
  memberIds: z2.array(z2.string()).default([]),
  pendingMemberIds: z2.array(z2.string()).default([]),
  taskCount: z2.number().int().default(0),
  completedTaskCount: z2.number().int().default(0),
  createdAt: z2.coerce.date().optional(),
  updatedAt: z2.coerce.date().optional()
});
var CreateProjectSchema = z2.object({
  name: z2.string().min(1, "Project name is required").max(100),
  description: z2.string().max(1e3).optional(),
  color: z2.string().regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color").optional(),
  icon: z2.string().optional()
});
var UpdateProjectSchema = CreateProjectSchema.partial();
var TaskStatusEnum = z2.enum(["todo", "doing", "completed", "on_hold"]);
var TaskPriorityEnum = z2.enum(["low", "medium", "high"]);
var SubtaskSchema = z2.object({
  id: z2.string(),
  title: z2.string().min(1),
  completed: z2.boolean().default(false)
});
var TaskActivitySchema = z2.object({
  type: z2.enum(["status_change", "priority_change", "assignee_change", "created"]),
  actorId: z2.string(),
  fromValue: z2.string().optional(),
  toValue: z2.string().optional(),
  timestamp: z2.coerce.date()
});
var TaskSchema = z2.object({
  _id: z2.string(),
  title: z2.string().min(1, "Title is required").max(200),
  description: z2.string().max(5e3).optional(),
  status: TaskStatusEnum.default("todo"),
  assignmentStatus: z2.enum(["unassigned", "assigned", "pending_request"]).default("unassigned"),
  priority: TaskPriorityEnum.default("medium"),
  dueDate: z2.coerce.date().optional().nullable(),
  tags: z2.array(z2.string().max(30)).default([]),
  assignee: UserSchema2.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }).optional().nullable(),
  subtasks: z2.array(SubtaskSchema).default([]),
  projectId: z2.string().optional().nullable(),
  owner: z2.string(),
  order: z2.number().int().default(0),
  activity: z2.array(TaskActivitySchema).default([]),
  createdAt: z2.coerce.date().optional(),
  updatedAt: z2.coerce.date().optional()
});
var CreateTaskSchema = z2.object({
  title: z2.string().min(1, "Title is required").max(200),
  description: z2.string().max(5e3).optional(),
  status: TaskStatusEnum.default("todo"),
  priority: TaskPriorityEnum.default("medium"),
  dueDate: z2.coerce.date().optional().nullable(),
  tags: z2.array(z2.string().max(30)).optional(),
  assigneeId: z2.string().optional().nullable(),
  subtasks: z2.array(SubtaskSchema).optional(),
  projectId: z2.string().optional().nullable(),
  order: z2.number().int().optional()
});
var AssignmentRequestStatusEnum = z2.enum(["pending", "approved", "rejected"]);
var AssignmentRequestSchema = z2.object({
  _id: z2.string(),
  taskId: z2.string(),
  requesterId: z2.string(),
  requester: UserSchema2.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }).optional(),
  status: AssignmentRequestStatusEnum.default("pending"),
  createdAt: z2.coerce.date(),
  updatedAt: z2.coerce.date().optional()
});
var CreateAssignmentRequestSchema = z2.object({
  taskId: z2.string()
});
var NotificationTypeEnum = z2.enum([
  "assigned",
  "assignment_requested",
  "assignment_approved",
  "assignment_rejected",
  "status_changed",
  "mentioned",
  "invite_accepted",
  "project_request",
  "task_created",
  "comment_added",
  "tags_changed",
  "description_changed",
  "assignee_changed"
]);
var NotificationSchema2 = z2.object({
  _id: z2.string(),
  userId: z2.string(),
  type: NotificationTypeEnum,
  taskId: z2.string().optional().nullable(),
  actorId: z2.string().optional(),
  message: z2.string(),
  read: z2.boolean().default(false),
  createdAt: z2.coerce.date()
});
var UpdateTaskSchema = CreateTaskSchema.partial();
var ReorderItemSchema = z2.object({
  id: z2.string(),
  status: TaskStatusEnum,
  order: z2.number().int()
});
var ReorderTasksSchema = z2.object({
  tasks: z2.array(ReorderItemSchema).min(1)
});
var TaskQueryFilterSchema = z2.object({
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  search: z2.string().optional(),
  tag: z2.string().optional(),
  projectId: z2.string().optional(),
  assigneeId: z2.string().optional()
});
var CommentSchema = z2.object({
  _id: z2.string(),
  taskId: z2.string(),
  author: UserSchema2.pick({ _id: true, name: true, avatarColor: true, avatarUrl: true }),
  body: z2.string().min(1).max(2e3),
  createdAt: z2.coerce.date()
});
var CreateCommentSchema = z2.object({
  body: z2.string().min(1, "Comment cannot be empty").max(2e3)
});
var AdminAuditLogSchema = z2.object({
  _id: z2.string(),
  adminId: z2.string(),
  adminName: z2.string(),
  action: z2.enum(["invite_sent", "invite_revoked", "member_deactivated", "member_promoted", "task_force_edited"]),
  targetType: z2.enum(["user", "task"]),
  targetId: z2.string(),
  timestamp: z2.coerce.date(),
  details: z2.any().optional()
});

// src/routes/auth.routes.ts
var router = Router();
router.post("/login", authLimiter, validateBody(LoginUserSchema), AuthController.login);
router.post("/accept-invite", authLimiter, validateBody(AcceptInviteSchema), AuthController.acceptInvite);
router.get("/me", requireAuth, AuthController.getMe);
router.get("/active-users", requireAuth, AuthController.getActiveUsers);
router.put("/change-password", requireAuth, validateBody(ChangePasswordSchema), AuthController.changePassword);
router.post("/logout", AuthController.logout);
var auth_routes_default = router;

// src/routes/user.routes.ts
import { Router as Router2 } from "express";

// src/controllers/user.controller.ts
var UserController = class {
  static updateTheme = asyncHandler(async (req, res) => {
    const user = await AuthService.updateTheme(req.user._id.toString(), req.body);
    res.status(200).json({ user });
  });
};

// src/routes/user.routes.ts
var router2 = Router2();
router2.patch("/me/theme", requireAuth, validateBody(UpdateThemeSchema), UserController.updateTheme);
var user_routes_default = router2;

// src/routes/task.routes.ts
import { Router as Router3 } from "express";

// src/services/task.service.ts
init_task_model();
init_user_model();
init_project_model();
import mongoose7 from "mongoose";

// src/models/audit-log.model.ts
import mongoose6, { Schema as Schema5 } from "mongoose";
var AdminAuditLogSchema2 = new Schema5(
  {
    adminId: {
      type: String,
      required: true,
      index: true
    },
    adminName: {
      type: String,
      required: true
    },
    action: {
      type: String,
      enum: ["invite_sent", "invite_revoked", "member_deactivated", "member_promoted", "task_force_edited"],
      required: true
    },
    targetType: {
      type: String,
      enum: ["user", "task"],
      required: true
    },
    targetId: {
      type: String,
      required: true
    },
    details: {
      type: Schema5.Types.Mixed
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id?.toString();
        return ret;
      }
    }
  }
);
var AdminAuditLogModel = mongoose6.model("AdminAuditLog", AdminAuditLogSchema2);

// src/services/task.service.ts
init_notification_service();
var toTask = (doc) => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    title: json.title,
    description: json.description || "",
    status: json.status,
    assignmentStatus: json.assignmentStatus || "unassigned",
    priority: json.priority,
    dueDate: json.dueDate ? new Date(json.dueDate) : null,
    tags: json.tags || [],
    assignee: json.assignee ? {
      _id: json.assignee._id.toString(),
      name: json.assignee.name,
      avatarColor: json.assignee.avatarColor,
      avatarUrl: json.assignee.avatarUrl
    } : null,
    subtasks: json.subtasks || [],
    projectId: json.projectId ? json.projectId.toString() : null,
    owner: json.owner.toString(),
    order: json.order || 0,
    activity: json.activity || [],
    createdAt: json.createdAt ? new Date(json.createdAt) : void 0,
    updatedAt: json.updatedAt ? new Date(json.updatedAt) : void 0
  };
};
var TaskService = class {
  static async getTasks(userId, filter) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    const query = {};
    const andConditions = [];
    if (user.role !== "admin") {
      const userProjects = await ProjectModel.find({ members: new mongoose7.Types.ObjectId(userId) }).select("_id");
      const projectIds = userProjects.map((p) => p._id);
      andConditions.push({
        $or: [
          { owner: new mongoose7.Types.ObjectId(userId) },
          { assignee: new mongoose7.Types.ObjectId(userId) },
          { projectId: { $in: projectIds } }
        ]
      });
    }
    if (filter?.status) query.status = filter.status;
    if (filter?.priority) query.priority = filter.priority;
    if (filter?.tag) query.tags = { $in: [filter.tag] };
    if (filter?.projectId) query.projectId = new mongoose7.Types.ObjectId(filter.projectId);
    if (filter?.assigneeId) query.assignee = new mongoose7.Types.ObjectId(filter.assigneeId);
    if (filter?.search) {
      const searchRegex = new RegExp(filter.search.trim(), "i");
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } }
        ]
      });
    }
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    const tasks = await TaskModel.find(query).populate("assignee", "name avatarColor avatarUrl").sort({ status: 1, order: 1, createdAt: -1 });
    return tasks.map(toTask);
  }
  static async createTask(userId, input) {
    const highestOrderTask = await TaskModel.findOne({
      status: input.status || "todo"
    }).sort({ order: -1 });
    const nextOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;
    const activity = [{
      type: "created",
      actorId: userId,
      timestamp: /* @__PURE__ */ new Date()
    }];
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    let project = null;
    if (input.projectId) {
      project = await ProjectModel.findById(input.projectId);
      if (user.role !== "admin") {
        if (!project || !project.members.includes(new mongoose7.Types.ObjectId(userId))) {
          throw new AppError(403, "You must be a member of this project to create tasks in it.");
        }
      }
    }
    const task = await TaskModel.create({
      ...input,
      projectId: input.projectId ? new mongoose7.Types.ObjectId(input.projectId) : null,
      assignee: input.assigneeId ? new mongoose7.Types.ObjectId(input.assigneeId) : null,
      assignmentStatus: input.assigneeId ? "assigned" : "unassigned",
      owner: new mongoose7.Types.ObjectId(userId),
      order: input.order !== void 0 ? input.order : nextOrder,
      activity
    });
    await task.populate("assignee", "name avatarColor avatarUrl");
    if (input.assigneeId && input.assigneeId !== userId) {
      await NotificationService.createNotification(
        input.assigneeId,
        "assigned",
        `You were assigned to a new task: ${task.title}`,
        userId,
        task._id.toString()
      );
    }
    if (project && project.members) {
      for (const memberId of project.members) {
        const memberIdStr = memberId.toString();
        if (memberIdStr !== userId && memberIdStr !== input.assigneeId) {
          await NotificationService.createNotification(
            memberIdStr,
            "task_created",
            `${user.name} created a new task in ${project.name}: ${task.title}`,
            userId,
            task._id.toString()
          );
        }
      }
    }
    return toTask(task);
  }
  static async getTaskById(userId, taskId) {
    if (!mongoose7.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const task = await TaskModel.findById(taskId).populate("assignee", "name avatarColor avatarUrl");
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    return toTask(task);
  }
  static async updateTask(userId, taskId, input) {
    if (!mongoose7.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    if (input.status && input.status !== task.status) {
      const isAdmin2 = user.role === "admin";
      const isCreatorOrAssignee = task.owner.toString() === userId || task.assignee && task.assignee.toString() === userId;
      if (!isAdmin2) {
        if (!isCreatorOrAssignee) {
          throw new AppError(403, "Only admins or the task owner/assignee can change task status.");
        }
        const allowedTransitions = {
          "todo": ["doing"],
          "doing": ["todo", "completed"],
          "completed": [],
          "on_hold": []
          // Only admins can move out of on_hold or reopen completed
        };
        const allowed = allowedTransitions[task.status] || [];
        if (!allowed.includes(input.status)) {
          throw new AppError(403, `Members cannot transition task from ${task.status} to ${input.status}.`);
        }
      }
    }
    const isOwner = task.owner.toString() === userId;
    const isAssignee = task.assignee && task.assignee.toString() === userId;
    const isAdmin = user.role === "admin";
    let isProjectMember = false;
    if (task.projectId) {
      const project = await ProjectModel.findById(task.projectId);
      if (project && project.members.includes(new mongoose7.Types.ObjectId(userId))) {
        isProjectMember = true;
      }
    }
    if (!isOwner && !isAssignee && !isAdmin && !isProjectMember) {
      throw new AppError(403, "You do not have permission to edit this task.");
    }
    const updatePayload = { ...input };
    if (input.projectId !== void 0) {
      updatePayload.projectId = input.projectId ? new mongoose7.Types.ObjectId(input.projectId) : null;
    }
    if (input.assigneeId !== void 0) {
      if (isAdmin) {
        updatePayload.assignee = input.assigneeId ? new mongoose7.Types.ObjectId(input.assigneeId) : null;
        updatePayload.assignmentStatus = input.assigneeId ? "assigned" : "unassigned";
      } else {
        throw new AppError(403, "Members cannot directly reassign tasks. Use the claim or request workflow.");
      }
    }
    const newActivities = [];
    if (input.status && input.status !== task.status) {
      newActivities.push({
        type: "status_change",
        actorId: userId,
        fromValue: task.status,
        toValue: input.status,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    if (input.priority && input.priority !== task.priority) {
      newActivities.push({
        type: "priority_change",
        actorId: userId,
        fromValue: task.priority,
        toValue: input.priority,
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    if (input.assigneeId !== void 0 && input.assigneeId !== task.assignee?.toString()) {
      newActivities.push({
        type: "assignee_change",
        actorId: userId,
        fromValue: task.assignee?.toString() || "unassigned",
        toValue: input.assigneeId || "unassigned",
        timestamp: /* @__PURE__ */ new Date()
      });
    }
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: updatePayload,
        $push: { activity: { $each: newActivities } }
      },
      { new: true, runValidators: true }
    ).populate("assignee", "name avatarColor avatarUrl");
    if (!updatedTask) {
      throw new AppError(404, "Task not found");
    }
    if (isAdmin && !isOwner && !isAssignee && newActivities.length > 0) {
      await AdminAuditLogModel.create({
        adminId: user._id.toString(),
        adminName: user.name,
        action: "task_force_edited",
        targetType: "task",
        targetId: taskId,
        details: { changes: newActivities }
      });
    }
    if (input.assigneeId !== void 0 && input.assigneeId !== (task.assignee?.toString() || void 0)) {
      if (input.assigneeId) {
        await NotificationService.createNotification(
          input.assigneeId,
          "assigned",
          `You were assigned to task: ${updatedTask.title}`,
          userId,
          updatedTask._id.toString()
        );
      }
      await NotificationService.notifyProjectMembers(
        updatedTask.projectId?.toString() || null,
        userId,
        "assignee_changed",
        `${user.name} reassigned task "${updatedTask.title}"`,
        updatedTask._id.toString(),
        updatedTask.assignee?._id?.toString()
      );
    }
    if (input.status && input.status !== task.status) {
      await NotificationService.notifyProjectMembers(
        updatedTask.projectId?.toString() || null,
        userId,
        "status_changed",
        `${user.name} changed the status of task "${updatedTask.title}" to ${input.status.replace("_", " ")}`,
        updatedTask._id.toString(),
        updatedTask.assignee?._id?.toString()
      );
    }
    if (input.tags && JSON.stringify(input.tags) !== JSON.stringify(task.tags)) {
      await NotificationService.notifyProjectMembers(
        updatedTask.projectId?.toString() || null,
        userId,
        "tags_changed",
        `${user.name} updated the tags on task "${updatedTask.title}"`,
        updatedTask._id.toString(),
        updatedTask.assignee?._id?.toString()
      );
    }
    if (input.description !== void 0 && input.description !== task.description) {
      await NotificationService.notifyProjectMembers(
        updatedTask.projectId?.toString() || null,
        userId,
        "description_changed",
        `${user.name} updated the description of task "${updatedTask.title}"`,
        updatedTask._id.toString(),
        updatedTask.assignee?._id?.toString()
      );
    }
    return toTask(updatedTask);
  }
  static async deleteTask(userId, taskId) {
    if (!mongoose7.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    const user = await UserModel.findById(userId);
    const isOwner = task.owner.toString() === userId;
    const isAdmin = user?.role === "admin";
    let isProjectMember = false;
    if (task.projectId) {
      const project = await ProjectModel.findById(task.projectId);
      if (project && project.members.includes(new mongoose7.Types.ObjectId(userId))) {
        isProjectMember = true;
      }
    }
    if (!isOwner && !isAdmin && !isProjectMember) {
      throw new AppError(403, "You do not have permission to delete this task.");
    }
    await TaskModel.findByIdAndDelete(taskId);
  }
  static async reorderTasks(userId, input) {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    const taskIds = input.tasks.map((t) => t.id);
    const tasksToUpdate = await TaskModel.find({ _id: { $in: taskIds } });
    if (user.role !== "admin") {
      const userProjects = await ProjectModel.find({ members: new mongoose7.Types.ObjectId(userId) }).select("_id");
      const projectIds = userProjects.map((p) => p._id.toString());
      for (const task of tasksToUpdate) {
        const isOwner = task.owner.toString() === userId;
        const isAssignee = task.assignee && task.assignee.toString() === userId;
        const isProjectMember = task.projectId && projectIds.includes(task.projectId.toString());
        if (!isOwner && !isAssignee && !isProjectMember) {
          throw new AppError(403, "You do not have permission to reorder or edit one or more of these tasks.");
        }
      }
    }
    const bulkOps = input.tasks.map((item) => {
      return {
        updateOne: {
          filter: {
            _id: new mongoose7.Types.ObjectId(item.id)
          },
          update: {
            $set: {
              status: item.status,
              order: item.order
            }
          }
        }
      };
    });
    if (bulkOps.length > 0) {
      await TaskModel.bulkWrite(bulkOps);
      for (const item of input.tasks) {
        const oldTask = tasksToUpdate.find((t) => t._id.toString() === item.id);
        if (oldTask && item.status && item.status !== oldTask.status) {
          await NotificationService.notifyProjectMembers(
            oldTask.projectId?.toString() || null,
            userId,
            "status_changed",
            `${user.name} moved task "${oldTask.title}" to ${item.status.replace("_", " ")}`,
            oldTask._id.toString(),
            oldTask.assignee?.toString()
          );
        }
      }
    }
    const updatedTasks = await TaskModel.find({ _id: { $in: taskIds } }).populate("assignee", "name avatarColor avatarUrl").sort({ status: 1, order: 1 });
    return updatedTasks.map(toTask);
  }
  static async claimTask(userId, taskId) {
    if (!mongoose7.Types.ObjectId.isValid(taskId)) throw new AppError(400, "Invalid task ID");
    const task = await TaskModel.findById(taskId);
    if (!task) throw new AppError(404, "Task not found");
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    if (task.assignee || task.assignmentStatus === "assigned") {
      throw new AppError(400, "Task is already assigned. Submit an assignment request instead.");
    }
    const activity = {
      type: "assignee_change",
      actorId: userId,
      fromValue: "unassigned",
      toValue: userId,
      timestamp: /* @__PURE__ */ new Date()
    };
    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: {
          assignee: new mongoose7.Types.ObjectId(userId),
          assignmentStatus: "assigned"
        },
        $push: { activity }
      },
      { new: true, runValidators: true }
    ).populate("assignee", "name avatarColor avatarUrl");
    if (!updatedTask) throw new AppError(404, "Task not found");
    return toTask(updatedTask);
  }
};

// src/controllers/task.controller.ts
var TaskController = class {
  static getTasks = asyncHandler(async (req, res) => {
    const tasks = await TaskService.getTasks(req.user._id.toString(), req.query);
    res.status(200).json({ tasks });
  });
  static createTask = asyncHandler(async (req, res) => {
    const task = await TaskService.createTask(req.user._id.toString(), req.body);
    res.status(201).json({ task });
  });
  static getTaskById = asyncHandler(async (req, res) => {
    const task = await TaskService.getTaskById(req.user._id.toString(), req.params.id);
    res.status(200).json({ task });
  });
  static updateTask = asyncHandler(async (req, res) => {
    const task = await TaskService.updateTask(req.user._id.toString(), req.params.id, req.body);
    res.status(200).json({ task });
  });
  static deleteTask = asyncHandler(async (req, res) => {
    await TaskService.deleteTask(req.user._id.toString(), req.params.id);
    res.status(200).json({ message: "Task deleted successfully" });
  });
  static reorderTasks = asyncHandler(async (req, res) => {
    const tasks = await TaskService.reorderTasks(req.user._id.toString(), req.body);
    res.status(200).json({ tasks });
  });
  static claimTask = asyncHandler(async (req, res) => {
    const task = await TaskService.claimTask(req.user._id.toString(), req.params.id);
    res.status(200).json({ task });
  });
};

// src/services/comment.service.ts
import mongoose9 from "mongoose";

// src/models/comment.model.ts
import mongoose8, { Schema as Schema6 } from "mongoose";
var CommentSchema2 = new Schema6(
  {
    taskId: {
      type: Schema6.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    author: {
      type: Schema6.Types.ObjectId,
      ref: "User",
      required: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id?.toString();
        ret.taskId = ret.taskId?.toString();
        return ret;
      }
    }
  }
);
var CommentModel = mongoose8.model("Comment", CommentSchema2);

// src/services/comment.service.ts
init_task_model();
var CommentService = class {
  static async getComments(taskId) {
    if (!mongoose9.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const comments = await CommentModel.find({ taskId }).populate("author", "name avatarColor avatarUrl").sort({ createdAt: 1 });
    return comments.map((c) => c.toJSON());
  }
  static async createComment(userId, taskId, input) {
    if (!mongoose9.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    const comment = await CommentModel.create({
      taskId: new mongoose9.Types.ObjectId(taskId),
      author: new mongoose9.Types.ObjectId(userId),
      body: input.body
    });
    await comment.populate("author", "name avatarColor avatarUrl");
    const user = await Promise.resolve().then(() => (init_user_model(), user_model_exports)).then((m) => m.UserModel.findById(userId));
    if (user) {
      const { NotificationService: NotificationService2 } = await Promise.resolve().then(() => (init_notification_service(), notification_service_exports));
      await NotificationService2.notifyProjectMembers(
        task.projectId?.toString() || null,
        userId,
        "comment_added",
        `${user.name} commented on task "${task.title}"`,
        task._id.toString(),
        task.assignee?.toString()
      );
    }
    return comment.toJSON();
  }
};

// src/controllers/comment.controller.ts
var CommentController = class {
  static getComments = asyncHandler(async (req, res) => {
    const comments = await CommentService.getComments(req.params.taskId);
    res.status(200).json({ comments });
  });
  static createComment = asyncHandler(async (req, res) => {
    const comment = await CommentService.createComment(
      req.user._id.toString(),
      req.params.taskId,
      req.body
    );
    res.status(201).json({ comment });
  });
};

// src/services/assignment-request.service.ts
import mongoose11 from "mongoose";

// src/models/assignment-request.model.ts
import mongoose10, { Schema as Schema7 } from "mongoose";
var AssignmentRequestSchema2 = new Schema7(
  {
    taskId: {
      type: Schema7.Types.ObjectId,
      ref: "Task",
      required: true,
      index: true
    },
    requesterId: {
      type: Schema7.Types.ObjectId,
      ref: "User",
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret._id = ret._id?.toString();
        ret.taskId = ret.taskId?.toString();
        ret.requesterId = ret.requesterId?.toString();
        if (ret.requesterId && typeof ret.requesterId !== "object") {
          ret.requester = void 0;
        }
        return ret;
      }
    }
  }
);
AssignmentRequestSchema2.index({ taskId: 1, requesterId: 1, status: 1 });
var AssignmentRequestModel = mongoose10.model("AssignmentRequest", AssignmentRequestSchema2);

// src/services/assignment-request.service.ts
init_task_model();
init_user_model();
init_notification_service();
var toAssignmentRequest = (doc) => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    taskId: json.taskId.toString(),
    requesterId: json.requesterId.toString(),
    status: json.status,
    requester: json.requesterId && typeof json.requesterId === "object" ? {
      _id: json.requesterId._id.toString(),
      name: json.requesterId.name,
      avatarColor: json.requesterId.avatarColor,
      avatarUrl: json.requesterId.avatarUrl
    } : void 0,
    createdAt: json.createdAt ? new Date(json.createdAt) : /* @__PURE__ */ new Date(),
    updatedAt: json.updatedAt ? new Date(json.updatedAt) : void 0
  };
};
var AssignmentRequestService = class {
  static async createRequest(userId, taskId) {
    if (!mongoose11.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid task ID");
    }
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found");
    }
    if (task.assignmentStatus === "unassigned" && !task.assignee) {
      throw new AppError(400, "Task is unassigned. You can claim it directly.");
    }
    const existing = await AssignmentRequestModel.findOne({
      taskId: new mongoose11.Types.ObjectId(taskId),
      requesterId: new mongoose11.Types.ObjectId(userId),
      status: "pending"
    });
    if (existing) {
      throw new AppError(400, "You already have a pending assignment request for this task.");
    }
    const request = await AssignmentRequestModel.create({
      taskId: new mongoose11.Types.ObjectId(taskId),
      requesterId: new mongoose11.Types.ObjectId(userId),
      status: "pending"
    });
    await TaskModel.findByIdAndUpdate(taskId, {
      $set: { assignmentStatus: "pending_request" }
    });
    if (task.assignee) {
      await NotificationService.createNotification(
        task.assignee.toString(),
        "assignment_requested",
        `User requested to be assigned to your task: ${task.title}`,
        userId,
        task._id.toString()
      );
    }
    const admins = await UserModel.find({ role: "admin", status: "active" });
    for (const admin of admins) {
      await NotificationService.createNotification(
        admin._id.toString(),
        "assignment_requested",
        `New assignment request for task: ${task.title}`,
        userId,
        task._id.toString()
      );
    }
    await request.populate("requesterId", "name avatarColor avatarUrl");
    return toAssignmentRequest(request);
  }
  static async getRequestsForTask(taskId) {
    const requests = await AssignmentRequestModel.find({ taskId: new mongoose11.Types.ObjectId(taskId) }).populate("requesterId", "name avatarColor avatarUrl").sort({ createdAt: -1 });
    return requests.map(toAssignmentRequest);
  }
  static async processRequest(userId, requestId, approve) {
    const request = await AssignmentRequestModel.findById(requestId);
    if (!request) {
      throw new AppError(404, "Assignment request not found");
    }
    if (request.status !== "pending") {
      throw new AppError(400, "This request has already been processed.");
    }
    const task = await TaskModel.findById(request.taskId);
    if (!task) {
      throw new AppError(404, "Associated task not found");
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, "User not found");
    const isAdmin = user.role === "admin";
    const isCurrentAssignee = task.assignee && task.assignee.toString() === userId;
    if (!isAdmin && !isCurrentAssignee) {
      throw new AppError(403, "Only admins or the current assignee can approve or reject assignment requests.");
    }
    request.status = approve ? "approved" : "rejected";
    await request.save();
    if (approve) {
      const activity = {
        type: "assignee_change",
        actorId: userId,
        fromValue: task.assignee ? task.assignee.toString() : "unassigned",
        toValue: request.requesterId.toString(),
        timestamp: /* @__PURE__ */ new Date()
      };
      await TaskModel.findByIdAndUpdate(task._id, {
        $set: {
          assignee: request.requesterId,
          assignmentStatus: "assigned"
        },
        $push: { activity }
      });
      if (isAdmin && !isCurrentAssignee) {
        await AdminAuditLogModel.create({
          adminId: user._id.toString(),
          adminName: user.name,
          action: "task_force_edited",
          targetType: "task",
          targetId: task._id.toString(),
          details: { changes: [{ type: "assignment_request_approved", newAssignee: request.requesterId.toString() }] }
        });
      }
    } else {
      const otherPending = await AssignmentRequestModel.findOne({
        taskId: task._id,
        status: "pending"
      });
      if (!otherPending) {
        await TaskModel.findByIdAndUpdate(task._id, {
          $set: { assignmentStatus: task.assignee ? "assigned" : "unassigned" }
        });
      }
    }
    await NotificationService.createNotification(
      request.requesterId.toString(),
      approve ? "assignment_approved" : "assignment_rejected",
      `Your assignment request for "${task.title}" was ${approve ? "approved" : "rejected"}.`,
      userId,
      task._id.toString()
    );
    await request.populate("requesterId", "name avatarColor avatarUrl");
    return toAssignmentRequest(request);
  }
};

// src/controllers/assignment-request.controller.ts
var AssignmentRequestController = class {
  static createRequest = asyncHandler(async (req, res) => {
    const request = await AssignmentRequestService.createRequest(req.user._id.toString(), req.params.taskId);
    res.status(201).json({ request });
  });
  static getRequestsForTask = asyncHandler(async (req, res) => {
    const requests = await AssignmentRequestService.getRequestsForTask(req.params.taskId);
    res.status(200).json({ requests });
  });
  static processRequest = asyncHandler(async (req, res) => {
    const { approve } = req.body;
    const request = await AssignmentRequestService.processRequest(req.user._id.toString(), req.params.id, approve);
    res.status(200).json({ request });
  });
};

// src/routes/task.routes.ts
var router3 = Router3();
router3.use(requireAuth);
router3.get("/", validateQuery(TaskQueryFilterSchema), TaskController.getTasks);
router3.post("/", validateBody(CreateTaskSchema), TaskController.createTask);
router3.patch("/reorder", validateBody(ReorderTasksSchema), TaskController.reorderTasks);
router3.get("/:id", TaskController.getTaskById);
router3.patch("/:id/claim", TaskController.claimTask);
router3.patch("/:id", validateBody(UpdateTaskSchema), TaskController.updateTask);
router3.delete("/:id", TaskController.deleteTask);
router3.post("/:taskId/assignment-requests", requestAssignmentLimiter, validateBody(CreateAssignmentRequestSchema), AssignmentRequestController.createRequest);
router3.get("/:taskId/assignment-requests", AssignmentRequestController.getRequestsForTask);
router3.get("/:taskId/comments", CommentController.getComments);
router3.post("/:taskId/comments", validateBody(CreateCommentSchema), CommentController.createComment);
var task_routes_default = router3;

// src/routes/project.routes.ts
import { Router as Router4 } from "express";

// src/services/project.service.ts
init_project_model();
init_task_model();
import mongoose12 from "mongoose";
var ProjectService = class {
  static async getProjects() {
    const projects = await ProjectModel.find().sort({ createdAt: -1 });
    const projectList = await Promise.all(
      projects.map(async (p) => {
        const total = await TaskModel.countDocuments({
          projectId: p._id
        });
        const completed = await TaskModel.countDocuments({
          projectId: p._id,
          status: "completed"
        });
        const json = p.toJSON();
        return {
          _id: json._id.toString(),
          name: json.name,
          description: json.description || "",
          color: json.color || "#4F46E5",
          icon: json.icon || "folder",
          owner: json.owner.toString(),
          memberIds: json.memberIds || [],
          pendingMemberIds: json.pendingMemberIds || [],
          taskCount: total,
          completedTaskCount: completed,
          createdAt: json.createdAt ? new Date(json.createdAt) : void 0,
          updatedAt: json.updatedAt ? new Date(json.updatedAt) : void 0
        };
      })
    );
    return projectList;
  }
  static async createProject(userId, input) {
    const project = await ProjectModel.create({
      ...input,
      owner: new mongoose12.Types.ObjectId(userId)
    });
    const json = project.toJSON();
    return {
      _id: json._id.toString(),
      name: json.name,
      description: json.description || "",
      color: json.color || "#4F46E5",
      icon: json.icon || "folder",
      owner: json.owner.toString(),
      memberIds: json.memberIds || [],
      pendingMemberIds: json.pendingMemberIds || [],
      taskCount: 0,
      completedTaskCount: 0,
      createdAt: json.createdAt ? new Date(json.createdAt) : void 0,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : void 0
    };
  }
  static async getProjectById(projectId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, "Invalid project ID");
    }
    const project = await ProjectModel.findOne({ _id: projectId });
    if (!project) {
      throw new AppError(404, "Project not found");
    }
    const total = await TaskModel.countDocuments({ projectId: project._id });
    const completed = await TaskModel.countDocuments({
      projectId: project._id,
      status: "completed"
    });
    const json = project.toJSON();
    return {
      _id: json._id.toString(),
      name: json.name,
      description: json.description || "",
      color: json.color || "#4F46E5",
      icon: json.icon || "folder",
      owner: json.owner.toString(),
      memberIds: json.memberIds || [],
      pendingMemberIds: json.pendingMemberIds || [],
      taskCount: total,
      completedTaskCount: completed,
      createdAt: json.createdAt ? new Date(json.createdAt) : void 0,
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : void 0
    };
  }
  static async updateProject(projectId, input) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, "Invalid project ID");
    }
    const project = await ProjectModel.findOneAndUpdate(
      { _id: projectId },
      { $set: input },
      { new: true, runValidators: true }
    );
    if (!project) {
      throw new AppError(404, "Project not found");
    }
    return this.getProjectById(projectId);
  }
  static async deleteProject(projectId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) {
      throw new AppError(400, "Invalid project ID");
    }
    const project = await ProjectModel.findOneAndDelete({ _id: projectId });
    if (!project) {
      throw new AppError(404, "Project not found");
    }
    await TaskModel.updateMany(
      { projectId: new mongoose12.Types.ObjectId(projectId) },
      { $set: { projectId: null } }
    );
  }
  static async requestAccess(userId, projectId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) throw new AppError(400, "Invalid project ID");
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, "Project not found");
    const uid = new mongoose12.Types.ObjectId(userId);
    if (project.members.includes(uid) || project.pendingMembers.includes(uid)) {
      return;
    }
    project.pendingMembers.push(uid);
    await project.save();
    try {
      const { NotificationService: NotificationService2 } = await Promise.resolve().then(() => (init_notification_service(), notification_service_exports));
      await NotificationService2.notifyProjectAccessRequest(userId, projectId, project.name);
    } catch (err) {
      console.error("Failed to notify admins of project request", err);
    }
  }
  static async denyRequest(adminId, projectId, targetUserId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) throw new AppError(400, "Invalid project ID");
    if (!mongoose12.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, "Invalid user ID");
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, "Project not found");
    const uid = new mongoose12.Types.ObjectId(targetUserId);
    project.pendingMembers = project.pendingMembers.filter((id) => !id.equals(uid));
    await project.save();
  }
  static async addMember(adminId, projectId, targetUserId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) throw new AppError(400, "Invalid project ID");
    if (!mongoose12.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, "Invalid user ID");
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, "Project not found");
    const uid = new mongoose12.Types.ObjectId(targetUserId);
    if (project.members.includes(uid)) return;
    project.members.push(uid);
    project.pendingMembers = project.pendingMembers.filter((id) => !id.equals(uid));
    await project.save();
  }
  static async removeMember(adminId, projectId, targetUserId) {
    if (!mongoose12.Types.ObjectId.isValid(projectId)) throw new AppError(400, "Invalid project ID");
    if (!mongoose12.Types.ObjectId.isValid(targetUserId)) throw new AppError(400, "Invalid user ID");
    const project = await ProjectModel.findById(projectId);
    if (!project) throw new AppError(404, "Project not found");
    const uid = new mongoose12.Types.ObjectId(targetUserId);
    project.members = project.members.filter((id) => !id.equals(uid));
    await project.save();
  }
};

// src/controllers/project.controller.ts
var ProjectController = class {
  static getProjects = asyncHandler(async (req, res) => {
    const projects = await ProjectService.getProjects();
    res.status(200).json({ projects });
  });
  static createProject = asyncHandler(async (req, res) => {
    const project = await ProjectService.createProject(req.user._id.toString(), req.body);
    res.status(201).json({ project });
  });
  static getProjectById = asyncHandler(async (req, res) => {
    const project = await ProjectService.getProjectById(req.params.id);
    res.status(200).json({ project });
  });
  static updateProject = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Admin only", statusCode: 403 } });
    }
    const project = await ProjectService.updateProject(
      req.params.id,
      req.body
    );
    res.status(200).json({ project });
  });
  static deleteProject = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Admin only", statusCode: 403 } });
    }
    await ProjectService.deleteProject(req.params.id);
    res.status(200).json({ message: "Project deleted successfully" });
  });
  static requestAccess = asyncHandler(async (req, res) => {
    await ProjectService.requestAccess(req.user._id.toString(), req.params.id);
    res.status(200).json({ message: "Access requested" });
  });
  static addMember = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Admin only", statusCode: 403 } });
    }
    await ProjectService.addMember(req.user._id.toString(), req.params.id, req.body.userId);
    res.status(200).json({ message: "Member added" });
  });
  static removeMember = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Admin only", statusCode: 403 } });
    }
    await ProjectService.removeMember(req.user._id.toString(), req.params.id, req.params.userId);
    res.status(200).json({ message: "Member removed" });
  });
  static denyRequest = asyncHandler(async (req, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: { message: "Admin only", statusCode: 403 } });
    }
    await ProjectService.denyRequest(req.user._id.toString(), req.params.id, req.params.userId);
    res.status(200).json({ message: "Request denied" });
  });
};

// src/routes/project.routes.ts
var router4 = Router4();
router4.use(requireAuth);
router4.get("/", ProjectController.getProjects);
router4.post("/", validateBody(CreateProjectSchema), ProjectController.createProject);
router4.get("/:id", ProjectController.getProjectById);
router4.patch("/:id", validateBody(UpdateProjectSchema), ProjectController.updateProject);
router4.delete("/:id", ProjectController.deleteProject);
router4.post("/:id/request-access", ProjectController.requestAccess);
router4.delete("/:id/request-access/:userId", ProjectController.denyRequest);
router4.post("/:id/members", ProjectController.addMember);
router4.delete("/:id/members/:userId", ProjectController.removeMember);
var project_routes_default = router4;

// src/routes/admin.routes.ts
import { Router as Router5 } from "express";

// src/services/admin.service.ts
init_user_model();
import crypto2 from "crypto";
var toUser2 = (doc) => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    name: json.name,
    email: json.email || void 0,
    role: json.role,
    status: json.status,
    avatarColor: json.avatarColor || "#4F46E5",
    avatarUrl: json.avatarUrl || void 0,
    theme: json.theme || "dark",
    lastActiveAt: json.lastActiveAt ? new Date(json.lastActiveAt) : void 0,
    createdAt: json.createdAt ? new Date(json.createdAt) : void 0
  };
};
var AdminService = class {
  static async getTeam(adminId) {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map(toUser2);
  }
  static async generateInvite(adminId, input) {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") throw new AppError(403, "Admin only");
    const existingUser = await UserModel.findOne({ email: input.email.trim().toLowerCase() });
    if (existingUser) {
      if (existingUser.status === "invited" || existingUser.status === "deactivated") {
      } else {
        throw new AppError(400, "User already exists and is active");
      }
    }
    const token = crypto2.randomBytes(32).toString("hex");
    const tokenHash = crypto2.createHash("sha256").update(token).digest("hex");
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    if (existingUser) {
      existingUser.inviteTokenHash = tokenHash;
      existingUser.name = input.name;
      existingUser.jobTitle = input.jobTitle;
      existingUser.status = "invited";
      existingUser.inviteExpiresAt = expiresAt;
      await existingUser.save();
    } else {
      await UserModel.create({
        email: input.email.trim().toLowerCase(),
        name: input.name,
        jobTitle: input.jobTitle,
        role: "member",
        status: "invited",
        inviteTokenHash: tokenHash,
        avatarColor: "#4F46E5",
        // Randomize later if needed
        inviteExpiresAt: expiresAt
      });
    }
    await AdminAuditLogModel.create({
      adminId: admin._id.toString(),
      adminName: admin.name,
      action: "invite_sent",
      targetType: "user",
      targetId: input.email.trim().toLowerCase(),
      details: { name: input.name, jobTitle: input.jobTitle }
    });
    return token;
  }
  static async revokeInvite(adminId, userId) {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") throw new AppError(403, "Admin only");
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    if (user.status !== "invited") {
      throw new AppError(400, "User is not in invited status");
    }
    await UserModel.findByIdAndDelete(userId);
    await AdminAuditLogModel.create({
      adminId: admin._id.toString(),
      adminName: admin.name,
      action: "invite_revoked",
      targetType: "user",
      targetId: userId,
      details: { email: user.email }
    });
  }
  static async deactivateMember(adminId, userId) {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== "admin") throw new AppError(403, "Admin only");
    if (adminId === userId) {
      throw new AppError(400, "You cannot deactivate yourself");
    }
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    if (user.role === "admin") {
      const adminCount = await UserModel.countDocuments({ role: "admin", status: "active" });
      if (adminCount <= 1) {
        throw new AppError(400, "Cannot deactivate the last active admin");
      }
    }
    user.status = "deactivated";
    await user.save();
    await AdminAuditLogModel.create({
      adminId: admin._id.toString(),
      adminName: admin.name,
      action: "member_deactivated",
      targetType: "user",
      targetId: userId,
      details: { email: user.email }
    });
  }
  static async getAuditLog(adminId) {
    const logs = await AdminAuditLogModel.find().sort({ timestamp: -1 }).limit(100);
    return logs.map((l) => {
      const json = l.toJSON ? l.toJSON() : l;
      return {
        _id: json._id.toString(),
        adminId: json.adminId,
        adminName: json.adminName,
        action: json.action,
        targetType: json.targetType,
        targetId: json.targetId,
        timestamp: new Date(json.timestamp),
        details: json.details
      };
    });
  }
};

// src/controllers/admin.controller.ts
var AdminController = class {
  static getTeam = asyncHandler(async (req, res) => {
    const team = await AdminService.getTeam(req.user._id.toString());
    res.status(200).json({ team });
  });
  static generateInvite = asyncHandler(async (req, res) => {
    const token = await AdminService.generateInvite(req.user._id.toString(), req.body);
    res.status(201).json({ token });
  });
  static revokeInvite = asyncHandler(async (req, res) => {
    await AdminService.revokeInvite(req.user._id.toString(), req.params.userId);
    res.status(200).json({ message: "Invite revoked" });
  });
  static deactivateMember = asyncHandler(async (req, res) => {
    await AdminService.deactivateMember(req.user._id.toString(), req.params.userId);
    res.status(200).json({ message: "Member deactivated" });
  });
  static getAuditLog = asyncHandler(async (req, res) => {
    const logs = await AdminService.getAuditLog(req.user._id.toString());
    res.status(200).json({ logs });
  });
};

// src/routes/admin.routes.ts
var requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return next(new AppError(403, "Administrator access required"));
  }
  next();
};
var router5 = Router5();
router5.use(requireAuth, requireAdmin);
router5.get("/team", AdminController.getTeam);
router5.post("/invite", validateBody(AdminInviteSchema), AdminController.generateInvite);
router5.delete("/invite/:userId", AdminController.revokeInvite);
router5.post("/deactivate/:userId", AdminController.deactivateMember);
router5.get("/audit-log", AdminController.getAuditLog);
var admin_routes_default = router5;

// src/routes/assignment-request.routes.ts
import { Router as Router6 } from "express";
var router6 = Router6();
router6.use(requireAuth);
router6.patch("/:id", AssignmentRequestController.processRequest);
var assignment_request_routes_default = router6;

// src/routes/notification.routes.ts
import { Router as Router7 } from "express";

// src/controllers/notification.controller.ts
init_notification_service();
var NotificationController = class {
  static getNotifications = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 20;
    const notifications = await NotificationService.getNotifications(req.user._id.toString(), limit);
    res.status(200).json({ notifications });
  });
  static getUnreadCount = asyncHandler(async (req, res) => {
    const count = await NotificationService.getUnreadCount(req.user._id.toString());
    res.status(200).json({ count });
  });
  static markAsRead = asyncHandler(async (req, res) => {
    const notification = await NotificationService.markAsRead(req.user._id.toString(), req.params.id);
    res.status(200).json({ notification });
  });
  static markAllAsRead = asyncHandler(async (req, res) => {
    await NotificationService.markAllAsRead(req.user._id.toString());
    res.status(200).json({ message: "All notifications marked as read" });
  });
};

// src/routes/notification.routes.ts
var router7 = Router7();
router7.use(requireAuth);
router7.get("/", NotificationController.getNotifications);
router7.get("/unread-count", NotificationController.getUnreadCount);
router7.patch("/read-all", NotificationController.markAllAsRead);
router7.patch("/:id/read", NotificationController.markAsRead);
var notification_routes_default = router7;

// src/routes/ai.routes.ts
import { Router as Router8 } from "express";

// src/services/ai.service.ts
var AiService = class {
  static async parseTaskPrompt(prompt, context = "") {
    if (!env.OPENROUTER_API_KEY) {
      console.warn("OPENROUTER_API_KEY is not set. AI parsing is disabled.");
      return { type: "task", task: { title: prompt } };
    }
    const systemPrompt = `You are a helpful AI assistant for Taskly. 
You can either create a task for the user, or answer their questions about their team/projects based on the context.

Context:
${context}

If the user is asking a question or just chatting (e.g., "Give me the list of teammates"), return a JSON object with:
{ "type": "reply", "message": "Your text response here" }

If the user is describing a task they want to create, return a JSON object with:
{
  "type": "task",
  "task": {
    "title": "string (the main task title)",
    "description": "string (any additional details, or empty)",
    "priority": "low | medium | high",
    "dueDate": "ISO string date (if mentioned)",
    "tags": ["array of strings"],
    "projectId": "string (the ObjectId of the project if the task should be added to a specific project. See available projects in context. Optional, omit if not specified.)"
  }
}

Return ONLY a valid JSON object matching one of these schemas exactly, nothing else.`;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Taskly"
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) return { title: prompt };
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n/, "").replace(/\n```$/, "");
      }
      const parsed = JSON.parse(cleanContent);
      if (parsed.type === "reply") {
        return parsed;
      }
      const taskData = parsed.task || parsed;
      return {
        type: "task",
        task: {
          title: taskData.title || prompt,
          description: taskData.description,
          priority: ["low", "medium", "high"].includes(taskData.priority) ? taskData.priority : "medium",
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : void 0,
          tags: Array.isArray(taskData.tags) ? taskData.tags : void 0,
          projectId: taskData.projectId || void 0
        }
      };
    } catch (error) {
      console.error("Failed to parse AI task prompt:", error);
      return { type: "task", task: { title: prompt } };
    }
  }
  static async generateGreeting(userName, timeOfDay, tasksSummary) {
    let contextualFallback = "Focus on what truly matters today.";
    if (tasksSummary) {
      if (tasksSummary.includes("0 active tasks")) {
        contextualFallback = "You have a clear board today. Great job!";
      } else if (tasksSummary.includes("are overdue") && !tasksSummary.includes("0 are overdue")) {
        contextualFallback = "Let's clear out those overdue tasks first.";
      } else {
        contextualFallback = "Let's knock out today's tasks.";
      }
    }
    if (!env.OPENROUTER_API_KEY) {
      return {
        greeting: `Good ${timeOfDay}, ${userName}`,
        quote: contextualFallback
      };
    }
    const systemPrompt = `You are an elite, highly professional AI copywriter for a premium productivity app called Taskly.
Your task is to generate a short, premium, highly motivational 1-sentence greeting and a short, sophisticated inspirational quote based on the time of day.
Do NOT use overly enthusiastic punctuation (like multiple exclamation marks) or emojis. The tone should be calm, focused, elegant, and grounded.

Time of day: ${timeOfDay}
User's name: ${userName}
User's current task status: ${tasksSummary || "No tasks data available."}

*Crucial rule*: The quote MUST subtly reference their task status (e.g. if they have overdue tasks, motivate them to tackle the backlog. If they have no tasks, encourage them to plan ahead). Keep the quote under 12 words.

Return ONLY a valid JSON object matching this exact schema:
{
  "greeting": "string (e.g. 'Good morning, Udit.', 'Good evening, Udit.')",
  "quote": "string (e.g. 'Focus on what truly matters today.', 'End the day with intention.')"
}`;
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Taskly"
        },
        body: JSON.stringify({
          model: "google/gemma-4-26b-a4b-it:free",
          messages: [
            { role: "system", content: systemPrompt }
          ],
          response_format: { type: "json_object" }
        })
      });
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("No content from AI");
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.replace(/^```json\n/, "").replace(/\n```$/, "");
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.replace(/^```\n/, "").replace(/\n```$/, "");
      }
      return JSON.parse(cleanContent);
    } catch (error) {
      console.error("Failed to generate AI greeting:", error);
      return {
        greeting: `Good ${timeOfDay}, ${userName}`,
        quote: contextualFallback
      };
    }
  }
};

// src/controllers/ai.controller.ts
var AiController = class {
  static parseTask = asyncHandler(async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: { message: "Prompt is required" } });
    }
    const user = req.user;
    const { UserModel: UserModel2 } = await Promise.resolve().then(() => (init_user_model(), user_model_exports));
    const { ProjectModel: ProjectModel2 } = await Promise.resolve().then(() => (init_project_model(), project_model_exports));
    let teammatesStr = "";
    if (user.role === "admin") {
      const team = await UserModel2.find({ _id: { $ne: user._id } });
      teammatesStr = team.map((t) => `${t.name} (${t.email}) - ${t.role}`).join(", ");
    } else {
      const admins = await UserModel2.find({ role: "admin" });
      teammatesStr = admins.map((t) => `${t.name} (${t.email}) - ${t.role}`).join(", ");
    }
    const projects = await ProjectModel2.find({
      $or: [{ owner: user._id }, { members: user._id }]
    });
    const projectsStr = projects.map((p) => `Name: "${p.name}", ID: "${p._id}"`).join("\n");
    const context = `
Current User: ${user.name} (${user.role})
Available Teammates: ${teammatesStr || "None"}
Available Projects:
${projectsStr || "None"}
`;
    const parsedData = await AiService.parseTaskPrompt(prompt, context);
    res.status(200).json({ parsed: parsedData });
  });
  static generateGreeting = asyncHandler(async (req, res) => {
    const { timeBlock } = req.query;
    const user = req.user;
    let timeOfDay = "day";
    if (timeBlock === "morning" || timeBlock === "afternoon" || timeBlock === "evening") {
      timeOfDay = timeBlock;
    }
    const { TaskModel: TaskModel2 } = await Promise.resolve().then(() => (init_task_model(), task_model_exports));
    const now = /* @__PURE__ */ new Date();
    now.setHours(0, 0, 0, 0);
    const tasks = await TaskModel2.find({
      assignee: user._id,
      status: { $ne: "completed" }
    });
    const overdueCount = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now).length;
    const todayCount = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === now.getTime();
    }).length;
    const inProgressCount = tasks.filter((t) => t.status === "doing").length;
    const tasksSummary = `The user has ${tasks.length} active tasks. ${overdueCount} are overdue, ${todayCount} are due today, and ${inProgressCount} are currently in progress.`;
    const result = await AiService.generateGreeting(user.name, timeOfDay, tasksSummary);
    res.status(200).json(result);
  });
};

// src/routes/ai.routes.ts
var router8 = Router8();
router8.use(requireAuth);
router8.post("/parse-task", aiParserLimiter, AiController.parseTask);
router8.get("/greeting", AiController.generateGreeting);
var ai_routes_default = router8;

// src/routes/index.ts
var router9 = Router9();
router9.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
});
router9.use("/auth", auth_routes_default);
router9.use("/users", user_routes_default);
router9.use("/tasks", task_routes_default);
router9.use("/projects", project_routes_default);
router9.use("/admin", admin_routes_default);
router9.use("/assignment-requests", assignment_request_routes_default);
router9.use("/notifications", notification_routes_default);
router9.use("/ai", ai_routes_default);
var routes_default = router9;

// src/middleware/error.middleware.ts
var errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Resource not found with ID of ${err.value}`;
  }
  if (err.code === 11e3) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }
  if (env.NODE_ENV === "development") {
    console.error("\u{1F525} Error caught in global middleware:", err);
  }
  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      ...err.details ? { details: err.details } : {},
      ...env.NODE_ENV === "development" ? { stack: err.stack } : {}
    }
  });
};

// src/app.ts
var createApp = () => {
  const app = express();
  app.set("trust proxy", 1);
  const allowedOrigins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    env.FRONTEND_URL
  ].filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app") || origin.includes("localhost") || env.NODE_ENV === "development") {
          callback(null, true);
        } else {
          callback(new AppError(403, `Origin ${origin} not allowed by CORS`));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
    })
  );
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    })
  );
  if (env.NODE_ENV !== "test") {
    app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
  }
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.get("/", (_req, res) => {
    res.status(200).json({
      name: "Taskly API",
      status: "healthy",
      version: "1.0.0",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app.use("/api", routes_default);
  app.use("/", routes_default);
  app.all("*", (req, _res, next) => {
    next(new AppError(404, `Cannot find ${req.method} ${req.originalUrl} on this server`));
  });
  app.use(errorHandler);
  return app;
};

// src/config/db.ts
import mongoose13 from "mongoose";
import dns from "dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {
}
var cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}
var connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose13.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8e3
    }).then((mongoose14) => {
      console.log(`\u2705 MongoDB Connected: ${mongoose14.connection.host}`);
      return mongoose14;
    }).catch((error) => {
      console.error("\u274C Failed to connect to MongoDB:", error);
      cached.promise = null;
      if (env.NODE_ENV === "production") {
        process.exit(1);
      }
      throw error;
    });
  }
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
};

// src/vercel.ts
var appInstance;
var vercel_default = async (req, res) => {
  if (!appInstance) {
    await connectDB();
    appInstance = createApp();
  }
  return appInstance(req, res);
};
export {
  vercel_default as default
};
//# sourceMappingURL=vercel.js.map