"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { decrypt } from "@/utils/encryption/encryption";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Alert, Button, Dropdown, Modal } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { MdAdd } from "react-icons/md";

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
  const [loading, setLoading] = useState(true);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [episodeContentsData, setEpisodeContentsData] = useState<EpisodesContentsData | null>(null);

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth <= 768); // Adjust the breakpoint as needed
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    fetchEpisodeContents();
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

  type ContentData = {
    id: number | null;
    ads_url: string | null,
    broken_at: string | null;
    bytes: number;
    content_type: string;
    episode_id: number;
    height: number;
    width: number;
    index_no: number;
    url: string;
    uuid: string;
  }
  type EpisodesContentsData = {
    data: ContentData[];
    total: number;
  };

  //? Delete Album Image
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);

  //!Fetch Contents
  const fetchEpisodeContents = async () => {
    setLoading(true)
    setError(null)
    setDeleteError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/contents/").concat(params.episode_uuid);
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      });
      const result = await res.json();
      setEpisodeContentsData(result || null);
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
        fetchEpisodeContents();
      } else {
        setDeleteError("Failed to delete episode");
      }
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

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
  if (error != null) return <SomethingWasWrong message={error} onPressedText="Reload" onPressed={() => fetchEpisodeContents()} />
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
          <h2 className="card-title">Contents</h2>
          <Button color="primary" href={`/entertainment/albums/${params.album_id}/episode/${params.episode_uuid}/contents/add`} as={Link}><MdAdd className="h-5 w-5" />Add</Button>
        </div>
        <div className="mt-6">
          {episodeContentsData != null && Array.isArray(episodeContentsData.data) && episodeContentsData.data.length > 0 ?
            episodeContentsData.data.map((episode, index) => (
              <div> //Todo </div>
            ))
            : (
              <div className="text-center">
                No contents available.
              </div>
            )}
        </div>
      </div>
    </>
  );
}
