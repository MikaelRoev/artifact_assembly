import {createContext, useState} from "react";

const WindowModalOpenContext = createContext(null);

export const WindowModalOpenContextProvider = ({children}) => {
    const [isScoreWindowOpen, setIsScoreWindowOpen] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isFilterWindowOpen, setIsFilterWindowOpen] = useState(false);

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