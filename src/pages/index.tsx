import { type NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, Dispatch, FC, SetStateAction, useState } from "react";
import z from 'zod'

const PlatfromsSchema = z.object({
    twitter: z.boolean(),
    farcaster: z.boolean(),
})

type Platforms = z.infer<typeof PlatfromsSchema>

const Home: NextPage = () => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platforms>({ twitter: false, farcaster: true })
    const [text, setText] = useState<string>("")

    const onSubmit = async () => {
        const response = await fetch("http://localhost:3000/api/submit", {
            method: "POST",
            headers: {
                contentType: "application/json"
            },
            body: JSON.stringify({
                platforms: selectedPlatforms,
                text
            })
        })
        const data = await response.json()
        console.log(data)
        if (data.error) {
            console.log(data.result.error)
        }

    }

    return (
        <>
            <Head>
                <title>Tcast</title>
                <meta name="description" content="Tweet and cast at the same time" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
                <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
                    <span className="text-sky-300">T</span> Cast
                </h1>
                <p className="text-2xl text-gray-700">Tweeting & Casting made easy</p>

                <div className="flex flex-col w-full justify-center">
                    <Selector selectedPlatforms={selectedPlatforms} setSelectedPlatforms={setSelectedPlatforms} />
                    <div className="flex flex-col justify-center items-center">
                        <TextArea value={text} onChange={
                            (e) => {
                                setText(e.target.value as string)
                            }
                        } />
                        <div className="">
                            <button className="flex mt-2 py-2 px-2 cursor-pointer bg-sky-500 rounded-md " onClick={onSubmit}>Send</button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};


type SelectorProps = {
    setSelectedPlatforms: Dispatch<SetStateAction<Platforms>>;
    selectedPlatforms: Platforms
}

const Selector: FC<SelectorProps> = ({ selectedPlatforms, setSelectedPlatforms: setSelectedOptions }) => {
    const onChange = (event: any) => {
        const value = event.target.value as "twitter" | "farcaster"
        setSelectedOptions(prev => ({ ...prev, [value]: !prev[value] }))
    }

    return (
        <div className="flex form-check justify-center mt-4">
            <div className="flex pb-4 space-x-2  just-center items-center align-middle">
                <div className="flex flex-row just-center items-center border rounded">
                    {Object.keys(selectedPlatforms).map((platform) => (
                        <div className="py-2 px-2" key={"_." + platform}>
                            <input
                                className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                type="checkbox"
                                id="flexCheckChecked"
                                checked={selectedPlatforms[platform]}
                                onChange={onChange}
                                value={platform}
                            ></input>
                            <label
                                className="form-check-label inline-block text-gray-800 px-2"
                                htmlFor="flexCheckChecked"
                            >
                                {platform}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}


type TextAreaProps = {
    value: string;
    onChange: ChangeEventHandler<HTMLElement>
}

const TextArea: FC<TextAreaProps> = ({ value, onChange }) => (
    <div className="relative block mt-20 h-full w-5/6 justify-center">
        <span className="sr-only">Post</span>
        <textarea rows="4" cols="70" className="w-full placeholder:italic placeholder:text-slate-400 block bg-white \
          border border-slate-300 rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none \
          focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm h-52"
            placeholder="What's happening?"
            type="text"
            value={value}
            onChange={onChange}
        />
    </div>
)
export default Home;
