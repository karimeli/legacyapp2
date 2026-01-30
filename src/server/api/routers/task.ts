import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const taskRouter = createTRPCRouter({
  // Mantenemos obtener todas
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.db.task.findMany({
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  // ELIMINADO: getById (ya no es necesario sin la carpeta [id])

  // Mantenemos la creación con la lógica de Proyecto General (Opción 3 anterior)
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.string(),
      projectId: z.number().optional() 
    }))
    .mutation(async ({ ctx, input }) => {
      let finalProjectId = input.projectId;
      
      const firstProject = await ctx.db.project.findFirst();
      if (firstProject) {
        finalProjectId = firstProject.id;
      } else {
        const defaultProject = await ctx.db.project.create({
          data: { name: "Proyecto General" }
        });
        finalProjectId = defaultProject.id;
      }

      return ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          priority: input.priority,
          projectId: finalProjectId!,
        },
      });
    }),

  getProjects: publicProcedure.query(({ ctx }) => {
    return ctx.db.project.findMany();
  }),
});