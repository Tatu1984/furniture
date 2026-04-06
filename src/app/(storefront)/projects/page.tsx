"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { MapPin, Calendar, Play, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/section-heading";

type ProjectMedia = {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  caption: string | null;
  isDefault: boolean;
};

type Project = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  location: string | null;
  completedAt: string | null;
  isFeatured: boolean;
  media: ProjectMedia[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [activeCategory, setActiveCategory] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true);

  const fetchProjects = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      params.set("limit", "50");

      const res = await fetch(`/api/projects?${params}`);
      const data = await res.json();
      setProjects(data.data || []);
      if (data.categories) setCategories(data.categories);
    } catch {
      console.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  React.useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const heroImage = (project: Project) => {
    const defaultMedia = project.media.find((m) => m.isDefault) || project.media[0];
    return defaultMedia?.url;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <SectionHeading
          title="Our Completed Projects"
          subtitle="Explore our portfolio of beautifully furnished spaces"
        />
      </div>

      {/* Category Filters */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <Button
            variant={activeCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveCategory(null)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-16 text-muted-foreground">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">
            No projects found. Check back soon!
          </p>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => {
            const image = heroImage(project);
            const hasVideo = project.media.some((m) => m.type === "VIDEO");

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {image ? (
                      <Image
                        src={image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        No image
                      </div>
                    )}
                    {hasVideo && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="gap-1">
                          <Play className="size-3" />
                          Video
                        </Badge>
                      </div>
                    )}
                    {project.isFeatured && (
                      <div className="absolute top-3 left-3">
                        <Badge>Featured</Badge>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <ArrowRight className="size-4 mt-1 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {project.category && (
                        <Badge variant="outline" className="text-xs">
                          {project.category}
                        </Badge>
                      )}
                      {project.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3" />
                          {project.location}
                        </span>
                      )}
                      {project.completedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {new Date(project.completedAt).toLocaleDateString(
                            "en-IN",
                            {
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
