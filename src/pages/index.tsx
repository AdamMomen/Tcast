import { type NextPage } from "next";
import Head from "next/head";
import { ChangeEventHandler, Dispatch, FC, SetStateAction, useEffect, useRef, useState } from "react";
import { Session } from 'next-auth';
import { signIn, signOut, getSession } from 'next-auth/react';
import z from 'zod'
import toast, { Toaster } from 'react-hot-toast';




const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const PlatfromsSchema = z.object({
    twitter: z.boolean(),
    farcaster: z.boolean(),
})

type Platforms = z.infer<typeof PlatfromsSchema>

type File = {
    name: string;
    mimeType: string;
    data: string | ArrayBuffer | null;
} | null;

const Home: NextPage<{ session: Session }> = ({ session }) => {
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platforms>({ twitter: true, farcaster: false })
    const [text, setText] = useState<string>("")
    const [file, setFile] = useState<File>(null)


    const submitMessage = async () => {
        const message = {
            platforms: selectedPlatforms,
            text,
            media: file
        }

        const response = await fetch("http://localhost:3000/api/submit", {
            method: "POST",
            headers: { contentType: "application/json" },
            body: JSON.stringify(message)
        })

        if (!response.ok) {
            toast.error('Netowrk Error')
            return
        }

        const data = await response.json()

        if (data?.error) {
            toast.error(data.error.message)
            return;
        }
        toast.success(data.result)
    }

    return (
        <>
            <Head>
                <title>Tcast</title>
                <meta name="description" content="Tweet and cast at the same time" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
                <Toaster />
                <h1 className="text-5xl font-extrabold leading-normal text-gray-700 md:text-[5rem]">
                    <span className="text-[#8a63d2]">T</span> Cast
                </h1>
                <p className="text-2xl text-gray-700">Tweeting & Casting made easy</p>
                <p className="">
                    {!session && <>
                        Not signed in <br />
                        <button onClick={() => signIn()}>Sign in</button>
                    </>}
                </p>
                {session &&
                    <Container
                        session={session}
                        selectedPlatforms={selectedPlatforms}
                        setSelectedPlatforms={setSelectedPlatforms}
                        onSubmit={submitMessage}
                        text={text}
                        setText={setText}
                        file={file}
                        setFile={setFile}
                    />
                }
            </main>
        </>
    );
};

type ContainerProps = {
    selectedPlatforms: Platforms;
    text: string;
    setSelectedPlatforms: Dispatch<SetStateAction<Platforms>>;
    setText: Dispatch<SetStateAction<string>>;
    session: Session;
    onSubmit: () => void
    setFile: Dispatch<SetStateAction<File>>;
    file: File
};

const Container: FC<ContainerProps> = ({ selectedPlatforms, text, setSelectedPlatforms, setText, onSubmit, session, setFile, file }) => {

    const onFileChange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return

        const fileReader = new FileReader();
        fileReader.readAsBinaryString(file);
        // fileReader.readAsArrayBuffer(file)

        fileReader.onloadend = () => {
            const fileContent = fileReader.result;
            const { name, type: mimeType } = file
            setFile({
                data: fileContent,
                name,
                mimeType,
            })
        };
    }

    const hiddenFileInput = useRef<HTMLInputElement>(null);



    return (
        <div className="flex flex-col w-full justify-center">
            <Selector selectedPlatforms={selectedPlatforms} setSelectedPlatforms={setSelectedPlatforms} />
            <div className="flex flex-col justify-center items-center">
                <div className="flex">
                    <div className="flex flex-col shrink-0 text-center justify-center items-center pr-8">
                        <img className="h-16 w-16 object-cover rounded-full"
                            src={session?.user?.image as string}
                            alt="Current profile photo" />
                        <span className="mt-2"> {session?.user?.name}</span>
                        <div className="bg-red-400 rounded px-1 py-1 mt-2">
                            <button onClick={() => signOut()}>Sign out</button>
                        </div>
                    </div>
                    <TextArea value={text} onChange={
                        (e) => {
                            const text = e.target.value as string
                            setText(text)
                        }
                    } />
                </div>
                <input ref={hiddenFileInput} type="file" onChange={onFileChange} className="" />
                <div className="">
                    <button disabled={!text}
                        className={`flex mt-2 py-2 px-2 cursor-pointer bg-sky-500 rounded-md ${!text ? 'bg-sky-200' : ''}`} onClick={onSubmit}>
                        Post
                    </button>
                </div>
            </div>
        </div >
    )
}


type SelectorProps = {
    setSelectedPlatforms: Dispatch<SetStateAction<Platforms>>;
    selectedPlatforms: Platforms
}

const Selector: FC<SelectorProps> = ({ selectedPlatforms, setSelectedPlatforms: setSelectedOptions }) => {
    const onChange = (value: "twitter" | "farcaster") => {
        setSelectedOptions(prev => ({ ...prev, [value]: !prev[value] }))
    }

    return (
        <div className="flex form-check justify-center mt-4">
            <div className="flex pb-4 space-x-2  just-center items-center align-middle">
                <div className="flex flex-row just-center items-center border rounded">
                    {Object.keys(selectedPlatforms)
                        .map((platform) => (
                            <div className="py-2 px-2" key={"_." + platform}>
                                <input
                                    className="form-check-input appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                    type="checkbox"
                                    id="flexCheckChecked"
                                    checked={selectedPlatforms[platform as "twitter" | "farcaster"]}
                                    onChange={(e) => onChange(e.target.value as "twitter" | "farcaster")}
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
    onChange: ChangeEventHandler<HTMLTextAreaElement>
}

const TextArea: FC<TextAreaProps> = ({ value, onChange }) => (
    <div className="relative block mt-20 h-full w-5/6 justify-center" >
        <span className="sr-only">Post</span>
        <textarea
            maxLength={200}
            rows={4}
            cols={70} className="w-full placeholder:italic placeholder:text-slate-400 block bg-white \
          border border-slate-300 rounded-md py-2 pl-3 pr-3 shadow-sm focus:outline-none \
          focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm h-52 resize-auto"
            placeholder="What's happening?"
            value={value}
            onChange={onChange}
        >
        </textarea>
    </div>
)
export default Home;

export const getServerSideProps = async (context: any) => {
    const session = await getSession(context);
    return {
        props: { session }
    }
}
