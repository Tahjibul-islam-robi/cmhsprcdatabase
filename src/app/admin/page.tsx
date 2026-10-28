"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  LogOut,
  Users,
  Calendar,
  FileText,
  Layers,
  ClipboardList,
  History,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  Upload,
  RefreshCw,
  Terminal,
  ExternalLink,
  Save,
  Eye
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import type { SitePage, ClubEvent, BlogPost, BatchItem, StudentDetail, AdminActivityLogItem } from "@/lib/types";

type AdminTab = "overview" | "website" | "events" | "posts" | "students" | "batches" | "plan" | "logs";

export default function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");

  // Data states
  const [stats, setStats] = useState({
    studentsCount: 0,
    batchesCount: 0,
    postsCount: 0,
    eventsCount: 0,
  });

  // Website pages state
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedPageSlug, setSelectedPageSlug] = useState<"home" | "about" | "join">("home");
  const [pageFormData, setPageFormData] = useState<Partial<SitePage>>({});
  const [pageSaveStatus, setPageSaveStatus] = useState("");

  // Events state
  const [events, setEvents] = useState<ClubEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<Partial<ClubEvent> | null>(null);

  // Blog/Materials state
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost> | null>(null);

  // Students state
  const [students, setStudents] = useState<StudentDetail[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [editingStudent, setEditingStudent] = useState<Partial<StudentDetail> | null>(null);

  // Plan note state
  const [planContent, setPlanContent] = useState("");
  const [planSaveStatus, setPlanSaveStatus] = useState("");

  // Audit logs state
  const [logs, setLogs] = useState<AdminActivityLogItem[]>([]);

  // Check auth session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch initial public/admin data when session changes
  useEffect(() => {
    async function loadData() {
      try {
        const [pagesRes, eventsRes, blogRes, batchesRes] = await Promise.all([
          supabase.rpc("get_public_site_pages"),
          supabase.rpc("get_public_site_events", { p_limit: 200 }),
          supabase.rpc("get_public_site_blog", { p_limit: 200, p_offset: 0 }),
          supabase.rpc("get_public_batches"),
        ]);

        if (pagesRes.data) {
          setPages(pagesRes.data);
          const home = pagesRes.data.find((p: SitePage) => p.slug === "home");
          if (home) setPageFormData(home);
        }
        if (eventsRes.data) setEvents(eventsRes.data);
        if (blogRes.data) setPosts(blogRes.data);
        if (batchesRes.data) setBatches(batchesRes.data);

        // Fetch students & plan if authenticated
        if (session) {
          const { data: studentsData } = await supabase.from("students").select("*").limit(200);
          if (studentsData) setStudents(studentsData);

          const { data: planData } = await supabase.from("admin_plan").select("content").eq("id", 1).single();
          if (planData) setPlanContent(planData.content || "");

          const { data: logData } = await supabase
            .from("admin_activity_log")
            .select("*")
            .order("logged_at", { ascending: false })
            .limit(50);
          if (logData) setLogs(logData);
        }

        setStats({
          studentsCount: batchesRes.data?.reduce((acc: number, b: any) => acc + (b.student_count || 0), 0) || 106,
          batchesCount: batchesRes.data?.length || 2,
          postsCount: blogRes.data?.length || 6,
          eventsCount: eventsRes.data?.length || 1,
        });
      } catch (err) {
        console.warn("Load data err:", err);
      }
    }
    loadData();
  }, [session]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setAuthError(error.message);
    } else {
      setSession(data.session);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleSavePage = async () => {
    setPageSaveStatus("Saving...");
    try {
      const { error } = await supabase
        .from("site_pages")
        .update(pageFormData)
        .eq("slug", selectedPageSlug);
      if (error) throw error;
      setPageSaveStatus("Saved successfully!");
      setTimeout(() => setPageSaveStatus(""), 3000);
    } catch (err: any) {
      setPageSaveStatus("Error: " + (err.message || "Failed to save"));
    }
  };

  const handleSavePlan = async () => {
    setPlanSaveStatus("Saving...");
    try {
      const { error } = await supabase
        .from("admin_plan")
        .upsert({ id: 1, content: planContent });
      if (error) throw error;
      setPlanSaveStatus("Saved!");
      setTimeout(() => setPlanSaveStatus(""), 3000);
    } catch (err: any) {
      setPlanSaveStatus("Error: " + err.message);
    }
  };

  const handleSaveEvent = async () => {
    if (!editingEvent?.title || !editingEvent?.event_date) {
      alert("Please enter title and event date.");
      return;
    }
    try {
      if (editingEvent.id) {
        await supabase.from("site_events").update(editingEvent).eq("id", editingEvent.id);
      } else {
        await supabase.from("site_events").insert([editingEvent]);
      }
      setEditingEvent(null);
      // Refresh events
      const { data } = await supabase.rpc("get_public_site_events", { p_limit: 200 });
      if (data) setEvents(data);
    } catch (err: any) {
      alert("Error saving event: " + err.message);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    try {
      await supabase.from("site_events").delete().eq("id", id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert("Error deleting event: " + err.message);
    }
  };

  const exportStudentsCSV = () => {
    if (!students.length) return;
    const headers = ["Student ID", "Full Name", "Class", "Section", "Roll", "Phone", "Email"];
    const rows = students.map((s) => [
      s.student_id,
      `"${s.full_name}"`,
      s.class || "",
      s.section || "",
      s.roll || "",
      s.student_contact_number || "",
      s.email_address || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cmhs_prc_students_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-mono text-[#E62229]">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>CONNECTING TO SECURE ADM PROTOCOL...</span>
        </div>
      </div>
    );
  }

  // If NOT signed in: show cyber login portal
  if (!session) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 sm:py-32">
        <div className="relative">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#E62229]/30 to-[#E62229]/30 blur-xl opacity-60" />
          <div className="relative glow-card rounded-2xl border border-white/15 p-8 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-black border border-[#E62229]/40 p-2 mx-auto flex items-center justify-center shadow-[0_0_20px_rgba(255,221,0,0.25)]">
                <ShieldCheck className="w-8 h-8 text-[#E62229]" />
              </div>
              <p className="text-[11px] font-mono tracking-widest text-[#E62229] uppercase font-bold">
                CMHS PRC · ADM PORTAL
              </p>
              <h1 className="text-2xl font-extrabold text-[#F5E8C7]">Administrator Sign-In</h1>
              <p className="text-xs text-[#cccccc]">
                Restricted access for verified club executives and technical trainers.
              </p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#cccccc] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cmhsprc.org"
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#cccccc] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary text-xs py-3 shadow-[0_0_25px_rgba(255,221,0,0.3)] mt-2"
              >
                Authenticate Session
              </button>
            </form>

            <div className="pt-4 border-t border-white/10 text-center">
              <Link href="/" className="text-xs text-[#cccccc] hover:text-[#E62229] transition-colors">
                ← Return to Public Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // SIGNED-IN ADMIN INTERFACE
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#081726] border border-[#E62229]/40 p-2 flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-[#E62229]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Club Control Center</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                ACTIVE ADMIN
              </span>
            </div>
            <p className="text-xs font-mono text-[#cccccc] mt-0.5">
              Signed in as: <span className="text-[#E62229]">{session.user.email}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/notice-maker"
            className="btn-secondary text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-[#E62229]" />
            Notice Maker
          </Link>
          <button
            onClick={handleSignOut}
            className="px-3.5 py-2 rounded-lg bg-black/60 border border-white/10 hover:border-rose-500/40 text-xs font-semibold text-rose-400 flex items-center gap-1.5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-white/10 scrollbar-none">
        {[
          { id: "overview", label: "Dashboard Overview", icon: Terminal },
          { id: "website", label: "Website Content", icon: Edit3 },
          { id: "events", label: "Events & Sessions", icon: Calendar },
          { id: "posts", label: "Blog & Materials", icon: FileText },
          { id: "students", label: "Student Records", icon: Users },
          { id: "batches", label: "Batch Cohorts", icon: Layers },
          { id: "plan", label: "Shared Admin Plan", icon: ClipboardList },
          { id: "logs", label: "Activity Audit Log", icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-[#E62229] text-black shadow-[0_0_15px_rgba(255,221,0,0.3)]"
                  : "bg-[#081726] text-[#F5E8C7]/70 border border-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="glow-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono text-[#E62229] uppercase">Verified Students</span>
              <p className="text-3xl font-extrabold text-[#F5E8C7] mt-1">{stats.studentsCount}</p>
              <p className="text-xs text-[#cccccc] mt-1">Across all cohorts</p>
            </div>
            <div className="glow-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono text-[#E62229] uppercase">Active Batches</span>
              <p className="text-3xl font-extrabold text-[#F5E8C7] mt-1">{stats.batchesCount}</p>
              <p className="text-xs text-[#cccccc] mt-1">C++ Batch 1, Everyone!</p>
            </div>
            <div className="glow-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono text-emerald-400 uppercase">Published Posts</span>
              <p className="text-3xl font-extrabold text-[#F5E8C7] mt-1">{stats.postsCount}</p>
              <p className="text-xs text-[#cccccc] mt-1">Notices & Class Materials</p>
            </div>
            <div className="glow-card p-6 rounded-2xl border border-white/10">
              <span className="text-xs font-mono text-sky-400 uppercase">Upcoming Events</span>
              <p className="text-3xl font-extrabold text-[#F5E8C7] mt-1">{stats.eventsCount}</p>
              <p className="text-xs text-[#cccccc] mt-1">The Launchpad (Nov 2)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glow-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-[#F5E8C7] flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#E62229]" /> Quick Operations
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => setActiveTab("website")}
                  className="w-full text-left p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#E62229]/40 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-[#F5E8C7]">Edit Home & About Us text</span>
                  <span className="text-[#E62229]">Open editor →</span>
                </button>
                <button
                  onClick={() => setActiveTab("events")}
                  className="w-full text-left p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#E62229]/40 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-[#F5E8C7]">Post new workshop or meeting</span>
                  <span className="text-[#E62229]">Create event →</span>
                </button>
                <button
                  onClick={exportStudentsCSV}
                  className="w-full text-left p-3 rounded-xl bg-black/40 border border-white/10 hover:border-[#E62229]/40 text-xs flex items-center justify-between"
                >
                  <span className="font-semibold text-[#F5E8C7]">Export Student Directory to CSV</span>
                  <span className="text-emerald-400">Download CSV ↓</span>
                </button>
              </div>
            </div>

            <div className="glow-card p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-bold text-[#F5E8C7] flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#E62229]" /> Administrator Note
              </h3>
              <p className="text-xs text-[#cccccc] leading-relaxed">
                {planContent ||
                  "Use the Shared Admin Plan tab to keep synchronized notes and agendas between all signed-in club executives."}
              </p>
              <button
                onClick={() => setActiveTab("plan")}
                className="text-xs font-semibold text-[#E62229] hover:underline"
              >
                Edit shared plan note →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WEBSITE CONTENT EDITOR */}
      {activeTab === "website" && (
        <div className="glow-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#F5E8C7]">Public Pages Editor</h2>
              <p className="text-xs text-[#cccccc]">
                Update texts and titles for the live website pages without modifying source code.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(["home", "about", "join"] as const).map((slug) => (
                <button
                  key={slug}
                  onClick={() => {
                    setSelectedPageSlug(slug);
                    const found = pages.find((p) => p.slug === slug);
                    if (found) setPageFormData(found);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase ${
                    selectedPageSlug === slug
                      ? "bg-[#E62229] text-black"
                      : "bg-black/40 text-white/70 border border-white/10"
                  }`}
                >
                  {slug}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1">
                  Page Title
                </label>
                <input
                  type="text"
                  value={pageFormData.title || ""}
                  onChange={(e) => setPageFormData({ ...pageFormData, title: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={pageFormData.subtitle || ""}
                  onChange={(e) => setPageFormData({ ...pageFormData, subtitle: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1">
                  Hero Intro
                </label>
                <textarea
                  rows={3}
                  value={pageFormData.hero_intro || ""}
                  onChange={(e) => setPageFormData({ ...pageFormData, hero_intro: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  value={pageFormData.section_title || ""}
                  onChange={(e) => setPageFormData({ ...pageFormData, section_title: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[#cccccc] uppercase mb-1">
                  Main Body Text
                </label>
                <textarea
                  rows={6}
                  value={pageFormData.body || ""}
                  onChange={(e) => setPageFormData({ ...pageFormData, body: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs text-[#F5E8C7] focus:outline-none focus:border-[#E62229]"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-[#E62229]">{pageSaveStatus}</span>
            <button
              onClick={handleSavePage}
              className="btn-primary text-xs py-2.5 px-6 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Page Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: EVENTS MANAGER */}
      {activeTab === "events" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#F5E8C7]">Events & Schedule</h2>
              <p className="text-xs text-[#cccccc]">Create, edit, or remove club sessions and milestones.</p>
            </div>
            <button
              onClick={() =>
                setEditingEvent({
                  title: "",
                  event_type: "Workshop",
                  event_date: new Date().toISOString().slice(0, 10),
                  event_time: "",
                  location: "Room 312",
                  summary: "",
                  details: "",
                  is_published: true,
                })
              }
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Event
            </button>
          </div>

          {editingEvent && (
            <div className="glow-card p-6 rounded-2xl border border-[#E62229]/40 space-y-4">
              <h3 className="text-base font-bold text-[#F5E8C7]">
                {editingEvent.id ? "Edit Event" : "Create New Event"}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-[#cccccc] mb-1">Title</label>
                  <input
                    type="text"
                    value={editingEvent.title || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5E8C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#cccccc] mb-1">Type</label>
                  <input
                    type="text"
                    value={editingEvent.event_type || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_type: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5E8C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#cccccc] mb-1">Date</label>
                  <input
                    type="date"
                    value={editingEvent.event_date || ""}
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5E8C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#cccccc] mb-1">Time</label>
                  <input
                    type="text"
                    value={editingEvent.event_time || ""}
                    placeholder="e.g. 3rd and 4th period"
                    onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5E8C7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-[#cccccc] mb-1">Location</label>
                  <input
                    type="text"
                    value={editingEvent.location || ""}
                    placeholder="Room 312"
                    onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                    className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-[#F5E8C7]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono text-[#cccccc] mb-1">Summary</label>
                <textarea
                  rows={2}
                  value={editingEvent.summary || ""}
                  onChange={(e) => setEditingEvent({ ...editingEvent, summary: e.target.value })}
                  className="w-full bg-black/60 border border-white/10 rounded-lg p-3 text-xs text-[#F5E8C7]"
                />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSaveEvent} className="btn-primary text-xs py-2 px-5">
                  Save Event
                </button>
                <button onClick={() => setEditingEvent(null)} className="btn-secondary text-xs py-2 px-4">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {events.map((e) => (
              <div
                key={e.id}
                className="glow-card p-4 rounded-xl border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#F5E8C7]">{e.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E62229]/10 text-[#E62229]">
                      {e.event_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#cccccc] mt-0.5">
                    {e.event_date} · {e.event_time} · {e.location}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingEvent(e)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(e.id)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: BLOG & MATERIALS */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#F5E8C7]">Blog & Batch Materials</h2>
              <p className="text-xs text-[#cccccc]">Manage notices, lesson notes, and uploaded PDF attachments.</p>
            </div>
          </div>

          <div className="space-y-3">
            {posts.map((p) => (
              <div
                key={p.id}
                className="glow-card p-4 rounded-xl border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#F5E8C7]">{p.title}</h4>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#E62229]">
                      {p.category}
                    </span>
                    <span className="text-[10px] font-mono text-[#cccccc]">
                      Batch: {p.batch_name || "General"}
                    </span>
                  </div>
                  <p className="text-xs text-[#cccccc] mt-1 line-clamp-1">
                    {p.body.replace(/<[^>]*>?/gm, "")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/blog"
                    className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#F5E8C7]"
                  >
                    View in Blog
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT RECORDS */}
      {activeTab === "students" && (
        <div className="glow-card rounded-2xl border border-white/10 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#F5E8C7]">Student Database</h2>
              <p className="text-xs text-[#cccccc]">Encrypted personal profiles and contact details.</p>
            </div>
            <button
              onClick={exportStudentsCSV}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-xs font-mono text-[#cccccc]">
                <tr>
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Full Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Section</th>
                  <th className="py-2.5 px-3">Roll</th>
                  <th className="py-2.5 px-3">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 font-mono font-bold text-[#E62229]">{s.student_id}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{s.full_name}</td>
                    <td className="py-2.5 px-3">{s.class || "—"}</td>
                    <td className="py-2.5 px-3">{s.section || "—"}</td>
                    <td className="py-2.5 px-3 font-mono">{s.roll || "—"}</td>
                    <td className="py-2.5 px-3 font-mono text-[#cccccc]">
                      {s.student_contact_number || s.email_address || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: BATCH COHORTS */}
      {activeTab === "batches" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {batches.map((b) => (
            <div key={b.id} className="glow-card p-6 rounded-2xl border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-[#E62229] uppercase font-bold">
                  Batch #{b.batch_number}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-emerald-400">
                  Active
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#F5E8C7]">{b.name}</h3>
              <p className="text-xs text-[#cccccc]">{b.description || "Active student cohort."}</p>
              <div className="pt-2">
                <Link
                  href="/batch-portal"
                  className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Layers className="w-3.5 h-3.5" /> View in Batch Portal
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 7: SHARED ADMIN PLAN */}
      {activeTab === "plan" && (
        <div className="glow-card p-6 sm:p-8 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-bold text-[#F5E8C7]">Shared Administrator Plan</h2>
              <p className="text-xs text-[#cccccc]">
                Synchronized scratchpad note editable by all authenticated administrators.
              </p>
            </div>
            <button onClick={handleSavePlan} className="btn-primary text-xs py-2 px-5 flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Note
            </button>
          </div>

          <textarea
            rows={14}
            value={planContent}
            onChange={(e) => setPlanContent(e.target.value)}
            placeholder="Write meeting agendas, room 312 equipment orders, or workshop notes here..."
            className="w-full bg-black/60 border border-white/10 rounded-xl p-4 text-xs font-mono text-[#F5E8C7] leading-relaxed focus:outline-none focus:border-[#E62229]"
          />
          {planSaveStatus && <p className="text-xs font-mono text-[#E62229]">{planSaveStatus}</p>}
        </div>
      )}

      {/* TAB 8: AUDIT ACTIVITY LOGS */}
      {activeTab === "logs" && (
        <div className="glow-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="pb-3 border-b border-white/10">
            <h2 className="text-xl font-bold text-[#F5E8C7]">Security & Activity Log</h2>
            <p className="text-xs text-[#cccccc]">
              Audit trail for record changes. Restricted to authorized role managers.
            </p>
          </div>

          {logs.length > 0 ? (
            <div className="divide-y divide-white/5">
              {logs.map((log) => (
                <div key={log.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-[#E62229] font-semibold uppercase">{log.action}</span>{" "}
                    <span className="text-[#F5E8C7] font-medium">{log.record_type}</span>{" "}
                    <span className="font-mono text-[#cccccc]">({log.record_id})</span>
                    <p className="text-[11px] text-[#cccccc] mt-0.5">
                      Fields changed: {log.changed_fields?.join(", ") || "none"}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-[#cccccc]">
                    <p>{log.actor_email || "admin"}</p>
                    <p>{new Date(log.logged_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#cccccc] py-6 text-center">
              No recent audit entries or you may need ADM001 authorization.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
