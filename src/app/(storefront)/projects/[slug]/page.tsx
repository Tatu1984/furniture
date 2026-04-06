"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "motion/react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type ProjectMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  caption: string | null;
  alt: string;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  location: string | null;
  clientName: string | null;
  completedAt: string | null;
  isFeatured: boolean;
  media: ProjectMedia[];
};

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [project, setProject] = React.useState<Project | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [currentMedia, setCurrentMedia] = React.useState(0);

  React.useEffect(() => {
    async function fetchProject() {
      try {
        const res = await fetch(`/api/projects/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProject(data.data);
        } else {
          setProject(null);
        }
      } catch {
        console.error("Failed to fetch project");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 flex justify-center text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The project you're looking for doesn't exist or has been removed.
        </p>
        <Button asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 size-4" />
            Back to Projects
          </Link>
        </Button>
      </div>
    );
  }

  const images = project.media.filter((m) => m.type === "IMAGE");
  const videos = project.media.filter((m) => m.type === "VIDEO");
  const allMedia = [...images, ...videos];
  const current = allMedia[currentMedia];

  const prevMedia = () =>
    setCurrentMedia((i) => (i === 0 ? allMedia.length - 1 : i - 1));
  const nextMedia = () =>
    setCurrentMedia((i) => (i === allMedia.length - 1 ? 0 : i + 1));

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 lg:py-12">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="size-4" />
        Back to Projects
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {project.category && (
              <Badge variant="outline">{project.category}</Badge>
            )}
            {project.isFeatured && <Badge>Featured</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {project.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            {project.location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-4" />
                {project.location}
              </span>
            )}
            {project.clientName && (
              <span className="flex items-center gap-1">
                <User className="size-4" />
                {project.clientName}
              </span>
            )}
            {project.completedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="size-4" />
                {new Date(project.completedAt).toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Media Gallery */}
        {allMedia.length > 0 && (
          <div className="mb-8">
            {/* Main media */}
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-muted mb-3">
              {current?.type === "VIDEO" ? (
                (() => {
                  const ytId = getYouTubeId(current.url);
                  return ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      title={current.caption || project.title}
                      className="absolute inset-0 w-full h-full"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={current.url}
                      controls
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  );
                })()
              ) : current ? (
                <Image
                  src={current.url}
                  alt={current.alt || project.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1024px"
                  priority
                />
              ) : null}

              {/* Navigation arrows */}
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={prevMedia}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                  <button
                    onClick={nextMedia}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                  >
                    <ChevronRight className="size-5" />
                  </button>
                </>
              )}

              {/* Caption */}
              {current?.caption && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3">
                  <p className="text-white text-sm">{current.caption}</p>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {allMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {allMedia.map((m, i) => (
                  <button
                    key={m.id}
                    onClick={() => setCurrentMedia(i)}
                    className={`relative shrink-0 size-16 overflow-hidden rounded-md border-2 transition ${
                      i === currentMedia
                        ? "border-primary"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    {m.type === "IMAGE" ? (
                      <Image
                        src={m.url}
                        alt={m.alt || ""}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted text-xs">
                        Video
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {project.description && (
          <>
            <Separator className="mb-6" />
            <div className="prose prose-neutral max-w-none">
              <h2 className="text-xl font-semibold mb-4">About This Project</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {project.description}
              </p>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
