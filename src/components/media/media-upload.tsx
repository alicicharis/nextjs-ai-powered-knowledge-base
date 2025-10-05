"use client";

import { getSignedURL } from "@/actions/media";
import SectionCard from "@/components/section-card";
import { Coins, File, Loader2 } from "lucide-react";
import { useState } from "react";

const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

export default function MediaUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (file) {
      setUploading(true);

      const signedURLResult = await getSignedURL({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        checksum: await computeSHA256(file),
      });

      if (signedURLResult.failure !== undefined) {
        console.error(signedURLResult.failure);
        setUploading(false);
        return;
      }

      const { url } = signedURLResult.success;

      await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      setUploading(false);
      setFile(null);
    }
  };

  return (
    <SectionCard>
      {file && (
        <div className="w-fit min-w-48 md:card bg-base-100 shadow-sm mb-4">
          <div className="card-body flex justify-between items-center">
            <File className="w-8 h-8" />
            {file.name}
            <div className="indicator font-bold">
              <span className="mr-1 text-yellow-300 text-xl">20</span>
              <Coins className="h-5 w-5 z-10 text-yellow-300" />
            </div>
          </div>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex items-center gap-4">
        <input
          type="file"
          className="file-input file-input-primary w-full"
          onChange={handleFileChange}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!file || uploading}
        >
          {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </SectionCard>
  );
}
