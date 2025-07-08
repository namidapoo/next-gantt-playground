"use client";

import { useEffect, useRef, useState } from "react";
import { useGanttStore } from "@/lib/stores/gantt.store";
import { Input } from "@/components/ui/input";

interface TaskNameEditorProps {
	taskId: string;
	initialName: string;
	onComplete: () => void;
}

export function TaskNameEditor({ taskId, initialName, onComplete }: TaskNameEditorProps) {
	const [name, setName] = useState(initialName);
	const { updateTask, deleteTask } = useGanttStore();
	const inputRef = useRef<HTMLInputElement>(null);

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
		onComplete();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleSubmit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			if (initialName) {
				onComplete();
			} else {
				deleteTask(taskId);
				onComplete();
			}
		}
	};

	const handleBlur = () => {
		handleSubmit();
	};

	return (
		<Input
			ref={inputRef}
			value={name}
			onChange={(e) => setName(e.target.value)}
			onKeyDown={handleKeyDown}
			onBlur={handleBlur}
			className="h-6 text-sm font-medium"
			placeholder="タスク名を入力"
		/>
	);
}