import type { Period } from "@/lib/types/gantt";

/**
 * 2つの日付範囲が重複しているかチェックする
 */
export function hasDateRangeOverlap(
	range1: { startDate: string; endDate: string },
	range2: { startDate: string; endDate: string },
): boolean {
	const start1 = new Date(range1.startDate);
	const end1 = new Date(range1.endDate);
	const start2 = new Date(range2.startDate);
	const end2 = new Date(range2.endDate);

	// 重複の条件: range1の開始日がrange2の終了日以前 かつ range1の終了日がrange2の開始日以降
	return start1 <= end2 && end1 >= start2;
}

/**
 * 指定された日付範囲が既存のPeriodと重複しているかチェックする
 */
export function hasOverlap(
	newPeriod: { startDate: string; endDate: string },
	existingPeriods: Period[],
	excludeId?: string,
): boolean {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	return targetPeriods.some((period) => hasDateRangeOverlap(newPeriod, period));
}

/**
 * 指定された日付が既存のPeriodと重複しているかチェックする
 */
export function isDateOccupied(
	date: string,
	existingPeriods: Period[],
	excludeId?: string,
): boolean {
	const targetPeriods = excludeId
		? existingPeriods.filter((p) => p.id !== excludeId)
		: existingPeriods;

	const targetDate = new Date(date);

	return targetPeriods.some((period) => {
		const startDate = new Date(period.startDate);
		const endDate = new Date(period.endDate);
		return targetDate >= startDate && targetDate <= endDate;
	});
}

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
