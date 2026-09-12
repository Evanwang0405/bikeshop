"use client";

import type { Component } from "@/types";

type BikeVisualizerProps = { frame?: Component; wheelset?: Component; groupset?: Component; tires?: Component; handlebar?: Component; saddle?: Component };

const frameColors: Record<string, string> = { "frame-red": "#d94b3d", "frame-blue": "#2f6070", "frame-sand": "#b89973" };
const wheelColors: Record<string, string> = { "wheels-carbon": "#1a252a", "wheels-deep": "#43545a", "wheels-shallow": "#78878a" };

export function BikeVisualizer({ frame, wheelset, groupset, tires, handlebar, saddle }: BikeVisualizerProps) {
  const frameColor = frame ? frameColors[frame.image] : "#b6bbb4";
  const wheelColor = wheelset ? wheelColors[wheelset.image] : "#6f7772";
  const electronic = groupset?.brand === "SRAM";
  const tireWidth = tires?.compatibility.tireWidth ? Math.max(8, tires.compatibility.tireWidth / 4) : 8;
  const cockpitColor = handlebar?.brand === "Zipp" ? "#202c30" : "#253238";
  const saddleColor = saddle?.brand === "Specialized" ? "#202c30" : "#253238";

  return (
    <div className="visualizer" aria-label="分层自行车预览">
      <div className="visualizer-label">实时预览 <span>01 / 01</span></div>
      <svg viewBox="0 0 760 430" role="img" aria-label="Configured road bicycle">
        <defs>
          <linearGradient id="floor" x1="0" x2="1">
            <stop offset="0" stopColor="#dce0d8" stopOpacity="0" />
            <stop offset="0.5" stopColor="#dce0d8" />
            <stop offset="1" stopColor="#dce0d8" stopOpacity="0" />
          </linearGradient>
        </defs>
        <ellipse cx="380" cy="376" rx="270" ry="16" fill="url(#floor)" />
        <g fill="none" stroke={wheelColor} strokeWidth={tireWidth}>
          <circle cx="190" cy="270" r="104" /><circle cx="575" cy="270" r="104" />
        </g>
        <g stroke="#aeb7b1" strokeWidth="1" opacity="0.38">
          {[190, 575].map((cx) => <g key={cx}>{[0, 45, 90, 135].map((deg) => <line key={deg} x1={cx} y1="270" x2={cx + Math.cos(deg * Math.PI / 180) * 98} y2={270 + Math.sin(deg * Math.PI / 180) * 98} />)}</g>)}
        </g>
        <g fill="none" stroke={frameColor} strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
          <path d="M190 270 L302 155 L454 270 L190 270 L365 267 L302 155" />
          <path d="M454 270 L487 151 L534 119" />
          <path d="M486 151 L454 270" />
        </g>
        <g fill="none" stroke={cockpitColor} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M302 155 L285 118 L318 115" /><path d="M534 119 Q552 108 570 121 L548 135" />
          <path d="M190 270 L178 345" /><path d="M575 270 L589 345" />
          <path d="M163 345 L196 345 M574 345 L608 345" />
        </g>
        <path d="M281 116 Q300 106 319 115" stroke={saddleColor} strokeWidth="8" strokeLinecap="round" />
        <circle cx="365" cy="267" r="22" fill="none" stroke="#263338" strokeWidth="5" />
        <path d="M365 267 l42 30 M365 267 l-29 -30" stroke="#263338" strokeWidth="5" strokeLinecap="round" />
        <circle cx="365" cy="267" r="7" fill={electronic ? "#d94b3d" : "#d4a94e"} />
        <text x="380" y="405" textAnchor="middle" fill="#748079" fontSize="11" letterSpacing="3">{frame?.brand ?? "请选择车架"} / {wheelset?.brand ?? "请选择轮组"}</text>
      </svg>
    </div>
  );
}
