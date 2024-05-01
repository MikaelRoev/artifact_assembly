import React from 'react';
import "../SimilarityMetricsWindow/SimilarityMetricsWindow.css";

/**
 * Represents the row of the histogram similarity metrics table.
 * @param image {Konva.Image} the image that will be compared to the tables image in this row.
 * @param histogramMetrics {
 *     combined: number,
 *     euclideanDistance: number,
 *     bhattacharyyaDistance: number,
 *     histogramIntersection: number
 * } the metrics scores to be shown in the row.
 * @return {JSX.IntrinsicElements.tr} a row in the table.
 */
const HistogramMetricsRow = ({ image, histogramMetrics}) => {
    return (
        <tr key={image.id()}>
            <td className={"tableColumn1"}>
                <img src={image.toDataURL()} alt={"For table row"}/>
            </td>
            <td>{histogramMetrics.combined.toFixed(3)}</td>
            <td>{histogramMetrics.euclideanDistance.toFixed(3)}</td>
            <td>{histogramMetrics.bhattacharyyaDistance.toFixed(3)}</td>
            <td>{histogramMetrics.histogramIntersection.toFixed(3)}</td>
        </tr>
    );
}

export default HistogramMetricsRow;