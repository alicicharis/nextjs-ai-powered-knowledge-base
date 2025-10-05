"use client";

export default function FileUpload() {
  return (
    <div className="col-span-12 bg-base-200 rounded-lg p-4">
      <form className="flex flex-col justify-center">
        <input type="file" className="file-input file-input-md w-full" />
        <button type="submit" className="btn btn-primary mt-4">
          Upload
        </button>
      </form>
    </div>
  );
}
