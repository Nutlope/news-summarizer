import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Footer from "../components/Footer";
import Header from "../components/Header";
import SquigglyLines from "../components/SquigglyLines";

export const Home: NextPage = () => {
  const router = useRouter();
  const urlState = router.query.slug;
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [curArticle, setCurArticle] = useState<string>("");
  const summaryRef = useRef<HTMLDivElement>(null);

  const curUrl = String(curArticle.split(".com")[1]);

  const generateSummary = useCallback(
    async (url?: string) => {
      setSummary("");
      if (url) {
        if (!url.includes("techcrunch.com")) {
          toast.error("Please enter a valid TechCrunch article");
          return;
        }
        setCurArticle(url);
      } else {
        if (!curArticle.includes("techcrunch.com")) {
          toast.error("Please enter a valid TechCrunch article");
          return;
        }
        router.replace(curUrl);
      }
      setLoading(true);
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url ? url : curArticle }),
      });

      if (!response.ok) {
        toast.error(response.statusText);
        setLoading(false);
        return;
      }

      const data = response.body;
      if (!data) {
        toast.error("Something went wrong");
        setLoading(false);
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setSummary((prev) => prev + chunkValue);
        summaryRef.current?.scrollIntoView({
          block: "start",
          inline: "nearest",
          behavior: "smooth",
        });
      }
      setLoading(false);
    },
    [curArticle, curUrl, router]
  );

  useEffect(() => {
    if (
      urlState &&
      router.isReady &&
      !curArticle &&
      typeof urlState !== "string" &&
      urlState.every((subslug: string) => typeof subslug === "string")
    ) {
      generateSummary(
        "https://techcrunch.com/" + (urlState as string[]).join("/")
      );
    }
  }, [router.isReady, urlState, generateSummary, curArticle]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Enter") {
        if (loading) {
          toast.error("The article is still being summarized");
        }
        generateSummary();
      }
    };

    const handlePaste = (event: ClipboardEvent) => {
      generateSummary(event.clipboardData?.getData("text"));
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("paste", handlePaste);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("paste", handlePaste);
    };
  }, [generateSummary, loading]);

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col pt-8 sm:pt-12">
      <Head>
        <title>TechCrunch Summarizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="mx-auto mt-10 flex max-w-5xl flex-1 flex-col justify-center px-2 sm:mt-40">
        <a
          target="_blank"
          rel="noreferrer"
          className="mx-auto mb-5 hidden max-w-fit rounded-full border border-gray-800 px-4 py-1 text-gray-500 transition duration-300 ease-in-out hover:scale-105 hover:border-gray-700 md:block"
          href="https://twitter.com/nutlope/status/1622988173155368960"
        >
          You can also go to a Techcrunch article and add "summary" after
          "techcrunch" in the URL
        </a>
        <h1 className="max-w-5xl text-center text-4xl font-bold sm:text-7xl">
          Summarize any{" "}
          <span className="relative whitespace-nowrap text-[#3290EE]">
            <SquigglyLines />
            <span className="relative text-green-500">TechCrunch</span>
          </span>{" "}
          article with AI
        </h1>
        <p className="mt-10 text-center text-lg text-gray-500 sm:text-2xl">
          Copy and paste any <span className="text-green-500">TechCrunch </span>
          article link below.
        </p>
        <input
          type="text"
          value={curArticle}
          onChange={(e) => setCurArticle(e.target.value)}
          className="mx-auto mt-10 w-full rounded-lg border border-gray-500 bg-black p-3 outline-1 outline-white sm:mt-7 sm:w-3/4"
        />
        {!loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 rounded-2xl border-gray-500 bg-green-500 p-3 text-lg font-medium transition hover:bg-green-400 sm:mt-10 sm:w-1/3"
            onClick={() => generateSummary()}
          >
            Summarize
          </button>
        )}
        {loading && (
          <button
            className="z-10 mx-auto mt-7 w-3/4 cursor-not-allowed rounded-2xl border-gray-500 bg-green-500 p-3 text-lg font-medium transition hover:bg-green-400 sm:mt-10 sm:w-1/3"
            disabled
          >
            <div className="flex items-center justify-center text-white">
              <Image
                src="/loading.svg"
                alt="Loading..."
                width={28}
                height={28}
              />
            </div>
          </button>
        )}
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        {summary && (
          <div className="mb-10 min-h-[75vh] px-4">
            <h2 className="mx-auto mt-16 max-w-3xl border-t border-gray-600 pt-8 text-center text-3xl font-bold sm:text-5xl">
              Summary
            </h2>
            <div className="mx-auto mt-6 max-w-3xl text-lg leading-7">
              {summary.split(". ").map((sentence, index) => (
                <div key={index}>
                  {sentence.length > 0 && (
                    <li className="mb-2 list-disc">{sentence}</li>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <div ref={summaryRef}>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
