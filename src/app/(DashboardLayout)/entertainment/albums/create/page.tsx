"use client";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, Datepicker, FileInput, Label, Select, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const Page = () => {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null);
  const [enable, setEnable] = useState(true)
  const [complete, setComplete] = useState(false)
  const [minAge, setMinAge] = useState(0)
  const [tags, setTags] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [releasedAt, setReleasedAt] = useState(new Date())
  const [loading, setLoading] = useState(false);
  const [showFileRequiredError, setShowFileRequiredError] = useState<boolean>(false);

  type AlbumFormData = {
    title: string;
    description: string;
    release_at: Date;
    tags: string;
    enable: boolean;
    completed: boolean;
    min_age: Number;
    cover: File;
    images: FileList | null;
  }

  //!Create Album
  const createAlbum = async () => {
    setLoading(true)
    setShowFileRequiredError(false)
    if (selectedCover != null) {
      try {
        const albumData: AlbumFormData = {
          title: title,
          description: description,
          release_at: releasedAt, // Or new Date().toISOString() if you prefer using Date objects
          tags: tags,
          enable: enable,
          completed: complete,
          min_age: minAge,
          cover: selectedCover, // Assuming `selectedFile` is a File object
          images: selectedImages,
        };
        var formData = toFormData<AlbumFormData>(albumData)

        var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/album");

        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
          },
          body: formData,
        });
        if (res.status == 201) {
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
    } else {
      toast.error("Album image is required");
      setShowFileRequiredError(true)
      setLoading(false);
    }
  };
  return (
    <>
      <Toaster position="bottom-left" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <h5 className="card-title">Create Album</h5>
        <div className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-6 col-span-12">
              <div className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="album-cover" value="Album cover" />
                  </div>
                  <FileInput
                    id="album-cover"
                    accept="image/jpeg"
                    defaultValue={selectedCover?.name}
                    color={(showFileRequiredError ? true : undefined) && "failure"}
                    helperText={showFileRequiredError && "Please select cover"}
                    onChange={(e) => {
                      if (e.target.files != null) {
                        var file = e.target.files[0];
                        setShowFileRequiredError(false)
                        setSelectedCover(file);
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="album-images" value="Album Images" />
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
                    onChange={(event) => {
                      setTitle(event.target.value)
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
                    onChange={(event) => {
                      setDescription(event.target.value)
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
                    onChange={(event) => {
                      setTags(event.target.value)
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
                    value={minAge}
                    onChange={(event) => {
                      var a = event.target.value;
                      console.log(a);
                      try {
                        var age = parseInt(a, 10);
                        console.log(age);
                        if (age >= 0) {
                          setMinAge(age)
                        } else {
                          setMinAge(0)
                        }
                      } catch (error) {
                        setMinAge(0)
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="visibility" value="Visibility" />
                  </div>
                  <Select id="visibility" required className="select-rounded" onChange={(e) => {
                    if (e.target.value === "disable") {
                      setEnable(false)
                    } else {
                      setEnable(true)
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
                    if (e.target.value === "ongoing") {
                      setComplete(false)
                    } else {
                      setComplete(true)
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
                  <Datepicker id="releasedAt" className="z-50" defaultValue={releasedAt} onChange={(e) => {
                    if (e != null) {
                      setReleasedAt(e)
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="col-span-12 flex gap-3 justify-end">
              <Button disabled={loading} color={loading ? "muted" : "primary"} onClick={createAlbum}>Save</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
