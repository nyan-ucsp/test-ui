"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { bytesToHumanReadable } from "@/utils/converter/converter";
import { formatToLocalDateTime } from "@/utils/date_helper/datehelper";
import { decrypt } from "@/utils/encryption/encryption";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, Button, Dropdown, Modal } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { FaFileArrowDown, FaLink } from "react-icons/fa6";
import { HiOutlineDotsVertical, HiOutlineExclamationCircle } from "react-icons/hi";
import { MdOutlineCreateNewFolder } from "react-icons/md";

export default function Page({ params }: {
  params: {
    id: number;
  }
}) {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filterEpisodeTitle, setFilterEpisodeTitle] = useState<string>("");
  const [episodesData, setEpisodesData] = useState<EpisodesData | null>(null);


  useEffect(() => {
    fetchEpisodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeleteSuccess(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [deleteSuccess]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeleteError(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [deleteError]);

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
  type EpisodesData = {
    data: EpisodeData[];
    total: number;
  };

  //? Delete Album Image
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);

  //!Fetch Album
  const fetchEpisodes = async () => {
    setLoading(true)
    setError(null)
    setDeleteError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/episodes/").concat(params.id.toString());
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify({ "title": filterEpisodeTitle }),
      });
      const result = await res.json();
      setEpisodesData(result || null);
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteEpisode = async (uuid: string) => {
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/episode/").concat(uuid);
      const res = await fetch(url, {
        method: 'Delete',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      });
      if (res.status == 204) {
        setDeleteSuccess("Successfully Deleted");
        fetchEpisodes();
      } else {
        setDeleteError("Failed to delete episode");
      }
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

  function handleFileClick(episode: EpisodeData) {
    if (episode.url != null && episode.content_type != null && episode.content_type.trim() != "") {
      var file_url = static_url.concat(episode.url!);
      if (episode.content_type === 'image/jpeg' || episode.content_type === 'image/png') {
        window.open(file_url, '_blank');
      } else if (episode.content_type === 'application/pdf') {
        window.open(file_url, '_blank');
      } else {
        const a = document.createElement('a');
        a.href = file_url;
        a.download = 'file.download'; // You can customize the download filename
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } else if (episode.file_url != null && episode.file_url.trim() != "") {
      window.open(episode.file_url, '_blank');
    }

  }

  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:pen-new-square-broken",
      listtitle: "Edit",
    },
    {
      icon: "solar:trash-bin-minimalistic-outline",
      listtitle: "Delete",
    },
  ];
  if (loading) return <Loading />
  if (error != null) return <SomethingWasWrong message={error} onPressedText="Reload" onPressed={() => fetchEpisodes()} />
  return (
    <>
      <Toaster position="bottom-left" />
      <Modal show={openDeleteModal != null} size="md" onClose={() => setOpenDeleteModal(null)} popup>
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this episode?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => {
                setOpenDeleteModal(null)
                deleteEpisode(openDeleteModal!);
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
      {error && <Alert color="failure" >
        <span className="font-medium" style={{ display: 'flex', alignItems: 'center' }}>
          <Icon icon="solar:info-circle-linear" height={16} />
          <span className="ml-2">{error}</span>
        </span>
      </Alert>}
      {deleteSuccess &&
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <span className="font-medium" style={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="solar:info-circle-linear" height={16} />
            <span className="ml-2">{deleteSuccess}</span>
          </span>
        </div>}
      {deleteError &&
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '10px 15px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
          }}
        >
          <span className="font-medium" style={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="solar:info-circle-linear" height={16} />
            <span className="ml-2">{deleteError}</span>
          </span>
        </div>}
      <div className="mt-8" />
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Episodes</h2>
          <Button color="primary" href={`/entertainment/albums/${params.id}/create_episode`} as={Link}><MdOutlineCreateNewFolder className="h-5 w-5" />Create</Button>
        </div>
        <div className="mt-6">
          {episodesData != null && Array.isArray(episodesData.data) && episodesData.data.length > 0 ?
            episodesData.data.map((episode, index) => (
              <div className="border border-ld rounded-lg px-6 py-4 mb-6">
                <div className="flex justify-between items-center"><h6 className="font-semibold text-base">{episode.title}</h6>
                  <div className="flex justify-between items-center">
                    <p className="ml-2">{formatToLocalDateTime(episode.created_at)}</p>
                    <Dropdown
                      label=""
                      dismissOnClick={false}
                      renderTrigger={() => (
                        <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                          <HiOutlineDotsVertical size={22} />
                        </span>
                      )}
                    >
                      {tableActionData.map((items, index) => (
                        <Dropdown.Item key={index} className="flex gap-3" onClick={() => {
                          if (index == 0) {
                            router.push(`/entertainment/albums/${params.id}/edit_episode/${episode.uuid}`);
                          }
                          if (index == 1) {
                            setOpenDeleteModal(episode.uuid);
                          }
                        }}>
                          {" "}
                          <Icon icon={`${items.icon}`} height={18} />
                          <span>{items.listtitle}</span>
                        </Dropdown.Item>

                      ))}
                    </Dropdown></div>
                </div>
                {(episode.content_type != null && episode.content_type?.trim() != "") ?
                  <div className="mt-2 flex items-center cursor-pointer" onClick={() => handleFileClick(episode)}>
                    <FaFileArrowDown size={24} />
                    <div className="w-2" />
                    <div > <p >{episode.content_type}</p> <p>{bytesToHumanReadable(episode.bytes)}</p> </div>
                  </div>
                  : (episode.file_url != null && episode.file_url?.trim() != "") ?
                    <div className="mt-2 flex items-center cursor-pointer" onClick={() => handleFileClick(episode)}>
                      <FaLink size={24} />
                      <div className="w-2" />
                      <p >{episode.file_url}</p>
                    </div>
                    : <div />}
              </div>
            ))
            : (
              <div className="text-center">
                No episodes available.
              </div>
            )}
        </div>
      </div>
    </>
  );
}
