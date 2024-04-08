import React, {createContext, useContext, useEffect, useState} from "react";
import ImageContext from "./ImageContext";

/**
 * The windows and modals context that allows for opening and closing them.
 * @type {React.Context<null>}
 */
const WindowModalOpenContext = createContext(null);

/**
 * Provider for the windows and modals context that allows for opening and closing them.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const WindowModalOpenContextProvider = ({children}) => {
    const [isScoreWindowOpen, setIsScoreWindowOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);
    const [isFilterInteracting, setIsFilterInteracting] = useState(false);
    const {images} = useContext(ImageContext);

    useEffect(() => {
        if (images.length === 0) {
            setIsScoreWindowOpen(false);
            setIsFilterWindowOpen(false);
        }
    }, [images.length]);

    return (
        <WindowModalOpenContext.Provider value={
            {
                isScoreWindowOpen, setIsScoreWindowOpen,
                isDialogOpen, setIsDialogOpen,
                isFilterWindowOpen, setIsFilterWindowOpen,
                isFilterInteracting, setIsFilterInteracting,
            }
        }>
            {children}
        </WindowModalOpenContext.Provider>
    );
};

export default WindowModalOpenContext;