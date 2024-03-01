import {createContext, useContext, useState} from "react";

export const ProjectContext = createContext(null);

/**
 * Provider for the project context that allows the getting and setting of the current project's information.
 * @param children the three that can use the project context.
 * @return {JSX.Element} the provider with the three under it.
 * @constructor
 */
export const ProjectProvider = ({children}) => {
    const [project, setProject] = useState({
        name: '',
        description: '',
        x: 0,
        y: 0,
        zoom: 1,
        elements: [],
    });

    return (
        <ProjectContext.Provider value={{project, setProject}}>
            {children}
        </ProjectContext.Provider>
    )
}

/**
 * Custom hook for getting the getter and setter of the current project's information.
 * @return {null}
 */
export const useProjectContext = () => useContext(ProjectContext);