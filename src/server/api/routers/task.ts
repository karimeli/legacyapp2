import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // 1. Obtener todas (Dashboard)
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // 2. Obtener una por ID (Detalle)
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return ctx.db.task.findUnique({
        where: { id: input.id },
        include: { 
          comments: { orderBy: { createdAt: 'desc' } },
          history: { orderBy: { timestamp: 'desc' } },
          project: true
        },
      });
    }),

  // 3. Crear Tarea (Nueva)
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.string(),
      projectId: z.number() // Asumiremos ID 1 por defecto si no hay selector de proyectos
    }))
    .mutation(async ({ ctx, input }) => {
      const newTask = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          projectId: input.projectId,
        },
      });
      // Registrar creación en historial
      await ctx.db.history.create({
        data: { taskId: newTask.id, action: "CREADA", newValue: input.title }
      });
      return newTask;
    }),

  // 4. Actualizar Estado (Detalle)
  updateStatus: publicProcedure
    .input(z.object({ 
      id: z.number(), 
      status: z.string() 
    }))
    .mutation(async ({ ctx, input }) => {
      const oldTask = await ctx.db.task.findUnique({ where: { id: input.id } });
      if (!oldTask) throw new Error("Tarea no encontrada");

      return ctx.db.$transaction(async (tx) => {
        const updated = await tx.task.update({
          where: { id: input.id },
          data: { status: input.status },
        });

        if (oldTask.status !== input.status) {
          await tx.history.create({
            data: {
              taskId: input.id,
              action: "CAMBIO_ESTADO",
              oldValue: oldTask.status,
              newValue: input.status,
            },
          });
        }
        return updated;
      });
    }),

  // 5. Agregar Comentario (Detalle)
  addComment: publicProcedure
    .input(z.object({ taskId: z.number(), text: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.$transaction(async (tx) => {
        const newComment = await tx.comment.create({
          data: { taskId: input.taskId, text: input.text },
        });

        await tx.history.create({
          data: {
            taskId: input.taskId,
            action: "COMENTARIO",
            oldValue: "",
            newValue: input.text,
          },
        });

        return newComment;
      });
    }),
    
  // 6. Obtener Proyectos (Para el select de crear tarea)
  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany();
  }),
});