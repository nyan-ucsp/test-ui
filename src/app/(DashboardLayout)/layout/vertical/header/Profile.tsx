
import { Button, Dropdown } from "flowbite-react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
const Profile = () => {
  const router = useRouter();
  const logoutClick = async () => {
    try {
      localStorage.removeItem("api-key");
    } catch (error) {
    } finally {
      router.replace('/auth/login');
    }
  };
  return (
    <div className="relative group/menu">
      <Dropdown
        label=""
        className="rounded-sm w-44"
        dismissOnClick={false}
        renderTrigger={() => (
          <span className="h-10 w-10 hover:text-primary hover:bg-lightprimary rounded-full flex justify-center items-center cursor-pointer group-hover/menu:bg-lightprimary group-hover/menu:text-primary">
            <Image
              src="/images/profile/user-1.jpg"
              alt="logo"
              height="35"
              width="35"
              className="rounded-full"
            />
          </span>
        )}
      >
        <Dropdown.Item
          as={Link}
          href="#"
          className="px-3 py-3 flex items-center bg-hover group/link w-full gap-3 text-dark"
        >
          <Icon icon="solar:user-circle-outline" height={20} />
          My Account
        </Dropdown.Item>
        <div className="p-2 pt-0 flex justify-center">
          <Button onClick={logoutClick} className="mt-2 border border-primary text-primary bg-transparent hover:bg-lightprimary outline-none focus:outline-none">Logout</Button>
        </div>
      </Dropdown>
    </div>
  );
};

export default Profile;
