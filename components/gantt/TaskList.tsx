"use client";

import { useEffect, useRef } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { TaskRow } from "./TaskRow";
import { TaskNameEditor } from "./TaskNameEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
	const { tasks, addTask, setEditingTaskId, editingTaskId } = useGanttStore();
	const taskListRef = useRef<HTMLDivElement>(null);

	const handleAddTask = () => {
		const taskId = addTask("");
		setEditingTaskId(taskId);
		
		// 新しいタスクにスクロール
		setTimeout(() => {
			if (taskListRef.current) {
				taskListRef.current.scrollTop = taskListRef.current.scrollHeight;
			}
		}, 100);
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
		<div className="flex flex-col h-full">
			<div className="flex-1 overflow-hidden">
				<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200 h-full">
					{/* 固定のTasks列 */}
					<div ref={taskListRef} className="divide-y divide-gray-200 overflow-y-auto">
						{tasks.map((task) => (
							<div key={`${task.id}-name`} className="p-3 h-16 flex items-center">
								{editingTaskId === task.id ? (
									<TaskNameEditor
										taskId={task.id}
										initialName={task.name}
										onFinish={handleEditFinish}
									/>
								) : (
									<div
										className="font-medium text-sm cursor-pointer hover:bg-gray-100 px-2 py-1 rounded w-full"
										onClick={() => handleTaskClick(task.id)}
									>
										{task.name}
									</div>
								)}
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
			</div>

			{/* 最下部のタスク追加ボタン */}
			<div className="p-3 border-t border-gray-200">
				<Button
					onClick={handleAddTask}
					variant="outline"
					className="w-full"
					size="sm"
				>
					<Plus className="w-4 h-4 mr-2" />
					タスクを追加
				</Button>
			</div>
		</div>
	);
}
