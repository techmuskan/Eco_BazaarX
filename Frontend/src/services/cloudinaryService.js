<<<<<<< HEAD
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME?.trim();
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET?.trim();
console.log("Cloud:", process.env.REACT_APP_CLOUDINARY_CLOUD_NAME);
console.log("Preset:", process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
=======
const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4

export async function uploadProductImage(file) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary env missing. Set REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();
  if (!response.ok) {
<<<<<<< HEAD
    if (process.env.NODE_ENV !== "production") {
      console.error("Cloudinary upload failed", {
        status: response.status,
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        fileName: file?.name,
        fileType: file?.type,
        fileSize: file?.size,
        response: data
      });
    }
    const cloudinaryMessage =
      data?.error?.message ||
      `Image upload failed with status ${response.status}`;
    throw new Error(
      `${cloudinaryMessage}. Check Cloudinary preset name/case and ensure the preset is unsigned.`
    );
=======
    throw new Error(data?.error?.message || "Image upload failed");
>>>>>>> c3670d096ec4ec373c9e00b78303e75bf37d6fd4
  }

  return data.secure_url;
}
