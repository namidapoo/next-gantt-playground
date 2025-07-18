import { create } from "zustand";
import initialData from "@/lib/data/initial-data.json";
import type { Period, Tag, Task } from "@/lib/types/gantt";
import { getOccupiedDates } from "@/lib/utils/period-overlap";

let taskCounter = 0;
let periodCounter = 0;

/**
 * 選択された期間の情報を表すインターフェース
 */
interface SelectedPeriod {
	taskId: string;
	startDate: string;
	endDate: string;
	/**
	 * 編集対象のPeriodのID
	 * - 編集時: 該当PeriodのIDを設定し、そのPeriodのみが移動対象となる
	 * - 新規作成時: undefinedのまま、既存Periodには影響しない
	 */
	periodId?: string;
}

interface GanttStore {
	tasks: Task[];
	tags: Tag[];
	selectedPeriod: SelectedPeriod | null;
	editingTaskId: string | null;
	setSelectedPeriod: (period: SelectedPeriod | null) => void;
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
	deletePeriod: (periodId: string) => void;
	getTagById: (tagId: string) => Tag | undefined;
	addTask: (name: string) => string;
	updateTask: (taskId: string, name: string) => void;
	deleteTask: (taskId: string) => void;
	setEditingTaskId: (taskId: string | null) => void;
	// Calendar用のdisabled dates機能
	getDisabledDates: (taskId: string, excludeId?: string) => string[];
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
									id: `period-${Date.now()}-${periodCounter++}`,
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

	deletePeriod: (periodId) => {
		set((state) => ({
			tasks: state.tasks.map((task) => ({
				...task,
				periods: task.periods.filter((period) => period.id !== periodId),
			})),
			selectedPeriod: null,
		}));
	},

	getTagById: (tagId) => {
		const { tags } = get();
		return tags.find((tag) => tag.id === tagId);
	},

	addTask: (name) => {
		const taskId = `task-${Date.now()}-${taskCounter++}`;
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

	// Calendar用のdisabled dates機能の実装
	getDisabledDates: (taskId, excludeId) => {
		const { tasks } = get();
		const task = tasks.find((t) => t.id === taskId);
		if (!task) return [];

		return getOccupiedDates(task.periods, excludeId);
	},
}));
