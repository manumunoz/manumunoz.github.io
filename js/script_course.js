// Function to read and process CSV file, generalized for both evaluations
function processData(callback, evalType) {
    Papa.parse("files/website_data.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data.map(row => ({
                gender: row.female === 0 ? 'Male' : 'Female',
                socialClass: row.class ? {
                    '1': 'Low',
                    '2': 'Middle',
                    '3': 'High'
                }[row.class] : 'Unknown',
                eval_workshop: row.eval_workshop,
                eval_instructor: row.eval_instructor,
                target: row.target.toString(),
                perform: row.perform.toString(),
            }));
            callback(data, evalType);
        }
    });
}

// Function to aggregate and compute average values by property
function aggregateDataByProperty(data, property, evalType) {
    const result = {};
    data.forEach(item => {
        const key = item[property];
        const value = item[evalType];
        if (!result[key]) {
            result[key] = { sum: 0, count: 0 };
        }
        if (typeof value === 'number') {
            result[key].sum += value;
            result[key].count++;
        }
    });

    return Object.keys(result).map(key => ({
        category: key,
        average: result[key].sum / result[key].count,
    }));
}

// Function to update the chart, targeting specific canvases
function updateChart(data, categoryLabel, canvasId) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (window[canvasId + 'Chart']) {
        window[canvasId + 'Chart'].destroy();
    }
    window[canvasId + 'Chart'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.category),
            datasets: [{
                label: `Average Evaluation for ${categoryLabel}`,
                data: data.map(item => item.average),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    suggestedMax: 5,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(1);
                        }
                    }
                }
            }
        }
    });
}

// Event listeners for general course evaluation
document.getElementById('genderBtn').addEventListener('click', () => updateEvaluation('gender', 'eval_workshop', 'chart'));
document.getElementById('classBtn').addEventListener('click', () => updateEvaluation('socialClass', 'eval_workshop', 'chart'));
document.getElementById('targetBtn').addEventListener('click', () => updateEvaluation('target', 'eval_workshop', 'chart'));
document.getElementById('performBtn').addEventListener('click', () => updateEvaluation('perform', 'eval_workshop', 'chart'));

// Event listeners for teacher evaluation
document.getElementById('genderInstructorBtn').addEventListener('click', () => updateEvaluation('gender', 'eval_instructor', 'instructorChart'));
document.getElementById('classInstructorBtn').addEventListener('click', () => updateEvaluation('socialClass', 'eval_instructor', 'instructorChart'));
document.getElementById('targetInstructorBtn').addEventListener('click', () => updateEvaluation('target', 'eval_instructor', 'instructorChart'));
document.getElementById('performInstructorBtn').addEventListener('click', () => updateEvaluation('perform', 'eval_instructor', 'instructorChart'));

// Function to handle updating evaluations
function updateEvaluation(property, evalType, canvasId) {
    processData((data) => {
        const processedData = aggregateDataByProperty(data, property, evalType);
        updateChart(processedData, property.charAt(0).toUpperCase() + property.slice(1), canvasId);
    }, evalType);
}
