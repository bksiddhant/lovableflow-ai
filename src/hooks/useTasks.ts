import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskStatus, TaskPriority } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });

    if (error) {
      toast({ title: "Error loading tasks", description: error.message, variant: "destructive" });
    } else {
      setTasks((data ?? []) as Task[]);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (title: string, status: TaskStatus = "todo") => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const columTasks = tasks.filter(t => t.status === status);
    const position = columTasks.length;

    const { data, error } = await supabase
      .from("tasks")
      .insert({ title, status, position, user_id: user.id })
      .select()
      .single();

    if (error) {
      toast({ title: "Error creating task", description: error.message, variant: "destructive" });
    } else if (data) {
      setTasks(prev => [...prev, data as Task]);
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, "title" | "description" | "priority" | "due_date" | "status" | "position">>) => {
    const { error } = await supabase.from("tasks").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error updating task", description: error.message, variant: "destructive" });
    } else {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting task", description: error.message, variant: "destructive" });
    } else {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const moveTask = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    const newPosition = tasks.filter(t => t.status === newStatus).length;
    await updateTask(taskId, { status: newStatus, position: newPosition });
  };

  const getTasksByStatus = (status: TaskStatus) =>
    tasks.filter(t => t.status === status).sort((a, b) => a.position - b.position);

  return { tasks, loading, addTask, updateTask, deleteTask, moveTask, getTasksByStatus, fetchTasks };
}
