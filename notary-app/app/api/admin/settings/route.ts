import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { z } from "zod";
import prisma from "@/lib/prisma";

// GET /api/admin/settings
export async function GET(request: Request) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.systemSetting.findMany();
    return NextResponse.json(settings);
}

// POST /api/admin/settings (Update or create multiple)
export async function POST(request: Request) {
    const headersList = await headers();
    const userRole = headersList.get("x-user-role");

    if (userRole !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { key, value, description } = body;

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value, description },
            create: { key, value, description },
        });

        return NextResponse.json(setting);
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
