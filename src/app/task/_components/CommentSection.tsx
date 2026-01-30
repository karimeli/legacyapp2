"use client";
import { useState } from "react";
import { api } from "@/trpc/react";

export function CommentSection({ taskId }: { taskId: number }) {
  const [text, setText] = useState("");
  const utils = api.useUtils();
  const { data: comments } = api.task.getComments.useQuery({ taskId });
  
  const addComment = api.task.addComment.useMutation({
    onSuccess: () => {
      setText("");
      void utils.task.getComments.invalidate({ taskId });
    }
  });

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <form 
        onSubmit={(e) => { e.preventDefault(); if(text.trim()) addComment.mutate({ taskId, text }); }} 
        className="flex gap-2 mb-4"
      >
        <input 
          className="flex-1 bg-slate-50 border border-slate-200 p-2 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="¿Qué has avanzado?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">
          {addComment.isPending ? "..." : "Registrar"}
        </button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
        {comments?.map((c) => (
          <div key={c.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex justify-between items-start">
            <p className="text-xs text-slate-600">{c.text}</p>
            <span className="text-[9px] text-slate-400 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}