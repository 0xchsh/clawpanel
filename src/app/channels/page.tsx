"use client";

import { useState } from "react";
import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { ChannelList } from "@/components/channels/channel-list";
import { ChannelDetail } from "@/components/channels/channel-detail";
import { Radio } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export default function ChannelsPage() {
  const { channels, toggleChannel } = useGatewayContext();
  const [selectedId, setSelectedId] = useState<string | null>(
    channels[0]?.id ?? null
  );

  const selectedChannel = channels.find((ch) => ch.id === selectedId);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Channels"
        description={`${channels.filter((c) => c.enabled).length} active channels`}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[60%] border-r border-card-border overflow-hidden">
          <ChannelList
            channels={channels}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onToggle={toggleChannel}
          />
        </div>
        <div className="w-[40%] overflow-hidden">
          {selectedChannel ? (
            <ChannelDetail channel={selectedChannel} />
          ) : (
            <EmptyState
              icon={Radio}
              title="No channel selected"
              description="Select a channel from the list to view its configuration."
            />
          )}
        </div>
      </div>
    </div>
  );
}
