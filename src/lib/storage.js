export const encodeFileBuffer = async ({ buffer, originalName, contentType }) => {
  if (!buffer || !originalName) {
    return null;
  }

  return {
    fileName: originalName,
    fileType: contentType || "application/octet-stream",
    base64: buffer.toString("base64"),
    size: buffer.length,
  };
};
