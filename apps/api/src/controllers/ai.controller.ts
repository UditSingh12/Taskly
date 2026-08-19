import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AiService } from '../services/ai.service.js';

export class AiController {
  static parseTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: { message: 'Prompt is required' } });
    }

    const user = req.user!;
    // Fetch user's team members context
    const { UserModel } = await import('../models/user.model.js');
    const { ProjectModel } = await import('../models/project.model.js');
    let teammatesStr = '';
    if (user.role === 'admin') {
      const team = await UserModel.find({ _id: { $ne: user._id } });
      teammatesStr = team.map(t => `${t.name} (${t.email}) - ${t.role}`).join(', ');
    } else {
      const admins = await UserModel.find({ role: 'admin' });
      teammatesStr = admins.map(t => `${t.name} (${t.email}) - ${t.role}`).join(', ');
    }

    // Fetch projects
    const projects = await ProjectModel.find({
      $or: [{ owner: user._id }, { members: user._id }]
    });
    const projectsStr = projects.map(p => `Name: "${p.name}", ID: "${p._id}"`).join('\n');

    const context = `
Current User: ${user.name} (${user.role})
Available Teammates: ${teammatesStr || 'None'}
Available Projects:
${projectsStr || 'None'}
`;

    const parsedData = await AiService.parseTaskPrompt(prompt, context);
    res.status(200).json({ parsed: parsedData });
  });
}
