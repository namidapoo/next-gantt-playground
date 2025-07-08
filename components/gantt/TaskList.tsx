"use client";

import { useGanttStore } from "@/lib/stores/gantt.store";
import type { Period } from "@/lib/types/gantt";
import { TaskRow } from "./TaskRow";
import { TaskNameEditor } from "./TaskNameEditor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect } from "react";

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

	const handleAddTask = () => {
		const taskId = addTask("");
		setEditingTaskId(taskId);
		
		// 新しいタスクまで自動スクロール
		setTimeout(() => {
			const taskElement = document.getElementById(`task-${taskId}`);
			if (taskElement) {
				taskElement.scrollIntoView({ behavior: "smooth", block: "center" });
			}
		}, 100);
	};

	const handleTaskClick = (taskId: string) => {
		setEditingTaskId(taskId);
	};

	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.ctrlKey || e.metaKey) && e.key === "n") {
				e.preventDefault();
				handleAddTask();
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div className="grid grid-cols-[250px_1fr] divide-x divide-gray-200">
			{/* 固定のTasks列 */}
			<div className="divide-y divide-gray-200">
				{tasks.map((task) => (
					<div 
						key={`${task.id}-name`} 
						id={`task-${task.id}`}
						className="p-3 h-16 flex items-center"
					>
						{editingTaskId === task.id ? (
							<TaskNameEditor
								taskId={task.id}
								initialName={task.name}
							/>
						) : (
							<div 
								className="font-medium text-sm cursor-pointer hover:text-blue-600 transition-colors w-full"
								onClick={() => handleTaskClick(task.id)}
							>
								{task.name}
							</div>
						)}
					</div>
				))}
				
				{/* 最下部の追加ボタン */}
				<div className="p-3 h-16 flex items-center justify-center">
					<Button
						onClick={handleAddTask}
						variant="ghost"
						size="sm"
						className="w-full text-gray-500 hover:text-gray-700"
					>
						<Plus className="h-4 w-4 mr-2" />
						タスクを追加
					</Button>
				</div>
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
					
					{/* 最下部の空のスペース（追加ボタンと合わせるため） */}
					<div className="h-16" />
				</div>
			</div>
		</div>
	);
}
