import React, {createContext, useRef} from "react";

/**
 * The stage reference context that allows for using the reference to konva stage in the stage area.
 * @type {React.Context<null>}
 */
const StageRefContext = createContext(null);

/**
 * Provider for the stage reference context that allows for using the reference to konva stage in the stage area.
 * @param children {JSX.Element} the components that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const StageRefContextProvider = ({children}) => {
    const stageRef = useRef();

    const getStage = () => {
        return stageRef.current;
    }

    const getLayer = () => {
        return getStage().getChildren()[0];
    }

    const getElements = () => {
        return getLayer().getChildren();
    }

    const getImages = () => {
    return getElements().filter((child)=> child.getClassName() == 'Image');
    }

    return (
        <StageRefContext.Provider value={{stageRef, getStage, getLayer, getElements, getImages}}>
            {children}
        </StageRefContext.Provider>
    )
}

export default StageRefContext;