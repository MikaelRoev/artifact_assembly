import {Group, Rect} from "react-konva";
import {useRef} from "react";

/**
 * Represents a group of objects on the canvas
 */

function GroupNode() {
    const groupRef = useRef(null);

    /**
     * Event handler for adding to the group.
     * @param event that happens
     */
    const handleGroupClick = (event) => {
         if (event.target)// there is a target
        {
            if (!event.ctrlKey) {
                // remove all from group
            }
            // add target to group
            //groupRef.current.add(event.target);
        } else //clicks on background
        {
           // remove all from group
        }
    }

    return (<Group ref={groupRef} draggable={true} >

    </Group>);

}

export default GroupNode;



