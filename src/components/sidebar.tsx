"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileCode,
  Settings,
  Image,
} from "lucide-react";
import type { AgentFile, Skill } from "@/types";

interface SidebarProps {
  files: AgentFile[];
  skills: Skill[];
  selectedFile: AgentFile | null;
  onSelectFile: (file: AgentFile) => void;
}

function getFileIcon(type: AgentFile["type"]) {
  switch (type) {
    case "markdown":
    case "text":
      return FileText;
    case "code":
      return FileCode;
    case "config":
      return Settings;
    case "image":
      return Image;
    default:
      return FileText;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function Sidebar({
  files,
  skills,
  selectedFile,
  onSelectFile,
}: SidebarProps) {
  const [filesOpen, setFilesOpen] = useState(true);
  const [skillsOpen, setSkillsOpen] = useState(true);

  return (
    <aside className="w-[260px] shrink-0 border-r border-card-border bg-background-deep p-3 flex flex-col gap-3 overflow-y-auto">
      {/* Files Section */}
      <div className="panel-frame rounded-lg overflow-hidden">
        <div className="panel-header">Files</div>
        <div className="p-2">
          <button
            onClick={() => setFilesOpen(!filesOpen)}
            className="flex items-center gap-1.5 w-full text-left py-1 cursor-pointer text-muted hover:text-foreground"
          >
            {filesOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Workspace
            </span>
            <span className="ml-auto text-[10px] text-gold-dim font-mono">
              {files.length}
            </span>
          </button>

          {filesOpen && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                const isSelected = selectedFile?.id === file.id;

                return (
                  <li key={file.id}>
                    <button
                      onClick={() => onSelectFile(file)}
                      className={`flex items-center gap-2 w-full text-left px-2 py-1.5 rounded transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-gold/10 border border-gold-dim/30 text-gold-light"
                          : "hover:bg-card border border-transparent"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="text-xs truncate">{file.name}</span>
                      <span className="ml-auto text-[10px] text-muted/50 shrink-0 font-mono">
                        {formatSize(file.size)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Skills Section */}
      <div className="panel-frame rounded-lg overflow-hidden">
        <div className="panel-header">Skills</div>
        <div className="p-2">
          <button
            onClick={() => setSkillsOpen(!skillsOpen)}
            className="flex items-center gap-1.5 w-full text-left py-1 cursor-pointer text-muted hover:text-foreground"
          >
            {skillsOpen ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Loaded
            </span>
            <span className="ml-auto text-[10px] text-gold-dim font-mono">
              {skills.filter((s) => s.active).length}/{skills.length}
            </span>
          </button>

          {skillsOpen && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {skills.map((skill) => (
                <li
                  key={skill.id}
                  className="flex items-start gap-2 px-2 py-1.5 rounded hover:bg-card transition-colors"
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      skill.active ? "bg-accent-green" : "bg-muted/30"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs truncate">{skill.name}</p>
                    <p className="text-[10px] text-muted/60 truncate">
                      {skill.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </aside>
  );
}
