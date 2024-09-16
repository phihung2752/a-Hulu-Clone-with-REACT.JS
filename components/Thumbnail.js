import { HandThumbUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import React from "react";
import {forwardRef} from "react";

const Thumbnail= forwardRef(({ result },ref) => {
	const BASE_URL = "https://image.tmdb.org/t/p/original/";

	// Sử dụng điều kiện để chọn đúng đường dẫn hình ảnh
	const imageUrl = result.backdrop_path
		? `${BASE_URL}${result.backdrop_path}`
		: `${BASE_URL}${result.poster_path}`;

	return (
		<div ref={ref} className="group cursor-pointer p-2 transition duration-200 ease-in transform sm:hover:scale-105 sm:hover:z-50">
			<Image
				layout="responsive"
				src={imageUrl}
				height={1080}
				width={1920}
				alt="Thumbnail"
			/>
			<div className="p-2">
				<p className="truncate max-w-md">{result.overview}</p>
				<h2 className="mt-1 text-2xl text-white transition-all duration-100 ease-in-out group-hover:font-bold">{result.title || result.original_name}</h2>
				<p className="flex items-center opacity-0 group-hover:opacity-100">
					{result.media_type && `${result.media_type} • `} {" "}
                    {result.release_date || result.first_air_date}  • {" "}
					<HandThumbUpIcon className="h-5 mx-2" /> {result.vote_count}
				</p>
			</div>
		</div>
	);
})

export default Thumbnail;
