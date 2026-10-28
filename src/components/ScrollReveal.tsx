"use client";

import React from "react";

export interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  blur?: number;
  className?: string;
}

export function ScrollReveal({
  children,
  className = "",
  ...props
}: ScrollRevealProps) {
  // Direct instant render: No page-to-page delay, blur, or hidden opacity
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export interface StaggerGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}

export function StaggerGroup({
  children,
  className = "",
  ...props
}: StaggerGroupProps) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  );
}

export default ScrollReveal;

