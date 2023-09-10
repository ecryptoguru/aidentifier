"use client";
import { useState } from "react";

interface IdentifiedObject {
  label: string;
  mask: string;
  score: number;
}

export default function Home() {
  const [theFile, setTheFile] = useState<File | undefined>(undefined);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<IdentifiedObject[]>([]);
  const [toShow, setToShow] = useState<IdentifiedObject | undefined>(undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Make sure we have a file
    const file = event.currentTarget.files?.[0];
    if (!file) return;
  
    // Update the state variable accordingly
    setTheFile(file);
  
    // Get the file's data url and set it as the image preview
    const blobUrl = URL.createObjectURL(file);
    setImagePreview(blobUrl);
  };

  const identifyThings = async () => {
    // Make sure we have a file to work with
    if (!theFile) return;
  
    // Start the loading indicator
    setIsLoading(true);
  
    // Prepare data to send to our backend
    const formData = new FormData();
    formData.set("theImage", theFile);
  
    try {
      // Call our backend API - which further calls Hugging Face
      const response = await fetch("/api", {
        method: "POST",
        body: formData,
      });
  
      // If the API call was successful, set the response
      if (response.ok) {
        console.log("File uploaded successfully");
        const theResponse = await response.json();
        console.log(theResponse);
        setApiResponse(theResponse.body);
      } else {
        console.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error occurred during API call:", error);
    }
  
    setIsLoading(false);
  };

  function toggleThis(label: string) {
    const showThis = apiResponse.find((obj) => obj.label === label);
    setToShow((prev: IdentifiedObject | undefined) => {
      if (prev === showThis) {
        return undefined;
      }
      return showThis || undefined;
    });
  }

  return (
    <main className="flex min-h-screen bg-gray-900 flex-col items-center justify-between px-24 py-12">
      <h1 className=" text-5xl mb-4">AI-dentifier</h1>
      <div className="mb-4">
        This is a project that uses Facebook's DEtection TRansformer (DETR)
        model trained end-to-end on COCO 2017 panoptic (118k annotated images).
      </div>
  
      {/* Accept image upload input */}
      <input
        type="file"
        className="border p-2 rounded-sm border-gray-600"
        onChange={handleFileChange}
        accept="image/*"
      />
  
      <div className="w-80 h-80 relative placeholderdiv">
        {/* Preview the image */}
        {imagePreview && (
          <img src={imagePreview} className=" object-contain absolute z-0" />
        )}
  
        {/* Show the masked image if an identified object is selected */}
        {toShow && (
          <img
            src={`data:image/png;base64,${toShow.mask}`}
            className="object-contain absolute z-20 mix-blend-screen invert"
          />
        )}
      </div>
  
      {/* Make the API call to identify objects */}
      {theFile && (
        <button
          className="bg-blue-600 px-5 py-1 rounded-sm disabled:cursor-not-allowed disabled:bg-blue-900 transition-colors"
          onClick={identifyThings}
          disabled={isLoading}
        >
          {isLoading ? "loading..." : "Go!"}
        </button>
      )}
  
      {/* Display a list of all identified objects */}
      {apiResponse && (
        <div className="mt-12 ">
          <div className="mb-4">Identified objects: </div>
          <div className="flex">
            {apiResponse.map((e) => (
              <div className="mx-2" key={e.label}>
                <button
                  className="px-4 py-1 bg-blue-600 rounded-md"
                  onClick={() => toggleThis(e.label)}
                >
                  {e.label}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}