<template>
    <div class="availability-predictor">
        <h3>Availability Predictor for {{ stationName }}</h3>
        <div class="input-group">
            <label for="predictionDate">Select Date:</label>
            <select id="predictionDate" v-model="selectedDate">
                <option v-for="date in availableDates" :key="date" :value="date">
                    {{ formatDate(date) }}
                </option>
            </select>
        </div>
        <div class="input-group">
            <label for="predictionTime">Select Time:</label>
            <select id="predictionTime" v-model="selectedTime">
                <option v-for="hour in 24" :key="hour" :value="formatHour(hour - 1)">
                    {{ formatHour(hour - 1) }}
                </option>
            </select>
        </div>
        <button @click="predictAvailability" :disabled="!selectedDate || !selectedTime">
            Predict Availability
        </button>

        <!-- Modal -->
        <div v-if="showModal" class="modal">
            <div class="modal-content">
                <span class="close" @click="showModal = false">&times;</span>
                <h4>Availability Prediction</h4>
                <p>Predicted availability for {{ stationName }} on {{ formatDate(selectedDate) }} at {{ selectedTime }}:
                </p>
                <p><strong>{{ prediction }}</strong></p>
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
        const selectedDate = ref('');
        const selectedTime = ref('');
        const prediction = ref('');
        const showModal = ref(false);

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

        const formatDate = (dateString) => {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        };

        const formatHour = (hour) => {
            return `${hour.toString().padStart(2, '0')}:00`;
        };

        const predictAvailability = async () => {
            const date = new Date(selectedDate.value);
            const dayOfWeek = date.getDay();
            const hour = parseInt(selectedTime.value.split(':')[0]);

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
                prediction.value = data.prediction; // 假设后端返回的 JSON 中有一个 'prediction' 字段
                showModal.value = true;
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error.message);
                prediction.value = "Error occurred while fetching prediction";
                showModal.value = true;
            }
        };

        return {
            selectedDate,
            selectedTime,
            prediction,
            predictAvailability,
            showModal,
            availableDates,
            formatDate,
            formatHour
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

/* Modal styles */
.modal {
    position: fixed;
    z-index: 1;
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
</style>