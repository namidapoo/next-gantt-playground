import type { Period } from "@/lib/types/gantt";

/**
 * 既存のPeriodで占有されている日付のリストを取得する
 */
export function getOccupiedDates(
	existingPeriods: Period[],
	excludeId?: string,
): string[] {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	const occupiedDates = new Set<string>();

	targetPeriods.forEach((period) => {
		const startDate = new Date(period.startDate);
		const endDate = new Date(period.endDate);

		// 期間内の全ての日付を追加
		const currentDate = new Date(startDate);
		while (currentDate <= endDate) {
			occupiedDates.add(currentDate.toISOString().split("T")[0]);
			currentDate.setDate(currentDate.getDate() + 1);
		}
	});

	return Array.from(occupiedDates);
}
