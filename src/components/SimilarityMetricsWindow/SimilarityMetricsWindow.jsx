import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import {getHueData} from "../../util/ImageManupulation";
import {makeDraggable, makeResizable} from "../../util/WindowFunctionality";
import Histogram from "../Histogram/Histogram";
import ElementContext from "../../contexts/ElementContext";
import SelectContext from "../../contexts/SelectContext";
import StageRefContext from "../../contexts/StageRefContext";
import DeleteEnabledContext from "../../contexts/DeleteEnabledContext";
import "./SimilarityMetricsWindow.css"
import HistogramMetricsTable from "../HistogramMetricsTable/HistogramMetricsTable";

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
    const {isAnyImages} = useContext(ElementContext);

    const [isSimilarityMetricsWindowOpen, setIsSimilarityMetricsWindowOpen] = useState(false);

    useEffect(() => {
        if (!isAnyImages) setIsSimilarityMetricsWindowOpen(false);
    }, [isAnyImages]);

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
    const {images} = useContext(ElementContext);
    const {selectedKonvaImages, isAnySelectedImages} = useContext(SelectContext);
    const {stageRef} = useContext(StageRefContext);
    const {setDeleteEnabled} = useContext(DeleteEnabledContext);

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
        const imageNodes = stageRef.current.find((node) => node.getClassName() === "Image");
        for (const imageNode of imageNodes) {
            imageNode.attrs.hueValues = await getHueData(imageNode.toDataURL());
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
                    onFocus={() => setDeleteEnabled(false)}
                    onBlur={() => setDeleteEnabled(true)}
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
                    onFocus={() => setDeleteEnabled(false)}
                    onBlur={() => setDeleteEnabled(true)}
                />
                <button onClick={handleReset}>Reset</button>
            </div>
            <div ref={contentRef} className="window-content">
                {isAnySelectedImages ?
                    (update &&
                        selectedKonvaImages.map(image => {
                            const hueValues = image.attrs.hueValues;
                            return (
                                hueValues &&
                                <div className={"element-container"} key={image.id()}>
                                    <div className="histogram-container">
                                        <div className="histogram-info">
                                            <img src={image.toDataURL()} alt={"For histogram"}/>
                                            <p>{image.attrs.fileName}</p>
                                        </div>
                                        <Histogram
                                            key={image.id()}
                                            array={hueValues}
                                            widthProp={400}
                                            heightProp={300}
                                            binsProp={maxCutOff - minCutOff}
                                            minCutoff={minCutOff}
                                            maxCutoff={maxCutOff}
                                        />
                                    </div>
                                    {
                                        images.length > 1 &&
                                        <HistogramMetricsTable
                                            selectedImage={image}
                                            maxHistogramValue={maxHistogramValue}
                                        />
                                    }
                                </div>
                            )
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