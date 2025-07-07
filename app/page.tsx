import { Zap } from "lucide-react";
import { GanttChart } from "@/components/gantt/GanttChart";
import { Badge } from "@/components/ui/badge";

export default function GanttPage() {
	return (
		<main className="h-screen bg-gray-50 flex flex-col overflow-hidden">
			<div className="flex-shrink-0 p-4 pb-0">
				<div className="flex items-center gap-3 mb-4">
					<h1 className="text-3xl font-bold">Interactive Gantt Chart Demo</h1>
					<Badge
						variant="default"
						className="px-4 py-1 text-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1.5"
					>
						<Zap className="w-3 h-3 fill-current" />
						Demo
					</Badge>
				</div>
			</div>
			<div className="flex-1 p-4 pt-0 min-h-0">
				<GanttChart />
			</div>
		</main>
	);
}
