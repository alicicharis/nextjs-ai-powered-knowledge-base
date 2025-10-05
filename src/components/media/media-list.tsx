import { File } from "@/db/schema";
import SectionCard from "../section-card";
import { File as LucideFile } from "lucide-react";

export default function MediaList({ files }: { files: File[] }) {
  return (
    <SectionCard>
      <div className="grid grid-cols-3 gap-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="md:col-span-1 col-span-3 md:card bg-base-100 shadow-sm"
          >
            <div className="card-body flex justify-between items-center">
              <LucideFile className="w-8 h-8" />
              <span className="font-medium text-lg">{file.name}</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
