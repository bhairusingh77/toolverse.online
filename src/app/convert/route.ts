import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const format = formData.get("format") as string;

        if (!file || !format) {
            return NextResponse.json({ error: "Invalid input" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let convertedImage;

        switch (format) {
            case "png":
                convertedImage = await sharp(buffer).png().toBuffer();
                break;
            case "jpg":
                convertedImage = await sharp(buffer).jpeg().toBuffer();
                break;
            case "webp":
                convertedImage = await sharp(buffer).webp().toBuffer();
                break;
            case "bmp":
                convertedImage = await sharp(buffer).toFormat("bmp").toBuffer();
                break;
            case "tiff":
                convertedImage = await sharp(buffer).tiff().toBuffer();
                break;
            default:
                return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
        }

        // Modify the file name to include "(converted_with_toolverse)"
        const originalName = file.name.replace(/\.[^.]+$/, ''); // Remove extension
        const newFileName = `${originalName} (converted_with_toolverse).${format}`;

        return new NextResponse(convertedImage, {
            status: 200,
            headers: {
                "Content-Type": `image/${format}`,
                "Content-Disposition": `attachment; filename="${newFileName}"`,
            },
        });
    } catch (error) {
        console.error("Error processing image:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
