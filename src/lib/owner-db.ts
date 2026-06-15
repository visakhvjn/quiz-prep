import { prisma } from "@/lib/db";
import {
  PLAN_LIMITS,
  type PlanTier,
  resolveOwnerPlan,
} from "@/lib/plans";

export interface AccountInfo {
  plan: PlanTier;
  limits: (typeof PLAN_LIMITS)[PlanTier];
}

export async function getOrCreateOwner(ownerId: string) {
  const existing = await prisma.owner.findUnique({ where: { id: ownerId } });
  if (existing) return existing;

  return prisma.owner.create({
    data: { id: ownerId, plan: "hobby" },
  });
}

export async function getAccountInfo(ownerId: string): Promise<AccountInfo> {
  const owner = await getOrCreateOwner(ownerId);
  const plan = resolveOwnerPlan(ownerId, owner.plan);

  return {
    plan,
    limits: PLAN_LIMITS[plan],
  };
}
