"use client";
import { useState } from "react";
import { api } from "@/trpc/react";

export function CommentSection({ taskId }: { taskId: number }) {
  const [text, setText] = useState("");
  const utils = api.useUtils();
  const { data: comments } = api.task.getComments.useQuery({ taskId });
  
  const add = api.task.addComment.useMutation({
    onSuccess: () => {
      setText("");
      void utils.task.getComments.invalidate({ taskId });
      void utils.task.getHistory.invalidate({ taskId });
    }
  });

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <form onSubmit={e => { e.preventDefault(); if(text.trim()) add.mutate({ taskId, text }); }} className="flex gap-2 mb-4">
        <input className="flex-1 bg-slate-50 border border-slate-200 p-2 text-sm rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="¿Qué has avanzado?" value={text} onChange={e => setText(e.target.value)} />
        <button disabled={add.isPending} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold">{add.isPending ? "..." : "Registrar"}</button>
      </form>
      <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
        {comments?.map(c => (
          <div key={c.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex justify-between items-start">
            <p className="text-xs text-slate-600 leading-relaxed">{c.text}</p>
            <span className="text-[9px] text-slate-400 font-bold ml-2 whitespace-nowrap">{new Date(c.createdAt).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}