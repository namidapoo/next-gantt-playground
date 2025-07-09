import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Gantt Chart Demo - Interactive Project Timeline",
	description:
		"Interactive Gantt chart demonstration with drag & drop, period editing, and real-time updates",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={cn(geistSans.variable, geistMono.variable, "antialiased")}
			>
				{children}
				<Toaster />
			</body>
		</html>
	);
}
