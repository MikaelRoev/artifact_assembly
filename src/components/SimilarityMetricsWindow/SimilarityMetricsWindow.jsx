import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import {getHueData} from "../../util/ImageManupulation";
import {makeDraggable, makeResizable} from "../../util/WindowFunctionality";
import Histogram from "../Histogram/Histogram";
import ElementContext from "../../contexts/ElementContext";
import SelectContext from "../../contexts/SelectContext";
import StageRefContext from "../../contexts/StageRefContext";
import FilterInteractionContext from "../../contexts/FilterInteractionContext";
import "./SimilarityMetricsWindow.css"
import HistogramMetricsTable from "./HistogramMetricsTable";

/**
 * The context for the similarity metrics window.
 * @type {React.Context<null>}
 */
export const SimilarityMetricsWindowContext = createContext(null);

/**
 * The context provider for the similarity metrics window context.
 * @param children the children that can use the context.
 * @return {JSX.Element} the context provider.
 * @constructor
 */
export const SimilarityMetricsWindowContextProvider = ({children}) => {
    const [isSimilarityMetricsWindowOpen, setIsSimilarityMetricsWindowOpen] = useState(false);
    const {elements} = useContext(ElementContext);

    useEffect(() => {
        if (elements.length === 0) setIsSimilarityMetricsWindowOpen(false);
    }, [elements.length]);

    const providerValues = useMemo(() => {
        return {
            isSimilarityMetricsWindowOpen,
            setIsSimilarityMetricsWindowOpen
        };
    }, [isSimilarityMetricsWindowOpen, setIsSimilarityMetricsWindowOpen]);

    return (
        <SimilarityMetricsWindowContext.Provider value={providerValues}>
            {children}
        </SimilarityMetricsWindowContext.Provider>
    )
}

/**
 * Component that represents a window that shows similarity metrics of the selected images.
 * @returns {JSX.Element} the similarity metrics window
 * @constructor
 */
const SimilarityMetricsWindow = () => {
    const {
        isSimilarityMetricsWindowOpen,
        setIsSimilarityMetricsWindowOpen
    } = useContext(SimilarityMetricsWindowContext);
    const {elements} = useContext(ElementContext);
    const {selectedElementsIndex} = useContext(SelectContext);
    const {stageRef} = useContext(StageRefContext);
    //TODO: change name of context: filter interaction to disable image delete?
    const {setIsFilterInteracting} = useContext(FilterInteractionContext);
    const contentRef = useRef(null);
    const [update, setUpdate] = useState(true);
    const maxHistogramValue = 360;
    const [minInputValue, setMinInputValue] = useState(0);
    const [maxInputValue, setMaxInputValue] = useState(maxHistogramValue);
    const [minCutOff, setMinCutOff] = useState(0);
    const [maxCutOff, setMaxCutOff] = useState(maxHistogramValue);

    /**
     * UseEffect to make the score window draggable on creation.
     * And handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        if (!isSimilarityMetricsWindowOpen) return;
        const element = document.getElementById("scoreWindow");
        const dragFrom = element.querySelector(".window-top");
        const stage = stageRef.current;
        makeDraggable(element, dragFrom, stage);
    }, [stageRef, isSimilarityMetricsWindowOpen]);

    /**
     * Resizes the window.
     */
    useEffect(() => {
        if (!isSimilarityMetricsWindowOpen) return;
        makeResizable(document.getElementById("scoreWindow"), 10, stageRef.current);
    }, [stageRef, isSimilarityMetricsWindowOpen]);


    /**
     * useEffect to prevent right-click on the similarity metrics window
     */
    useEffect(() => {
        let window = document.querySelector("#scoreWindow");
        if (window) {
            window.addEventListener("contextmenu", (event) => {
                event.preventDefault();
            })
        }
    }, []);

    /**
     * Updates the hueValues value of the selected images when the update button is pushed
     * @returns {Promise<void>}
     */
    async function updateHistograms() {
        const imageNodes = stageRef.current.getChildren()[0].getChildren().filter((child) => child.getClassName() === "Image")
        for (const index of selectedElementsIndex) {
            for (const imageNode of imageNodes) {
                if (elements[index].id === imageNode.attrs.id) {
                    const newHues = await getHueData(imageNode.toDataURL())
                    elements[index] = {
                        ...elements[index],
                        hueValues: newHues,
                    }
                }
            }
        }

        setMinCutOff(minInputValue);
        setMaxCutOff(maxInputValue);

        setUpdate(false);
        await new Promise(resolve => setTimeout(resolve, 1));
        setUpdate(true);
    }

    /**
     * Resets the values in the inputs to default.
     */
    function handleReset() {
        setMinInputValue(0);
        setMaxInputValue(maxHistogramValue);
    }

    return (
        isSimilarityMetricsWindowOpen &&
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics</div>
                <button className="square exit" onClick={() => setIsSimilarityMetricsWindowOpen(false)}></button>
            </div>
            <div className={"options-container"}>
                <button className={"updateButton"} onClick={updateHistograms}>⟳</button>
                <label htmlFor={"minNumber"}>Min </label>
                <input
                    className={"histInput"}
                    id={"minNumber"}
                    type={"number"}
                    min={0}
                    max={maxHistogramValue}
                    step={1}
                    value={minInputValue}
                    onChange={(e) => setMinInputValue(Number(e.target.value))}
                    onFocus={() => setIsFilterInteracting(true)}
                    onBlur={() => setIsFilterInteracting(false)}
                />

                <label htmlFor={"maxNumber"}>Max </label>
                <input
                    className={"histInput"}
                    id={"maxNumber"}
                    type={"number"}
                    min={0}
                    max={maxHistogramValue}
                    step={1}
                    value={maxInputValue}
                    onChange={(e) => setMaxInputValue(Number(e.target.value))}
                    onFocus={() => setIsFilterInteracting(true)}
                    onBlur={() => setIsFilterInteracting(false)}
                />
                <button onClick={handleReset}>Reset</button>
            </div>
            <div ref={contentRef} className="window-content">
                {selectedElementsIndex.length > 0 ?
                    (update &&
                        selectedElementsIndex.map(index => {
                            const image = elements[index];
                            if (image.hueValues) {
                                const path = convertFileSrc(image.filePath)
                                return (
                                    <div className={"element-container"} key={index}>
                                        <div className="histogram-container">
                                            <div className="histogram-info">
                                                <img src={path} alt={"For histogram"}/>
                                                <p>{image.fileName}</p>
                                            </div>
                                            <Histogram
                                                key={index}
                                                array={image.hueValues}
                                                widthProp={400}
                                                heightProp={300}
                                                binsProp={maxCutOff - minCutOff}
                                                minCutoff={minCutOff}
                                                maxCutoff={maxCutOff}
                                            />
                                        </div>
                                        <HistogramMetricsTable
                                            selectedImage={image}
                                            maxHistogramValue={maxHistogramValue}
                                        />
                                    </div>
                                )
                            }
                            return null;
                        })
                    ) :
                    (<p style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}>
                        Info.<br/>Select one or more images to display their histogram.
                    </p>)
                }
            </div>
        </div>);
}

export default SimilarityMetricsWindow;