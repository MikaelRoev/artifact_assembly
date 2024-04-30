import React, {useContext} from 'react';
import {convertFileSrc} from "@tauri-apps/api/tauri";
import ElementContext from "../../contexts/ElementContext";
import HistogramMetricsRow from "./HistogramMetricsRow";

/**
 * Represents a table with the histogram similarity scores between the selected image and every other image.
 * @param selectedImage {
 *     {
 *          filepath: string,
 *          hueValues: number[],
 *          id: string
 *     }
 * } the image the table belongs to.
 * @param maxHistogramValue the number of bins in the histogram.
 * @returns {Element} div element with a table of scores and the most similar element to selectedElement
 */
const HistogramMetricsTable = ({selectedImage, maxHistogramValue}) => {
    const {elements} = useContext(ElementContext);

    const url= convertFileSrc(selectedImage.filePath);
    const arrayA = countAndNormalizeValues(selectedImage.hueValues, maxHistogramValue);

    const images = elements.filter((element) => (
        element.type === "Image"
        && selectedImage.id !== element.id
        && (element.hueValues !== undefined && selectedImage.hueValues !== undefined)
    ));

    const imageScores = images.map((image) => {
        const arrayB = countAndNormalizeValues(image.hueValues, maxHistogramValue);
        return {image: image, metrics: getHistogramScores(arrayA, arrayB)}
    });

    /*
    function sortImageScores(metric) {
        return imageScores.sort((a, b) => a.metrics[metric] - b.metrics[metric]);
    }
     */

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
     * Calculates the Euclidean distance, Pearson correlation, Bhattacharyya distance, Intersection and a Combined metric
     * between the two histograms.
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
        <div key={`table-${selectedImage.id}`} className={"tableDiv"}>
            {/* TODO: make table sortable */}
            <table className={"score-table"}>
                <thead>
                <tr>
                    <th className={"tableColumn1"}><img src={url} alt={"For table header"}/></th>
                    <th>Combined<br/>scores</th>
                    <th>Euclidean<br/>Distance</th>
                    <th>Bhattacharyya<br/>Distance</th>
                    <th>Histogram<br/>Intersection</th>
                </tr>
                </thead>
                <tbody>
                {imageScores.map((entry) => (
                    <HistogramMetricsRow key={entry.image.id} image = {entry.image} histogramMetrics={entry.metrics} />
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistogramMetricsTable;