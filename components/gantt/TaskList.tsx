"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
	dates: Date[];
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	onPeriodEdit?: (period: Period) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export function TaskList({
	dates,
	onPeriodSelect,
	onPeriodEdit,
	scrollRef,
	onScroll,
}: TaskListProps) {
	const { tasks, deleteTask } = useGanttStore();
	const [deleteTaskDialog, setDeleteTaskDialog] = useState<{
		isOpen: boolean;
		taskId: string;
		taskName: string;
	}>({ isOpen: false, taskId: "", taskName: "" });

	const handleDeleteTask = (taskId: string, taskName: string) => {
		setDeleteTaskDialog({ isOpen: true, taskId, taskName });
	};

	const handleConfirmDeleteTask = () => {
		deleteTask(deleteTaskDialog.taskId);
		toast.success(`Task "${deleteTaskDialog.taskName}" deleted successfully`);
		setDeleteTaskDialog({ isOpen: false, taskId: "", taskName: "" });
	};

	return (
		<>
			<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200">
				{/* 固定のTasks列 */}
				<div className="divide-y divide-gray-200">
					{tasks.map((task) => (
						<div key={`${task.id}-name`} className="p-3 h-16 flex items-center justify-between group">
							<div className="font-medium text-sm">{task.name}</div>
							<Button
								variant="ghost"
								size="sm"
								className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
								onClick={() => handleDeleteTask(task.id, task.name)}
								title="Delete task"
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					))}
				</div>

				{/* スクロール可能なコンテンツ領域 */}
				<div ref={scrollRef} className="overflow-x-hidden" onScroll={onScroll}>
					<div className="min-w-max divide-y divide-gray-200">
						{tasks.map((task) => (
							<TaskRow
								key={task.id}
								task={task}
								dates={dates}
								onPeriodSelect={onPeriodSelect}
								onPeriodEdit={onPeriodEdit}
								scrollRef={scrollRef}
							/>
						))}
					</div>
				</div>
			</div>

			<DeleteConfirmationDialog
				isOpen={deleteTaskDialog.isOpen}
				onClose={() => setDeleteTaskDialog({ isOpen: false, taskId: "", taskName: "" })}
				onConfirm={handleConfirmDeleteTask}
				title="Delete Task"
				description={`Are you sure you want to delete "${deleteTaskDialog.taskName}"? This action cannot be undone and will remove all associated periods.`}
				confirmText="Delete Task"
			/>
		</>
	);
}
