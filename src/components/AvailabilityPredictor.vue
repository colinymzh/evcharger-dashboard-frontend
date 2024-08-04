<template>
    <div class="availability-predictor">
        <h3>Availability Predictor for {{ stationName }}</h3>

        <!-- Date selection input -->
        <div class="input-group">
            <label for="predictionDate">Select Date:</label>
            <select id="predictionDate" v-model="selectedDate">
                <option v-for="date in availableDates" :key="date" :value="date">
                    {{ formatDate(date) }}
                </option>
            </select>
        </div>

        <!-- Time selection input -->
        <div class="input-group">
            <label for="predictionTime">Select Time:</label>
            <select id="predictionTime" v-model="selectedTime">
                <option v-for="hour in 24" :key="hour" :value="formatHour(hour - 1)">
                    {{ formatHour(hour - 1) }}
                </option>
            </select>
        </div>

        <!-- Prediction button -->
        <button @click="predictAvailability" :disabled="!selectedDate || !selectedTime || isLoading">
            Predict Availability
        </button>

        <!-- Loading overlay with progress bar -->
        <div v-if="isLoading" class="overlay">
            <div class="centered-progress-bar">
                <div class="progress-bar-container">
                    <div class="progress-bar" :style="{ width: progressWidth + '%' }"></div>
                </div>
                <div class="progress-text">Loading... {{ progressWidth }}%</div>
            </div>
        </div>

        <!-- Results modal -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="showModal = false">&times;</span>
                <h4>Availability Prediction</h4>
                <p>Predicted availability for {{ stationName }} on {{ formatDate(selectedDate) }} at {{ selectedTime }}:
                </p>
                <div v-for="(connector, index) in predictions" :key="index" class="connector-prediction">
                    <h5 class="connector-title">{{ connector[0] }}</h5>
                    <div class="probability-container">
                        <p class="probability-label">{{ connector[1] }}</p>
                        <div v-for="(line, lineIndex) in connector.slice(2)" :key="lineIndex" class="probability-item">
                            <div class="label-container">
                                <span class="class-label">{{ getAvailabilityLabel(line.split(':')[0]) }}:</span>
                                <span class="probability-text">{{ line.split(':')[1] }}</span>
                            </div>
                            <div class="probability-bar-container">
                                <div class="probability-value"
                                    :class="getAvailabilityLabel(line.split(':')[0]).toLowerCase().replace(' ', '-')"
                                    :style="{ width: getProbabilityWidth(line) }">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>
import { ref, computed } from 'vue';

export default {
    name: 'AvailabilityPredictor',
    props: {
        stationName: {
            type: String,
            required: true
        }
    },
    setup(props) {
        // Reactive state variables
        const selectedDate = ref('');
        const selectedTime = ref('');
        const predictions = ref([]);
        const showModal = ref(false);
        const isLoading = ref(false);
        const progressWidth = ref(0);

        // Calculate the width of the probability bar
        const getProbabilityWidth = (line) => {
            const probability = parseFloat(line.split(':')[1]);
            return `${probability * 100}%`;
        };

        // Convert class labels to human-readable format
        const getAvailabilityLabel = (classLabel) => {
            if (classLabel.trim() === 'Class 0') return 'Unavailable';
            if (classLabel.trim() === 'Class 1') return 'Available';
            return classLabel; 
        };

        // Compute available dates for the next 7 days
        const availableDates = computed(() => {
            const dates = [];
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                dates.push(date.toISOString().split('T')[0]);
            }
            return dates;
        });

        // Format date for display
        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };

        // Format hour for display
        const formatHour = (hour) => {
            return `${hour.toString().padStart(2, '0')}:00`;
        };

        // Main function to predict availability
        const predictAvailability = async () => {
            isLoading.value = true;
            progressWidth.value = 0;

            // Simulate progress bar growth
            const progressInterval = setInterval(() => {
                if (progressWidth.value < 90) {
                    progressWidth.value += 10;
                }
            }, 300);

            const date = new Date(selectedDate.value);
            const dayOfWeek = date.getDay();
            const hour = parseInt(selectedTime.value.split(':')[0]);

            // Construct URL for API request
            const url = new URL('http://localhost:8088/prediction/weather');
            url.searchParams.append('stationName', props.stationName);
            url.searchParams.append('date', selectedDate.value);
            url.searchParams.append('dayOfWeek', dayOfWeek.toString());
            url.searchParams.append('hour', hour.toString());
            console.log('Request URL:', url.toString());

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data);

                // Parse the returned data
                predictions.value = parseConnectorData(data);

                // Stop progress bar and show modal
                clearInterval(progressInterval);
                progressWidth.value = 100;
                setTimeout(() => {
                    isLoading.value = false;
                    showModal.value = true;
                }, 200);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error.message);
                predictions.value = [["Error occurred while fetching prediction"]];

                // Stop progress bar and show error modal
                clearInterval(progressInterval);
                progressWidth.value = 100;
                setTimeout(() => {
                    isLoading.value = false;
                    showModal.value = true;
                }, 200);
            }
        };

        // Parse the connector data from API response
        const parseConnectorData = (data) => {
            const connectors = [];
            let currentConnector = [];
            let connectorNumber = 1;

            for (const line of data) {
                if (line.trim() === 'Probability:') {
                    if (currentConnector.length > 0) {
                        connectors.push(currentConnector);
                        currentConnector = [];
                    }
                    currentConnector.push(`Connector ${connectorNumber}`);
                    currentConnector.push(line.trim());
                    connectorNumber++;
                } else if (line.trim() !== '') {
                    currentConnector.push(line.trim());
                }
            }

            if (currentConnector.length > 0) {
                connectors.push(currentConnector);
            }

            return connectors;
        };

        // Return reactive variables and functions
        return {
            selectedDate,
            selectedTime,
            predictions,
            predictAvailability,
            showModal,
            availableDates,
            formatDate,
            getProbabilityWidth,
            getAvailabilityLabel,
            formatHour,
            isLoading,
            progressWidth
        };
    }
};
</script>


<style scoped>
.availability-predictor {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.input-group {
    margin-bottom: 15px;
}

label {
    display: block;
    margin-bottom: 5px;
}

select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

button:disabled {
    background-color: #ddd;
    cursor: not-allowed;
}

/* Overlay and Centered Progress Bar styles */
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.centered-progress-bar {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.progress-bar-container {
    width: 300px;
    height: 20px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 10px;
}

.progress-bar {
    height: 100%;
    background-color: #4CAF50;
    transition: width 0.3s ease-in-out;
}

.progress-text {
    text-align: center;
    font-weight: bold;
}

/* Modal styles */
.modal {
    position: fixed;
    z-index: 1001;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 500px;
    border-radius: 8px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.connector-prediction {
    background-color: #f0f0f0;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.connector-title {
    color: #2c3e50;
    margin-bottom: 10px;
    font-size: 1.2em;
}

.probability-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.label-container {
    display: flex;
    justify-content: space-between;
    margin-bottom: 5px;
}

.class-label {
    font-weight: bold;
    color: #000000;
}

.probability-text {
    color: #000000;
}

.probability-bar-container {
    width: 100%;
    background-color: #f0f0f0;
    border-radius: 3px;
    overflow: hidden;
}

.probability-value {
    height: 20px;
    color: transparent;
    text-align: right;
    transition: width 0.5s ease-in-out;
}

.probability-value.available {
    background-color: #2ecc71;
}

.probability-value.unavailable {
    background-color: #e74c3c;
}
</style>