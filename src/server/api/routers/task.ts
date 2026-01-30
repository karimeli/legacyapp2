import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // Obtener todas las tareas
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // Crear Tarea con validación de Proyecto (Opción 3)
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.string(),
      projectId: z.number().optional() 
    }))
    .mutation(async ({ ctx, input }) => {
      // Lógica de resiliencia: Buscar o crear un proyecto válido
      let finalProjectId = input.projectId;

      if (finalProjectId) {
        const exists = await ctx.db.project.findUnique({ where: { id: finalProjectId } });
        if (!exists) finalProjectId = undefined;
      }

      if (!finalProjectId) {
        // Intentamos tomar el primer proyecto que exista
        const firstProject = await ctx.db.project.findFirst();
        if (firstProject) {
          finalProjectId = firstProject.id;
        } else {
          // Si no hay NINGÚN proyecto, creamos uno por defecto
          const defaultProject = await ctx.db.project.create({
            data: { name: "Proyecto General", description: "Creado automáticamente" }
          });
          finalProjectId = defaultProject.id;
        }
      }

      // Asegurar que tenemos un projectId válido antes de crear la tarea
      if (finalProjectId === undefined) {
        throw new Error("No se pudo determinar el proyecto para la tarea");
      }

      const newTask = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          projectId: finalProjectId,
        },
      });

      // Registrar en historial
      await ctx.db.history.create({
        data: { taskId: newTask.id, action: "CREADA", newValue: input.title }
      });

      return newTask;
    }),

  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany();
  }),

  // ... (puedes mantener tus otros métodos updateStatus y addComment igual)
});