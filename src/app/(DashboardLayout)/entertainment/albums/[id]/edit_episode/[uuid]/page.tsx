"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, FileInput, Label, Radio, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function Page({ params }: {
  params: {
    id: number;
    uuid: string;
  }
}) {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [error, setError] = useState<string | null>(null);
  const [initloading, setInitLoading] = useState(true);
  const [editEpisodeFormData, setEditEpisodeFormData] = useState<EditEpisodeFormData | null>(null);
  const [selectedType, setSelectedType] = useState<string>("None");
  const [loading, setLoading] = useState(false);

  function setEditData(result: any) {
    if (result != null) {
      var reqData: EditEpisodeFormData = {
        title: result.title,
        file: null,
        file_url: result.file_url
      }
      if (reqData.file_url != null && reqData.file_url.trim() != "") {
        setSelectedType("URL");
      } else if (result.content_type != null && result.content_type.trim() != "") {
        setSelectedType("File");
      } else {
        setSelectedType("None");
      }
      setEditEpisodeFormData(reqData);
    }
  }

  type EditEpisodeFormData = {
    file: File | null;
    file_url: string | undefined;
    title: string;
  }

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value);
  };

  useEffect(() => {
    fetchEpisode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  // //!Fetch Album
  const fetchEpisode = async () => {
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/episode/").concat(params.uuid);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      });
      try {
        const result = await res.json();
        setEditData(result);
      } catch (error) {
        setError("Something was wrong")
      }
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setInitLoading(false);
    }
  };

  //!Edit Episode
  const saveClick = async (event: React.FormEvent) => {
    event.preventDefault();
    setInitLoading(true);
    try {
      var formData = toFormData<EditEpisodeFormData>(editEpisodeFormData!)

      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/episodes/").concat(params.uuid);

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'X-API-KEY': apiKey,
        },
        body: formData,
      });
      if (res.status == 200) {
        toast.success("Successfully Updated");
        setTimeout(() => router.replace(`/entertainment/albums/details/${params.id}`), 500);
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
  if (error != null || editEpisodeFormData == null) <SomethingWasWrong message={error!} onPressedText={"Reload"} onPressed={() => fetchEpisode()} />
  return (
    <>
      <Toaster position="bottom-left" />
      <form onSubmit={saveClick}>
        <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
          <h5 className="card-title">Edit Episode</h5>
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-6 col-span-12">
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="mb-2 block">
                      <Label htmlFor="episode-name" value="Name" />
                    </div>
                    <div>
                      <TextInput
                        id="episode-name"
                        required
                        placeholder="Episode Name"
                        defaultValue={editEpisodeFormData?.title}
                        onChange={(event) => {
                          var data = editEpisodeFormData!;
                          data.title = event.target.value;
                          setEditEpisodeFormData(data)
                        }}
                      />
                    </div>
                  </div>
                  <fieldset className="flex max-w-md flex-row gap-4">
                    <legend className="mb-4">Choose your episode type</legend>
                    <div className="flex items-center gap-2">
                      <Radio id="none" name="episode-type" value="None" checked={selectedType === 'None'} onChange={handleTypeChange} />
                      <Label htmlFor="none">None</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio id="file" name="episode-type" value="File" checked={selectedType === 'File'} onChange={handleTypeChange} />
                      <Label htmlFor="file">File</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Radio id="url" name="episode-type" value="URL" checked={selectedType === 'URL'} onChange={handleTypeChange} />
                      <Label htmlFor="url">Recirect URL</Label>
                    </div>
                  </fieldset>
                  {selectedType == "File" ?
                    <div>
                      <div className="mb-2 block">
                        <Label htmlFor="episode-file" value="New File" />
                      </div>
                      <FileInput
                        id="episode-file"
                        required
                        defaultValue={editEpisodeFormData?.file?.name}
                        onChange={(e) => {
                          if (e.target.files != null) {
                            var file = e.target.files[0];
                            var data = editEpisodeFormData!;
                            data.file = file;
                            setEditEpisodeFormData(data)
                          }
                        }}
                      />
                    </div>
                    : selectedType == "URL" ?
                      <div>
                        <div className="mb-2 block">
                          <Label htmlFor="episode-url" value="URL" />
                        </div>
                        <div>
                          <TextInput
                            id="episode-url"
                            required
                            placeholder="Episode File URL"
                            defaultValue={editEpisodeFormData?.file_url}
                            onChange={(event) => {
                              var data = editEpisodeFormData!;
                              data.file_url = event.target.value;
                              setEditEpisodeFormData(data)
                            }}
                          />
                        </div>
                      </div>
                      : <div />
                  }
                </div>
              </div>
              <div className="col-span-12 flex gap-3 justify-end">
                <Button disabled={loading} color={loading ? "muted" : "primary"} type="submit">Save</Button>
              </div>
            </div>
          </div>
        </div>
      </form >
    </>
  );
}
