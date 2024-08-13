import { LineWave } from "react-loader-spinner";

function Loader() {
    return (
        <div className="flex w-full h-[70vh] justify-center items-center">
            <LineWave
                height="100"
                width="100"
                color="#4338CA"
                ariaLabel="line-wave"
                wrapperStyle={{}}
                wrapperClass=""
                visible={true}
                firstLineColor=""
                middleLineColor=""
                lastLineColor=""
            />
        </div>
    );
}

export default Loader;
