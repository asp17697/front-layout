import Image from "next/image";
import { ArrowRightIcon, ArrowLeftIcon } from "lucide-react";

interface StepProviderProps {
    onClickNext: () => void;
    onClickBack: () => void;
}

const StepProvider = ({ onClickNext, onClickBack }: StepProviderProps) => {


    return (

        <div className="flex items-center gap-2.5 justify-end mt-6 mb-10">
            <button
                onClick={onClickBack}
                className="flex items-center gap-2 bg-slate-200 capitalize text-slate-400 text-sm font-bold py-2.5 px-4 rounded"
            >
                <ArrowLeftIcon /> <p>Back</p>
            </button>
            <button
                onClick={onClickNext}
                className="flex items-center gap-2 bg-blue-100 capitalize text-blue-600 text-sm font-bold py-2.5 px-4 rounded"
            >
                <p>Next Step</p> <ArrowRightIcon />
            </button>
        </div>
    );
};

export default StepProvider;