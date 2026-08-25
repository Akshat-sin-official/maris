import { Response, NextFunction } from 'express';
import { Report } from './Report.model';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { NotFoundError, ValidationError, ForbiddenError } from '../common/errors';

export async function listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userRole = req.user?.role || '';
    const isStaff = ['RESEARCHER', 'SUPERVISOR', 'ADMIN', 'ORG_ADMIN', 'CONTROL_ROOM_OPERATOR', 'CONTROL_ROOM'].includes(userRole);

    const query = isStaff ? {} : { status: 'PUBLISHED' };
    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
}

export async function getReportById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Research report not found.');
    }

    res.status(200).json({
      status: 'success',
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) throw new ForbiddenError('Authentication required to author research reports');

    const { title, category, abstract, content, region, tags, status } = req.body;
    if (!title || !abstract || !content) {
      throw new ValidationError('Title, abstract, and narrative content are required');
    }

    const reportId = `REP-${Date.now().toString().slice(-4)}`;
    const isPublished = status === 'PUBLISHED';

    const newReport = await Report.create({
      reportId,
      title,
      category: category || 'BIODIVERSITY_ASSESSMENT',
      author: user.email.split('@')[0] || 'Dr. Meera Swaminathan',
      authorId: user.userId,
      abstract,
      content,
      region: region || 'Gulf of Mannar Sector B4',
      status: status || 'DRAFT',
      tags: Array.isArray(tags) ? tags : ['Marine Intelligence', 'INCOIS'],
      publishedAt: isPublished ? new Date() : undefined,
    });

    res.status(201).json({
      status: 'success',
      message: `Research report ${reportId} created successfully.`,
      data: newReport,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { title, category, abstract, content, region, tags, status } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Research report not found.');
    }

    if (title !== undefined) report.title = title;
    if (category !== undefined) report.category = category;
    if (abstract !== undefined) report.abstract = abstract;
    if (content !== undefined) report.content = content;
    if (region !== undefined) report.region = region;
    if (tags !== undefined) report.tags = tags;
    if (status !== undefined) {
      report.status = status;
      if (status === 'PUBLISHED' && !report.publishedAt) {
        report.publishedAt = new Date();
      }
    }

    await report.save();

    res.status(200).json({
      status: 'success',
      message: `Report ${report.reportId} updated successfully.`,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function publishReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const targetStatus = status || 'PUBLISHED';
    const report = await Report.findById(id);
    if (!report) {
      throw new NotFoundError('Research report not found.');
    }

    report.status = targetStatus;
    if (targetStatus === 'PUBLISHED' && !report.publishedAt) {
      report.publishedAt = new Date();
    }
    await report.save();

    res.status(200).json({
      status: 'success',
      message: `Report ${report.reportId} status updated to ${targetStatus}`,
      data: report,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      throw new NotFoundError('Research report not found.');
    }

    res.status(200).json({
      status: 'success',
      message: 'Research report deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
