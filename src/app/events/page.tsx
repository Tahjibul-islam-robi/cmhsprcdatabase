"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  ArrowUpRight,
  Filter,
  Activity,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { ClubEvent } from "@/lib/types";

export default function EventsPage() {
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dhakaToday, setDhakaToday] = useState<string>("");

  useEffect(() => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    setDhakaToday(today);

    async function loadEvents() {
      try {
        const { data } = await supabase.rpc("get_public_site_events", { p_limit: 200 });
        if (data) setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

  const types = ["all", ...Array.from(new Set(events.map((e) => e.event_type)))];
  const filtered = selectedType === "all" ? events : events.filter((e) => e.event_type === selectedType);
  const upcoming = filtered.filter((e) => e.event_date >= dhakaToday);
  const past = filtered.filter((e) => e.event_date < dhakaToday);

  return (
    <div className="space-y-12">
      {/* =========================================================================
          HERO POSTER: CYBER DISPATCH BOARD
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Warning Banner */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// DISPATCH PROTOCOL // MISSION SCHEDULE // ASIA/DHAKA
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">NODE: ROOM_312</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">TIMEZONE: GMT+6</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#E62229] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
                CALENDAR // CONTESTS & WORKSHOPS
              </span>
              <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
                DISPATCH BOARD
              </h1>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl">
                Official timeline for competitive coding rounds, hands-on robotics workshops, intra-school olympiads, and Room 312 hardware sessions.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-[#E62229] flex items-center gap-1 mr-2">
                <Filter className="w-3.5 h-3.5" />
                TYPE:
              </span>
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedType(t)}
                  className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                    selectedType === t
                      ? "bg-[#E62229] text-black shadow-[3px_3px_0px_#000000] border-2 border-black"
                      : "bg-[#04080D] text-[#F5E8C7] border border-[#E62229]/50 hover:bg-[#E62229]/20"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Hazard Divider */}
          <div className="h-5 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* =========================================================================
          UPCOMING EVENTS (CYBER DISPATCH TICKETS)
          ========================================================================= */}
      <ScrollReveal className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-[#E62229] pb-3">
          <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
            <span>Upcoming Missions</span>
            <span className="text-xs font-black px-2 py-0.5 bg-[#E62229] text-black">
              {upcoming.length} ACTIVE
            </span>
          </h2>
          <span className="text-xs font-mono text-[#F5E8C7]">LIVE DIRECTORY</span>
        </div>

        {upcoming.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcoming.map((evt) => (
              <div
                key={evt.id}
                className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#E62229] flex flex-col justify-between space-y-4 group hover:-translate-y-1 transition-transform"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="px-2 py-0.5 bg-[#E62229] text-black uppercase">
                      {evt.event_type}
                    </span>
                    <span className="text-xs font-mono text-[#F5E8C7] border border-[#F5E8C7]/40 px-2 py-0.5 bg-[#04080D]">
                      {formatDate(evt.event_date)}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-[#E62229] transition-colors leading-tight uppercase">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-[#cccccc] leading-relaxed line-clamp-3">
                    {evt.summary || evt.details || "Official CMHS PRC club activity scheduled in Room 312."}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E62229]/40 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px] text-[#F5E8C7]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E62229]" />
                      {evt.location || "Room 312, CMHS"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#E62229]" />
                      {evt.event_time ? evt.event_time.slice(0, 5) : "TBD"}
                    </span>
                  </div>

                  {/* Barcode Strip */}
                  <div className="h-4 w-full barcode-pattern opacity-60 border-t border-[#F5E8C7]/20" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border-2 border-white/20 bg-[#04080D] p-8 text-center font-mono text-xs text-[#cccccc]">
            [SYSTEM_STATUS: NO_UPCOMING_MISSIONS_MATCH_CRITERIA]
          </div>
        )}
      </ScrollReveal>

      {/* =========================================================================
          PAST / ARCHIVED EVENTS
          ========================================================================= */}
      {past.length > 0 && (
        <ScrollReveal className="space-y-6 pt-8">
          <div className="flex items-center justify-between border-b-4 border-white/30 pb-3">
            <h2 className="text-2xl font-black text-white uppercase flex items-center gap-3">
              <span>Completed Mission Archive</span>
              <span className="text-xs font-black px-2 py-0.5 bg-[#04080D] border border-white/30 text-[#cccccc]">
                {past.length} LOGGED
              </span>
            </h2>
            <span className="text-xs font-mono text-[#888888]">HISTORICAL RECORD</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75 hover:opacity-100 transition-opacity">
            {past.map((evt) => (
              <div
                key={evt.id}
                className="border-2 border-white/20 bg-[#04080D] p-5 shadow-[4px_4px_0px_#000000] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#888888]">{evt.event_type}</span>
                    <span className="text-[#888888]">{formatDate(evt.event_date)}</span>
                  </div>
                  <h3 className="text-base font-bold text-white uppercase">{evt.title}</h3>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-[#888888]">
                  <span>{evt.location || "Room 312"}</span>
                  <span className="text-[#00FF66] font-bold">COMPLETED</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      )}
    </div>
  );
}
