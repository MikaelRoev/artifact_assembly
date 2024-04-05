import {createContext, useState} from "react";

/**
 * The project context that allows the getting and setting of the current project's information.
 * @type {React.Context<null>}
 */
const ProjectContext = createContext(null);

/**
 * Provider for the project context that allows the getting and setting of the current project's information.
 * @param children the tree that can use the project context.
 * @return {JSX.Element} the context provider.
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