import { EngineTrade, DebitResult, CreditResult } from "@repo/types";

const balances = new Map<string, number>();
const openTrades = new Map<string, EngineTrade>();

export const setUserBalance = (userId: string, balance: number) => {
    balances.set(userId, balance);
}

export const getUserBalance = (userId: string) => {
    return balances.get(userId);
}

export const restoreUserBalance = (userId: string, balance: number) => {
    balances.set(userId, balance);
}

export const debitUserBalance = (userId: string, amount: number): DebitResult => {
  const currentBalance = balances.get(userId);

  if (currentBalance === undefined) {
    return {
      success: false,
      error: "User not found",
    };
  }

  if (amount > currentBalance) {
    return {
      success: false,
      error: "Insufficient balance",
    };
  }

  const updatedBalance = currentBalance - amount;
  balances.set(userId, updatedBalance);

  return {
    success: true,
    previousBalance: currentBalance,
    balance: updatedBalance,
  };
};

export const creditUserBalance = (userId:string, amount: number): CreditResult => {
    const currentBalance = balances.get(userId);

    if (currentBalance === undefined) {
        return {
            success: false,
            error: "User not found"
        }
    }

    const updatedBalance = currentBalance + amount;
    balances.set(userId, updatedBalance);

    return {
        success: true,
        previousBalance: currentBalance,
        balance: updatedBalance
    }
}


export const addOpenTrade = (trade: EngineTrade) => {
  openTrades.set(trade.id, trade);
};

export const getOpenTrade = (tradeId: string) => {
  return openTrades.get(tradeId);
};

export const removeOpenTrade = (tradeId: string) => {
  openTrades.delete(tradeId);
};

export const getStateStats = () => {
  return {
    balances: balances.size,
    openTrades: openTrades.size,
  };
};