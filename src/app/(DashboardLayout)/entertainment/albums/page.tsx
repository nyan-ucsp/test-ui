"use client";;
import { Alert, Badge, Button, Dropdown, Label, Modal, Pagination, Select, TextInput } from "flowbite-react";
import { HiOutlineDotsVertical, HiOutlineExclamationCircle } from "react-icons/hi";
import { Icon } from "@iconify/react";
import { Table } from "flowbite-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import Loading from "../../layout/shared/loading/Loading";
import { decrypt } from "@/utils/encryption/encryption";
import SomethingWasWrong from "../../layout/shared/reload/something_was_wrong";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FilterData = {
  completed: boolean | null;
  enable: boolean | null;
  broken: boolean | null;
  id: number;
  limit: number;
  min_age: number;
  offset: number;
  tags: string;
  title: string;
  uuid: string;
};

type ResponseData = {
  data: AlbumData[]
  total: number;
};

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
  content_type: string;
  width: number;
  height: number;
  bytes: number;
  released_at: string;
  broken_at: string | null;
  created_at: string;
  updated_at: string | null;
};

const Albums = () => {
  const router = useRouter();
  var static_url = (process.env.NEXT_PUBLIC_STATIC_API_URL ?? "");
  var chiperText = localStorage.getItem('api-key') ?? "";
  var apiKey = decrypt({ data: chiperText })
  const [responseData, setResponseData] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [filterData, setFilterData] = useState<FilterData>({
    completed: null,
    enable: null,
    broken: null,
    id: 0,
    limit: itemsPerPage,
    min_age: 0,
    offset: (currentPage - 1) * itemsPerPage,
    tags: "",
    title: "",
    uuid: "",
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeleteSuccess(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [deleteSuccess]);

  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<string | null>(null);

  function onCloseFilterModal() {
    setOpenFilterModal(false);
  }

  const isFiltering = () => {
    return filterData.completed != null || filterData.enable != null || filterData.broken != null || filterData.id != 0 || filterData.min_age != 0 || filterData.tags != "" || filterData.title != "" || filterData.uuid != ""
  };

  const resetFiltering = () => {
    filterData.completed = null; filterData.enable = null; filterData.broken = null; filterData.id = 0; filterData.min_age = 0; filterData.tags = ""; filterData.title = ""; filterData.uuid = "";
    setFilterData(filterData);
    fetchAlbums();
    setOpenFilterModal(false);
  };

  const filtering = () => {
    fetchAlbums();
    setOpenFilterModal(false);
  };

  //!Fetch Albums
  const fetchAlbums = async () => {
    setLoading(true)
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/albums");
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(filterData),
      });
      const result = await res.json();
      setResponseData(result || null);
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

  const deleteAlbums = async (uuid: string) => {
    setError(null)
    try {
      var url = (process.env.NEXT_PUBLIC_API_URL ?? "").concat("/album/").concat(uuid);
      const res = await fetch(url, {
        method: 'Delete',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
        body: JSON.stringify(filterData),
      });
      if (res.status == 204) {
        setDeleteSuccess("Successfully Deleted");
        fetchAlbums();
      }
    } catch (error) {
      setError("Something was wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let limit = Number(event.target.value);
    filterData.limit = limit;
    setItemsPerPage(limit);
  };

  useEffect(() => {
    fetchAlbums();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  const onPageChange = (page: number) => {
    filterData.offset = (page - 1) * filterData.limit;
    setCurrentPage(page);
  };

  /*Table Action*/
  const tableActionData = [
    {
      icon: "solar:document-text-outline",
      listtitle: "Detail",
    },
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
  if (error != null) return <SomethingWasWrong message={error} onPressedText="Reload" onPressed={() => fetchAlbums()} />
  return (
    <>
      <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6  relative w-full break-words">
        <div className="flex justify-between items-center">
          <h2 className="card-title">Albums</h2>
          <Button color="primary" href="/entertainment/albums/create" as={Link}><MdOutlineCreateNewFolder className="h-5 w-5" />Create</Button>
        </div>
        <div className="mt-3">
          <div className="overflow-x-auto pt-8">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell className="p-6">Album</Table.HeadCell>
                <Table.HeadCell>Type</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>
                  <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer relative">
                    <Icon icon="flowbite:filter-outline" height={20} onClick={() => setOpenFilterModal(true)} />
                    <Modal show={openFilterModal} size="md" onClose={onCloseFilterModal} popup>
                      <Modal.Header />
                      <Modal.Body>
                        <div className="space-y-6">
                          <h3 className="text-xl font-medium text-gray-900 dark:text-white">Filter Albums</h3>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="title" value="Title" />
                            </div>
                            <div>
                              <TextInput
                                id="title"
                                placeholder="Title"
                                defaultValue={filterData.title}
                                onChange={(event) => {
                                  var data = filterData;
                                  data.title = event.target.value;
                                  setFilterData(data)
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="uuid" value="UUID" />
                            </div>
                            <div>
                              <TextInput
                                id="uuid"
                                placeholder="UUID"
                                defaultValue={filterData.uuid}
                                onChange={(event) => {
                                  var data = filterData;
                                  data.uuid = event.target.value;
                                  setFilterData(data)
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="type" value="Type" />
                            </div>
                            <div>
                              <Select id="type" required className="select-rounded" defaultValue={filterData.completed != null ? filterData.completed ? 2 : 1 : 0} onChange={(event) => {
                                var data = filterData;
                                switch (event.target.value) {
                                  case "1":
                                    data.completed = false;
                                    break;
                                  case "2":
                                    data.completed = true;
                                    break;
                                  default:
                                    data.completed = null;
                                    break;
                                }
                                setFilterData(data)
                              }}>
                                <option value={0}>None</option>
                                <option value={1}>Ongoing</option>
                                <option value={2}>Complete</option>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="enable" value="Visibility" />
                            </div>
                            <div>
                              <Select id="enable" required className="select-rounded" defaultValue={filterData.enable != null ? filterData.enable ? 2 : 1 : 0} onChange={(event) => {
                                var data = filterData;
                                switch (event.target.value) {
                                  case "1":
                                    data.enable = false;
                                    break;
                                  case "2":
                                    data.enable = true;
                                    break;
                                  default:
                                    data.enable = null;
                                    break;
                                }
                                setFilterData(data)
                              }}>
                                <option value={0}>None</option>
                                <option value={1}>Disable</option>
                                <option value={2}>Enable</option>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <div className="mb-2 block">
                              <Label htmlFor="broken" value="Status" />
                            </div>
                            <div>
                              <Select id="broken" required className="select-rounded" defaultValue={filterData.broken != null ? filterData.broken ? 2 : 1 : 0} onChange={(event) => {
                                var data = filterData;
                                switch (event.target.value) {
                                  case "1":
                                    data.broken = false;
                                    break;
                                  case "2":
                                    data.broken = true;
                                    break;
                                  default:
                                    data.broken = null;
                                    break;
                                }
                                setFilterData(data)
                              }}>
                                <option value={0}>None</option>
                                <option value={1}>Good</option>
                                <option value={2}>Broken</option>
                              </Select>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <Button color={"red"} onClick={resetFiltering} className="w-fit mt-8 mx-auto">Clear Filter</Button>
                            <Button color={"primary"} onClick={filtering} className="w-fit mt-8 mx-auto">Filter</Button>
                          </div>
                        </div>
                      </Modal.Body>
                    </Modal>
                    {isFiltering() && <Badge className="h-2 w-2 rounded-full absolute end-2 top-1 bg-red-500 p-0"></Badge>}
                  </span>
                </Table.HeadCell>
              </Table.Head>

              <Table.Body className="divide-y divide-border dark:divide-darkborder">
                {responseData != null && Array.isArray(responseData.data) && responseData.data.length > 0 ?
                  responseData.data.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell className="whitespace-nowrap ps-6">
                        <div className="flex gap-3 items-center">
                          <Image
                            src={static_url.concat(item.url)}
                            width={60}
                            height={0}
                            alt="icon"
                            className="rounded-md"
                            style={{ height: 'auto', width: 'auto' }}
                          />
                          <div className="truncat line-clamp-2 sm:text-wrap max-w-56">
                            <h5 className="text-md">{item.title}</h5>
                            <p className="text-sm">{item.description}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={item.completed ? `green` : `blue`}>
                          {item.completed ? "Completed" : "Ongoing"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={item.broken_at != null ? `red` : item.enable ? `green` : `amber`}>
                          {item.broken_at != null ? "Broken" : item.enable ? "Enable" : "Disable"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Dropdown
                          label=""
                          className="z-60"
                          dismissOnClick={false}
                          renderTrigger={() => (
                            <span className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                              <HiOutlineDotsVertical size={22} />
                            </span>
                          )}
                        >
                          {tableActionData.map((items, index) => (
                            <Dropdown.Item key={index}
                              className="flex gap-3 p-2 relative"
                              onClick={() => {
                                if (index == 0) {
                                  router.push(`/entertainment/albums/details/${item.uuid}`);
                                }
                                if (index == 1) {
                                  router.push(`/entertainment/albums/edit/${item.uuid}`);
                                }
                                if (index == 2) {
                                  setOpenDeleteModal(item.uuid);
                                }
                              }}>
                              {" "}
                              <Icon icon={`${items.icon}`} height={18} />
                              <span>{items.listtitle}</span>
                            </Dropdown.Item>

                          ))}
                        </Dropdown>
                      </Table.Cell>
                    </Table.Row>
                  ))
                  : (
                    <Table.Row>
                      <Table.Cell colSpan={4} className="text-center">
                        No albums available.
                      </Table.Cell>
                    </Table.Row>
                  )}
              </Table.Body>
            </Table>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Select id="countries" required className="select-rounded" value={itemsPerPage} onChange={handleItemsPerPageChange}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Select>
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil((responseData?.total ?? 0) / itemsPerPage)} // Make sure you use totalPages instead of totalPage unless it's a typo.
              onPageChange={onPageChange}
            />
          </div>
          <Modal show={openDeleteModal != null} size="md" onClose={() => setOpenDeleteModal(null)} popup>
            <Modal.Header />
            <Modal.Body>
              <div className="text-center">
                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this album?
                </h3>
                <div className="flex justify-center gap-4">
                  <Button color="failure" onClick={() => {
                    setOpenDeleteModal(null)
                    deleteAlbums(openDeleteModal!);
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
        </div>
      </div >
    </>
  );
};

export default Albums;
