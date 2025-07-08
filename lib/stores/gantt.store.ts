import { create } from "zustand";
import initialData from "@/lib/data/initial-data.json";
import type { Period, Tag, Task } from "@/lib/types/gantt";

interface GanttStore {
	tasks: Task[];
	tags: Tag[];
	selectedPeriod: {
		taskId: string;
		startDate: string;
		endDate: string;
	} | null;
	setSelectedPeriod: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	updateSelectedPeriod: (
		startDate: string,
		endDate: string,
		taskId?: string,
	) => void;
	addTask: (name: string) => string;
	updateTask: (taskId: string, name: string) => void;
	deleteTask: (taskId: string) => void;
	addPeriod: (taskId: string, period: Omit<Period, "id">) => void;
	updatePeriod: (
		periodId: string,
		updates: Partial<Omit<Period, "id">>,
	) => void;
	getTagById: (tagId: string) => Tag | undefined;
}

export const useGanttStore = create<GanttStore>((set, get) => ({
	tasks: initialData.tasks as Task[],
	tags: initialData.tags as Tag[],
	selectedPeriod: null,

	setSelectedPeriod: (period) => set({ selectedPeriod: period }),

	updateSelectedPeriod: (startDate, endDate, taskId) =>
		set((state) => ({
			selectedPeriod: state.selectedPeriod
				? {
						...state.selectedPeriod,
						startDate,
						endDate,
						...(taskId && { taskId }),
					}
				: null,
		})),

	addTask: (name) => {
		const taskId = `task-${Date.now()}`;
		set((state) => ({
			tasks: [
				...state.tasks,
				{
					id: taskId,
					name,
					periods: [],
				},
			],
		}));
		return taskId;
	},

	updateTask: (taskId, name) => {
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId ? { ...task, name } : task,
			),
		}));
	},

	deleteTask: (taskId) => {
		set((state) => ({
			tasks: state.tasks.filter((task) => task.id !== taskId),
		}));
	},

	addPeriod: (taskId, period) => {
		set((state) => ({
			tasks: state.tasks.map((task) =>
				task.id === taskId
					? {
							...task,
							periods: [
								...task.periods,
								{
									...period,
									id: `period-${Date.now()}`,
								},
							],
						}
					: task,
			),
		}));
	},

	updatePeriod: (periodId, updates) => {
		set((state) => ({
			tasks: state.tasks.map((task) => ({
				...task,
				periods: task.periods.map((period) =>
					period.id === periodId ? { ...period, ...updates } : period,
				),
			})),
		}));
	},

	getTagById: (tagId) => {
		const { tags } = get();
		return tags.find((tag) => tag.id === tagId);
	},
}));
