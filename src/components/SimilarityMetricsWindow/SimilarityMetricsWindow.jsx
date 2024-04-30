import React, {createContext, useContext, useEffect, useMemo, useRef, useState} from "react";
import Konva from "konva";
import {getHueData} from "../../util/ImageManupulation";
import {makeDraggable, makeResizable} from "../../util/WindowFunctionality";
import Histogram from "../Histogram/Histogram";
import ElementContext from "../../contexts/ElementContext";
import SelectContext from "../../contexts/SelectContext";
import StageRefContext from "../../contexts/StageRefContext";
import DeleteEnabledContext from "../../contexts/DeleteEnabledContext";
import "./SimilarityMetricsWindow.css"

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
    const {elements, images} = useContext(ElementContext);
    const {selectedKonvaImages, selectedImagesIndex, isAnySelectedImages} = useContext(SelectContext);
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
        for (const index of selectedImagesIndex) {
            const image = elements[index];
            for (const imageNode of imageNodes) {
                if (image.id !== imageNode.id()) continue;
                imageNode.attrs.hueValues = await getHueData(imageNode.toDataURL());
            }
        }

        setMinCutOff(minInputValue);
        setMaxCutOff(maxInputValue);

        setUpdate(false);
        await new Promise(resolve => setTimeout(resolve, 1));
        setUpdate(true);
    }

    /**
     * Calculates the Euclidean distance, Pearson correlation, Bhattacharyya distance, Intersection between the two histograms.
     * @param arrayA Histogram A array
     * @param arrayB Histogram B array
     * @returns {
     * {bhattacharyyaDistance: number,
     * euclideanDistance: number,
     * pearsonCorrelation: number,
     * histogramIntersection: number}
     * }
     */
    function getHistogramScores(arrayA, arrayB) {
        // Euclidean Distance
        let euclidean = 0;
        // Bhattacharyya Distance
        let coefficient = 0;
        // Histogram Intersection
        let intersection = 0;

        for (let i = 0; i < arrayA.length; i++) {
            // Euclidean
            euclidean += Math.pow(arrayA[i] - arrayB[i], 2);

            // Bhattacharyya
            coefficient += Math.sqrt(arrayA[i] * arrayB[i]);

            // Intersection
            intersection += Math.min(arrayA[i], arrayB[i]);
        }

        // Final calculation
        const euclideanDistance = Math.sqrt(euclidean);
        const bhattacharyyaDistance = -Math.log(coefficient);
        const histogramIntersection = (1 - intersection);

        return {
            euclideanDistance: euclideanDistance,
            bhattacharyyaDistance: bhattacharyyaDistance,
            histogramIntersection: histogramIntersection,
            combined: (euclideanDistance + bhattacharyyaDistance + histogramIntersection) / 3
        }
    }

    /**
     * Sets a table with the similarity scores between the selectedImage and every other element
     * @param selectedImage {Konva.image}
     * @returns {Element} div element with a table of scores and the most similar element to selectedImage
     */
    function setTable(selectedImage) {
        let rows = [];
        const arrayA = countAndNormalizeValues(selectedImage.attrs.hueValues, maxHistogramValue);
        let lowest = Infinity;
        let lowestImage = null;
        const imageNodes = stageRef.current.find((node) => node instanceof Konva.Image);
        imageNodes.forEach(image => {
            if (selectedImage.id() === image.id()
                || image.attrs.hueValues === undefined
                || selectedImage.attrs.hueValues === undefined) return;
            const arrayB = countAndNormalizeValues(image.attrs.hueValues, maxHistogramValue);
            const values = getHistogramScores(arrayA, arrayB);
            if (values.combined < lowest) {
                lowest = values.combined;
                lowestImage = image;
            }
            rows.push(
                <tr key={`${selectedImage.id()}-${image.id()}`}>
                    <td className={"tableColumn1"}><img src={image.toDataURL()} alt={"For table row"}/></td>
                    <td>{values.combined.toFixed(3)}</td>
                    <td>{values.euclideanDistance.toFixed(3)}</td>
                    <td>{values.bhattacharyyaDistance.toFixed(3)}</td>
                    <td>{values.histogramIntersection.toFixed(3)}</td>
                </tr>
            );
        })

        return (
            lowestImage &&
            <div key={`table-${selectedImage.id}`} className={"tableDiv"}>
                <div className={"info-div"}>
                    <p>The most similar element to</p>
                    <img src={selectedImage.toDataURL()} alt={"For information"}
                         className={"info-image"}/>
                    <p>is</p>
                    <img src={lowestImage.toDataURL()} alt={"For Information"}
                         className={"info-image"}/>
                </div>
                <table className={"score-table"}>
                    <thead>
                    <tr>
                        <th className={"tableColumn1"}><img src={selectedImage.toDataURL()} alt={"For table header"}/></th>
                        <th>Combined<br/>scores</th>
                        <th>Euclidean<br/>Distance</th>
                        <th>Bhattacharyya<br/>Distance</th>
                        <th>Histogram<br/>Intersection</th>
                    </tr>
                    </thead>
                    <tbody>
                    {rows}
                    </tbody>
                </table>
            </div>
        )
    }

    /**
     * Counts all the values in an array and puts them into another array. It then normalizes the count values.
     * @param array array to be counted and normalized.
     * @param maxValue the max value possible in the array
     * @returns {any[]}
     */
    function countAndNormalizeValues(array, maxValue) {
        const probArray = new Array(maxValue + 1).fill(0);
        array.forEach(value => {
            if (value >= 0 && value <= maxValue) {
                probArray[Math.floor(value)]++;
            }
        });
        const totalCount = array.length;
        probArray.forEach((value, index, arr) => {
            arr[index] = value / totalCount;
        });

        return probArray;
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
                                        <div>
                                            {setTable(image)}
                                        </div>
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