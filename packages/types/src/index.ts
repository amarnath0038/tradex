export type  RedisStreamMessage = [id: string, fields: string[]];

export type RedisStream = [stream: string, messages: RedisStreamMessage[]];

export type XReadResponse = RedisStream[] | null;

export type TradeResponse = {
    requestId: string;
    status: "SUCCESS" | "ERROR";
    type?: string;
    message?: string;
    pnl?: number;
    tradeStatus?: "OPEN" | "CLOSED" | "LIQUIDATED";
}


type Side = "long" | "short";

export type EngineTrade = {
  id: string;
  userId: string;
  asset: string;
  status?: "OPEN" | "CLOSED" | "LIQUIDATED";
  side: Side;
  leverage: number;
  positionSize: number;
  marginUsed: number;
  entryPrice: number;
  openedAt: Date;
};

export type DebitResult =
  | { success: true; balance: number; previousBalance: number }
  | { success: false; error: string };

export type CreditResult =
  | { success: true; balance: number; previousBalance: number }
  | { success: false; error: string };


export type TradeOpenedEvent = {
  type: "TRADE_OPENED";
  requestId: string;
  tradeId: string;
  userId: string;
  asset: string;
  side: "long" | "short";
  leverage: number;
  positionSize: number;
  marginUsed: number;
  entryPrice: number;
  balanceAfter: number;
  createdAt: string;
};

export type TradeClosedEvent = {
  type: "TRADE_CLOSED";
  requestId: string;
  tradeId: string;
  userId: string;
  asset: string;
  side: "long" | "short";
  entryPrice: number;
  exitPrice: number;
  positionSize: number;
  marginUsed: number;
  pnl: number;
  balanceAfter: number;
  closedAt: string;
};

export type TradeEvent = TradeOpenedEvent | TradeClosedEvent;
