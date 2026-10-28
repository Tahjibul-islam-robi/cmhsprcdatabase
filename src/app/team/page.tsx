"use client";

import { useEffect, useState } from "react";
import { Users, Shield, Award, Terminal, Star, Sparkles, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ZoomCard } from "@/components/ZoomCard";
import type { TeamMember } from "@/lib/types";

const ROLE_PRIORITY = [
  "President",
  "Vice President",
  "General Secretary",
  "Joint Secretary",
  "Treasurer",
  "Organizing Secretary",
  "IT Secretary",
  "Publicity Secretary",
  "Volunteer Coordinator",
  "Event Volunteer",
  "Technical Volunteer",
  "Content Volunteer",
  "Executive Member",
  "Delegate",
  "Trainer",
  "Assistant Trainer",
];

const CATEGORIES = [
  {
    role: "Administrator (ADM)",
    title: "Club Administrators",
    desc: "Oversees club management, policy governance, and event execution.",
    tag: "ADMIN_OFFICER",
  },
  {
    role: "Delegate",
    title: "School & External Delegates",
    desc: "Represents the club in school forums and inter-school olympiads.",
    tag: "DELEGATE",
  },
  {
    role: "Trainer (EM)",
    title: "Head Technical Trainers",
    desc: "Leads programming and robotics instructional batches in Room 312.",
    tag: "TECH_TRAINER",
  },
  {
    role: "Assistant Trainer (EM)",
    title: "Assistant Technical Trainers",
    desc: "Provides hands-on mentorship, code reviews, and hardware troubleshooting.",
    tag: "ASST_TRAINER",
  },
];

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeam() {
      try {
        const { data } = await supabase.rpc("get_public_club_team");
        if (data) setTeam(data);
      } catch (err) {
        console.error("Team load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeam();
  }, []);

  const getRank = (pos?: string | null) => {
    const idx = ROLE_PRIORITY.indexOf(String(pos || ""));
    return idx === -1 ? ROLE_PRIORITY.length : idx;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 space-y-16">
      {/* Header */}
      <div className="max-w-4xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-[#E62229] bg-[#E62229] text-black text-xs font-black tracking-widest shadow-[3px_3px_0px_#000000]">
          <Shield className="w-3.5 h-3.5" />
          <span>LEADERSHIP // COMMITTEE DIRECTORY // 2024–2026</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
          Club Executives & Mentors
        </h1>
        <p className="text-sm sm:text-base text-[#cccccc] leading-relaxed">
          The elected student administrators, delegates, and dedicated technical trainers who organize activities and guide members in Room 312.
        </p>
      </div>

      {/* Role Categories Sections */}
      <div className="space-y-16">
        {CATEGORIES.map((cat, catIdx) => {
          const members = team
            .filter((m) => m.team_role === cat.role && m.full_name)
            .sort(
              (a, b) =>
                getRank(a.position_title) - getRank(b.position_title) ||
                a.full_name.localeCompare(b.full_name)
            );

          return (
            <section key={cat.role} className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b-4 border-[#E62229] font-mono">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase">{cat.title}</h2>
                    <span className="text-xs font-black px-2 py-0.5 border border-[#E62229] text-[#E62229] bg-[#04080D]">
                      {members.length} {members.length === 1 ? "MEMBER" : "MEMBERS"}
                    </span>
                  </div>
                  <p className="text-xs text-[#aaaaaa] mt-1">{cat.desc}</p>
                </div>
              </div>

              {members.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map((member, i) => (
                    <ZoomCard
                      key={i}
                      id={`ADM-${catIdx}-${String(i + 1).padStart(2, "0")}`}
                      name={member.full_name}
                      role={member.position_title || cat.role}
                      affiliation="CMHS Room 312"
                      tag={cat.tag}
                    />
                  ))}
                </div>
              ) : cat.role === "Administrator (ADM)" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ZoomCard
                    id="ADM-01"
                    name="Tahjibul Islam Robi"
                    role="President"
                    affiliation="CMHS Room 312"
                    tag={cat.tag}
                  />
                  <ZoomCard
                    id="ADM-02"
                    name="Rafan Haizar"
                    role="Vice President"
                    affiliation="CMHS Room 312"
                    tag={cat.tag}
                  />
                  <ZoomCard
                    id="ADM-03"
                    name="Adnan Samir"
                    role="General Secretary"
                    affiliation="CMHS Room 312"
                    tag={cat.tag}
                  />
                </div>
              ) : cat.role === "Trainer (EM)" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ZoomCard
                    id="TRN-01"
                    name="Md Tamzid Alahi"
                    role="Head Technical Trainer"
                    affiliation="CMHS Room 312"
                    tag={cat.tag}
                  />
                </div>
              ) : (
                <div className="p-6 border-2 border-[#E62229]/40 bg-[#04080D] font-mono text-xs text-[#aaaaaa]">
                  [DIRECTORY: CANDIDATES ASSIGNED DURING ACTIVE TERM]
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
