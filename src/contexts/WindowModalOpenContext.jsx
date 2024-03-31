import {createContext, useContext, useEffect, useState} from "react";
import ImageContext from "./ImageContext";

const WindowModalOpenContext = createContext(null);

export const WindowModalOpenContextProvider = ({children}) => {
    const [isScoreWindowOpen, setIsScoreWindowOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);
    const {images} = useContext(ImageContext);

    useEffect(() => {
        if (images.length === 0) {
            setIsScoreWindowOpen(false);
            setIsFilterWindowOpen(false)
        }
    }, [images.length]);

    return (
        <WindowModalOpenContext.Provider value={
            {
                isScoreWindowOpen, setIsScoreWindowOpen,
                isDialogOpen, setIsDialogOpen,
                isFilterWindowOpen, setIsFilterWindowOpen
            }
        }>
            {children}
        </WindowModalOpenContext.Provider>
    );
};

export default WindowModalOpenContext;