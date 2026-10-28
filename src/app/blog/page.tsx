"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  Search,
  Tag,
  ExternalLink,
  Layers,
  X,
  Sparkles,
} from "lucide-react";
import { supabase, getPublicStorageUrl } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@/lib/types";
import {
  ClubDocViewer,
  stripHtml,
  detectPostFeatures,
} from "@/components/ClubDocViewer";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"all" | "material" | "announcement">("all");
  const [search, setSearch] = useState("");
  const [activeModalPost, setActiveModalPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    async function loadPosts() {
      try {
        const { data } = await supabase.rpc("get_public_site_blog", {
          p_limit: 50,
          p_offset: 0,
        });
        if (data) setPosts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = category === "all" || post.category === category;
    const cleanText = stripHtml(post.body);
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      cleanText.toLowerCase().includes(search.toLowerCase()) ||
      (post.batch_name && post.batch_name.toLowerCase().includes(search.toLowerCase())) ||
      (post.file_name && post.file_name.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-10">
      {/* =========================================================================
          HERO POSTER: CYBER ARCHIVES & LOGS
          ========================================================================= */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        {/* Warning Banner: Clean, high-contrast, no indicator light, no text crowding */}
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// MISSION LOGS // NOTICES & RESOURCE ARCHIVES // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2.5 py-0.5 border border-black">
              NODE: PUBLIC_LOGS
            </span>
            <span className="bg-black text-white px-2.5 py-0.5 border border-black">
              REPOSITORY: ONLINE
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-[#E62229] pb-6">
            <div className="space-y-2">
              <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
                COMMUNICATIONS & SYLLABUS
              </span>
              <h1 className="text-3xl sm:text-5xl font-mech-wide font-black text-white tracking-wide">
                CLUB LOGS & DOCS
              </h1>
              <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl leading-relaxed">
                Official lecture notes, IDE download packages, interactive video modules, coding homework, and school notices published for CMHS PRC batches.
              </p>
            </div>

            {/* Notice Maker shortcut */}
            <Link href="/notice-maker" className="btn-cyber-primary text-xs shrink-0">
              <span>OPEN NOTICE MAKER</span>
              <ArrowUpRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setCategory("all")}
                className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                  category === "all"
                    ? "bg-[#E62229] text-black shadow-[2px_2px_0px_#000000] border-2 border-black"
                    : "bg-[#04080D] text-[#F5E8C7] border border-[#E62229]/40 hover:bg-[#E62229]/20"
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => setCategory("material")}
                className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                  category === "material"
                    ? "bg-[#E62229] text-black shadow-[2px_2px_0px_#000000] border-2 border-black"
                    : "bg-[#04080D] text-[#F5E8C7] border border-[#E62229]/40 hover:bg-[#E62229]/20"
                }`}
              >
                Materials
              </button>
              <button
                onClick={() => setCategory("announcement")}
                className={`px-3 py-1.5 text-xs font-black uppercase transition-all ${
                  category === "announcement"
                    ? "bg-[#E62229] text-black shadow-[2px_2px_0px_#000000] border-2 border-black"
                    : "bg-[#04080D] text-[#F5E8C7] border border-[#E62229]/40 hover:bg-[#E62229]/20"
                }`}
              >
                Announcements
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E62229]" />
              <input
                type="text"
                placeholder="SEARCH ARCHIVE OR TOPICS..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#04080D] border-2 border-[#E62229] pl-9 pr-3 py-1.5 text-xs text-[#F5E8C7] font-mono placeholder:text-[#666666] focus:outline-none focus:ring-1 focus:ring-[#E62229]"
              />
            </div>
          </div>

          {/* Hazard Divider */}
          <div className="h-4 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* =========================================================================
          LOGS & MATERIALS GRID (Direct Instant Render - No page animation delay)
          ========================================================================= */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b-4 border-[#E62229] pb-3">
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase flex items-center gap-3">
            <span>Archived Documents</span>
            <span className="text-xs font-black px-2 py-0.5 bg-[#E62229] text-black">
              {filteredPosts.length} FOUND
            </span>
          </h2>
          <span className="text-xs font-mono text-[#F5E8C7]">ROOM 312 INDEX</span>
        </div>

        {loading ? (
          <div className="border-2 border-[#E62229] bg-[#081726] p-8 text-center font-mono text-xs text-[#cccccc]">
            LOADING ROOM 312 RESOURCE ARCHIVES...
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => {
              const features = detectPostFeatures(post);
              const cleanExcerpt = stripHtml(post.body);
              const fallbackExcerpt = post.file_name
                ? `Official club document and attachment: "${post.file_name}". Click below to inspect full syllabus or download.`
                : "Official club notice and communications dispatch from Room 312.";
              const displayExcerpt = cleanExcerpt || fallbackExcerpt;

              return (
                <div
                  key={post.id}
                  className="border-2 border-[#E62229] bg-[#081726] p-5 sm:p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-4 hover:border-white transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-black uppercase ${
                            post.category === "material"
                              ? "bg-[#00F0FF] text-black"
                              : "bg-[#E62229] text-black"
                          }`}
                        >
                          {post.category}
                        </span>
                        {post.batch_name && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-black text-[#F5E8C7] border border-white/20 font-bold">
                            {post.batch_name}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#aaaaaa]">
                        {formatDate(post.created_at)}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white uppercase leading-snug">
                      {post.title}
                    </h3>

                    {/* Feature Chips */}
                    {features.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1">
                        {features.map((feat) => (
                          <span
                            key={feat}
                            className="text-[9px] font-bold px-1.5 py-0.2 bg-black border border-[#E62229]/60 text-[#F5E8C7]"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Clean plain-text excerpt: NO raw HTML or broken tags */}
                    <p className="text-xs text-[#cccccc] leading-relaxed line-clamp-3">
                      {displayExcerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E62229]/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setActiveModalPost(post)}
                      className="text-xs text-[#F5E8C7] hover:text-[#E62229] font-black uppercase flex items-center gap-1 cursor-pointer"
                    >
                      <span>VIEW FULL DOC</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>

                    {post.object_path && (
                      <a
                        href={getPublicStorageUrl(post.object_path) || "#"}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-cyber-primary text-[10px] px-2.5 py-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-white/20 bg-[#04080D] p-8 text-center font-mono text-xs text-[#cccccc]">
            No archived documents or lecture materials found matching your search query. Try another search keyword or clear filters.
          </div>
        )}
      </div>

      {/* =========================================================================
          RICH DOCUMENT VIEWER MODAL
          ========================================================================= */}
      {activeModalPost && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="border-4 border-[#E62229] bg-[#04080D] text-[#F5E8C7] max-w-3xl w-full p-4 sm:p-6 space-y-6 shadow-[12px_12px_0px_#000000] my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-[#E62229] pb-3">
              <span className="text-xs font-black text-[#E62229] tracking-wider uppercase">
                /// CMHS PRC DOCUMENT ARCHIVE // ROOM 312
              </span>
              <button
                onClick={() => setActiveModalPost(null)}
                className="p-1 border border-[#E62229] text-[#E62229] hover:bg-[#E62229] hover:text-black transition-colors"
                title="Close Document"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Structured Rich Content Renderer */}
            <ClubDocViewer
              post={activeModalPost}
              onClose={() => setActiveModalPost(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

