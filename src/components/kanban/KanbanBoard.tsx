import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { useState } from "react";
import { COLUMNS, Task, TaskStatus } from "@/lib/types";
import { useTasks } from "@/hooks/useTasks";
import { KanbanColumn } from "./KanbanColumn";
import { TaskCard } from "./TaskCard";
import { Loader2 } from "lucide-react";

export function KanbanBoard() {
  const { tasks, loading, addTask, updateTask, deleteTask, moveTask, getTasksByStatus } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Dropped over a column
    if (COLUMNS.some(c => c.id === overId)) {
      moveTask(taskId, overId as TaskStatus);
      return;
    }

    // Dropped over another task — move to that task's column
    const overTask = tasks.find(t => t.id === overId);
    if (overTask) {
      moveTask(taskId, overTask.status as TaskStatus);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-5 overflow-x-auto pb-4 px-1">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={getTasksByStatus(col.id)}
            onAddTask={addTask}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onMoveTask={moveTask}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="task-card task-card-dragging w-[300px]">
            <h4 className="font-semibold text-sm">{activeTask.title}</h4>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
