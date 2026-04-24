import { db, users, trades } from "@repo/db";
import { eq } from "@repo/db";
import { getPrice } from "../priceStore";

export const handleOpenTrade = async (data:any) => {
  const {userId, asset, side, leverage, positionSize} = data;

  const lev = Number(leverage);
  const size = Number(positionSize)

  const user = await db.query.users.findFirst({ where: (u, {eq}) => eq(u.id, userId)});

  if (!user) {
    console.log("user not found");
    return;
  }

  const requiredMargin = size / lev;

  if (Number(user.balance) < requiredMargin) {
    console.log("insufficient balance");
    return;
  }

  const entryPrice = getPrice(asset);
  const newBalance = Number(user.balance) - requiredMargin;

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

  console.log("Trade created");
};