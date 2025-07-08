"use client";

import { useGanttStore } from "@/lib/stores/gantt.store";
import { useEffect, useRef, useState } from "react";

interface TaskNameEditorProps {
	taskId: string;
	initialName: string;
	onComplete?: () => void;
}

export function TaskNameEditor({
	taskId,
	initialName,
	onComplete,
}: TaskNameEditorProps) {
	const { updateTask, deleteTask, setEditingTaskId } = useGanttStore();
	const [name, setName] = useState(initialName);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, []);

	const handleComplete = () => {
		const trimmedName = name.trim();
		if (trimmedName) {
			updateTask(taskId, trimmedName);
		} else {
			deleteTask(taskId);
		}
		setEditingTaskId(null);
		onComplete?.();
	};

	const handleCancel = () => {
		if (!initialName) {
			deleteTask(taskId);
		}
		setEditingTaskId(null);
		onComplete?.();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleComplete();
		} else if (e.key === "Escape") {
			e.preventDefault();
			handleCancel();
		}
	};

	return (
		<input
			ref={inputRef}
			type="text"
			value={name}
			onChange={(e) => setName(e.target.value)}
			onKeyDown={handleKeyDown}
			onBlur={handleComplete}
			className="w-full bg-transparent border-none outline-none ring-2 ring-blue-500 ring-inset rounded px-1 font-medium text-sm"
			placeholder="タスク名を入力..."
		/>
	);
}