"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import type { Period } from "@/lib/types/gantt";
import { cn } from "@/lib/utils";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

const FormSchema = z
	.object({
		startDate: z.date({
			required_error: "Start date is required.",
		}),
		endDate: z.date({
			required_error: "End date is required.",
		}),
		note: z.string().min(1, {
			message: "Note is required.",
		}),
		tagId: z.string().min(1, {
			message: "Tag is required.",
		}),
	})
	.refine((data) => data.startDate <= data.endDate, {
		message: "Start date must be before or equal to end date.",
		path: ["endDate"],
	});

interface EditPeriodModalProps {
	isOpen: boolean;
	onClose: () => void;
	period: Period | null;
}

export function EditPeriodModal({
	isOpen,
	onClose,
	period,
}: EditPeriodModalProps) {
	const { tags, updatePeriod, deletePeriod, tasks, updateSelectedPeriod } =
		useGanttStore();
	const task = tasks.find((t) => t.periods.some((p) => p.id === period?.id));
	const [deleteDialog, setDeleteDialog] = useState<{
		isOpen: boolean;
		periodId: string;
		periodNote: string;
	}>({ isOpen: false, periodId: "", periodNote: "" });

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			startDate: period ? new Date(period.startDate) : undefined,
			endDate: period ? new Date(period.endDate) : undefined,
			note: period?.note || "",
			tagId: period?.tagId || tags[0]?.id || "",
		},
	});

	useEffect(() => {
		if (isOpen && period) {
			form.reset({
				startDate: new Date(period.startDate),
				endDate: new Date(period.endDate),
				note: period.note,
				tagId: period.tagId,
			});
		}
	}, [isOpen, period, form]);

	// 日付変更時にハイライトを更新
	useEffect(() => {
		const subscription = form.watch((value) => {
			if (value.startDate && value.endDate && task) {
				const startDateString = format(value.startDate, "yyyy-MM-dd");
				const endDateString = format(value.endDate, "yyyy-MM-dd");
				updateSelectedPeriod(startDateString, endDateString, task.id);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, updateSelectedPeriod, task]);

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		if (!period || !task) return;

		const requestBody = {
			periodId: period.id,
			startDate: format(data.startDate, "yyyy-MM-dd"),
			endDate: format(data.endDate, "yyyy-MM-dd"),
			note: data.note,
			tagId: data.tagId,
		};

		// Sonnerでリクエストボディを表示
		toast("Period updated successfully", {
			description: (
				<pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
					<code className="text-white">
						{JSON.stringify(requestBody, null, 2)}
					</code>
				</pre>
			),
		});

		// 実際の期間更新処理
		updatePeriod(period.id, {
			startDate: requestBody.startDate,
			endDate: requestBody.endDate,
			note: requestBody.note,
			tagId: requestBody.tagId,
		});

		onClose();
	};

	const handleDeletePeriod = () => {
		if (!period) return;
		setDeleteDialog({
			isOpen: true,
			periodId: period.id,
			periodNote: period.note,
		});
	};

	const handleConfirmDeletePeriod = () => {
		deletePeriod(deleteDialog.periodId);
		toast.success(`Period "${deleteDialog.periodNote}" deleted successfully`);
		setDeleteDialog({ isOpen: false, periodId: "", periodNote: "" });
		onClose();
	};

	if (!task || !period) return null;

	return (
		<>
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Edit Period</DialogTitle>
						<DialogDescription>
							Edit the period details for {task.name}
						</DialogDescription>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid gap-4 py-4">
								<FormField
									control={form.control}
									name="startDate"
									render={({ field }) => (
										<FormItem className="grid grid-cols-4 items-center gap-4">
											<FormLabel className="text-right">Start Date</FormLabel>
											<div className="col-span-3">
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={cn(
																	"w-full justify-start text-left font-normal",
																	!field.value && "text-muted-foreground",
																)}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, "MMM d, yyyy")
																) : (
																	<span>Pick a date</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={(date) => {
																field.onChange(date);
																// 日付選択後、ポップオーバーを閉じる
																document.dispatchEvent(
																	new KeyboardEvent("keydown", {
																		key: "Escape",
																	}),
																);
															}}
															captionLayout="dropdown"
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="endDate"
									render={({ field }) => (
										<FormItem className="grid grid-cols-4 items-center gap-4">
											<FormLabel className="text-right">End Date</FormLabel>
											<div className="col-span-3">
												<Popover>
													<PopoverTrigger asChild>
														<FormControl>
															<Button
																variant="outline"
																className={cn(
																	"w-full justify-start text-left font-normal",
																	!field.value && "text-muted-foreground",
																)}
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, "MMM d, yyyy")
																) : (
																	<span>Pick a date</span>
																)}
															</Button>
														</FormControl>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0" align="start">
														<Calendar
															mode="single"
															selected={field.value}
															onSelect={(date) => {
																field.onChange(date);
																// 日付選択後、ポップオーバーを閉じる
																document.dispatchEvent(
																	new KeyboardEvent("keydown", {
																		key: "Escape",
																	}),
																);
															}}
															captionLayout="dropdown"
														/>
													</PopoverContent>
												</Popover>
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="tagId"
									render={({ field }) => (
										<FormItem className="grid grid-cols-4 items-center gap-4">
											<FormLabel className="text-right">Tag</FormLabel>
											<div className="col-span-3">
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
													name={field.name}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select a tag" />
														</SelectTrigger>
													</FormControl>
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
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="note"
									render={({ field }) => (
										<FormItem className="grid grid-cols-4 items-center gap-4">
											<FormLabel className="text-right">Note</FormLabel>
											<div className="col-span-3">
												<FormControl>
													<Input
														placeholder="Enter work description"
														autoFocus
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</div>
										</FormItem>
									)}
								/>
							</div>

							<DialogFooter className="flex justify-between">
								<Button
									variant="outline"
									onClick={handleDeletePeriod}
									type="button"
									className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
								>
									<Trash2 className="h-4 w-4 mr-2" />
									Delete Period
								</Button>
								<div className="flex gap-2">
									<Button variant="outline" onClick={onClose} type="button">
										Cancel
									</Button>
									<Button type="submit">Save Changes</Button>
								</div>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<DeleteConfirmationDialog
				isOpen={deleteDialog.isOpen}
				onClose={() =>
					setDeleteDialog({ isOpen: false, periodId: "", periodNote: "" })
				}
				onConfirm={handleConfirmDeletePeriod}
				title="Delete Period"
				description={`Are you sure you want to delete the period "${deleteDialog.periodNote}"? This action cannot be undone.`}
				confirmText="Delete Period"
			/>
		</>
	);
}
