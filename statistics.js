const database = firebase.database();

database.ref('quiz_results').once('value').then(snapshot => {
    const responses = snapshot.val();
    document.getElementById('response-count').innerText = Object.keys(responses).length;
})

async function fetchResultsFromFirebase() {
    const database = firebase.database();
    const quizResultsRef = database.ref('quiz_results');

    try {
        const snapshot = await quizResultsRef.once('value');
        const data = snapshot.val();

        if (data) {
            return data;
        } else {
            throw new Error("Failed to fetch results from Firebase");
        }
    } catch (error) {
        console.error("Error fetching results from Firebase:", error);
        throw error;
    }
}

async function displayResultsChart() {
    try {
        const results = await fetchResultsFromFirebase();
        const correctAnswersArray = Object.values(results).map(item => item.correctAnswers);

        const resultsCounts = correctAnswersArray.reduce((acc, currentValue) => {
            acc[currentValue] = (acc[currentValue] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(resultsCounts).map(key => `${key} правильных ответов`);
        const dataPoints = Object.values(resultsCounts);

        const ctx = document.getElementById('resultsChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Количество студентов',
                    data: dataPoints,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error displaying chart:", error);
    }
}

async function displayRegionStatistics() {
    try {
        const results = await fetchResultsFromFirebase();

        const regionCounts = {};
        const totalResponses = Object.values(results).length;
        Object.values(results).forEach(item => {
            const region = item.region || "Не указан";
            regionCounts[region] = (regionCounts[region] || 0) + 1;
        });

        const labels = Object.keys(regionCounts);
        const dataPoints = Object.values(regionCounts);
        const percentages = dataPoints.map(count => ((count / totalResponses) * 100).toFixed(2));

        const ctx = document.getElementById('regionChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataPoints,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = percentages[labels.indexOf(label)];
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error displaying region statistics:", error);
    }
}

async function displayAgeStatistics() {
    try {
        const results = await fetchResultsFromFirebase();

        const ageCounts = {};
        const totalResponses = Object.values(results).length;
        Object.values(results).forEach(item => {
            const age = item.ageGroup || "Не указан";
            ageCounts[age] = (ageCounts[age] || 0) + 1;
        });

        const labels = Object.keys(ageCounts);
        const dataPoints = Object.values(ageCounts);
        const percentages = dataPoints.map(count => ((count / totalResponses) * 100).toFixed(2));

        const ctx = document.getElementById('ageChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Количество студентов',
                    data: dataPoints,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: totalResponses
                    }
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = percentages[labels.indexOf(label)];
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error displaying age statistics:", error);
    }
}

async function displayLocationStatistics() {
    try {
        const results = await fetchResultsFromFirebase();

        const locationCounts = {};
        const totalResponses = Object.values(results).length;
        Object.values(results).forEach(item => {
            const location = item.location || "Не указан";
            locationCounts[location] = (locationCounts[location] || 0) + 1;
        });

        const labels = Object.keys(locationCounts);
        const dataPoints = Object.values(locationCounts);
        const percentages = dataPoints.map(count => ((count / totalResponses) * 100).toFixed(2));

        const ctx = document.getElementById('locationChart').getContext('2d');
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataPoints,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const percentage = percentages[labels.indexOf(label)];
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error displaying location statistics:", error);
    }
}

displayRegionStatistics();
displayAgeStatistics();
displayLocationStatistics();
displayResultsChart();
