import Image from "next/image";
import HeaderItem from "./HeaderItem";
import {
	HomeIcon,
	UserIcon,
	MagnifyingGlassIcon,
	BoltIcon,
	CircleStackIcon,
	CheckBadgeIcon,
} from "@heroicons/react/24/outline";

function Header() {
	return (
		<header className="flex flex-col sm:flex-row m-5 justify-between items-center h-auto">
			<div className="flex flex-grow justify-evenly max-w-2xl mb-5 sm:mb-0">
				<HeaderItem title="HOME" Icon={HomeIcon} />
				<HeaderItem title="LIGHTNING" Icon={BoltIcon} />
				<HeaderItem title="COLLECTION" Icon={CircleStackIcon} />
				<HeaderItem title="BADGE" Icon={CheckBadgeIcon} />
				<HeaderItem title="SEARCH" Icon={MagnifyingGlassIcon} />
				<HeaderItem title="USER" Icon={UserIcon} />
			</div>
			<Image
				className="object-contain"
				src="https://links.papareact.com/ua6"
				width={200}
				height={100}
				alt="Logo"
			/>
		</header>
	);
}

export default Header;
