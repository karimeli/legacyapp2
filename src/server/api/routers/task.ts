import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // TAREAS
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({ include: { project: true }, orderBy: { createdAt: "desc" } });
  }),

  create: publicProcedure
    .input(z.object({ title: z.string().min(1), description: z.string().optional(), priority: z.string(), projectId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const task = await tx.task.create({ data: input });
        await tx.history.create({ data: { taskId: task.id, action: "CREACIÓN", newValue: task.title } });
        return task;
      });
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const old = await ctx.db.task.findUnique({ where: { id: input.id } });
      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.task.update({ where: { id: input.id }, data: { status: input.status } });
        await tx.history.create({ data: { taskId: input.id, action: "ESTADO", oldValue: old?.status, newValue: input.status } });
        return updated;
      });
    }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => {
    return ctx.db.task.delete({ where: { id: input.id } });
  }),

  // PROYECTOS
  getAllProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({ include: { _count: { select: { tasks: true } } }, orderBy: { createdAt: "desc" } });
  }),

  createProject: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) => ctx.db.project.create({ data: input })),

  deleteProject: publicProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => {
    return ctx.db.project.delete({ where: { id: input.id } });
  }),

  // REPORTES Y BÚSQUEDA
  getReportData: publicProcedure.query(async ({ ctx }) => {
    const [total, status, projects] = await Promise.all([
      ctx.db.task.count(),
      ctx.db.task.groupBy({ by: ['status'], _count: { id: true } }),
      ctx.db.project.findMany({ include: { _count: { select: { tasks: true } } } })
    ]);
    return { total, status, projects: projects.map(p => ({ name: p.name, count: p._count.tasks })) };
  }),

  searchTasks: publicProcedure
    .input(z.object({ query: z.string().optional(), status: z.string().optional(), projectId: z.number().optional() }))
    .query(({ ctx, input }) => {
      return ctx.db.task.findMany({
        where: {
          AND: [
            input.query ? { title: { contains: input.query, mode: 'insensitive' } } : {},
            input.status ? { status: input.status } : {},
            input.projectId ? { projectId: input.projectId } : {},
          ]
        },
        include: { project: true },
        orderBy: { createdAt: 'desc' }
      });
    }),

  // AVANCES E HISTORIAL
  addComment: publicProcedure
    .input(z.object({ taskId: z.number(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const comment = await tx.comment.create({ data: input });
        await tx.history.create({ data: { taskId: input.taskId, action: "AVANCE", newValue: input.text } });
        return comment;
      });
    }),

  getComments: publicProcedure.input(z.object({ taskId: z.number() })).query(({ ctx, input }) => {
    return ctx.db.comment.findMany({ where: { taskId: input.taskId }, orderBy: { createdAt: "desc" } });
  }),

  getHistory: publicProcedure.input(z.object({ taskId: z.number() })).query(({ ctx, input }) => {
    return ctx.db.history.findMany({ where: { taskId: input.taskId }, orderBy: { timestamp: "desc" } });
  }),
});