import {createContext, useContext, useEffect, useState} from "react";
import ElementContext from "./ElementContext";

const WindowModalOpenContext = createContext(null);

export const WindowModalOpenContextProvider = ({children}) => {
    const [isScoreWindowOpen, setIsScoreWindowOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);
    const [isFilterInteracting, setIsFilterInteracting] = useState(false);
    const {elements} = useContext(ElementContext);

    useEffect(() => {
        if (elements.length === 0) {
            setIsScoreWindowOpen(false);
            setIsFilterWindowOpen(false)
        }
    }, [elements.length]);

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