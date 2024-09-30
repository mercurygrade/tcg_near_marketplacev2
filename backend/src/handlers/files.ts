export const getImagefromUrl = async (imageUrl: any) => {
  let contentType = null;
  let imageData = null;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error("Failed to get Picture");

    contentType = res.headers.get("Content-Type");
    imageData = await res.arrayBuffer();
    return { contentType, imageData };
  } catch (error) {
    console.error(error);
  }
  return { contentType, imageData };
};

export const uploadImage = async (
  url: any = "https://images.unsplash.com/photo-1511497584788-876760111969"
) => {
  const API_KEY = "3TIAfdr4AeadLwmQikY3s5zHY5NZAoVE3yfsfOaD";
  let data = null;
  let error = null;

  //   const vaultId = "PlblrelOIxwuLUYAzSYjDZEGnTfLGUk4uQsORWlH4bg";
  //   const filePath = "uploads/a.jpeg";
  //   const fileData = fs.readFileSync(filePath);

  try {
    const { contentType, imageData } = await getImagefromUrl(url);
    console.log("imageData", imageData);
    if (!imageData) throw new Error("No image found");
    const response = await fetch(`https://api.akord.com/files`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Api-Key": API_KEY,
        "Content-Type": contentType?.toString() || "image/jpeg",
      },
      body: imageData,
    });

    const result = await response.json();
    console.log("File uploaded successfully:", result);
    data = result;
  } catch (e) {
    console.error("Error uploading to Arweave:", error);
    error = e;
  }
  return { data, error };
};

export const getAllVaults = async (API_KEY: string) => {
  let vaults = [];
  let error = null;
  try {
    const vaultsResponse = await fetch("https://api.akord.com/vaults", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Api-Key": API_KEY,
      },
    });
    const vaultsData = await vaultsResponse.json();
    return (vaults = vaultsData);
  } catch (e) {
    error = e;
  }
  return { vaults, error };
};
