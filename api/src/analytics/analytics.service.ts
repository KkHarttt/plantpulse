
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IssueStatus, Severity, ChecklistStatus } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // Общая статистика системы
  async getDashboard() {
    const [
      totalEquipment,
      activeEquipment,
      totalChecklists,
      submittedChecklists,
      totalIssues,
      openIssues,
      resolvedIssues,
      criticalIssues,
      warningIssues,
    ] = await Promise.all([
      this.prisma.equipment.count(),
      this.prisma.equipment.count({
        where: { isActive: true },
      }),
      this.prisma.checklist.count(),
      this.prisma.checklist.count({
        where: { status: ChecklistStatus.SUBMITTED },
      }),
      this.prisma.issue.count(),
      this.prisma.issue.count({
        where: {
          status: {
            not: IssueStatus.RESOLVED,
          },
        },
      }),
      this.prisma.issue.count({
        where: { status: IssueStatus.RESOLVED },
      }),
      this.prisma.issue.count({
        where: { severity: Severity.CRITICAL },
      }),
      this.prisma.issue.count({
        where: { severity: Severity.WARNING },
      }),
    ]);

    return {
      equipment: {
        total: totalEquipment,
        active: activeEquipment,
      },
      checklists: {
        total: totalChecklists,
        submitted: submittedChecklists,
      },
      issues: {
        total: totalIssues,
        open: openIssues,
        resolved: resolvedIssues,
        critical: criticalIssues,
        warning: warningIssues,
      },
    };
  }

  // Статистика тикетов по статусам
  async getIssuesByStatus() {
    const statuses = Object.values(IssueStatus);

    const result = await Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await this.prisma.issue.count({
          where: { status },
        }),
      })),
    );

    return result;
  }

  // Статистика тикетов по серьёзности
  async getIssuesBySeverity() {
    const severities = Object.values(Severity);

    const result = await Promise.all(
      severities.map(async (severity) => ({
        severity,
        count: await this.prisma.issue.count({
          where: { severity },
        }),
      })),
    );

    return result;
  }
}
