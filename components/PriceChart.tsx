"use client"

import * as React from 'react';
import { defaults } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

// defaults.maintainAspectRatio = false;
defaults.responsive = true;
defaults.plugins.title.display = true;
defaults.plugins.title.align = "center";
defaults.plugins.title.color = "black";
defaults.plugins.title.fullSize = true;
defaults.font.size = 16;
defaults.plugins.title.text = "Динамика цен";
defaults.plugins.title.padding = 15;
defaults.plugins.title.fullSize = true;

interface Props {
    labels: any;
    dataset: any;

}

export default function PriceChart({labels, dataset}: Props) {
    return (
        <div className='text-base'>
            <Line
                data={{
                    labels: labels,
                    datasets: [
                        {
                            data: dataset,
                            backgroundColor: '#981e97',
                            // borderColor: '#FFFFFF',
                            fill: true,
                            pointBackgroundColor: '#FFFFFF',
                            // pointBorderColor: "#981e97"
                        }
                    ]
                }}
                options={{
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }}
            />
        </div>
    );
}