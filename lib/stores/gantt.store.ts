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
	editingTaskId: string | null;
	setSelectedPeriod: (
		period: { taskId: string; startDate: string; endDate: string } | null,
	) => void;
	updateSelectedPeriod: (
		startDate: string,
		endDate: string,
		taskId?: string,
	) => void;
	addPeriod: (taskId: string, period: Omit<Period, "id">) => void;
	updatePeriod: (
		periodId: string,
		updates: Partial<Omit<Period, "id">>,
	) => void;
	getTagById: (tagId: string) => Tag | undefined;
	addTask: (name: string) => string;
	updateTask: (taskId: string, name: string) => void;
	deleteTask: (taskId: string) => void;
	setEditingTaskId: (taskId: string | null) => void;
}

export const useGanttStore = create<GanttStore>((set, get) => ({
	tasks: initialData.tasks as Task[],
	tags: initialData.tags as Tag[],
	selectedPeriod: null,
	editingTaskId: null,

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

	addTask: (name) => {
		const taskId = `task-${Date.now()}`;
		const newTask: Task = {
			id: taskId,
			name,
			periods: [],
		};
		set((state) => ({
			tasks: [...state.tasks, newTask],
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

	setEditingTaskId: (taskId) => {
		set({ editingTaskId: taskId });
	},
}));
