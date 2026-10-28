"use client";

import { CyberMemberBadge } from "./CyberMemberBadge";

export interface ZoomCardProps {
  id?: string;
  name: string;
  role: string;
  image?: string;
  affiliation?: string;
  tag?: string;
}

export function ZoomCard({
  id = "PRC-01",
  name,
  role,
  affiliation = "Room 312",
  tag = "01",
}: ZoomCardProps) {
  return (
    <CyberMemberBadge
      id={id}
      name={name}
      role={role}
      affiliation={affiliation}
      level={tag}
    />
  );
}

export default ZoomCard;
