"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { ToggleSwitch } from "@/components/toggle-switch";
import type { ConfigSection, ConfigField } from "@/types";
import {
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  Cpu,
  KeyRound,
  Radio,
  Puzzle,
  Wrench,
  ScrollText,
  Clock,
  Globe,
  MessageSquare,
  Webhook,
  Monitor,
  Volume2,
  Search,
  Blocks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const sectionIcons: Record<string, LucideIcon> = {
  gateway: Settings,
  auth: Shield,
  models: Cpu,
  session: KeyRound,
  channels: Radio,
  skills: Puzzle,
  tools: Wrench,
  logging: ScrollText,
  cron: Clock,
  web: Globe,
  messages: MessageSquare,
  hooks: Webhook,
  browser: Monitor,
  audio: Volume2,
  discovery: Search,
  plugins: Blocks,
};

export default function ConfigPage() {
  const { configSections, updateConfigField } = useGatewayContext();
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set([configSections[0]?.key])
  );
  const [search, setSearch] = useState("");

  const toggleSection = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredSections = search
    ? configSections.filter(
        (s) =>
          s.label.toLowerCase().includes(search.toLowerCase()) ||
          s.fields.some(
            (f) =>
              f.label.toLowerCase().includes(search.toLowerCase()) ||
              f.key.toLowerCase().includes(search.toLowerCase())
          )
      )
    : configSections;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Config"
        description={`${configSections.length} sections`}
        actions={
          <div className="relative">
            <Search
              size={12}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search settings..."
              className="h-8 w-48 rounded-lg border border-card-border bg-input-bg pl-7 pr-3 text-xs text-foreground placeholder:text-muted outline-none"
            />
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Section Nav */}
        <div className="w-48 shrink-0 border-r border-card-border overflow-y-auto p-3 space-y-0.5">
          {configSections.map((section) => {
            const Icon = sectionIcons[section.key] || Settings;
            return (
              <button
                key={section.key}
                onClick={() => {
                  setOpenSections(new Set([section.key]));
                  document
                    .getElementById(`config-${section.key}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors cursor-pointer ${
                  openSections.has(section.key)
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-card-border hover:text-foreground"
                }`}
              >
                <Icon size={12} />
                {section.label}
              </button>
            );
          })}
        </div>

        {/* Config Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-xl space-y-3">
            {filteredSections.map((section) => (
              <ConfigSectionView
                key={section.key}
                section={section}
                isOpen={openSections.has(section.key)}
                onToggle={() => toggleSection(section.key)}
                onFieldChange={(fieldKey, value) =>
                  updateConfigField(section.key, fieldKey, value)
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigSectionView({
  section,
  isOpen,
  onToggle,
  onFieldChange,
}: {
  section: ConfigSection;
  isOpen: boolean;
  onToggle: () => void;
  onFieldChange: (fieldKey: string, value: string | number | boolean) => void;
}) {
  const Icon = sectionIcons[section.key] || Settings;

  return (
    <div
      id={`config-${section.key}`}
      className="rounded-2xl border border-card-border bg-card"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center gap-3 p-4 text-left cursor-pointer"
      >
        {isOpen ? (
          <ChevronDown size={14} className="text-muted" />
        ) : (
          <ChevronRight size={14} className="text-muted" />
        )}
        <Icon size={14} className="text-muted" />
        <div>
          <h3 className="text-sm font-medium">{section.label}</h3>
          <p className="text-[10px] text-muted">{section.description}</p>
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-card-border p-4 space-y-3">
          {section.fields.map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              onChange={(value) => onFieldChange(field.key, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FieldEditor({
  field,
  onChange,
}: {
  field: ConfigField;
  onChange: (value: string | number | boolean) => void;
}) {
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm">{field.label}</span>
          {field.description && (
            <p className="text-[10px] text-muted">{field.description}</p>
          )}
        </div>
        <ToggleSwitch
          enabled={field.value as boolean}
          onToggle={() => onChange(!field.value)}
          size="sm"
        />
      </div>
    );
  }

  if (field.type === "select" && field.options) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm">{field.label}</span>
          {field.description && (
            <p className="text-[10px] text-muted">{field.description}</p>
          )}
        </div>
        <select
          value={field.value as string}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-lg border border-card-border bg-input-bg px-2 py-1 text-xs text-foreground outline-none cursor-pointer"
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm">{field.label}</span>
      </div>
      {field.description && (
        <p className="text-[10px] text-muted mb-1">{field.description}</p>
      )}
      <input
        type={field.type === "number" ? "number" : "text"}
        value={field.value as string | number}
        onChange={(e) =>
          onChange(
            field.type === "number"
              ? Number(e.target.value)
              : e.target.value
          )
        }
        className="w-full rounded-lg border border-card-border bg-input-bg px-3 py-1.5 font-mono text-xs text-foreground outline-none"
      />
    </div>
  );
}
