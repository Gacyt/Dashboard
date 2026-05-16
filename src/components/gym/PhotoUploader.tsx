"use client";

import { useRef, useState } from "react";

export default function PhotoUploader({
  onUpload
}: {
  onUpload: (file: File, onProgress?: (value: number) => void) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploadPct, setUploadPct] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div style={{ display: "grid", gap: "6px" }}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setIsUploading(true);
          setUploadPct(0);
          try {
            await onUpload(file, setUploadPct);
          } finally {
            setIsUploading(false);
            inputRef.current!.value = "";
          }
        }}
      />
      {isUploading ? (
        <div className="nx-progress">
          <span style={{ width: `${uploadPct}%`, background: "var(--accent)" }} />
        </div>
      ) : null}
    </div>
  );
}
