"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
	const { theme = "system" } = useTheme();

	return (
		<Sonner
			theme={theme as ToasterProps["theme"]}
			className="toaster group"
			style={
				{
					"--normal-bg": "var(--popover)",
					"--normal-text": "var(--popover-foreground)",
					"--normal-border": "var(--border)",
				} as React.CSSProperties
			}
			toastOptions={{
				style: {
					background: "var(--popover)",
					color: "var(--popover-foreground)",
					border: "1px solid var(--border)",
				},
				classNames: {
					error: "!bg-rose-50 !text-rose-700 !border-rose-200",
					success: "!bg-emerald-50 !text-emerald-700 !border-emerald-200",
					default: "!bg-blue-50 !text-blue-700 !border-blue-200",
				},
			}}
			duration={2000}
			closeButton={true}
			{...props}
		/>
	);
};

export { Toaster };
