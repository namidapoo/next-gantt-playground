"use client";

import { format } from "date-fns";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useGanttStore } from "@/lib/stores/gantt.store";

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
	const { tags, addPeriod, tasks } = useGanttStore();
	const [note, setNote] = useState("");
	const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id || "");

	const task = tasks.find((t) => t.id === taskId);

	const handleSubmit = () => {
		if (note && selectedTagId) {
			addPeriod(taskId, {
				startDate,
				endDate,
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
							<Input
								id="start-date"
								value={format(new Date(startDate), "MMM d, yyyy")}
								disabled
							/>
						</div>
					</div>

					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="end-date" className="text-right">
							End Date
						</Label>
						<div className="col-span-3">
							<Input
								id="end-date"
								value={format(new Date(endDate), "MMM d, yyyy")}
								disabled
							/>
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
					<Button onClick={handleSubmit} disabled={!note || !selectedTagId}>
						Add
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
