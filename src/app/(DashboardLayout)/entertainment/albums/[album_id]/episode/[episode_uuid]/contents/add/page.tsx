"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { bytesToHumanReadable } from "@/utils/converter/converter";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, FileInput, Label } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { FaFile } from "react-icons/fa6";

export default function Page({ params }: {
  params: {
    album_id: number;
    episode_uuid: string;
  }
}) {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [error, setError] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [episodeData, setEpisodeData] = useState<EpisodeData | null>(null);
  type AddAlbumImagesFormData = {
    episode_id: number;
    files: FileList | null;
  }

  type EpisodeData = {
    id: number | null;
    album_id: number,
    broken_at: string | null;
    bytes: number;
    content_type: string | null;
    created_at: string | null;
    height: number;
    width: number;
    title: string;
    updated_at: string | null;
    file_url: string | null;
    url: string | null;
    uuid: string;
  }

  useEffect(() => {
    fetchEpisode();
    setInitLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchEpisode = async () => {
    setLoading(true)
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/episode/").concat(params.episode_uuid);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      });
      const result = await res.json();
      setEpisodeData(result || null);
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

  //!Edit Album
  const addAlbumImages = async () => {
    setLoading(true)
    try {
      if (episodeData?.id) {
        const reqData: AddAlbumImagesFormData = {
          episode_id: episodeData?.id ?? 0,
          files: selectedImages,
        };
        var formData = toFormData<AddAlbumImagesFormData>(reqData)
        var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/content");
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
          },
          body: formData,
        });
        if (res.status == 201) {
          toast.success("Successfully Added");
          setTimeout(() => router.replace(`/entertainment/albums/${params.album_id}/episode/${params.episode_uuid}/contents`), 500);
        } else {
          toast.error("Something was wrong");
        }
      } else {
        setError("Episode not found")
      }
    } catch (error) {
      toast.error("Something was wrong");
    } finally {
      setLoading(false);
    }
  };


  if (initLoading) return <Loading />
  if (error != null || episodeData?.id == null) return <SomethingWasWrong message={error ?? "Something was wrong"} onPressedText="Reload" onPressed={() => fetchEpisode()} />
  return (
    <>
      <Toaster position="bottom-left" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between">
          <h5 className="card-title">Add Contents to Episode</h5>
          <div className="col-span-12 flex gap-3 justify-end">
            <Button disabled={loading} color={loading ? "muted" : "primary"} onClick={addAlbumImages}>Save</Button>
          </div>
        </div>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="episode-contents-images" value="New Contents" />
                  </div>
                  <FileInput
                    id="episode-contents-images"
                    multiple
                    defaultValue={selectedImages != null ? Array.from(selectedImages!).map(file => file.name) : []}
                    onChange={(e) => {
                      if (e.target.files != null) {
                        setSelectedImages(e.target.files)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        {selectedImages != null && selectedImages.length > 0 ?
          <div>
            {Array.from(selectedImages).map((file) => (
              <div key={file.name} className="relative">
                {/* Image Container */}

                <div>
                  {file.type == "image/jpeg" ?
                    URL.createObjectURL ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full max-h-full object-cover"
                      />
                    ) : (
                      <p>Image preview not available.</p>
                    )
                    : <div />}

                  {/* Text Overlay */}
                  <div className="flex item-center">
                    {file.type == "image/jpeg" ? <div /> : <FaFile size={32} className="mr-2 mt-1" />}
                    <div className={file.type == "image/jpeg" ? "absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white px-4 py-2" : ""}>
                      <p>File Name: {file.name}</p>
                      <p>File Size: {bytesToHumanReadable(file.size)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          : (
            <div />

          )}
      </div>
    </>
  );
}
