import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";

const paymentSchema = z.object({
    transactionId: z.string().uuid(),
    provider: z.enum(["EVC_PLUS", "PREMIER_WALLET", "SAHAL"]),
    phoneNumber: z.string().min(6), // basic validation
});

// POST /api/payments/local
export async function POST(request: Request) {
    // This could optionally be called from client portal (no tenant header) or admin dashboard.
    // If called from admin dashboard, we might have x-user-id.
    
    try {
        const body = await request.json();
        const validated = paymentSchema.parse(body);

        const transaction = await prisma.transaction.findUnique({
            where: { id: validated.transactionId },
            include: { tenant: true }
        });

        if (!transaction) {
            return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
        }

        if (transaction.paymentStatus === "PAID") {
            return NextResponse.json({ error: "Transaction already paid" }, { status: 400 });
        }

        // SIMULATE: Call actual EVC Plus, Premier Wallet, or Sahal API
        // In a real application, you would make an axios/fetch call to the provider's API.
        // We will pause for a second to simulate the USSD push and wait for user PIN.
        await new Promise(resolve => setTimeout(resolve, 1500)); 

        // Calculate Revenue Split
        // 90% to Tenant, 10% to System
        const systemCommissionRate = transaction.tenant.commissionRate || 10; // default 10%
        const systemCut = (transaction.amount * systemCommissionRate) / 100;
        const tenantCut = transaction.amount - systemCut;

        const updatedTx = await prisma.transaction.update({
            where: { id: validated.transactionId },
            data: {
                paymentStatus: "PAID",
                paymentMethod: validated.provider,
                tenantRevenue: tenantCut,
                systemRevenue: systemCut,
                gatewayData: {
                    provider: validated.provider,
                    phoneNumber: validated.phoneNumber,
                    reference: `REF-${Math.floor(Math.random() * 1000000)}`,
                    simulated: true,
                    timestamp: new Date().toISOString()
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Payment processed successfully",
            transaction: updatedTx
        });
    } catch (error) {
        console.error(error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
    }
}
