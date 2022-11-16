import { type NextPage } from "next";
import Head from "next/head";
import { Dispatch, FC, SetStateAction, useState } from "react";
import z from 'zod'

const OptionSchema = z.object({
    tweet: z.boolean(),
    cast: z.boolean(),
})



type Option = z.infer<typeof OptionSchema>

const Home: NextPage = () => {
    const [selectedOptions, setSelectedOptions] = useState<Option>({ tweet: false, cast: true })
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
                <div className="mt-3 grid gap-3 pt-3 text-center md:grid-cols-3 lg:w-2/3">
                    {/*<button className="border-white hover:border-red-500" onClick={() => console.log("here")}>Let's begin</button>*/}
                    <Selector selectedOptions={selectedOptions} setSelectedOptions={setSelectedOptions} />
                    <TextArea />
                </div>
            </main>
        </>
    );
};

type SelectorProps = {
    setSelectedOptions: Dispatch<SetStateAction<Option>>
    selectedOptions: Option
}

const Selector: FC<SelectorProps> = ({ selectedOptions, setSelectedOptions }) => {
    const onChange = (key: 'tweet' | 'cast') => {
        setSelectedOptions(prev => {
            prev[key] = !prev[key]
            return prev
        })
    }

    return (
        <div className="flex justify-around">
            <ToggleCheckbox name="Tweet" onChange={() => onChange('tweet')} checked={selectedOptions.tweet} />
            <ToggleCheckbox name="Cast" onChange={() => onChange('cast')} checked={selectedOptions.cast} />
        </div>
    )
}

const ToggleCheckbox = ({ checked, name, onChange }: { checked: boolean, name: string, onChange: any }) => (
    <div className="flex justify-center">
        <div className="form-check form-switch">
            <input className="form-check-input appearance-none w-9 -ml-10 rounded-full float-left h-5 align-top bg-white bg-no-repeat bg-contain bg-gray-300 focus:outline-none cursor-pointer shadow-sm" type="checkbox" role="switch" id="flexSwitchCheckChecked" checked={checked} onChange={onChange} />
            <label className="form-check-label inline-block text-gray-800"
                htmlFor="flexSwitchCheckChecked">{name}</label>
        </div>
    </div>
)


const TextArea = () => (
    <label className="relative block mt-20">
        <span className="sr-only">Post</span>
        <input className="placeholder:italic placeholder:text-slate-400 block bg-white \
          w-full border border-slate-300 rounded-md py-2 pl-9 pr-3 shadow-sm focus:outline-none \
          focus:border-sky-500 focus:ring-sky-500 focus:ring-1 sm:text-sm"
            placeholder="What's happening?"
            type="text"
            name="search"
        />
    </label>
)
export default Home;
