"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
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
import { cn } from "@/lib/utils";

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
	const task = tasks.find((t) => t.id === taskId);

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			note: "",
			tagId: tags[0]?.id || "",
		},
	});

	useEffect(() => {
		if (isOpen) {
			form.reset({
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				note: "",
				tagId: tags[0]?.id || "",
			});
		}
	}, [isOpen, startDate, endDate, form, tags]);

	// 日付変更時にハイライトを更新
	useEffect(() => {
		const subscription = form.watch((value) => {
			if (value.startDate && value.endDate) {
				const startDateString = format(value.startDate, "yyyy-MM-dd");
				const endDateString = format(value.endDate, "yyyy-MM-dd");
				updateSelectedPeriod(startDateString, endDateString);
			}
		});
		return () => subscription.unsubscribe();
	}, [form, updateSelectedPeriod]);

	const onSubmit = (data: z.infer<typeof FormSchema>) => {
		const requestBody = {
			taskId,
			startDate: format(data.startDate, "yyyy-MM-dd"),
			endDate: format(data.endDate, "yyyy-MM-dd"),
			note: data.note,
			tagId: data.tagId,
		};

		// Sonnerでリクエストボディを表示
		toast("Period added successfully", {
			description: (
				<pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
					<code className="text-white">
						{JSON.stringify(requestBody, null, 2)}
					</code>
				</pre>
			),
		});

		// 実際の期間追加処理
		addPeriod(taskId, {
			startDate: requestBody.startDate,
			endDate: requestBody.endDate,
			note: requestBody.note,
			tagId: requestBody.tagId,
		});

		onClose();
	};

	if (!task) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Period</DialogTitle>
					<DialogDescription>Add a new period to {task.name}</DialogDescription>
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
														onSelect={field.onChange}
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
														onSelect={field.onChange}
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

						<DialogFooter>
							<Button variant="outline" onClick={onClose} type="button">
								Cancel
							</Button>
							<Button type="submit">Add</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
