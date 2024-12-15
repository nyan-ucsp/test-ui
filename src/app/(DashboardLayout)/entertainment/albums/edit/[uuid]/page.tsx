"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, Datepicker, FileInput, Label, Modal, Select, TextInput } from "flowbite-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdDelete, MdOutlineAddAPhoto } from "react-icons/md";

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
  const [initloading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [albumData, setAlbumData] = useState<AlbumData | null>(null);
  const [selectedAge, setSelectedAge] = useState<number | undefined>(undefined);
  const [albumEditData, setAlbumEditData] = useState<AlbumEditFormData | null>(null);

  function setEditData(result: any) {
    if (result != null) {
      var reqData: AlbumEditFormData = {
        title: result.title,
        description: result.description,
        released_at: new Date(result.released_at),
        broken_at: result.broken_at != null ? new Date(result.broken_at) : null,
        tags: result.tags,
        enable: result.enable,
        completed: result.completed,
        min_age: result.min_age,
        cover: null,
      }
      setAlbumEditData(reqData);
    }
  }


  useEffect(() => {
    fetchAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function goToAddAlbumImages() {
    router.push(`/entertainment/albums/edit/${params.uuid}/add-images`);
  }

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
    released_at: Date;
    broken_at: Date | null;
    tags: string;
    enable: boolean;
    completed: boolean;
    min_age: number;
    cover: File | null;
  }

  //? Delete Album Image
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);

  const removeAlbumImages = async (img_src: string) => {
    setError(null)
    setLoading(true)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/album/").concat(params.uuid).concat("/remove-images");
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify({ "images": [img_src] }),
      });
      if (res.status == 200) {
        fetchAlbum();
        toast.success("Successfully Deleted");
      }
    } catch (error) {
      toast.error("Failed to delete image");
    } finally {
      setLoading(false);
    }
  };

  //!Fetch Album
  const fetchAlbum = async () => {
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
      setSelectedAge(result.min_age);
      setEditData(result);
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setInitLoading(false);
    }
  };

  //!Edit Album
  const updateAlbum = async () => {
    setLoading(true)
    if (albumEditData != null) {
      try {
        var formData = toFormData<AlbumEditFormData>(albumEditData)

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
    } else {
      toast.error("Invalid reqest");
    }
  };
  if (initloading) return <Loading />
  if (albumData == null || albumEditData == null || error != null) <SomethingWasWrong message={error!} onPressedText={"Reload"} onPressed={() => fetchAlbum()} />
  return (
    <>
      <Toaster position="bottom-left" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Album Images</h2>
          <div />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {
            albumData?.images != null && albumData.images.length ?
              albumData.images.map((item, index) => (
                <div style={{ position: 'relative', display: 'inline-block', width: '20%' }}>
                  <img src={`${static_url}${item}`} alt={albumData.uuid} style={{ width: '100%', height: 'auto', objectFit: 'cover' }} />
                  <button
                    onClick={() => {
                      setOpenDeleteModal(item)
                    }}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: 'red',
                      border: 'none',
                      borderRadius: '50%',
                      color: 'white',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <MdDelete className="h-3 w-3" />
                  </button>
                </div>
              ))
              : <h4>Empty images</h4>
          }

        </div>
        <div className="col-span-12 flex gap-3 justify-end mt-8">
          <Button color="primary" onClick={goToAddAlbumImages}><MdOutlineAddAPhoto className="h-5 w-5" />Add More</Button>
        </div>
      </div>
      <Modal show={openDeleteModal != null} size="md" onClose={() => setOpenDeleteModal(null)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this image?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => {
                setOpenDeleteModal(null)
                removeAlbumImages(openDeleteModal!);
              }}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenDeleteModal(null)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      <div className="mt-8" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Edit Album</h2>
          <div />
        </div>
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
                    defaultValue={albumEditData?.title}
                    onChange={(event) => {
                      var data = albumEditData!;
                      data.title = event.target.value;
                      setAlbumEditData(data)
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
                    defaultValue={albumEditData?.description}
                    onChange={(event) => {
                      var data = albumEditData!;
                      data.description = event.target.value;
                      setAlbumEditData(data)
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
                    defaultValue={albumEditData?.tags}
                    onChange={(event) => {
                      var data = albumEditData!;
                      data.tags = event.target.value;
                      setAlbumEditData(data)
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
                    defaultValue={selectedAge}
                    value={selectedAge}
                    onChange={(event) => {
                      if (albumEditData != null) {
                        var a = event.target.value;
                        try {
                          var age = parseInt(a, 10);
                          if (age >= 0) {
                            setSelectedAge(age);
                            setAlbumEditData({
                              ...albumEditData,
                              min_age: age,
                            })
                          } else {
                            setSelectedAge(undefined);
                            setAlbumEditData({
                              ...albumEditData,
                              min_age: 0,
                            })
                          }
                        } catch (error) {
                          setSelectedAge(undefined);
                          setAlbumEditData({
                            ...albumEditData,
                            min_age: 0,
                          })
                        }
                      }
                    }}
                  />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="visibility" value="Visibility" />
                  </div>
                  <Select
                    value={(albumEditData?.enable ?? true) ? "enable" : "disable"} id="visibility"
                    required
                    className="select-rounded"
                    onChange={(e) => {
                      if (albumEditData != null) {
                        if (e.target.value === "disable") {
                          setAlbumEditData({
                            ...albumEditData,
                            enable: false,
                          })
                        } else {
                          setAlbumEditData({
                            ...albumEditData,
                            enable: true,
                          })
                        }
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
                  <Select id="type"
                    value={(albumEditData?.completed ?? true) ? "completed" : "ongoing"}
                    required
                    className="select-rounded"
                    onChange={(e) => {
                      if (albumEditData != null) {
                        if (e.target.value === "ongoing") {
                          setAlbumEditData({
                            ...albumEditData,
                            completed: false,
                          })
                        } else {
                          setAlbumEditData({
                            ...albumEditData,
                            completed: true,
                          })
                        }
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
                  <Datepicker id="releasedAt"
                    className="z-50"
                    value={albumEditData?.released_at}
                    onChange={(e) => {
                      if (e != null && albumEditData != null) {
                        setAlbumEditData({
                          ...albumEditData,
                          released_at: e,
                        })
                      }
                    }} />
                </div>
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="brokenAt" value="Broken At" />
                  </div>
                  <Datepicker
                    id="brokenAt"
                    key={albumEditData?.broken_at == null ? "with-value" : "no-value"}
                    value={albumEditData?.broken_at}
                    unselectable="on"
                    placeholder="Please select a date"
                    onChange={(e) => {
                      if (albumEditData != null) {
                        setAlbumEditData({
                          ...albumEditData,
                          broken_at: e,
                        })
                      }
                    }}
                  />
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
}
