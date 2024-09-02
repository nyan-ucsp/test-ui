"use client";;
import { Alert, Button, Label, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import { encrypt } from "@/utils/encryption/encryption";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";


const AuthLogin = () => {
  const router = useRouter();
  interface ApiKeyData {
    apikey: string;
  }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [apikeydata, setApiKey] = useState<ApiKeyData>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    const timer = setTimeout(() => {
      setError(null);
    }, 1500);

    return () => clearTimeout(timer);
  }, [error]);


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (username === process.env.NEXT_PUBLIC_USER_NAME && password === process.env.NEXT_PUBLIC_PASSWORD) {
      // !set api key in git
      // fetchApiKey();
      // !set api key in local
      storeAPIKey()
    } else {
      setError('Invalid credentials');
      setIsLoading(false);
    }
  };

  const storeAPIKey = async () => {
    var apikey = process.env.NEXT_PUBLIC_API_KEY;
    if (apikey != null) {
      localStorage.setItem('api-key', encrypt({ data: apikey }));
      router.replace('/');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  const fetchApiKey = async () => {
    try {
      var url = process.env.NEXT_PUBLIC_API_KEY_URL ?? "";
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await res.json();
      setApiKey(result);
      if (apikeydata?.apikey != null) {
        localStorage.setItem('api-key', encrypt({ data: apikeydata?.apikey }));
      } else {
        setError('Something was wrong');
      }
    } catch (error) {
      console.error(error);
      setError('Something was wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="Username" value="Username" />
          </div>
          <TextInput
            id="username"
            type="text"
            sizing="md"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" value="Password" />
          </div>
          <TextInput
            id="userpwd"
            type="password"
            sizing="md"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="flex justify-between my-3" />
        {/* {error && <div className="text-red-500 text-center mb-2">{error}</div>} */}
        {error && <Alert color="failure" >
          <span className="font-medium" style={{ display: 'flex', alignItems: 'center' }}>
            <Icon icon="solar:info-circle-linear" height={16} />
            <span className="ml-2">{error}</span>
          </span>
        </Alert>}
        <div className="flex justify-between my-2" />
        <Button disabled={isLoading} color={isLoading ? "muted" : "primary"} type="submit" className="w-full">
          LogIn
        </Button>
      </form>

    </>
  );
};

export default AuthLogin;
