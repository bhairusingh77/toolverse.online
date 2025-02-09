import BlurText from "./components/BlurText";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-screen bg-black flex flex-col justify-center items-center text-center px-4">
      <Link href="tools/imageconverter">
        <BlurText
          text="Image Converter"
          className=" bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
        />
      </Link>
      <Link href="tools/socialdownloader">
        <BlurText
          text="URL to mp3/mp4"
          className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent"
        />
      </Link>
    </div>
  );
}
