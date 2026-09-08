import FileSidebar from "./FileSidebar"
import MonacoEditor from "./MonacoEditor"

const Homepage = () => {
    return (
        <div className="w-full">
            {/* <div className="w-50%">Questions </div> */}
            <div className="flex">
                {/* file structure */}
                <div className="w-[20%] h-full overflow-y-auto">
                    <FileSidebar />
                </div>
                {/* Code */}
                <div className="w-[75%]">
                    <MonacoEditor />
                </div>

            </div>
        </div>
    )
}
export default Homepage