<template>
    <div class="charging-estimator">
        <h3>Charging Time Guess</h3>
        <div class="input-group">
            <label>Usable battery capacity:</label>
            <input v-model.number="usableCapacity" type="number" min="0" /> kWh
        </div>
        <div class="input-group">
            <label>Battery charge remaining:</label>
            <input v-model.number="currentCharge" type="number" min="0" max="100" /> %
        </div>
        <div class="input-group">
            <label>Target battery charge:</label>
            <input v-model.number="targetCharge" type="number" min="0" max="100" /> %
        </div>
        <div class="input-group">
            <label>Charge station charging rate:</label>
            <input v-model.number="chargingRate" type="number" min="0" /> kW
        </div>
        <button @click="calculateChargingTime" class="estimate-button" :disabled="!isFormValid">
            Guess Charging Time
        </button>
        <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
        </div>
        <div v-if="estimatedTime" class="estimated-time">
            Estimated time to {{ targetCharge }}% charge: {{ formatTime(estimatedTime) }}
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            usableCapacity: null,
            currentCharge: null,
            targetCharge: 100,
            chargingRate: null,
            estimatedTime: null,
            errorMessage: ''
        };
    },
    computed: {
        // Validate form inputs
        isFormValid() {
            return this.usableCapacity > 0 &&
                this.currentCharge >= 0 && this.currentCharge <= 100 &&
                this.targetCharge > 0 && this.targetCharge <= 100 &&
                this.chargingRate > 0 &&
                this.targetCharge > this.currentCharge;
        }
    },
    methods: {
        // Calculate the charging time
        calculateChargingTime() {
            this.errorMessage = '';
            if (!this.isFormValid) {
                if (this.targetCharge <= this.currentCharge) {
                    this.errorMessage = 'Target charge must be greater than current charge.';
                } else {
                    this.errorMessage = 'Please fill in all fields correctly.';
                }
                return;
            }

            // Variables for calculation
            const Uc = this.usableCapacity;
            const Pc = this.currentCharge;
            const Tc = this.targetCharge;
            const Cr = this.chargingRate;

            // Calculate charging time in hours
            const d = (Uc * (Tc - Pc)) / (100 * Cr);
            this.estimatedTime = d;
        },
        formatTime(hours) {
            // Format the calculated time into hours and minutes
            const totalMinutes = Math.round(hours * 60);
            const hrs = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            return `${hrs} hours, ${mins} minutes`;
        }
    }
};
</script>

<style scoped>
.charging-estimator {
    background-color: #f0f0f0;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.input-group {
    margin-bottom: 10px;
}

.input-group label {
    display: block;
    margin-bottom: 5px;
}

.input-group input {
    width: 60px;
    padding: 5px;
}

.estimate-button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    margin-top: 10px;
}

.estimate-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.estimated-time {
    margin-top: 15px;
    font-weight: bold;
}

.error-message {
    color: red;
    margin-top: 10px;
}
</style>