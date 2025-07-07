export interface Task {
	id: string;
	name: string;
	periods: Period[];
}

export interface Period {
	id: string;
	startDate: string; // YYYY-MM-DD
	endDate: string; // YYYY-MM-DD
	note: string;
	tagId: string;
}

export interface Tag {
	id: string;
	name: string;
	color: string;
}

export interface GanttState {
	tasks: Task[];
	tags: Tag[];
	selectedPeriod: {
		taskId: string;
		startDate: string;
		endDate: string;
	} | null;
}
