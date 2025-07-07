"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGanttStore } from "@/lib/stores/gantt.store";
import { cn } from "@/lib/utils";

interface AddPeriodModalProps {
	isOpen: boolean;
	onClose: () => void;
	taskId: string;
	startDate: string;
	endDate: string;
}

export function AddPeriodModal({
	isOpen,
	onClose,
	taskId,
	startDate,
	endDate,
}: AddPeriodModalProps) {
	const { tags, addPeriod, tasks, updateSelectedPeriod } = useGanttStore();
	const [note, setNote] = useState("");
	const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || "");
	const [editableStartDate, setEditableStartDate] = useState<Date | undefined>(
		startDate ? new Date(startDate) : undefined,
	);
	const [editableEndDate, setEditableEndDate] = useState<Date | undefined>(
		endDate ? new Date(endDate) : undefined,
	);

	const task = tasks.find((t) => t.id === taskId);

	useEffect(() => {
		setEditableStartDate(startDate ? new Date(startDate) : undefined);
		setEditableEndDate(endDate ? new Date(endDate) : undefined);
	}, [startDate, endDate]);

	// 日付変更時にハイライトを更新
	useEffect(() => {
		if (editableStartDate && editableEndDate) {
			const startDateString = format(editableStartDate, "yyyy-MM-dd");
			const endDateString = format(editableEndDate, "yyyy-MM-dd");
			updateSelectedPeriod(startDateString, endDateString);
		}
	}, [editableStartDate, editableEndDate, updateSelectedPeriod]);

	const handleSubmit = () => {
		if (note && selectedTagId && editableStartDate && editableEndDate) {
			// Check if start date is before or equal to end date
			if (editableStartDate > editableEndDate) {
				alert("Start date must be before or equal to end date");
				return;
			}

			addPeriod(taskId, {
				startDate: format(editableStartDate, "yyyy-MM-dd"),
				endDate: format(editableEndDate, "yyyy-MM-dd"),
				note,
				tagId: selectedTagId,
			});

			setNote("");
			setSelectedTagId(tags[0]?.id || "");
			onClose();
		}
	};

	if (!task) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Period</DialogTitle>
					<DialogDescription>Add a new period to {task.name}</DialogDescription>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="start-date" className="text-right">
							Start Date
						</Label>
						<div className="col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!editableStartDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{editableStartDate ? (
											format(editableStartDate, "MMM d, yyyy")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={editableStartDate}
										onSelect={setEditableStartDate}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="end-date" className="text-right">
							End Date
						</Label>
						<div className="col-span-3">
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant="outline"
										className={cn(
											"w-full justify-start text-left font-normal",
											!editableEndDate && "text-muted-foreground",
										)}
									>
										<CalendarIcon className="mr-2 h-4 w-4" />
										{editableEndDate ? (
											format(editableEndDate, "MMM d, yyyy")
										) : (
											<span>Pick a date</span>
										)}
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-auto p-0" align="start">
									<Calendar
										mode="single"
										selected={editableEndDate}
										onSelect={setEditableEndDate}
										captionLayout="dropdown"
									/>
								</PopoverContent>
							</Popover>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="tag" className="text-right">
							Tag
						</Label>
						<div className="col-span-3">
							<Select value={selectedTagId} onValueChange={setSelectedTagId}>
								<SelectTrigger id="tag">
									<SelectValue placeholder="Select a tag" />
								</SelectTrigger>
								<SelectContent>
									{tags.map((tag) => (
										<SelectItem key={tag.id} value={tag.id}>
											<div className="flex items-center gap-2">
												<div
													className="w-3 h-3 rounded-full"
													style={{ backgroundColor: tag.color }}
												/>
												{tag.name}
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="note" className="text-right">
							Note
						</Label>
						<div className="col-span-3">
							<Input
								id="note"
								value={note}
								onChange={(e) => setNote(e.target.value)}
								placeholder="Enter work description"
								autoFocus
							/>
						</div>
					</div>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={
							!note || !selectedTagId || !editableStartDate || !editableEndDate
						}
					>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
