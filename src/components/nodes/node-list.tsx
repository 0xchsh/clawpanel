"use client";

import type { Node } from "@/types";
import { NodeCard } from "./node-card";
import { PairingCard } from "./pairing-card";

interface NodeListProps {
  nodes: Node[];
  onApprove: (nodeId: string) => void;
  onReject: (nodeId: string) => void;
}

export function NodeList({ nodes, onApprove, onReject }: NodeListProps) {
  const pendingNodes = nodes.filter((n) => n.status === "pending");
  const activeNodes = nodes.filter((n) => n.status !== "pending");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {pendingNodes.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
            Pending Approval
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {pendingNodes.map((node) => (
              <PairingCard
                key={node.id}
                node={node}
                onApprove={() => onApprove(node.id)}
                onReject={() => onReject(node.id)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Devices ({activeNodes.length})
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {activeNodes.map((node) => (
            <NodeCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}
