"use client";

import { useEffect, useRef, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";

interface TaskNameEditorProps {
	taskId: string;
	initialName: string;
	onFinish: () => void;
}

export function TaskNameEditor({ taskId, initialName, onFinish }: TaskNameEditorProps) {
	const [name, setName] = useState(initialName);
	const inputRef = useRef<HTMLInputElement>(null);
	const { updateTask, deleteTask } = useGanttStore();

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
			inputRef.current.select();
		}
	}, []);

	const handleSubmit = () => {
		if (name.trim()) {
			updateTask(taskId, name.trim());
		} else {
			deleteTask(taskId);
		}
		onFinish();
	};

	const handleCancel = () => {
		if (initialName === "") {
			deleteTask(taskId);
		}
		onFinish();
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
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
			onBlur={handleSubmit}
			className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
			placeholder="タスク名を入力"
		/>
	);
}