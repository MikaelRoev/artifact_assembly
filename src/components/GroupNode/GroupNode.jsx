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
        <Rect
            x={100}
            y={150}
            width={30}
            height={30}
            fill="red"
        />
        <Rect
            x={150}
            y={200}
            width={30}
            height={30}
            fill="green"/>
    </Group>);

}

export default GroupNode;



