"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { TaskNameEditor } from "./TaskNameEditor";
import { TaskRow } from "./TaskRow";

interface TaskListProps {
	dates: Date[];
	onPeriodSelect: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	onPeriodEdit?: (period: Period, taskId: string) => void;
	scrollRef?: React.RefObject<HTMLDivElement | null>;
	onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
	isAddModalOpen?: boolean;
}

export function TaskList({
	dates,
	onPeriodSelect,
	onPeriodEdit,
	scrollRef,
	onScroll,
	isAddModalOpen,
}: TaskListProps) {
	const { tasks, deleteTask, setEditingTaskId, editingTaskId } =
		useGanttStore();
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

	const handleTaskClick = (taskId: string) => {
		if (editingTaskId !== taskId) {
			setEditingTaskId(taskId);
		}
	};

	const handleEditFinish = () => {
		setEditingTaskId(null);
	};

	return (
		<>
			<div className="flex">
				{/* 固定されたTasks列 */}
				<div className="w-[250px] border-r border-gray-200 flex-shrink-0">
					{tasks.map((task, index) => {
						const isNotLastItem = index < tasks.length - 1;

						return (
							<div
								key={`${task.id}-name`}
								className={cn(
									"p-3 h-16 flex items-center justify-between group",
									isNotLastItem && "border-b border-gray-200",
								)}
							>
								{editingTaskId === task.id ? (
									<TaskNameEditor
										taskId={task.id}
										initialName={task.name}
										onFinish={handleEditFinish}
									/>
								) : (
									<button
										type="button"
										className="font-medium text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded text-left w-full truncate max-w-[200px]"
										onClick={() => handleTaskClick(task.id)}
										title={task.name}
									>
										{task.name}
									</button>
								)}
								<Button
									variant="ghost"
									size="sm"
									className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 cursor-pointer"
									onClick={() => handleDeleteTask(task.id, task.name)}
									title="Delete task"
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						);
					})}
				</div>

				{/* スクロール可能なスケジュール列 */}
				<div
					ref={scrollRef}
					className="flex-1 overflow-x-auto scrollbar-hide"
					onScroll={onScroll}
				>
					<div className="min-w-max">
						{tasks.map((task, index) => {
							const isLastRow = index === tasks.length - 1;

							return (
								<TaskRow
									key={task.id}
									task={task}
									dates={dates}
									onPeriodSelect={onPeriodSelect}
									onPeriodEdit={onPeriodEdit}
									scrollRef={scrollRef}
									isAddModalOpen={isAddModalOpen}
									isLastRow={isLastRow}
								/>
							);
						})}
					</div>
				</div>
			</div>

			<DeleteConfirmationDialog
				isOpen={deleteTaskDialog.isOpen}
				onClose={() =>
					setDeleteTaskDialog({ isOpen: false, taskId: "", taskName: "" })
				}
				onConfirm={handleConfirmDeleteTask}
				title="Delete Task"
				description={`Are you sure you want to delete "${deleteTaskDialog.taskName}"? This action cannot be undone and will remove all associated periods.`}
				confirmText="Delete Task"
			/>
		</>
	);
}
