import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // --- SECCIÓN DE TAREAS (Ya la tenías) ---
  
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({ 
      include: { project: true }, 
      orderBy: { createdAt: "desc" } 
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: { id: input.id },
        include: { project: true },
      });
    }),

  // Usado por el formulario de Nueva Tarea (Select)
  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({ 
      include: { _count: { select: { tasks: true } } }, 
      orderBy: { name: "asc" } 
    });
  }),

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
        await tx.history.create({ 
            data: { taskId: task.id, action: "CREACIÓN", newValue: task.title } 
        });
        return task;
      });
    }),

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
          data: { 
            taskId: id, 
            action: "EDICIÓN", 
            oldValue: oldTask?.title, 
            newValue: data.title 
          }
        });
        return updated;
      });
    }),

  updateStatus: publicProcedure
    .input(z.object({ id: z.number(), status: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const old = await ctx.db.task.findUnique({ where: { id: input.id } });
      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.task.update({ 
            where: { id: input.id }, 
            data: { status: input.status } 
        });
        await tx.history.create({ 
            data: { 
                taskId: input.id, 
                action: "ESTADO", 
                oldValue: old?.status, 
                newValue: input.status 
            } 
        });
        return updated;
      });
    }),

  addComment: publicProcedure
    .input(z.object({ taskId: z.number(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const comment = await tx.comment.create({ data: input });
        await tx.history.create({ 
            data: { taskId: input.taskId, action: "AVANCE", newValue: input.text } 
        });
        return comment;
      });
    }),

  getComments: publicProcedure.input(z.object({ taskId: z.number() })).query(({ ctx, input }) => {
    return ctx.db.comment.findMany({ 
        where: { taskId: input.taskId }, 
        orderBy: { createdAt: "desc" } 
    });
  }),

  getHistory: publicProcedure.input(z.object({ taskId: z.number() })).query(({ ctx, input }) => {
    return ctx.db.history.findMany({ 
        where: { taskId: input.taskId }, 
        orderBy: { timestamp: "desc" } 
    });
  }),

  delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ ctx, input }) => {
    return ctx.db.task.delete({ where: { id: input.id } });
  }),

  // --- NUEVA SECCIÓN: GESTIÓN DE PROYECTOS (Para arreglar tu error) ---

  // 1. Alias o función específica para la página de proyectos
  getAllProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany({
      include: { _count: { select: { tasks: true } } },
      orderBy: { name: "asc" }
    });
  }),

  // 2. Crear Proyecto
  createProject: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({ data: input });
    }),

  // 3. Eliminar Proyecto (Con validación básica)
  deleteProject: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Verificamos si tiene tareas antes de borrar
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: { _count: { select: { tasks: true } } }
      });

      if (project && project._count.tasks > 0) {
        throw new Error("No se puede eliminar un proyecto que tiene tareas activas.");
      }

      return ctx.db.project.delete({ where: { id: input.id } });
    }),

  // 4. Datos para Reportes (Usado en invalidación)
  getReportData: publicProcedure.query(async ({ ctx }) => {
    const total = await ctx.db.task.count();
    const pending = await ctx.db.task.count({ where: { status: "PENDIENTE" } });
    const done = await ctx.db.task.count({ where: { status: "COMPLETADA" } });
    
    // Agregamos desglose por proyecto para gráficos futuros si se requiere
    const byProject = await ctx.db.project.findMany({
      select: { name: true, _count: { select: { tasks: true } } }
    });

    return { total, pending, done, byProject };
  }),
});