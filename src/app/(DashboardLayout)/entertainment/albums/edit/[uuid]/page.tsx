"use client";
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, Datepicker, FileInput, Label, Select, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [releasedAt, setReleasedAt] = useState(new Date())
  const [brokenAt, setBrokenAt] = useState<Date | null>(null)
  const [initloading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState<AlbumData | null>(null);

  useEffect(() => {
    fetchAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  type AlbumData = {
    id: number;
    uuid: string;
    title: string;
    description: string;
    completed: boolean;
    tags: string;
    enable: boolean;
    min_age: number;
    url: string;
    images: string[];
    content_type: string;
    width: number;
    height: number;
    bytes: number;
    released_at: string;
    broken_at: string | null;
    created_at: string;
    updated_at: string | null;
  };

  type AlbumEditFormData = {
    title: string;
    description: string;
    releasedAt: Date;
    brokenAt: Date | null;
    tags: string;
    enable: boolean;
    completed: boolean;
    minAge: number;
    cover: File | null;
  }

  //!Fetch Album
  const fetchAlbum = async () => {
    setInitLoading(true)
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/albums/").concat(params.uuid);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      });
      const result = await res.json();
      setAlbumData(result || null);
      if (albumData != null) {
        const parsedDate = new Date(albumData.released_at)
        setReleasedAt(parsedDate)
      }
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setInitLoading(false);
    }
  };

  //!Edit Album
  const updateAlbum = async () => {
    setLoading(true)
    try {
      const reqData: AlbumEditFormData = {
        title: albumData?.title ?? "",
        description: albumData?.description ?? "",
        releasedAt: releasedAt, // Or new Date().toISOString() if you prefer using Date objects
        brokenAt: brokenAt,
        tags: albumData?.tags ?? "",
        enable: albumData?.enable ?? true,
        completed: albumData?.completed ?? false,
        minAge: albumData?.min_age ?? 0,
        cover: selectedCover
      };
      var formData = toFormData<AlbumEditFormData>(reqData)

      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/album/").concat(params.uuid);

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'X-API-KEY': apiKey,
        },
        body: formData,
      });
      if (res.status == 200) {
        toast.success("Successfully Created");
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
  if (initloading) return <Loading />
  if (albumData == null || error != null) <SomethingWasWrong message={error!} onPressedText={"Reload"} onPressed={() => fetchAlbum()} />
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
                    <Label htmlFor="album-cover" value="New album cover" />
                  </div>
                  <FileInput
                    id="album-cover"
                    accept="image/jpeg"
                    defaultValue={selectedCover?.name}
                    onChange={(e) => {
                      if (e.target.files != null) {
                        var file = e.target.files[0];
                        setSelectedCover(file);
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="title" value="Title" />
                  </div>
                  <TextInput
                    id="title"
                    type="text"
                    placeholder="Title"
                    required
                    className="form-control"
                    defaultValue={albumData?.title}
                    onChange={(event) => {
                      var data = albumData!;
                      data.title = event.target.value;
                      setAlbumData(data)
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="description" value="Description" />
                  </div>
                  <TextInput
                    id="description"
                    type="text"
                    placeholder="Description"
                    required
                    className="form-control"
                    defaultValue={albumData?.description}
                    onChange={(event) => {
                      var data = albumData!;
                      data.description = event.target.value;
                      setAlbumData(data)
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="tags" value="Tags" />
                  </div>
                  <TextInput
                    id="tags"
                    type="text"
                    placeholder="#action"
                    className="form-control"
                    defaultValue={albumData?.tags}
                    onChange={(event) => {
                      var data = albumData!;
                      data.tags = event.target.value;
                      setAlbumData(data)
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="min-age" value="Minimum Age" />
                  </div>
                  <TextInput
                    id="min-age"
                    type="number"
                    placeholder="Minimum Age"
                    required
                    className="form-control"
                    defaultValue={albumData?.min_age}
                    value={albumData?.min_age}
                    onChange={(event) => {
                      var data = albumData!;
                      var a = event.target.value;
                      try {
                        var age = parseInt(a, 10)
                        if (age >= 0) {
                          data.min_age = age;
                          setAlbumData(data)
                        } else {
                          data.min_age = 0;
                          setAlbumData(data)
                        }
                      } catch (error) {
                        data.min_age = 0;
                        setAlbumData(data)
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="visibility" value="Visibility" />
                  </div>
                  <Select id="visibility" required className="select-rounded" onChange={(e) => {
                    var data = albumData!;
                    if (e.target.value === "disable") {
                      data.enable = false;
                      setAlbumData(data);
                    } else {
                      data.enable = true;
                      setAlbumData(data);
                    }
                  }}>
                    <option value="enable">Enable</option>
                    <option value="disable">Disable</option>
                  </Select>
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="type" value="Type" />
                  </div>
                  <Select id="type" required className="select-rounded" onChange={(e) => {
                    var data = albumData!;
                    if (e.target.value === "ongoing") {
                      data.completed = false;
                      setAlbumData(data);
                    } else {
                      data.completed = true;
                      setAlbumData(data);
                    }
                  }}>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </Select>
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="releasedAt" value="Released At" />
                  </div>
                  <Datepicker id="releasedAt" className="z-50" defaultValue={releasedAt?.toDateString()} onChange={(e) => {
                    if (e.target.valueAsDate != null) {

                      setReleasedAt(e.target.valueAsDate)
                    }
                  }} />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="brokenAt" value="Broken At" />
                  </div>
                  <Datepicker id="brokenAt" className="z-50" defaultValue={brokenAt?.toDateString()} onChange={(e) => {
                    if (e.target.valueAsDate != null) {
                      setBrokenAt(e.target.valueAsDate)
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="col-span-12 flex gap-3 justify-end">
              <Button disabled={loading} color={loading ? "muted" : "primary"} onClick={updateAlbum}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
