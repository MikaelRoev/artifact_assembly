import {createContext, useState} from "react";

const ProjectContext = createContext(null);

/**
 * Provider for the project context that allows the getting and setting of the current project's information.
 * @param children the tree that can use the project context.
 * @return {JSX.Element} the provider with the tree under it.
 * @constructor
 */
export const ProjectContextProvider = ({children}) => {
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

export default ProjectContext;