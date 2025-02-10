import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import util from "util";

const execAsync = util.promisify(exec);

function isValidUrl(url: string) {
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
    return urlPattern.test(url);
}

function getPlatform(url: string): string {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('instagram.com')) {
        return 'instagram';
    }
    return 'unknown';
}

// Function to get video title
async function getVideoTitle(url: string): Promise<string> {
    try {
        const { stdout } = await execAsync(`yt-dlp --get-title "${url}"`);
        return stdout.trim().replace(/[^a-zA-Z0-9\s_-]/g, "").replace(/\s+/g, "_"); // Remove special characters
    } catch (error) {
        console.error("Error fetching title:", error);
        return "Untitled"; // Default title if fetching fails
    }
}

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        const { url, format, quality } = data;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        if (!isValidUrl(url)) {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }

        const platform = getPlatform(url);
        if (platform === 'unknown') {
            return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
        }

        const title = await getVideoTitle(url);
        const sanitizedTitle = `${title}_toolverse.online`; // No brackets

        const downloadDir = "/tmp";  // Use Vercel's writable directory
        if (!fs.existsSync(downloadDir)) {
            fs.mkdirSync(downloadDir, { recursive: true });
        }

        const tempFilename = `${sanitizedTitle}.%(ext)s`;
        const tempFilePath = path.join(downloadDir, tempFilename);

        let command = `yt-dlp `;

        if (format === 'mp3') {
            const qualityBitrates: { [key: string]: string } = {
                'highest': '320',
                'high': '256',
                'medium': '192',
                'low': '128'
            };
            const bitrate = qualityBitrates[quality] || '192';
            command += `-x --audio-format mp3 --audio-quality ${bitrate}K `;
        } else {
            const qualityFormats: { [key: string]: string } = {
                'highest': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
                'high': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best',
                'medium': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best',
                'low': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best'
            };
            const formatString = qualityFormats[quality] || qualityFormats.high;
            command += `-f "${formatString}" --merge-output-format mp4 `;
        }

        if (platform === 'instagram') {
            const cookiesPath = path.join(process.cwd(), 'cookies.txt');
            if (fs.existsSync(cookiesPath)) {
                command += `--cookies "${cookiesPath}" `;
            }
        }

        command += `-o "${tempFilePath}" "${url}" --no-check-certificates --force-overwrites`;

        console.log('Executing command:', command);
        const { stdout, stderr } = await execAsync(command);
        console.log('Download output:', stdout);
        if (stderr) console.error('Download stderr:', stderr);

        const downloadedFilePath = tempFilePath.replace("%(ext)s", format === 'mp3' ? "mp3" : "mp4");

        if (!fs.existsSync(downloadedFilePath)) {
            throw new Error("Download failed - file not created");
        }

        // Add watermark if it's a video
        if (format !== 'mp3') {
            const watermarkedFilePath = path.join(downloadDir, `watermarked_${sanitizedTitle}.mp4`);
            const watermarkText = "ToolVerse";
            const ffmpegCommand = `ffmpeg -i "${downloadedFilePath}" -vf "drawtext=text='${watermarkText}':fontcolor=white:fontsize=24:x=10:y=10" -codec:a copy "${watermarkedFilePath}" -y`;

            console.log("Executing watermark command:", ffmpegCommand);
            await execAsync(ffmpegCommand);
            fs.unlinkSync(downloadedFilePath);
            fs.renameSync(watermarkedFilePath, downloadedFilePath);
        }

        setTimeout(() => {
            if (fs.existsSync(downloadedFilePath)) {
                fs.unlinkSync(downloadedFilePath);
                console.log(`Deleted file: ${downloadedFilePath}`);
            }
        }, 3 * 60 * 1000); // Delete after 5 minutes

        const finalFileUrl = `${req.nextUrl.origin}/downloads/${sanitizedTitle}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        return NextResponse.json({ file: finalFileUrl });

    } catch (error) {
        console.error("Download error:", error);
        return NextResponse.json(
            { error: "Failed to process download. Please try again." },
            { status: 500 }
        );
    }
}
