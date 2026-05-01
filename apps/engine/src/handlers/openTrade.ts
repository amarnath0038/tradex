import { db, users, trades } from "@repo/db";
import { eq } from "@repo/db";
import { getPrice } from "../store/priceStore";
import { sendErrorResponse, sendSuccessResponse } from "@repo/redis";

export const openTrade = async (data:any) => {
  const {userId, asset, side, leverage, positionSize} = data;

  const lev = Number(leverage);
  const size = Number(positionSize)

  const user = await db.query.users.findFirst({ where: (u, {eq}) => eq(u.id, userId)});

  if (!user) {
    console.log("user not found");

    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "user not found"
    })
    return;
  }

  const requiredMargin = size / lev;

  if (Number(user.balance) < requiredMargin) {
    console.log("insufficient balance");
    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "insufficient balance"
    });
    return;
  }

  const entryPrice = getPrice(asset);
  if (!entryPrice) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "price not available"
    });
    return;
  }

  const newBalance = Number(user.balance) - requiredMargin;

  try {
    await db.transaction(async (tx) => {
      await tx.update(users)
        .set({ balance: newBalance.toString() })
        .where(eq(users.id, userId));

      await tx.insert(trades).values({
        userId,
        asset,
        side,
        leverage: leverage.toString(),
        positionSize: positionSize.toString(),
        marginUsed: requiredMargin.toString(),
        entryPrice: entryPrice.toString(),
        status: "OPEN"
      });
    });

    await sendSuccessResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "Trade created"
    })

    console.log("Trade created");

  } catch(err) {
    await sendErrorResponse({
      requestId: data.requestId,
      type: "OPEN_TRADE",
      message: "database error"
    });
    return;
  }
};