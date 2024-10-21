"use client";;
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, FileInput, Label } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Page({ params }: {
  params: {
    uuid: string;
  }
}) {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  type AddAlbumImagesFormData = {
    images: FileList | null;
  }

  //!Edit Album
  const addAlbumImages = async () => {
    setLoading(true)
    try {
      const reqData: AddAlbumImagesFormData = {
        images: selectedImages
      };
      var formData = toFormData<AddAlbumImagesFormData>(reqData)

      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/album/").concat(params.uuid).concat("/add-images");

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'X-API-KEY': apiKey,
        },
        body: formData,
      });
      if (res.status == 201) {
        toast.success("Successfully Added");
        router.replace('/entertainment/albums');
      } else {
        toast.error("Something was wrong");
      }
    } catch (error) {
      toast.error("Something was wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Toaster position="bottom-left" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Edit Album</h5>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="album-images" value="New Album Images" />
                  </div>
                  <FileInput
                    id="album-images"
                    multiple
                    accept="image/jpeg"
                    defaultValue={selectedImages != null ? Array.from(selectedImages!).map(file => file.name) : ""}
                    onChange={(e) => {
                      if (e.target.files != null) {
                        setSelectedImages(e.target.files)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-span-12 flex gap-3 justify-end">
              <Button disabled={loading} color={loading ? "muted" : "primary"} onClick={addAlbumImages}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
