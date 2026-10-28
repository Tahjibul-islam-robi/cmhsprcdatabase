"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Archive, Download, ChevronLeft, ChevronRight, Filter, BookOpen, ArrowUpRight } from "lucide-react";
import { supabase, getPublicStorageUrl } from "@/lib/supabase";
import { formatDate } from "@/lib/utils";
import { ScrollReveal } from "@/components/ScrollReveal";
import type { BlogPost, BatchItem } from "@/lib/types";
import { stripHtml } from "@/components/ClubDocViewer";

export default function ArchivePage() {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 12;

  useEffect(() => {
    async function loadBatches() {
      try {
        const { data } = await supabase.rpc("get_public_batches");
        if (data) setBatches(data);
      } catch (err) {
        console.error("Batches error:", err);
      }
    }
    loadBatches();
  }, []);

  useEffect(() => {
    async function loadArchive() {
      setLoading(true);
      try {
        const { data, count } = await supabase.rpc("get_public_archive_posts", {
          p_batch_id: selectedBatch || null,
          p_category: selectedCategory || null,
          p_limit: pageSize,
          p_offset: page * pageSize,
        });
        if (data) {
          setPosts(data);
          if (count !== null) setTotalCount(count);
        }
      } catch (err) {
        console.error("Archive load error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadArchive();
  }, [selectedBatch, selectedCategory, page]);

  return (
    <div className="space-y-12">
      {/* Header Poster */}
      <section className="border-4 border-[#E62229] bg-[#04080D] shadow-[8px_8px_0px_#000000] overflow-hidden">
        <div className="bg-[#E62229] text-black font-mono text-xs font-black px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="tracking-widest">
              /// HISTORICAL ARCHIVE // CMHS PRC // ROOM 312
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] font-bold">
            <span className="bg-black text-[#E62229] px-2 py-0.5 border border-black">TOTAL_LOGS: {totalCount}</span>
            <span className="bg-black text-white px-2 py-0.5 border border-black">SYSTEM: ONLINE</span>
          </div>
        </div>

        <div className="p-6 sm:p-10 bg-[#081726] text-[#F5E8C7] space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-black tracking-widest text-[#E62229] uppercase">
              DEEP VAULT STORAGE
            </span>
            <h1 className="text-4xl sm:text-6xl font-mech-wide font-black text-white tracking-wide">
              HISTORICAL ARCHIVE
            </h1>
            <p className="text-xs sm:text-sm text-[#cccccc] max-w-xl">
              Browse historical announcements, lesson attachments, and records filtered by specific student cohort batches.
            </p>
          </div>

          {/* Filter Bar */}
          <div className="border-2 border-[#E62229] bg-[#04080D] p-5 shadow-[4px_4px_0px_#000000] flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-mono text-[#F5E8C7] uppercase font-bold mb-1.5">
                Filter by Cohort / Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => {
                  setSelectedBatch(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-[#081726] border-2 border-[#E62229] px-3.5 py-2 text-xs text-[#F5E8C7] font-mono focus:outline-none"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} (Batch #{b.batch_number})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[11px] font-mono text-[#F5E8C7] uppercase font-bold mb-1.5">
                Filter by Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(0);
                }}
                className="w-full bg-[#081726] border-2 border-[#E62229] px-3.5 py-2 text-xs text-[#F5E8C7] font-mono focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="material">Class Materials</option>
                <option value="announcement">Announcements</option>
              </select>
            </div>
          </div>

          <div className="h-4 w-full hazard-stripes border-t border-b border-[#F5E8C7]/60" />
        </div>
      </section>

      {/* Archive Grid */}
      <ScrollReveal className="space-y-6">
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const fileUrl = getPublicStorageUrl(post.object_path);
              return (
                <article
                  key={post.id}
                  className="border-2 border-[#E62229] bg-[#081726] p-6 shadow-[6px_6px_0px_#000000] flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#888888]">{formatDate(post.created_at)}</span>
                      <span className="px-2 py-0.5 bg-[#E62229] text-black font-black uppercase text-[10px]">
                        {post.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white uppercase leading-snug">
                      {post.title}
                    </h3>

                    <p className="text-xs font-mono text-[#E62229]">
                      Cohort: {post.batch_name || "Club General"}
                    </p>

                    <p className="text-xs text-[#cccccc] line-clamp-3 leading-relaxed font-mono">
                      {stripHtml(post.body) || (post.file_name ? `Attached document: ${post.file_name}. Click to view or download.` : "Official archived club record.")}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#E62229]/30 flex items-center justify-between text-xs font-mono">
                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#E62229] hover:underline font-bold flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Download
                      </a>
                    ) : (
                      <span className="text-[11px] text-[#666666]">No attachment</span>
                    )}
                    <Link href="/blog" className="text-white hover:text-[#E62229] flex items-center gap-1">
                      <span>View in Logs</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-2 border-white/20 bg-[#04080D] p-12 text-center font-mono text-xs text-[#888888]">
            [NO_ARCHIVED_RECORDS_MATCH_CRITERIA]
          </div>
        )}

        {/* Pagination Controls */}
        <div className="flex items-center justify-between pt-6 border-t-2 border-[#E62229] text-xs font-mono">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="btn-cyber-navy text-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Previous
          </button>
          <span className="font-mono text-[#F5E8C7]">Page {page + 1}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={posts.length < pageSize}
            className="btn-cyber-navy text-xs disabled:opacity-40 disabled:pointer-events-none"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </ScrollReveal>
    </div>
  );
}
