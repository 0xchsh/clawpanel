"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { MemoryList } from "@/components/memory/memory-list";
import { MemoryDetail } from "@/components/memory/memory-detail";
import { Brain } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function MemoryPage() {
  const { memories } = useGatewayContext();
  const [selectedId, setSelectedId] = useState<string | null>(
    memories[0]?.id ?? null
  );

  const selectedMemory = memories.find((m) => m.id === selectedId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Memory"
        description={`${memories.length} entries, ${memories.reduce((sum, m) => sum + m.tokenCount, 0).toLocaleString()} tokens`}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-card-border overflow-hidden">
          <MemoryList
            memories={memories}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>
        <div className="w-[40%] overflow-hidden">
          {selectedMemory ? (
            <MemoryDetail memory={selectedMemory} />
          ) : (
            <EmptyState
              icon={Brain}
              title="No memory selected"
              description="Select a memory from the list to view its full content."
            />
          )}
        </div>
      </div>
    </div>
  );
}
