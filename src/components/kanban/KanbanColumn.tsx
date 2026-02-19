import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onAddTask: (title: string, status: TaskStatus) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onMoveTask: (id: string, status: TaskStatus) => void;
}

export function KanbanColumn({ id, title, tasks, onAddTask, onUpdateTask, onDeleteTask, onMoveTask }: KanbanColumnProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  const { setNodeRef, isOver } = useDroppable({ id });

  const handleAdd = () => {
    if (newTitle.trim()) {
      onAddTask(newTitle.trim(), id);
      setNewTitle("");
      setAdding(false);
    }
  };

  const columnColors: Record<TaskStatus, string> = {
    backlog: "bg-muted-foreground/20",
    todo: "bg-primary/20",
    in_progress: "bg-priority-medium/20",
    done: "bg-priority-low/20",
  };

  const dotColors: Record<TaskStatus, string> = {
    backlog: "bg-muted-foreground",
    todo: "bg-primary",
    in_progress: "bg-priority-medium",
    done: "bg-priority-low",
  };

  return (
    <div className="flex-1 min-w-[280px] max-w-[350px]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColors[id]}`} />
          <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5 font-medium">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setAdding(true)}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div
        ref={setNodeRef}
        className={`kanban-column transition-colors duration-200 ${isOver ? columnColors[id] : ""}`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2.5">
            <AnimatePresence mode="popLayout">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask}
                  onDelete={onDeleteTask}
                  onMove={onMoveTask}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {adding && (
          <div className="mt-2.5 bg-card rounded-xl p-3 border border-border shadow-sm animate-fade-in">
            <input
              className="w-full bg-transparent border-0 text-sm font-medium focus:outline-none placeholder:text-muted-foreground"
              placeholder="Task title..."
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setAdding(false);
              }}
              autoFocus
            />
            <div className="flex gap-1 mt-2">
              <Button size="sm" onClick={handleAdd} className="text-xs h-7">Add</Button>
              <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-xs h-7">Cancel</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
