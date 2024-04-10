import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import WindowModalOpenContext from "../../contexts/WindowModalOpenContext";
import ImageContext from "../../contexts/ImageContext";
import "./SimilarityMetricsWindow.css"
import {makeDraggable, makeResizable} from "../WindowFunctionality";
import Histogram from "../Histogram/Histogram";
import selectedElementsIndexContext from "../../contexts/SelectedElementsIndexContext";
import {convertFileSrc} from "@tauri-apps/api/tauri";
import {getHueData} from "../ImageManupulation";

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
    const {images} = useContext(ImageContext);

    useEffect(() => {
        if (images.length === 0) setIsSimilarityMetricsWindowOpen(false);
    }, [images.length]);

    return (
        <SimilarityMetricsWindowContext.Provider value={{
            isSimilarityMetricsWindowOpen,
            setIsSimilarityMetricsWindowOpen
        }}>
            {children}
        </SimilarityMetricsWindowContext.Provider>
    )
}

/**
 * Component that represents a window that shows similarity metrics of the selected images.
 * @returns {JSX.Element} the similarity metrics window
 * @constructor
 */
const SimilarityMetricsWindow = ({stageRef}) => {
    const {
        isSimilarityMetricsWindowOpen,
        setIsSimilarityMetricsWindowOpen
    } = useContext(SimilarityMetricsWindowContext);
    const {images} = useContext(ImageContext);
    const {selectedElementsIndex} = useContext(selectedElementsIndexContext)
    const contentRef = useRef(null);
    const [update, setUpdate] = useState(true);

    /**
     * UseEffect to make the score window draggable on creation.
     * And handle hiding the window when the exit button is pressed.
     */
    useEffect(() => {
        const element = document.getElementById("scoreWindow");
        const dragFrom = element.querySelector('.window-top');
        const stage = stageRef.current;
        makeDraggable(element, dragFrom, stage);
    }, [stageRef]);

    /**
     * Resizes the window.
     */
    useEffect(() => {
        makeResizable(document.getElementById('scoreWindow'), 10, stageRef.current);
    }, [stageRef]);


    /**
     * useEffect to prevent right-click on the similarity metrics window
     */
    useEffect(() => {
        let window = document.querySelector('#scoreWindow');
        if (window) {
            window.addEventListener('contextmenu', (event) => {
                event.preventDefault();
            })
        }
    }, []);

    /**
     * Updates the hueValues value of the selected images when the update button is pushed
     * @returns {Promise<void>}
     */
    async function updateHistograms() {
        const imageNodes = stageRef.current.getChildren()[0].getChildren().filter((child) => child.getClassName() === 'Image')
        for (const index of selectedElementsIndex) {
            for (const imageNode of imageNodes) {
                if (images[index].id === imageNode.attrs.id) {
                    const newHues = await getHueData(imageNode.toDataURL())
                    images[index] = {
                        ...images[index],
                        hueValues: newHues,
                    }
                }
            }

        }
        setUpdate(false)
        await new Promise(resolve => setTimeout(resolve, 1));
        setUpdate(true)
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
    const getHistogramScores = (arrayA, arrayB) => {
        // Euclidean Distance
        let euclidean = 0
        // Pearson Correlation
        let meanA = arrayA.reduce((acc, val) => acc + val, 0) / arrayA.length;
        let meanB = arrayB.reduce((acc, val) => acc + val, 0) / arrayB.length;
        let numerator = 0, denominatorA = 0, denominatorB = 0;
        // Bhattacharyya Distance
        let coefficient = 0;
        // Histogram Intersection
        let intersection = 0;

        for (let i = 0; i < arrayA.length; i++) {
            // Euclidean
            euclidean += Math.pow(arrayA[i] - arrayB[i], 2)

            // Pearson
            numerator += (arrayA[i] - meanA) * (arrayB[i] - meanB)
            denominatorA += Math.pow(arrayA[i] - meanA, 2);
            denominatorB += Math.pow(arrayB[i] - meanB, 2);

            // Bhattacharyya
            coefficient += Math.sqrt(arrayA[i] * arrayB[i]);

            // Intersection
            intersection += Math.min(arrayA[i], arrayB[i]);
        }




        // Final calculation
        const euclideanDistance = Math.sqrt(euclidean);
        const pearsonCorrelation = numerator / Math.sqrt(denominatorA + denominatorB);
        const bhattacharyyaDistance = -Math.log(coefficient)
        const histogramIntersection = intersection

        return {
            euclideanDistance: euclideanDistance,
            pearsonCorrelation: pearsonCorrelation,
            bhattacharyyaDistance: bhattacharyyaDistance,
            histogramIntersection: histogramIntersection
        }
    }

    /**
     * Gets the similarity values from the selected elements and sets it to the window.
     * @returns {*[]}
     */
    function setSimilarity() {
        let similarities = []
        selectedElementsIndex.forEach((index1Val, index1) => {
            for (let index2 = index1 + 1; index2 < selectedElementsIndex.length; index2++){
                const index2Val = selectedElementsIndex[index2];
                if (index1Val !== index2Val) {
                    const arrayA = countAndNormalizeValues(images[index1Val].hueValues, 360)
                    const arrayB = countAndNormalizeValues(images[index2Val].hueValues, 360)
                    const values = getHistogramScores(arrayA, arrayB)
                    similarities.push(<div key={`${index1Val}-${index2Val}`}>
                        <h3>Scores between {images[index1Val].fileName} & {images[index2Val].fileName}</h3>
                        <p>Euclidean Distance: {values.euclideanDistance}</p>
                        <p>Pearson Correlation: {values.pearsonCorrelation}</p>
                        <p>Bhattacharyya Distance: {values.bhattacharyyaDistance}</p>
                        <p>Histogram Intersection: {values.histogramIntersection}</p>
                    </div>);
                }
            }
        })
        return similarities;
    }

    /**
     * Counts all the values in an array and puts them into another array. It then normalizes the count values.
     * @param array array to be counted and normalized.
     * @param maxValue the max value possible in the array
     * @returns {any[]}
     */
    const countAndNormalizeValues = (array, maxValue) => {
        const probArray = new Array(maxValue + 1).fill(0)
        array.forEach(value => {
            if (value >= 0 && value <= maxValue) {
                probArray[Math.floor(value)]++
            }
        })
        const totalCount = array.length;
        probArray.forEach((value, index, arr) => {
            arr[index] = value / totalCount
        })

        return probArray;
    }


    return (
        isSimilarityMetricsWindowOpen &&
        <div id="scoreWindow" className="window">
            <div className="window-top">
                <div className="window-top-left">Similarity Metrics Window</div>
                <button className="square exit" onClick={() => setIsSimilarityMetricsWindowOpen(false)}></button>
            </div>
            <div className={"options-container"}>
                <button className={"updateButton"} onClick={updateHistograms}>⟳</button>
            </div>
            <div ref={contentRef} className="window-content">
                {images.length > 0 && update &&
                    selectedElementsIndex.map((index) => {
                        const image = images[index];
                        if (image.hueValues) {
                            const path = convertFileSrc(image.filePath)
                            return (
                                <div className={"histogram-container"} key={index}>
                                    <div className="histogram-info">
                                        <img src={path} alt={"For histogram"}/>
                                        <p>{image.fileName}</p>
                                    </div>
                                    <Histogram
                                        key={index}
                                        array={image.hueValues}
                                        widthProp={400}
                                        heightProp={300}
                                        binsProp={360}
                                        maxValue={359}
                                    />
                                </div>
                            )
                        }
                        return null;
                    })
                }
                {selectedElementsIndex.length > 1 && update && <div>{setSimilarity()}</div>}
                {selectedElementsIndex.length === 0 &&
                    <p style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}>Info.<br/>Select one or more images to display their histogram</p>
                }
            </div>

        </div>);
}

export default SimilarityMetricsWindow;