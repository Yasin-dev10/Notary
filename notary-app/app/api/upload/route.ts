import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        
        // Ensure standard characters only in filename, add timestamp
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${timestamp}-${safeName}`;
        
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        
        // Write the file to the local directory
        await writeFile(path.join(uploadsDir, filename), buffer);

        // Return path relative to project root
        return NextResponse.json({ 
            fileUrl: `/uploads/${filename}`, 
            filename: filename 
        });
    } catch (error: any) {
        console.error("Error saving file:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
