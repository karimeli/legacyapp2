import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // Obtener todas las tareas para el dashboard
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({ 
      include: { project: true }, 
      orderBy: { createdAt: "desc" } 
    });
  }),

  // Procedimiento para cargar proyectos en formularios (Corregido)
  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({ 
      include: { _count: { select: { tasks: true } } }, 
      orderBy: { name: "asc" } 
    });
  }),

  // Crear Tarea
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

  // Cambiar estado e historial
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

  // Agregar avance (comentario)
  addComment: publicProcedure
    .input(z.object({ taskId: z.number(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const comment = await tx.comment.create({ data: input });
        await tx.history.create({ data: { taskId: input.taskId, action: "AVANCE", newValue: input.text } });
        return comment;
      });
    }),

  // Consultas de apoyo
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