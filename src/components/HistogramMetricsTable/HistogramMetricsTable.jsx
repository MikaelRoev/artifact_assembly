import React, {useContext, useState} from 'react';
import HistogramMetricsRow from "./HistogramMetricsRow";
import Konva from "konva";
import StageRefContext from "../../contexts/StageRefContext";
import "./HistogramMetrics.css"

/**
 * Represents a table with the histogram similarity scores between the selected image and every other image.
 * @param selectedImage {Konva.Image} the image the table belongs to.
 * @param maxHistogramValue the number of bins in the histogram.
 * @returns {Element} div element with a table of scores and the most similar element to selectedElement
 */
const HistogramMetricsTable = ({selectedImage, maxHistogramValue}) => {
    const {stageRef} = useContext(StageRefContext);

    const [sortParameter, setSortParameter] = useState("combined");

    const url = selectedImage.toDataURL();
    const arrayA = countAndNormalizeValues(selectedImage.attrs.hueValues, maxHistogramValue);

    const imageNodes = stageRef.current.find((node) => node instanceof Konva.Image)
        .filter(image => !(selectedImage.id() === image.id()
            || image.attrs.hueValues === undefined
            || selectedImage.attrs.hueValues === undefined));

    let lowest = Infinity;
    let lowestImage = null;
    const imageScores = imageNodes.map((image) => {
        const arrayB = countAndNormalizeValues(image.attrs.hueValues, maxHistogramValue);
        const metrics = getHistogramScores(arrayA, arrayB);
        if (metrics.combined < lowest) {
            lowest = metrics.combined;
            lowestImage = image;
        }
        return {image: image, metrics: metrics}
    });
    imageScores.sort((a, b) => a.metrics[sortParameter] - b.metrics[sortParameter]);

    /**
     * Counts all the values in an array and puts them into another array. It then normalizes the count values.
     * @param array {number[]} array to be counted and normalized.
     * @param maxValue {number} the max value possible in the array
     * @returns {number[]}
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
     * Calculates the Euclidean distance, Pearson correlation,
     * Bhattacharyya distance, Intersection and a Combined metric between the two histograms.
     * @param arrayA {number[]} Histogram A array
     * @param arrayB {number[]} Histogram B array
     * @returns {
     * {bhattacharyyaDistance: number,
     * euclideanDistance: number,
     * pearsonCorrelation: number,
     * histogramIntersection: number,
     * combined: number}
     * } the calculated metrics.
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

    return (
        <div key={`table-${selectedImage.id()}`} className={"tableDiv"}>
            {
                lowestImage &&
                <div className={"info-div"}>
                    <p>The most similar element to</p>
                    <img src={url} alt={"For information"}
                         className={"info-image"}/>
                    <p>is</p>
                    <img src={lowestImage.toDataURL()} alt={"For Information"}
                         className={"info-image"}/>
                </div>
            }
            <table className={"score-table"}>
                <thead>
                <tr>
                    <th className={"tableColumn1"}><img src={url} alt={"For table header"}/></th>
                    <th>
                        <button className={"sortButton"} onClick={() => {
                            setSortParameter("combined");
                        }}>
                            Combined<br/>scores
                        </button>
                    </th>
                    <th>
                        <button className={"sortButton"} onClick={() => {
                            setSortParameter("euclideanDistance");
                        }}>
                            Euclidean<br/>Distance
                        </button>
                    </th>
                    <th>
                        <button className={"sortButton"} onClick={() => {
                            setSortParameter("bhattacharyyaDistance");
                        }}>
                            Bhattacharyya<br/>Distance
                        </button>
                    </th>
                    <th>
                        <button className={"sortButton"} onClick={() => {
                            setSortParameter("histogramIntersection");
                        }}>
                            Histogram<br/>Intersection
                        </button>
                    </th>
                </tr>
                </thead>
                <tbody>
                {imageScores.map((entry) => (
                    <HistogramMetricsRow key={entry.image.id()} image={entry.image} histogramMetrics={entry.metrics}/>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistogramMetricsTable;