import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { GripVertical, Calendar, Trash2, ChevronRight, Pencil } from "lucide-react";
import { Task, TaskStatus, COLUMNS, PRIORITY_LABELS } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

export function TaskCard({ task, onUpdate, onDelete, onMove }: TaskCardProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    onUpdate(task.id, { title, description });
    setEditing(false);
  };

  const priorityClass = `priority-${task.priority}`;
  const nextStatuses = COLUMNS.filter(c => c.id !== task.status);

  const formattedDate = task.due_date
    ? new Date(task.due_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : null;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`task-card group ${isDragging ? "task-card-dragging" : ""}`}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab active:cursor-grabbing text-muted-foreground"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input
                className="w-full bg-secondary/50 border border-border rounded-md px-2 py-1 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSave()}
                autoFocus
              />
              <textarea
                className="w-full bg-secondary/50 border border-border rounded-md px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Add description..."
              />
              <div className="flex gap-1">
                <Button size="sm" variant="default" onClick={handleSave} className="text-xs h-7">Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)} className="text-xs h-7">Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className={`text-xs font-medium ${priorityClass} border-0`}>
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                      <span className="text-lg leading-none">···</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => setEditing(true)}>
                      <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                    {nextStatuses.map(col => (
                      <DropdownMenuItem key={col.id} onClick={() => onMove(task.id, col.id)}>
                        <ChevronRight className="w-3.5 h-3.5 mr-2" /> Move to {col.title}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => onDelete(task.id)} className="text-destructive focus:text-destructive">
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h4 className="font-semibold text-sm text-card-foreground leading-tight">{task.title}</h4>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
              )}
              {formattedDate && (
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
