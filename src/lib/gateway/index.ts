export { GatewayConnection, type ConnectionState, type ConnectionConfig } from "./connection";
export { ClawPanelError, type ClawPanelErrorCode, getErrorMessage } from "./errors";
export { classifyGatewayEvent, EventDispatcher, type ClassifiedEvent, type EventCategory } from "./event-bridge";
export { createConnectFrame, createRpcRequest, parseFrame, type RpcRequest, type RpcResponse, type GatewayEvent } from "./protocol";
export { initialReconnectState, nextReconnectDelay, resetReconnectState } from "./reconnect";
