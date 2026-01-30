import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // 1. Obtener todas
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({ 
      include: { project: true }, 
      orderBy: { createdAt: "desc" } 
    });
  }),

  // 2. Obtener una por ID (Agregado)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: { id: input.id },
        include: { project: true },
      });
    }),

  // 3. Obtener Proyectos
  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({ 
      include: { _count: { select: { tasks: true } } }, 
      orderBy: { name: "asc" } 
    });
  }),

  // 4. Crear Tarea
  create: publicProcedure
    .input(z.object({ 
      title: z.string().min(1), 
      description: z.string().optional(), 
      priority: z.string(), 
      projectId: z.number() 
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const task = await tx.task.create({ data: input });
        await tx.history.create({ data: { taskId: task.id, action: "CREACIÓN", newValue: task.title } });
        return task;
      });
    }),

  // 5. Editar Tarea (Agregado)
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.string(),
      projectId: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.$transaction(async (tx) => {
        const oldTask = await tx.task.findUnique({ where: { id } });
        const updated = await tx.task.update({ where: { id }, data });
        await tx.history.create({
          data: { taskId: id, action: "EDICIÓN", oldValue: oldTask?.title, newValue: data.title }
        });
        return updated;
      });
    }),

  // 6. Cambiar Estado
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

  // 7. Comentarios e Historial
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

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => {
    return ctx.db.task.delete({ where: { id: input.id } });
  }),
});