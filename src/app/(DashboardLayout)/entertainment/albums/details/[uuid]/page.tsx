"use client";;
import Loading from "@/app/(DashboardLayout)/layout/shared/loading/Loading";
import SomethingWasWrong from "@/app/(DashboardLayout)/layout/shared/reload/something_was_wrong";
import { decrypt } from "@/utils/encryption/encryption";
import { toFormData } from "@/utils/formdata/toformdata";
import { Button, FileInput, Label } from "flowbite-react";
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
        } catch (error) {
            setError("Something was wrong");
        } finally {
            setInitLoading(false);
        }
    };


    if (initloading) return <Loading />
    if (albumData == null || error != null) <SomethingWasWrong message={error!} onPressedText={"Reload"} onPressed={() => fetchAlbum()} />
    return (
        <>
            <Toaster position="bottom-left" />
            <div className="rounded-lg dark:shadow-dark-md shadow-md bg-white dark:bg-darkgray p-6 relative w-full break-words">
                <h5 className="card-title">Album Details</h5>
                <div className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-6 col-span-12">
                            {/* <div className="flex flex-col gap-4">
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
                            </div> */}
                        </div>
                        <div className="col-span-12 flex gap-3 justify-end">
                            <Button disabled={loading} color={loading ? "muted" : "primary"}>Save</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
