import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Workshop / 自行车配置器", description: "在线选择零件，配置你的下一辆自行车。" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
