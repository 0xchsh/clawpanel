"use client";

import { useGatewayContext } from "@/contexts/gateway-context";
import { PageHeader } from "@/components/page-header";
import { NodeList } from "@/components/nodes/node-list";

export default function NodesPage() {
  const { nodes, approveNode, rejectNode } = useGatewayContext();

  const onlineCount = nodes.filter((n) => n.status === "online").length;
  const pendingCount = nodes.filter((n) => n.status === "pending").length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Nodes"
        description={`${onlineCount} online${pendingCount > 0 ? `, ${pendingCount} pending` : ""}`}
      />
      <NodeList
        nodes={nodes}
        onApprove={approveNode}
        onReject={rejectNode}
      />
    </div>
  );
}
